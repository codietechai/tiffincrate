import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import "@/models/Menu";
import DeliveryOrder from "@/models/deliveryOrders";
import Notification from "@/models/Notification";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import {
  getOrderConfirmationEmail,
  getOrderConfirmationSMS,
} from "@/lib/notifications";
import mongoose from "mongoose";
import { createDeliveryOrders, getOrderTypeSummary } from "@/utils/orders";
import Address from "@/models/Address";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query: any = {};
    if (role === "consumer") {
      query.consumerId = userId;

      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("consumerId", "name email")
        .populate({
          path: "menuId",
          populate: {
            path: "providerId",
            select: "businessName location.address",
          },
        })
        .sort({ createdAt: -1 });

      return NextResponse.json(
        {
          data: orders,
          message: SUCCESSMESSAGE.ORDERS_FETCH,
          success: true,
        },
        { status: 200 },
      );
    } else if (role === "provider") {
      query.providerId = userId;

      if (status) query.status = status;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const currentDay = new Date()
        .toLocaleString("en-US", { weekday: "long" })
        .toLowerCase();

      const orders = await DeliveryOrder.aggregate([
        {
          $match: {
            "orderId.providerId": query.providerId.providerId,
            deliveryDate: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },

        {
          $lookup: {
            from: "users",
            localField: "order.consumerId",
            foreignField: "_id",
            as: "consumer",
          },
        },
        {
          $lookup: {
            from: "menus",
            localField: "order.menuId",
            foreignField: "_id",
            as: "menu",
          },
        },

        // ✅ Lookup and filter menuitems for current day only
        {
          $lookup: {
            from: "menuitems",
            let: { menuId: "$order.menuId", today: currentDay },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$menuId", "$$menuId"] },
                      { $eq: ["$day", "$$today"] },
                    ],
                  },
                },
              },
            ],
            as: "menuitems",
          },
        },

        // {
        //   $match: {
        //     "order.deliveryPartnerId": new mongoose.Types.ObjectId(
        //       query.providerId
        //     ),
        //     deliveryDate: { $gte: startOfDay, $lte: endOfDay },
        //   },
        // },

        { $sort: { createdAt: -1 } },

        {
          $project: {
            _id: 1,
            deliveryDate: 1,
            deliveryStatus: 1,
            "consumer.name": 1,
            createdAt: 1,
            updatedAt: 1,
            order: 1,
            menu: 1,
            menuitems: 1,
          },
        },
      ]);

      return NextResponse.json(
        {
          data: orders,
          message: SUCCESSMESSAGE.ORDERS_FETCH,
          success: true,
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      data: {},
      message: "You are admin",
      success: false,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "consumer") {
      return NextResponse.json(
        { error: "Forbidden", success: false },
        { status: 403 },
      );
    }

    await connectMongoDB();

    const {
      menuId,
      providerId,
      items,
      totalAmount,
      address,
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
        razorpaySignature,
      );

      if (!isValidPayment) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 },
        );
      }
    }

    let newAddressId;
    const existing = await Address.findOne({
      ref_address: address,
      address_mutability: "immutable",
    });

    if (existing) {
      newAddressId = address;
    } else {
      const original = await Address.findById(address);

      if (!original) {
        throw new Error("Address not found");
      }

      const newAddress = await Address.create({
        ...original.toObject(),
        _id: undefined,
        address_mutability: "immutable",
        ref_address: address,
      });
      newAddressId = newAddress._id;
    }

    const order = new Order({
      menuId,
      items,
      totalAmount,
      address: newAddressId,
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
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId as string) },
      { $inc: { wallet_amount: totalAmount } },
    );
    await createDeliveryOrders(order._id, deliveryInfo);
    const providerDetails = await ServiceProvider.findOne({
      _id: new mongoose.Types.ObjectId(providerId),
    });
    const customerDetails = await User.findById(userId);

    await Promise.all([
      new Notification({
        userId,
        title: "Order Confirmed",
        message: `Your order from ${providerDetails?.businessName} has been confirmed.`,
        type: "order",
        data: { orderId: order._id, providerId },
      }).save(),

      new Notification({
        userId: customerDetails?._id,
        title: "New Order Received",
        message: `You have received a new order from ${customerDetails?.name}.`,
        type: "order",
        data: { orderId: order._id, consumerId: userId },
      }).save(),
    ]);

    // Optional: send email and SMS
    try {
      const orderTypeSummary = getOrderTypeSummary(deliveryInfo);
      const orderNotificationData = {
        orderId: order._id.toString().slice(-8),
        customerName: customerDetails.name,
        providerName: providerDetails.businessName,
        totalAmount,
        order_type: orderTypeSummary,
      };

      const emailData = getOrderConfirmationEmail(orderNotificationData);
      // await sendEmail({ to: customerDetails.email, ...emailData });

      if (customerDetails.phone) {
        const smsMessage = getOrderConfirmationSMS(orderNotificationData);
        // await sendSMS({ to: customerDetails.phone, message: smsMessage });
      }

      // If provider doesn’t handle self-delivery, auto-assign
      if (!providerDetails.operatingHours[timeSlot]?.selfDelivery) {
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
      { success: true, data: order, message: SUCCESSMESSAGE.ORDER_COMPLETE },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}
