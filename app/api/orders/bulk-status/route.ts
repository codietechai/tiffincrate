import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
import ServiceProvider from "@/models/ServiceProvider";

export async function PATCH(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (role !== "provider") {
            return NextResponse.json(
                { error: "Only providers can update delivery order status" },
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

        // Prepare update object with status timestamps
        const updateObj: any = {
            status: status,
        };

        // Add appropriate timestamp based on status
        switch (status) {
            case "confirmed":
                updateObj.confirmedAt = new Date();
                break;
            case "preparing":
                updateObj.preparingAt = new Date();
                break;
            case "ready":
                updateObj.readyAt = new Date();
                break;
            case "out_for_delivery":
                updateObj.outForDeliveryAt = new Date();
                updateObj.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
                break;
            case "delivered":
                updateObj.deliveredAt = new Date();
                updateObj.actualDeliveryTime = new Date();
                break;
            case "cancelled":
                updateObj.cancelledAt = new Date();
                break;
            case "not_delivered":
                updateObj.notDeliveredAt = new Date();
                break;
        }

        // Update multiple delivery orders at once
        const result = await DeliveryOrder.updateMany(
            {
                _id: { $in: orderIds },
                providerId: provider._id,
            },
            { $set: updateObj }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "No delivery orders found or unauthorized" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: `${result.modifiedCount} delivery orders updated to ${status}`,
            updatedCount: result.modifiedCount,
            success: true,
        });
    } catch (error) {
        console.error("Bulk update delivery order status error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}