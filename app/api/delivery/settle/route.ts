import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
import Order from "@/models/Order";
import { WalletService } from "@/services/wallet-service";

// Settle delivery payment (Provider gets paid after delivery)
export async function POST(request: NextRequest) {
    try {
        const adminId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        // Only admin or system can trigger settlements
        if (role !== "admin" && role !== "system") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { deliveryOrderId, settlementType = "automatic" } = await request.json();

        if (!deliveryOrderId) {
            return NextResponse.json(
                { error: "Delivery order ID is required" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        // Get delivery order with populated data
        const deliveryOrder = await DeliveryOrder.findById(deliveryOrderId)
            .populate({
                path: 'orderId',
                populate: [
                    { path: 'providerId', select: '_id' },
                    { path: 'consumerId', select: '_id' }
                ]
            });

        if (!deliveryOrder) {
            return NextResponse.json(
                { error: "Delivery order not found" },
                { status: 404 }
            );
        }

        // Check if delivery is completed
        if (deliveryOrder.deliveryStatus !== "delivered") {
            return NextResponse.json(
                { error: "Can only settle delivered orders" },
                { status: 400 }
            );
        }

        const order = deliveryOrder.orderId as any;

        // Calculate meal amount (total order amount / number of delivery days)
        const totalDeliveryOrders = await DeliveryOrder.countDocuments({
            orderId: order._id
        });
        const mealAmount = Math.round((order.totalAmount / totalDeliveryOrders) * 100) / 100;

        // Process settlement
        const settlementResult = await WalletService.processDeliverySettlement(
            deliveryOrderId,
            order.providerId._id.toString(),
            order._id.toString(),
            order.consumerId._id.toString(),
            mealAmount,
            deliveryOrder.deliveryDate,
            settlementType
        );

        if (!settlementResult.success) {
            return NextResponse.json(
                { error: settlementResult.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: settlementResult.data,
            message: "Delivery settlement processed successfully"
        });

    } catch (error) {
        console.error("Delivery settlement error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Auto-settle all delivered orders (can be called by cron job)
export async function PATCH(request: NextRequest) {
    try {
        const adminId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (role !== "admin" && role !== "system") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        await connectMongoDB();

        // Get all delivered orders that haven't been settled
        const deliveredOrders = await DeliveryOrder.find({
            deliveryStatus: "delivered",
            // Add a field to track if settlement is processed
            settlementProcessed: { $ne: true }
        }).populate({
            path: 'orderId',
            populate: [
                { path: 'providerId', select: '_id' },
                { path: 'consumerId', select: '_id' }
            ]
        });

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const deliveryOrder of deliveredOrders) {
            try {
                const order = deliveryOrder.orderId as any;

                // Calculate meal amount
                const totalDeliveryOrders = await DeliveryOrder.countDocuments({
                    orderId: order._id
                });
                const mealAmount = Math.round((order.totalAmount / totalDeliveryOrders) * 100) / 100;

                // Process settlement
                const settlementResult = await WalletService.processDeliverySettlement(
                    deliveryOrder._id.toString(),
                    order.providerId._id.toString(),
                    order._id.toString(),
                    order.consumerId._id.toString(),
                    mealAmount,
                    deliveryOrder.deliveryDate,
                    "automatic"
                );

                if (settlementResult.success) {
                    // Mark as processed
                    await DeliveryOrder.findByIdAndUpdate(deliveryOrder._id, {
                        settlementProcessed: true
                    });
                    successCount++;
                } else {
                    errorCount++;
                }

                results.push({
                    deliveryOrderId: deliveryOrder._id,
                    success: settlementResult.success,
                    error: settlementResult.error
                });

            } catch (error) {
                errorCount++;
                results.push({
                    deliveryOrderId: deliveryOrder._id,
                    success: false,
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                totalProcessed: deliveredOrders.length,
                successCount,
                errorCount,
                results
            },
            message: `Auto-settlement completed: ${successCount} successful, ${errorCount} failed`
        });

    } catch (error) {
        console.error("Auto-settlement error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}