import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import deliveryOrders from "@/models/deliveryOrders";
import { ERRORMESSAGE } from "@/constants/response-messages";
import Notification from "@/models/Notification";
import Order from "@/models/Order";
export async function PATCH(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const { searchParams } = new URL(request.url);
    const orderDeliveryId = searchParams.get("orderDeliveryId");
    const status = searchParams.get("status");

    if (!orderDeliveryId || !status) {
      return NextResponse.json(
        { error: "Missing orderDeliveryId or status" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Updating delivery:", orderDeliveryId, "→", status);

    const order = await deliveryOrders
      .findOne({ _id: orderDeliveryId })
      .populate({
        path: "orderId",
        populate: {
          path: "providerId",
        },
      });
    const data = await deliveryOrders
      .findByIdAndUpdate(
        orderDeliveryId,
        { deliveryStatus: status },
        { new: true }
      )
      .lean();

    const readableStatus = status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    new Notification({
      userId: order.orderId.consumerId,
      title: `your order is ${readableStatus}`,
      message: `Your order from ${order.orderId.providerId.businessName} has been ${readableStatus}.`,
      type: "order",
      data: { orderId: order._id, providerId: order.orderId.providerId },
    }).save();
    
    if (!data) {
      return NextResponse.json(
        { error: "Delivery order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(ERRORMESSAGE.MENUS_FETCH_FAILED, error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL || "Internal server error" },
      { status: 500 }
    );
  }
}
