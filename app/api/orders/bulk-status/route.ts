import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";

export async function PATCH(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (role !== "provider") {
            return NextResponse.json(
                { error: "Only providers can update order status" },
                { status: 403 },
            );
        }

        await connectMongoDB();

        const { status, orderIds } = await request.json();

        // Get provider info
        const provider = await ServiceProvider.findOne({ userId });
        if (!provider) {
            return NextResponse.json(
                { error: "Provider not found" },
                { status: 404 },
            );
        }

        // Update multiple orders at once
        const result = await Order.updateMany(
            {
                _id: { $in: orderIds },
                providerId: provider._id,
            },
            {
                $set: {
                    status: status,
                    ...(status === "out_for_delivery" && {
                        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
                    }),
                    ...(status === "delivered" && {
                        actualDeliveryTime: new Date(),
                    }),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "No orders found or unauthorized" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: `${result.modifiedCount} orders updated to ${status}`,
            updatedCount: result.modifiedCount,
            success: true,
        });
    } catch (error) {
        console.error("Bulk update order status error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}