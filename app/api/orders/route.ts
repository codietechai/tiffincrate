import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import Menu from "@/models/Menu";
import DeliveryOrder from "@/models/deliveryOrders";
import Notification from "@/models/Notification";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import {
  getOrderConfirmationEmail,
  getOrderConfirmationSMS,
} from "@/lib/notifications";
import { createDeliveryOrders, getOrderTypeSummary } from "@/utils/orders";
import Address from "@/models/Address";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";
import { WalletService } from "@/services/wallet-service";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query: any = {};

    if (role === "consumer") {
      query.consumerId = userId;
      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("consumerId", "name email phone")
        .populate({
          path: "providerId",
          select: "businessName location",
        })
        .populate({
          path: "menuId",
          select: "name description category basePrice image",
        })
        .populate("address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(query);

      return NextResponse.json({
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: SUCCESSMESSAGE.ORDERS_FETCH,
        success: true,
      });

    } else if (role === "provider") {
      // Get provider details
      const provider = await ServiceProvider.findOne({ userId });
      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }

      query.providerId = provider._id;
      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("consumerId", "name email phone")
        .populate("address")
        .populate({
          path: "menuId",
          select: "name description category",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(query);

      return NextResponse.json({
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: SUCCESSMESSAGE.ORDERS_FETCH,
        success: true,
      });

    } else if (role === "admin") {
      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("consumerId", "name email phone")
        .populate({
          path: "providerId",
          select: "businessName location",
        })
        .populate({
          path: "menuId",
          select: "name description category",
        })
        .populate("address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(query);

      return NextResponse.json({
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: SUCCESSMESSAGE.ORDERS_FETCH,
        success: true,
      });
    }

    return NextResponse.json(
      { error: "Invalid role" },
      { status: 403 }
    );
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
      return NextResponse.json(
        { error: "Only consumers can place orders", success: false },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const {
      menuId,
      providerId,
      items,
      totalAmount,
      address, // Frontend sends 'address', not 'addressId'
      addressId, // Keep backward compatibility
      orderType,
      deliveryInfo,
      timeSlot,
      paymentMethod,
      notes,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    // Use address or addressId (for backward compatibility)
    const finalAddressId = address || addressId;

    // Validate required fields
    if (!menuId || !providerId || !totalAmount || !finalAddressId || !orderType || !deliveryInfo || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["wallet", "razorpay", "cod"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method", success: false },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found", success: false },
        { status: 404 }
      );
    }

    // Verify menu exists and belongs to provider
    const menu = await Menu.findOne({ _id: menuId, providerId });
    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found or doesn't belong to provider", success: false },
        { status: 404 }
      );
    }

    // Verify address belongs to user
    const userAddress = await Address.findOne({ _id: finalAddressId, userId, isActive: true });
    if (!userAddress) {
      return NextResponse.json(
        { error: "Address not found", success: false },
        { status: 404 }
      );
    }

    // Handle payment processing
    let paymentStatus = "pending";

    try {
      if (paymentMethod === "razorpay") {
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          return NextResponse.json(
            { error: "Missing Razorpay payment details", success: false },
            { status: 400 }
          );
        }

        const isValidPayment = verifyRazorpayPayment(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );

        if (!isValidPayment) {
          return NextResponse.json(
            { error: "Invalid payment signature", success: false },
            { status: 400 }
          );
        }
        paymentStatus = "paid";
      } else if (paymentMethod === "wallet") {
        // Process wallet payment
        const walletPaymentResult = await WalletService.processOrderPayment(
          userId as string,
          "", // Will be updated with actual order ID after creation
          totalAmount,
          `Order payment for ${orderType} plan`
        );

        if (!walletPaymentResult.success) {
          return NextResponse.json(
            { error: walletPaymentResult.error, success: false },
            { status: 400 }
          );
        }
        paymentStatus = "paid";
      } else if (paymentMethod === "cod") {
        paymentStatus = "pending";
      }
    } catch (paymentError) {
      console.error("Payment processing error:", paymentError);
      return NextResponse.json(
        { error: "Payment processing failed", success: false },
        { status: 400 }
      );
    }

    // Create order
    let order;
    try {
      order = new Order({
        consumerId: userId,
        providerId,
        menuId,
        items: items || [], // Make items optional for menu-based orders
        totalAmount,
        address: finalAddressId,
        orderType,
        deliveryInfo,
        timeSlot,
        paymentMethod,
        paymentStatus,
        notes,
        status: paymentStatus === "paid" ? "confirmed" : "pending",
      });

      await order.save();
    } catch (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", success: false },
        { status: 500 }
      );
    }

    // Create delivery orders
    try {
      await createDeliveryOrders(order._id, deliveryInfo, {
        consumerId: userId as string,
        providerId,
        timeSlot,
        items: items || [],
        address: finalAddressId,
      });
    } catch (deliveryError) {
      console.error("Delivery orders creation error:", deliveryError);
      // Don't fail the entire order if delivery orders fail
      // They can be created later
    }

    // Get user details for notifications
    let customerDetails;
    try {
      customerDetails = await User.findById(userId);
    } catch (userError) {
      console.error("Error fetching user details:", userError);
    }

    // Create notifications
    try {
      await Promise.all([
        new Notification({
          userId,
          title: "Order Confirmed",
          message: `Your order from ${provider.businessName} has been confirmed.`,
          type: "order",
          priority: "medium",
          data: { orderId: order._id, providerId },
        }).save(),

        new Notification({
          userId: provider.userId,
          title: "New Order Received",
          message: `You have received a new order from ${customerDetails?.name || 'Customer'}.`,
          type: "order",
          priority: "high",
          data: { orderId: order._id, consumerId: userId },
        }).save(),
      ]);
    } catch (notificationError) {
      console.error("Notification creation error:", notificationError);
      // Don't fail the order if notifications fail
    }

    // Optional: send email and SMS notifications
    try {
      if (customerDetails) {
        const orderTypeSummary = getOrderTypeSummary(deliveryInfo);
        const orderNotificationData = {
          orderId: order._id.toString().slice(-8),
          customerName: customerDetails.name || "Customer",
          providerName: provider.businessName,
          totalAmount,
          order_type: orderTypeSummary,
        };

        // Email and SMS notifications are commented out for now
        // const emailData = getOrderConfirmationEmail(orderNotificationData);
        // await sendEmail({ to: customerDetails.email, ...emailData });

        // if (customerDetails.phone) {
        //   const smsMessage = getOrderConfirmationSMS(orderNotificationData);
        //   await sendSMS({ to: customerDetails.phone, message: smsMessage });
        // }
      }
    } catch (notificationError) {
      console.error("Email/SMS notification error:", notificationError);
      // Don't fail the order if external notifications fail
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: SUCCESSMESSAGE.ORDER_COMPLETE
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL, success: false },
      { status: 500 }
    );
  }
}