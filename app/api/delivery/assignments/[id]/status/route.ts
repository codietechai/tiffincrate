import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "delivery_partner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { status, location } = await request.json();

    const assignment = await DeliveryAssignment.findById(params.id)
      .populate("orderId")
      .populate("providerId", "businessName");

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Update assignment status
    assignment.status = status;

    if (status === "picked_up") {
      assignment.pickupTime = new Date();
    } else if (status === "delivered") {
      assignment.deliveryTime = new Date();

      // Update order status
      await Order.findByIdAndUpdate(assignment.orderId._id, {
        status: "delivered",
      });
    }

    await assignment.save();

    // Create notifications
    const statusMessages = {
      picked_up: "Your order has been picked up and is on the way!",
      in_transit: "Your order is in transit and will arrive soon!",
      delivered: "Your order has been delivered successfully!",
      failed: "There was an issue with your delivery. Please contact support.",
    };

    if (statusMessages[status as keyof typeof statusMessages]) {
      await new Notification({
        userId: assignment.orderId.consumerId,
        title: "Delivery Update",
        message: statusMessages[status as keyof typeof statusMessages],
        type: "order",
        data: {
          orderId: assignment.orderId._id,
          assignmentId: assignment._id,
          status,
        },
      }).save();
    }

    return NextResponse.json({
      message: "Assignment status updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Update assignment status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
