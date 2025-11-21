import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import DeliveryOrder from "@/models/deliveryOrders";
import Notification from "@/models/Notification";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import {
  sendEmail,
  sendSMS,
  getOrderConfirmationEmail,
  getOrderConfirmationSMS,
} from "@/lib/notifications";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export const createDeliveryOrders = async (orderId: string, deliveryInfo: any) => {
  const deliveryOrders: any[] = [];
  const tz = "Asia/Kolkata";

  if (deliveryInfo?.type === "month") {
    const startDate = deliveryInfo.startDate
      ? dayjs.tz(deliveryInfo.startDate, tz).startOf("day")
      : dayjs().tz(tz).startOf("month");

    const endDate = startDate.endOf("month");
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate)) {

      const localDate = new Date(current.format("YYYY-MM-DD") + "T00:00:00+05:30");
      deliveryOrders.push({
        orderId,
        deliveryStatus: "pending",
        deliveryDate: localDate,
      });
      current = current.add(1, "day");
    }
  }

else if (deliveryInfo?.type === "specific_days") {
  const { days } = deliveryInfo;
  const tz = "Asia/Kolkata";

  const now = dayjs().tz(tz).startOf("day");
  const start = now; // start from today, not from start of month
  const end = now.endOf("month");

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDays = (days || []).map((d: string) => dayMap[d.toLowerCase()]);
  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    if (targetDays.includes(current.day())) {
      const localDate = new Date(current.format("YYYY-MM-DD") + "T00:00:00+05:30");
      deliveryOrders.push({
        orderId,
        deliveryStatus: "pending",
        deliveryDate: localDate,
      });
    }
    current = current.add(1, "day");
  }
}


  else if (deliveryInfo?.type === "custom_dates" && Array.isArray(deliveryInfo.dates)) {
    for (const dateStr of deliveryInfo.dates) {
      const localDate = new Date(`${dateStr}`);
      deliveryOrders.push({
        orderId,
        deliveryStatus: "pending",
        deliveryDate: localDate,
      });
    }
  }


  if (deliveryOrders.length > 0) {
    await DeliveryOrder.insertMany(deliveryOrders);
    console.log(`✅ Created ${deliveryOrders.length} delivery orders for order ${orderId}`);
  } else {
    console.log("⚠️ No delivery orders generated for:", deliveryInfo);
  }

  return deliveryOrders;
};

function getOrderTypeSummary(deliveryInfo: {
  type: "month" | "specific_days" | "custom_dates";
  startDate?: string;
  days?: string[];
  dates?: string[];
}) {
  switch (deliveryInfo.type) {
    case "month":
      return `Monthly from ${deliveryInfo.startDate || "start date unknown"}`;
    case "specific_days":
      return `Specific days: ${deliveryInfo.days?.join(", ")}`;
    case "custom_dates":
      return `Custom dates: ${deliveryInfo.dates?.join(", ")}`;
    default:
      return "Unknown";
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query based on user role
    let query: any = {};
    if (role === "consumer") {
      query.consumerId = userId;

      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("consumerId", "name email")
        .populate("providerId", "businessName")
        .sort({ createdAt: -1 });

        console.log('first')

      return NextResponse.json({ orders });
    } else if (role === "provider") {
      query.providerId = userId;

      if (status) query.status = status;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const orders = await DeliveryOrder.aggregate([
        {
          $match: {
            'orderId.providerId': query.providerId.providerId,
            deliveryDate: { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'order'
          }
        },
        { $unwind: '$order' },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            deliveryDate: 1,
            deliveryStatus: 1,
            createdAt: 1,
            updatedAt: 1,
            order:1
          },}
      ]);
      return NextResponse.json({ orders });
    }
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "consumer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const {
      providerId,
      items,
      totalAmount,
      deliveryAddress,
      orderType,
      deliveryInfo,
      timeSlot,
      paymentMethod,
      notes,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    if (paymentMethod === "razorpay") {
      const isValidPayment = verifyRazorpayPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValidPayment) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    const order = new Order({
      providerId,
      items,
      totalAmount,
      deliveryAddress:
        typeof deliveryAddress === "string"
          ? { address: deliveryAddress, latitude: 0, longitude: 0 }
          : deliveryAddress,
      orderType,
      deliveryInfo,
      timeSlot,
      paymentMethod,
      notes,
      consumerId: userId,
      paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
      status: "confirmed",
    });

    await order.save();

    // ✅ Create Delivery Orders based on deliveryInfo
    await createDeliveryOrders(order._id, deliveryInfo);

    // Fetch related users
    const [consumer, provider] = await Promise.all([
      User.findById(userId),
      ServiceProvider.findById(providerId).populate("userId"),
    ]);

    // Notifications for both consumer and provider
    await Promise.all([
      new Notification({
        userId,
        title: "Order Confirmed",
        message: `Your order from ${provider.businessName} has been confirmed.`,
        type: "order",
        data: { orderId: order._id, providerId },
      }).save(),

      new Notification({
        userId: provider.userId._id,
        title: "New Order Received",
        message: `You have received a new order from ${consumer.name}.`,
        type: "order",
        data: { orderId: order._id, consumerId: userId },
      }).save(),
    ]);

    // Optional: send email and SMS
    try {
      const orderTypeSummary = getOrderTypeSummary(deliveryInfo);
      const orderNotificationData = {
        orderId: order._id.toString().slice(-8),
        customerName: consumer.name,
        providerName: provider.businessName,
        totalAmount,
        order_type: orderTypeSummary,
      };

      const emailData = getOrderConfirmationEmail(orderNotificationData);
      await sendEmail({ to: consumer.email, ...emailData });

      if (consumer.phone) {
        const smsMessage = getOrderConfirmationSMS(orderNotificationData);
        await sendSMS({ to: consumer.phone, message: smsMessage });
      }

      // If provider doesn’t handle self-delivery, auto-assign
      if (!provider.operatingHours[timeSlot]?.selfDelivery) {
        await fetch("/api/delivery/auto-assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order._id }),
        });
      }
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    return NextResponse.json(
      { message: "Order placed successfully", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
