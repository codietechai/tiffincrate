import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import DeliveryOrder from "@/models/deliveryOrders";
import mongoose from "mongoose";
import { WalletService } from "@/services/wallet-service";

// Define the populated order type
interface PopulatedOrder {
  _id: mongoose.Types.ObjectId;
  consumerId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
  providerId: {
    _id: mongoose.Types.ObjectId;
    businessName: string;
    description?: string;
    rating?: number;
    location?: any;
  };
  menuId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    image?: string;
    price?: number;
  };
  address: {
    _id: mongoose.Types.ObjectId;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    region: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
  };
  orderType: string;
  deliveryInfo: any;
  totalAmount: number;
  status: string;
  timeSlot: string;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const { id } = params;

    await connectMongoDB();

    // Build query based on user role
    let query: any = { _id: new mongoose.Types.ObjectId(id) };
    if (role === "consumer") {
      query.consumerId = new mongoose.Types.ObjectId(userId as string);
    } else if (role === "provider") {
      query.providerId = new mongoose.Types.ObjectId(userId as string);
    }

    const order = await Order.findOne(query)
      .populate({
        path: 'consumerId',
        select: 'name email phone'
      })
      .populate({
        path: 'providerId',
        select: 'businessName description rating location'
      })
      .populate({
        path: 'menuId',
        select: 'name description image price'
      })
      .populate({
        path: 'address',
        select: 'address_line_1 address_line_2 city region postal_code latitude longitude'
      })
      .lean() as PopulatedOrder | null;

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch all delivery orders for this main order
    const deliveryOrders = await DeliveryOrder.find({ orderId: order._id })
      .sort({ deliveryDate: 1 })
      .lean();

    // Format the response to match frontend expectations
    const formattedOrder = {
      _id: order._id,
      consumerId: order.consumerId,
      providerId: order.providerId,
      menuId: order.menuId,
      orderType: order.orderType,
      deliveryInfo: order.deliveryInfo,
      totalAmount: order.totalAmount,
      status: order.status,
      address: order.address,
      timeSlot: order.timeSlot,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Add delivery orders for individual days
      deliveryOrders: deliveryOrders.map(delivery => ({
        _id: delivery._id,
        deliveryDate: delivery.deliveryDate,
        deliveryStatus: delivery.deliveryStatus,
        pendingAt: delivery.pendingAt,
        confirmedAt: delivery.confirmedAt,
        readyAt: delivery.readyAt,
        assignedAt: delivery.assignedAt,
        outForDeliveryAt: delivery.outForDeliveryAt,
        deliveredAt: delivery.deliveredAt,
        notDeliveredAt: delivery.notDeliveredAt,
        cancelledAt: delivery.cancelledAt,
        preparationStartAt: delivery.preparationStartAt,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt
      })),
      // Legacy fields for backward compatibility
      deliveryAddress: {
        address: order.address ?
          `${order.address.address_line_1}${order.address.address_line_2 ? ', ' + order.address.address_line_2 : ''}, ${order.address.city}, ${order.address.region} - ${order.address.postal_code}`
          : 'Address not available'
      },
      deliveryDate: order.estimatedDeliveryTime || order.createdAt,
      items: [
        {
          name: order.menuId?.name || 'Menu Item',
          quantity: 1,
          price: order.totalAmount
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: formattedOrder
    });

  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cancel order endpoint - supports both whole order and individual delivery cancellation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const { id } = params;
    const { action, deliveryOrderId } = await request.json();

    await connectMongoDB();

    // Build query based on user role
    let query: any = { _id: new mongoose.Types.ObjectId(id) };
    if (role === "consumer") {
      query.consumerId = new mongoose.Types.ObjectId(userId as string);
    }

    const order = await Order.findOne(query);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (action === "cancel_whole_order") {
      // Cancel entire order
      if (order.status === "delivered" || order.status === "cancelled") {
        return NextResponse.json(
          { error: "Order cannot be cancelled" },
          { status: 400 }
        );
      }

      // Cancel all delivery orders
      await DeliveryOrder.updateMany(
        { orderId: order._id },
        {
          deliveryStatus: "cancelled",
          cancelledAt: new Date()
        }
      );

      order.status = "cancelled";
      order.updatedAt = new Date();
      await order.save();

      return NextResponse.json({
        success: true,
        message: "Entire order cancelled successfully",
        data: order
      });

    } else if (action === "cancel_delivery" && deliveryOrderId) {
      // Cancel individual delivery
      const deliveryOrder = await DeliveryOrder.findOne({
        _id: new mongoose.Types.ObjectId(deliveryOrderId),
        orderId: order._id
      });

      if (!deliveryOrder) {
        return NextResponse.json(
          { error: "Delivery order not found" },
          { status: 404 }
        );
      }

      // Check if delivery can be cancelled based on time rules
      const { canCancelDelivery } = await import("@/utils/time-slots");
      const cancellationCheck = canCancelDelivery(
        deliveryOrder.deliveryDate,
        order.timeSlot as 'breakfast' | 'lunch' | 'dinner'
      );

      if (!cancellationCheck.canCancel) {
        return NextResponse.json(
          { error: cancellationCheck.reason || "Cannot cancel this delivery" },
          { status: 400 }
        );
      }

      // Calculate refund amount (total order amount / number of delivery days)
      const totalDeliveryOrders = await DeliveryOrder.countDocuments({
        orderId: order._id
      });
      const refundAmount = Math.round((order.totalAmount / totalDeliveryOrders) * 100) / 100;

      // Process refund if order was paid
      let refundProcessed = false;
      if (order.paymentStatus === "paid") {
        const refundResult = await WalletService.processCancellationRefund(
          order.consumerId.toString(),
          order._id.toString(),
          deliveryOrderId,
          refundAmount,
          `Refund for cancelled delivery on ${new Date(deliveryOrder.deliveryDate).toDateString()}`
        );

        if (!refundResult.success) {
          return NextResponse.json(
            { error: `Cancellation failed: ${refundResult.error}` },
            { status: 400 }
          );
        }
        refundProcessed = true;
      }

      // Cancel the specific delivery
      deliveryOrder.deliveryStatus = "cancelled";
      deliveryOrder.cancelledAt = new Date();
      await deliveryOrder.save();

      // Check if all deliveries are cancelled, then cancel the main order
      const remainingDeliveries = await DeliveryOrder.countDocuments({
        orderId: order._id,
        deliveryStatus: { $ne: "cancelled" }
      });

      if (remainingDeliveries === 0) {
        order.status = "cancelled";
        order.updatedAt = new Date();
        await order.save();
      }

      return NextResponse.json({
        success: true,
        message: refundProcessed ?
          "Delivery cancelled and refund processed successfully" :
          "Delivery cancelled successfully",
        data: {
          deliveryOrder,
          orderStatus: order.status,
          refundAmount: refundProcessed ? refundAmount : 0,
          refundProcessed
        }
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}