import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import RealtimeNotificationService from "@/lib/realtime-notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    await connectMongoDB();
    const { status } = await request.json();

    const order = await Order.findById(params.id)
      .populate("consumerId", "_id name email");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization check
    if (role === "provider" && order.providerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role === "consumer" && order.consumerId._id.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update order status
    const previousStatus = order.status;
    order.status = status;

    // Set timestamps based on status
    if (status === "delivered") {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Send real-time notification
    const notificationService = RealtimeNotificationService.getInstance();
    notificationService.broadcastOrderUpdate(
      order._id.toString(),
      order.consumerId._id.toString(),
      order.providerId.toString(),
      status,
      {
        previousStatus,
        updatedAt: order.updatedAt,
        actualDeliveryTime: order.actualDeliveryTime,
      }
    );

    return NextResponse.json({
      message: "Order status updated",
      order: {
        _id: order._id,
        status: order.status,
        actualDeliveryTime: order.actualDeliveryTime,
        updatedAt: order.updatedAt,
      }
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
