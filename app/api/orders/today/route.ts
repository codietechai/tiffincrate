import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import DeliveryOrder from "@/models/deliveryOrders";
import ServiceProvider from "@/models/ServiceProvider";
import "@/models/Menu";
import "@/models/Address";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const timeSlot = searchParams.get("timeSlot");

    if (role !== "provider") {
      return NextResponse.json(
        { error: "Only provider can access delivery orders" },
        { status: 403 },
      );
    }

    // Get provider info
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Build query for delivery orders
    let deliveryQuery: any = {
      providerId: provider._id,
      deliveryDate: {
        $gte: todayStart,
        $lt: todayEnd
      }
    };

    // timeSlot filter
    if (timeSlot) deliveryQuery.timeSlot = timeSlot;

    // Get today's delivery orders
    const deliveryOrders = await DeliveryOrder.find(deliveryQuery)
      .populate({
        path: "orderId",
        populate: [
          {
            path: "providerId",
            select: "businessName location",
          },
          {
            path: "menuId",
            select: "name description providerId",
          },
          {
            path: "consumerId",
            select: "name email phone",
          }
        ]
      })
      .populate("address")
      .sort({ createdAt: -1 });

    // Filter by search if provided
    let filteredDeliveryOrders = deliveryOrders;
    if (search) {
      filteredDeliveryOrders = deliveryOrders.filter(deliveryOrder => {
        const order = deliveryOrder.orderId as any;
        if (!order || !order.menuId) return false;

        const menuName = order.menuId.name || "";
        const menuDescription = order.menuId.description || "";

        return menuName.toLowerCase().includes(search.toLowerCase()) ||
          menuDescription.toLowerCase().includes(search.toLowerCase());
      });
    }

    // Transform to match expected format
    const transformedOrders = filteredDeliveryOrders.map(deliveryOrder => {
      const order = deliveryOrder.orderId as any;

      return {
        _id: deliveryOrder._id,
        orderId: order._id,
        consumerId: order.consumerId,
        providerId: order.providerId,
        menuId: order.menuId,
        orderType: order.orderType,
        deliveryInfo: order.deliveryInfo,
        totalAmount: deliveryOrder.totalAmount || order.totalAmount,
        status: deliveryOrder.status, // Use delivery order status, not order status
        address: deliveryOrder.address,
        timeSlot: deliveryOrder.timeSlot,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        estimatedDeliveryTime: deliveryOrder.estimatedDeliveryTime,
        actualDeliveryTime: deliveryOrder.actualDeliveryTime,
        createdAt: deliveryOrder.createdAt,
        updatedAt: deliveryOrder.updatedAt,

        // Additional delivery-specific fields
        deliveryDate: deliveryOrder.deliveryDate,
        deliveryNotes: deliveryOrder.deliveryNotes,
        cancelReason: deliveryOrder.cancelReason,

        // Status timestamps
        pendingAt: deliveryOrder.pendingAt,
        confirmedAt: deliveryOrder.confirmedAt,
        preparingAt: deliveryOrder.preparingAt,
        readyAt: deliveryOrder.readyAt,
        outForDeliveryAt: deliveryOrder.outForDeliveryAt,
        deliveredAt: deliveryOrder.deliveredAt,
        cancelledAt: deliveryOrder.cancelledAt,
        notDeliveredAt: deliveryOrder.notDeliveredAt,
      };
    });

    return NextResponse.json(
      {
        data: transformedOrders,
        message: SUCCESSMESSAGE.ORDERS_FETCH,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get delivery orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
