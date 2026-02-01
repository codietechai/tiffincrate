import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
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

    const deliveryOrder = await DeliveryOrder.findById(params.id)
      .populate("consumerId", "_id name email");

    if (!deliveryOrder) {
      return NextResponse.json({ error: "Delivery order not found" }, { status: 404 });
    }

    // Authorization check
    if (role === "provider" && deliveryOrder.providerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role === "consumer" && deliveryOrder.consumerId._id.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update delivery order status
    const previousStatus = deliveryOrder.status;
    deliveryOrder.status = status;

    // Set appropriate timestamp based on status
    switch (status) {
      case "confirmed":
        deliveryOrder.confirmedAt = new Date();
        break;
      case "preparing":
        deliveryOrder.preparingAt = new Date();
        break;
      case "ready":
        deliveryOrder.readyAt = new Date();
        break;
      case "out_for_delivery":
        deliveryOrder.outForDeliveryAt = new Date();
        deliveryOrder.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);
        break;
      case "delivered":
        deliveryOrder.deliveredAt = new Date();
        deliveryOrder.actualDeliveryTime = new Date();
        break;
      case "cancelled":
        deliveryOrder.cancelledAt = new Date();
        break;
      case "not_delivered":
        deliveryOrder.notDeliveredAt = new Date();
        break;
    }

    await deliveryOrder.save();

    // Send real-time notification
    const notificationService = RealtimeNotificationService.getInstance();
    notificationService.broadcastOrderUpdate(
      deliveryOrder._id.toString(),
      deliveryOrder.consumerId._id.toString(),
      deliveryOrder.providerId.toString(),
      status,
      {
        previousStatus,
        updatedAt: deliveryOrder.updatedAt,
        actualDeliveryTime: deliveryOrder.actualDeliveryTime,
        deliveryDate: deliveryOrder.deliveryDate,
        timeSlot: deliveryOrder.timeSlot,
      }
    );

    return NextResponse.json({
      message: "Delivery order status updated",
      deliveryOrder: {
        _id: deliveryOrder._id,
        status: deliveryOrder.status,
        actualDeliveryTime: deliveryOrder.actualDeliveryTime,
        deliveryDate: deliveryOrder.deliveryDate,
        timeSlot: deliveryOrder.timeSlot,
        updatedAt: deliveryOrder.updatedAt,
      }
    });
  } catch (error) {
    console.error("Update delivery order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
