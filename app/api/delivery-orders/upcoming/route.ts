import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (role !== "consumer") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        await connectMongoDB();

        // Get upcoming delivery orders (today and next 7 days)
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endDate = new Date(startOfToday);
        endDate.setDate(endDate.getDate() + 7); // Next 7 days

        // First, get all orders for this consumer
        const userOrders = await Order.find({
            consumerId: new mongoose.Types.ObjectId(userId as string)
        }).select('_id');

        const orderIds = userOrders.map(order => order._id);

        // Get delivery orders for these orders within the date range
        const upcomingDeliveries = await DeliveryOrder.aggregate([
            {
                $match: {
                    orderId: { $in: orderIds },
                    deliveryDate: {
                        $gte: startOfToday,
                        $lt: endDate
                    },
                    deliveryStatus: { $ne: "cancelled" }
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "order"
                }
            },
            { $unwind: "$order" },
            {
                $lookup: {
                    from: "users",
                    localField: "order.consumerId",
                    foreignField: "_id",
                    as: "consumer"
                }
            },
            { $unwind: "$consumer" },
            {
                $lookup: {
                    from: "serviceproviders",
                    localField: "order.providerId",
                    foreignField: "_id",
                    as: "provider"
                }
            },
            { $unwind: "$provider" },
            {
                $lookup: {
                    from: "menus",
                    localField: "order.menuId",
                    foreignField: "_id",
                    as: "menu"
                }
            },
            { $unwind: "$menu" },
            {
                $lookup: {
                    from: "addresses",
                    localField: "order.address",
                    foreignField: "_id",
                    as: "address"
                }
            },
            { $unwind: "$address" },
            {
                $sort: { deliveryDate: 1 }
            },
            {
                $project: {
                    _id: 1,
                    deliveryDate: 1,
                    deliveryStatus: 1,
                    pendingAt: 1,
                    confirmedAt: 1,
                    readyAt: 1,
                    assignedAt: 1,
                    outForDeliveryAt: 1,
                    deliveredAt: 1,
                    notDeliveredAt: 1,
                    cancelledAt: 1,
                    preparationStartAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    order: {
                        _id: "$order._id",
                        orderType: "$order.orderType",
                        deliveryInfo: "$order.deliveryInfo",
                        totalAmount: "$order.totalAmount",
                        status: "$order.status",
                        timeSlot: "$order.timeSlot",
                        paymentStatus: "$order.paymentStatus",
                        paymentMethod: "$order.paymentMethod",
                        notes: "$order.notes",
                        estimatedDeliveryTime: "$order.estimatedDeliveryTime",
                        actualDeliveryTime: "$order.actualDeliveryTime",
                        createdAt: "$order.createdAt",
                        updatedAt: "$order.updatedAt"
                    },
                    consumer: {
                        _id: "$consumer._id",
                        name: "$consumer.name",
                        email: "$consumer.email",
                        phone: "$consumer.phone"
                    },
                    provider: {
                        _id: "$provider._id",
                        businessName: "$provider.businessName",
                        description: "$provider.description",
                        rating: "$provider.rating",
                        location: "$provider.location"
                    },
                    menu: {
                        _id: "$menu._id",
                        name: "$menu.name",
                        description: "$menu.description",
                        image: "$menu.image",
                        price: "$menu.price"
                    },
                    address: {
                        _id: "$address._id",
                        address_line_1: "$address.address_line_1",
                        address_line_2: "$address.address_line_2",
                        city: "$address.city",
                        region: "$address.region",
                        postal_code: "$address.postal_code",
                        latitude: "$address.latitude",
                        longitude: "$address.longitude"
                    }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: upcomingDeliveries,
            message: "Upcoming deliveries fetched successfully"
        });

    } catch (error) {
        console.error("Fetch upcoming deliveries error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}