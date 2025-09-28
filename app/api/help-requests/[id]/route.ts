import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import HelpRequest from "@/models/HelpRequest";
import Notification from "@/models/Notification";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const helpRequest = await HelpRequest.findById(params.id)
      .populate("fromUserId", "name email role")
      .populate("toUserId", "name email role")
      .populate("responses.userId", "name role");

    if (!helpRequest) {
      return NextResponse.json(
        { error: "Help request not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canView =
      decoded.role === "admin" ||
      helpRequest.fromUserId._id.toString() === decoded.userId ||
      helpRequest.toUserId?._id.toString() === decoded.userId;

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ helpRequest });
  } catch (error) {
    console.error("Get help request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, priority, response } = await request.json();

    const helpRequest = await HelpRequest.findById(params.id);
    if (!helpRequest) {
      return NextResponse.json(
        { error: "Help request not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const canUpdate =
      decoded.role === "admin" ||
      helpRequest.fromUserId.toString() === decoded.userId ||
      helpRequest.toUserId?.toString() === decoded.userId;

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update status and priority if provided
    if (status) {
      helpRequest.status = status;
      if (status === "resolved") {
        helpRequest.resolvedAt = new Date();
        helpRequest.resolvedBy = decoded.userId;
      }
    }
    if (priority) helpRequest.priority = priority;

    // Add response if provided
    if (response) {
      helpRequest.responses.push({
        userId: decoded.userId,
        message: response,
        timestamp: new Date(),
        isAdmin: decoded.role === "admin",
      });

      // Create notification for the other party
      const notifyUserId =
        helpRequest.fromUserId.toString() === decoded.userId
          ? helpRequest.toUserId
          : helpRequest.fromUserId;

      if (notifyUserId) {
        await new Notification({
          userId: notifyUserId,
          title: "Help Request Response",
          message: `You have received a response to your help request: ${helpRequest.subject}`,
          type: "system",
          data: { helpRequestId: helpRequest._id },
        }).save();
      }
    }

    await helpRequest.save();

    return NextResponse.json({
      message: "Help request updated successfully",
      helpRequest,
    });
  } catch (error) {
    console.error("Update help request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
