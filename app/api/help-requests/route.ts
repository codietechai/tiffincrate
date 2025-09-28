import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import HelpRequest from "@/models/HelpRequest";
import Notification from "@/models/Notification";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    let query: any = {};

    // Role-based filtering
    if (decoded.role === "admin") {
      // Admin can see all help requests or those directed to admin
      if (type !== "consumer_to_provider") {
        query = {
          $or: [{ type: "admin_support" }, { type: "provider_support" }],
        };
      }
    } else {
      // Users can see their own requests and requests directed to them
      query = {
        $or: [{ fromUserId: decoded.userId }, { toUserId: decoded.userId }],
      };
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const helpRequests = await HelpRequest.find(query)
      .populate("fromUserId", "name email role")
      .populate("toUserId", "name email role")
      .populate("responses.userId", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await HelpRequest.countDocuments(query);

    return NextResponse.json({
      helpRequests,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: helpRequests.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Get help requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectMongoDB();
    const { toUserId, type, subject, message, priority, category } =
      await request.json();

    const helpRequest = new HelpRequest({
      fromUserId: decoded.userId,
      toUserId,
      type,
      subject,
      message,
      priority: priority || "medium",
      category: category || "general",
    });

    await helpRequest.save();

    // Create notification for recipient
    const recipientId =
      type === "admin_support" || type === "provider_support"
        ? null // Will be handled by admin
        : toUserId;

    if (recipientId) {
      await new Notification({
        userId: recipientId,
        title: "New Help Request",
        message: `You have received a new help request: ${subject}`,
        type: "system",
        data: { helpRequestId: helpRequest._id, type },
      }).save();
    }

    return NextResponse.json(
      { message: "Help request created successfully", helpRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create help request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
