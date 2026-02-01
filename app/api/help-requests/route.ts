import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import HelpRequest from "@/models/HelpRequest";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const assignedTo = searchParams.get("assignedTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Build query based on role and new schema fields
    let query: any = {};

    if (role === "admin") {
      // Admin can see all requests or filter by type
      if (type && type !== "all") {
        query.type = type;
      }
      // Admin can filter by assignment
      if (assignedTo && assignedTo !== "all") {
        query.assignedTo = assignedTo === "me" ? userId : assignedTo;
      }
    } else {
      // Non-admin users can only see their own requests
      query = {
        $or: [{ fromUserId: userId }, { toUserId: userId }],
      };
    }

    // Apply filters
    if (status && status !== "all") query.status = status;
    if (priority && priority !== "all") query.priority = priority;
    if (category && category !== "all") query.category = category;

    // Text search using index
    if (search && search.trim() !== "") {
      query.$text = { $search: search };
    }

    // Sort by priority and creation date
    const sortQuery = search
      ? { score: { $meta: "textScore" }, priority: -1, createdAt: -1 }
      : { priority: -1, createdAt: -1 };

    const helpRequests = await HelpRequest.find(query)
      .populate("fromUserId", "name email role")
      .populate("toUserId", "name email role")
      .populate("assignedTo", "name role")
      .populate("resolvedBy", "name role")
      .populate("responses.userId", "name role")
      .populate("relatedOrderId", "totalAmount createdAt")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await HelpRequest.countDocuments(query);

    // Get statistics for admin dashboard
    let stats = {};
    if (role === "admin") {
      stats = await HelpRequest.aggregate([
        {
          $facet: {
            statusCounts: [
              { $group: { _id: "$status", count: { $sum: 1 } } }
            ],
            priorityCounts: [
              { $group: { _id: "$priority", count: { $sum: 1 } } }
            ],
            categoryCounts: [
              { $group: { _id: "$category", count: { $sum: 1 } } }
            ],
            unassignedCount: [
              { $match: { assignedTo: { $exists: false } } },
              { $count: "count" }
            ]
          }
        }
      ]);
    }

    return NextResponse.json({
      data: helpRequests,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: helpRequests.length,
        totalRecords: total,
      },
      stats: role === "admin" ? stats[0] : undefined,
      message: SUCCESSMESSAGE.HELPREQUESTS_FETCH,
    });
  } catch (error) {
    console.error("Get help requests error:", error);
    return NextResponse.json(
      { error: ERRORMESSAGE.HELPREQUEST_FETCH_FAILED },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    await connectMongoDB();
    const {
      toUserId,
      type,
      subject,
      message,
      priority = "medium",
      category = "general",
      attachments = [],
      tags = [],
      relatedOrderId
    } = await request.json();

    // Validate required fields
    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, subject, message" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be 200 characters or less" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be 2000 characters or less" },
        { status: 400 }
      );
    }

    // Create help request with new schema fields
    let payload: any = {
      fromUserId: userId,
      type,
      subject: subject.trim(),
      message: message.trim(),
      priority,
      category,
      attachments: attachments.slice(0, 5), // Limit attachments
      tags: tags.slice(0, 10).map((tag: string) => tag.trim()), // Limit and clean tags
      status: "open",
      responses: [],
    };

    if (toUserId) {
      payload.toUserId = toUserId;
    }

    if (relatedOrderId) {
      payload.relatedOrderId = relatedOrderId;
    }

    const helpRequest = new HelpRequest(payload);
    await helpRequest.save();

    // Create notifications for relevant users
    const recipientId = type === "admin_support" || type === "provider_support" ? null : toUserId;

    if (type === "admin_support" || type === "provider_support") {
      // Notify all admins
      const admins = await User.find({ role: "admin", isActive: true });

      for (const admin of admins) {
        await new Notification({
          userId: admin._id,
          title: "New Help Request",
          message: `New ${priority} priority help request: ${subject}`,
          type: "system",
          priority: priority === "urgent" ? "high" : "medium",
          data: {
            helpRequestId: helpRequest._id,
            type,
            category,
            priority
          },
          actionUrl: `/admin/help-requests/${helpRequest._id}`,
        }).save();
      }
    }

    if (recipientId) {
      // Notify specific recipient
      await new Notification({
        userId: recipientId,
        title: "New Help Request",
        message: `You have received a new help request: ${subject}`,
        type: "system",
        priority: priority === "urgent" ? "high" : "medium",
        data: {
          helpRequestId: helpRequest._id,
          type,
          category,
          priority
        },
        actionUrl: `/help-requests/${helpRequest._id}`,
      }).save();
    }

    // Populate the response
    const populatedRequest = await HelpRequest.findById(helpRequest._id)
      .populate("fromUserId", "name email role")
      .populate("toUserId", "name email role")
      .populate("relatedOrderId", "totalAmount createdAt");

    return NextResponse.json(
      {
        message: SUCCESSMESSAGE.HELPREQUEST_CREATE,
        data: populatedRequest
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create help request error:", error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}
