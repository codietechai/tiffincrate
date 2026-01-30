import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongoDB();

        const order = await Order.findById(params.id)
            .populate("consumerId", "name email phone")
            .populate("providerId", "businessName location")
            .populate("menuId", "name description")
            .populate("address");

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Calculate progress percentage based on status
        const statusProgress = {
            pending: 10,
            confirmed: 25,
            preparing: 50,
            ready: 70,
            out_for_delivery: 85,
            delivered: 100,
            cancelled: 0,
        };

        const trackingData = {
            orderId: order._id,
            status: order.status,
            progress: statusProgress[order.status as keyof typeof statusProgress] || 0,
            customer: {
                name: order.consumerId.name,
                email: order.consumerId.email,
            },
            provider: {
                name: order.providerId.businessName,
                location: order.providerId.location,
            },
            menu: {
                name: order.menuId.name,
                description: order.menuId.description,
            },
            deliveryAddress: order.address,
            timeSlot: order.timeSlot,
            totalAmount: order.totalAmount,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            actualDeliveryTime: order.actualDeliveryTime,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            timeline: [
                {
                    status: "pending",
                    timestamp: order.createdAt,
                    completed: true,
                    title: "Order Placed",
                    description: "Your order has been placed successfully",
                },
                {
                    status: "confirmed",
                    timestamp: order.status !== "pending" ? order.updatedAt : null,
                    completed: ["confirmed", "preparing", "ready", "out_for_delivery", "delivered"].includes(order.status),
                    title: "Order Confirmed",
                    description: "Provider has confirmed your order",
                },
                {
                    status: "preparing",
                    timestamp: order.status === "preparing" ? order.updatedAt : null,
                    completed: ["preparing", "ready", "out_for_delivery", "delivered"].includes(order.status),
                    title: "Preparing Food",
                    description: "Your meal is being prepared",
                },
                {
                    status: "ready",
                    timestamp: order.status === "ready" ? order.updatedAt : null,
                    completed: ["ready", "out_for_delivery", "delivered"].includes(order.status),
                    title: "Ready for Delivery",
                    description: "Your order is ready and will be picked up soon",
                },
                {
                    status: "out_for_delivery",
                    timestamp: order.status === "out_for_delivery" ? order.updatedAt : null,
                    completed: ["out_for_delivery", "delivered"].includes(order.status),
                    title: "Out for Delivery",
                    description: "Your order is on the way",
                },
                {
                    status: "delivered",
                    timestamp: order.actualDeliveryTime || (order.status === "delivered" ? order.updatedAt : null),
                    completed: order.status === "delivered",
                    title: "Delivered",
                    description: "Your order has been delivered successfully",
                },
            ],
        };

        return NextResponse.json({
            success: true,
            data: trackingData,
        });
    } catch (error) {
        console.error("Track order error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}