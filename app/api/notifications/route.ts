import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";



export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");

    const skip = (page - 1) * limit;

    // Build query with new schema fields
    const query: any = { userId: userId };
    if (unreadOnly) query.isRead = false;
    if (type && type !== "all") query.type = type;
    if (priority && priority !== "all") query.priority = priority;

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 }) // Sort by priority first, then by date
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: userId,
      isRead: false,
    });

    // Get priority counts for filtering
    const priorityCounts = await Notification.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Get type counts for filtering
    const typeCounts = await Notification.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      data: notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalRecords: total,
      },
      unreadCount,
      filters: {
        priority: priorityCounts,
        type: typeCounts,
      },
      message: SUCCESSMESSAGE.NOTIFICATIONS_FETCH,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    await connectMongoDB();
    const { notificationIds, markAsRead, markAllAsRead } = await request.json();

    let updateQuery: any;
    let updateData: any = { isRead: markAsRead };

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      updateQuery = { userId: userId, isRead: false };
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      updateQuery = { _id: { $in: notificationIds }, userId: userId };
    } else {
      // Mark all unread notifications as read (fallback)
      updateQuery = { userId: userId, isRead: false };
    }

    const result = await Notification.updateMany(updateQuery, updateData);

    return NextResponse.json({
      message: SUCCESSMESSAGE.NOTIFICATION_MARK_READ,
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}

// Add POST method for creating notifications (admin/system use)
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");

    // Only allow admin or system to create notifications
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const {
      userId,
      title,
      message,
      type = "system",
      priority = "medium",
      actionUrl,
      data,
      expiresAt
    } = await request.json();

    // Validate required fields
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, message" },
        { status: 400 }
      );
    }

    const notification = new Notification({
      userId,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      actionUrl,
      data,
      expiresAt,
      isRead: false,
    });

    await notification.save();

    return NextResponse.json(
      {
        message: "Notification created successfully",
        notification
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}
