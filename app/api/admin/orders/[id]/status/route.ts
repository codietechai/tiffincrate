import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate("consumerId", "name")
      .populate("providerId", "businessName");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create notifications for both consumer and provider
    await Promise.all([
      new Notification({
        userId: order.consumerId._id,
        title: "Order Status Updated",
        message: `Your order status has been updated to ${status} by admin.`,
        type: "order",
        data: { orderId: order._id, status },
      }).save(),

      new Notification({
        userId: order.providerId.userId,
        title: "Order Status Updated",
        message: `Order ${order._id
          .toString()
          .slice(-8)} status updated to ${status} by admin.`,
        type: "order",
        data: { orderId: order._id, status },
      }).save(),
    ]);

    return NextResponse.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
