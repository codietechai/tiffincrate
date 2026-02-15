import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (!userId || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const timeSlot = searchParams.get("timeSlot");
    const deliveryDate = searchParams.get("deliveryDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const upcoming = searchParams.get("upcoming") === "true";

    const skip = (page - 1) * limit;

    // Build query based on role
    let query: any = {};

    if (role === "provider") {
      query.providerId = userId;
    } else if (role === "consumer") {
      query.consumerId = userId;
    } else if (role === "admin") {
      // Admin can see all delivery orders
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Apply filters
    if (status && status !== "all") query.status = status;
    if (timeSlot && timeSlot !== "all") query.timeSlot = timeSlot;

    if (deliveryDate) {
      const date = new Date(deliveryDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      query.deliveryDate = { $gte: date, $lt: nextDay };
    }

    if (upcoming) {
      query.deliveryDate = { $gte: new Date() };
      query.status = { $in: ["pending", "confirmed", "preparing", "ready", "out_for_delivery"] };
    }

    // Sort by delivery date and time slot
    const sortQuery: any = { deliveryDate: 1, timeSlot: 1, createdAt: -1 };

    const deliveryOrders = await DeliveryOrder.find(query)
      .populate("orderId", "totalAmount paymentMethod paymentStatus")
      .populate("consumerId", "name phone")
      .populate("providerId", "businessName phone")
      .populate("address", "addressLine1 addressLine2 city pincode landmark deliveryInstructions")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await DeliveryOrder.countDocuments(query);

    // Get status counts for dashboard
    const statusCounts = await DeliveryOrder.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      data: deliveryOrders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: deliveryOrders.length,
        totalRecords: total,
      },
      statusCounts,
      message: SUCCESSMESSAGE.DELIVERY_ORDERS_FETCH || "Delivery orders fetched successfully",
    });
  } catch (error) {
    console.error("Get delivery orders error:", error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const deliveryOrderId = searchParams.get("deliveryOrderId");

    const { status, deliveryNotes, cancelReason } = await request.json();

    if (!deliveryOrderId || !status) {
      return NextResponse.json(
        { error: "Missing deliveryOrderId or status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled", "not_delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find the delivery order and verify ownership
    const deliveryOrder = await DeliveryOrder.findOne({
      _id: deliveryOrderId,
      providerId: userId
    }).populate("orderId").populate("consumerId", "name");

    if (!deliveryOrder) {
      return NextResponse.json(
        { error: "Delivery order not found" },
        { status: 404 }
      );
    }

    // Prepare update data with timestamps
    const updateData: any = { status };
    const currentTime = new Date();

    // Set appropriate timestamp based on status
    switch (status) {
      case "confirmed":
        updateData.confirmedAt = currentTime;
        break;
      case "preparing":
        updateData.preparingAt = currentTime;
        break;
      case "ready":
        updateData.readyAt = currentTime;
        break;
      case "out_for_delivery":
        updateData.outForDeliveryAt = currentTime;
        break;
      case "delivered":
        updateData.deliveredAt = currentTime;
        updateData.actualDeliveryTime = currentTime;
        break;
      case "cancelled":
        updateData.cancelledAt = currentTime;
        if (cancelReason) updateData.cancelReason = cancelReason;
        break;
      case "not_delivered":
        updateData.notDeliveredAt = currentTime;
        if (cancelReason) updateData.cancelReason = cancelReason;
        break;
    }

    if (deliveryNotes) {
      updateData.deliveryNotes = deliveryNotes;
    }

    // Update the delivery order
    const updatedDeliveryOrder = await DeliveryOrder.findByIdAndUpdate(
      deliveryOrderId,
      updateData,
      { new: true }
    ).populate("orderId").populate("consumerId", "name").populate("providerId", "businessName");

    // Create notification for consumer
    const statusMessages: Record<string, string> = {
      confirmed: "confirmed",
      preparing: "being prepared",
      ready: "ready for pickup",
      out_for_delivery: "out for delivery",
      delivered: "delivered",
      cancelled: "cancelled",
      not_delivered: "not delivered"
    };

    const notificationMessage = `Your order from ${updatedDeliveryOrder.providerId.businessName} has been ${statusMessages[status] || status}.`;

    await new Notification({
      userId: deliveryOrder.consumerId._id,
      title: `Order ${statusMessages[status]}`,
      message: notificationMessage,
      type: "delivery",
      priority: status === "delivered" ? "high" : "medium",
      data: {
        deliveryOrderId: deliveryOrder._id,
        orderId: deliveryOrder.orderId._id,
        status
      },
      actionUrl: `/track-order/${deliveryOrder.orderId._id}`,
    }).save();

    return NextResponse.json({
      data: updatedDeliveryOrder,
      message: `Delivery order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update delivery order error:", error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL || "Internal server error" },
      { status: 500 }
    );
  }
}
