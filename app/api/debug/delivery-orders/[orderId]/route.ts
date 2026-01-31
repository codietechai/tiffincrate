import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
import mongoose from "mongoose";

export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const { orderId } = params;

        await connectMongoDB();

        // Fetch all delivery orders for this order
        const deliveryOrders = await DeliveryOrder.find({
            orderId: new mongoose.Types.ObjectId(orderId)
        })
            .sort({ deliveryDate: 1 })
            .lean();

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return NextResponse.json({
            success: true,
            data: {
                orderId,
                totalDeliveryOrders: deliveryOrders.length,
                today: today.toISOString(),
                tomorrow: tomorrow.toISOString(),
                deliveryOrders: deliveryOrders.map(delivery => ({
                    _id: delivery._id,
                    deliveryDate: delivery.deliveryDate,
                    deliveryStatus: delivery.deliveryStatus,
                    createdAt: delivery.createdAt,
                    isToday: new Date(delivery.deliveryDate).toDateString() === today.toDateString(),
                    isTomorrow: new Date(delivery.deliveryDate).toDateString() === tomorrow.toDateString(),
                    daysDifference: Math.floor((new Date(delivery.deliveryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                }))
            }
        });

    } catch (error) {
        console.error("Debug delivery orders error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}