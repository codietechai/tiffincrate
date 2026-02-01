import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import DeliveryOrder from "@/models/deliveryOrders";
import "@/models/Address"; // Ensure Address model is loaded for population
import { TIME_SLOT_PERIODS, parseTimeString } from "@/utils/time-slots";

// Helper function to get time slot end time
const getTimeSlotEndTime = (timeSlot: string, date: Date): Date => {
    const period = TIME_SLOT_PERIODS[timeSlot];
    if (!period) return new Date();

    const endTime = parseTimeString(period.end);
    const slotEndTime = new Date(date);
    slotEndTime.setHours(endTime.hour, endTime.minute, 0, 0);

    return slotEndTime;
};

// Helper function to check if time slot has expired
const isTimeSlotExpired = (timeSlot: string, deliveryDate: Date): boolean => {
    const now = new Date();
    const slotEndTime = getTimeSlotEndTime(timeSlot, deliveryDate);

    // Add 1 hour buffer after time slot ends before marking as not_delivered
    const expiryTime = new Date(slotEndTime.getTime() + (60 * 60 * 1000)); // 1 hour buffer

    return now > expiryTime;
};

export async function POST(request: NextRequest) {
    try {
        // Verify this is an internal cron request (you can add authentication here)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET || "your-cron-secret-key";

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectMongoDB();

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        console.log(`[CRON] Checking expired orders for ${todayStart.toDateString()}`);

        // Find all orders that should be checked for expiry
        const ordersToCheck = await Order.find({
            createdAt: { $gte: todayStart, $lt: todayEnd },
            status: { $in: ["pending", "confirmed", "preparing", "ready", "out_for_delivery"] }
        }).populate("address");

        let expiredOrdersCount = 0;
        let processedOrdersCount = 0;

        for (const order of ordersToCheck) {
            try {
                // Check if this order should have deliveries today
                const deliveryInfo = order.deliveryInfo;
                let shouldHaveDeliveryToday = false;

                if (order.orderType === "month") {
                    const startDate = new Date(deliveryInfo.startDate!);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 30);
                    shouldHaveDeliveryToday = today >= startDate && today <= endDate;
                } else if (order.orderType === "specific_days") {
                    const todayDay = today.toLocaleString("en-IN", { weekday: "long" }).toLowerCase();
                    shouldHaveDeliveryToday = deliveryInfo.days?.map((d: string) => d.toLowerCase()).includes(todayDay);
                } else if (order.orderType === "custom_dates") {
                    const todayDate = today.toISOString().split("T")[0];
                    shouldHaveDeliveryToday = deliveryInfo.dates?.includes(todayDate);
                }

                if (!shouldHaveDeliveryToday) {
                    continue;
                }

                // Check if time slot has expired
                if (isTimeSlotExpired(order.timeSlot, today)) {
                    // Check if there's already a delivery order for today
                    let deliveryOrder = await DeliveryOrder.findOne({
                        orderId: order._id,
                        deliveryDate: {
                            $gte: todayStart,
                            $lt: todayEnd
                        }
                    });

                    // If no delivery order exists, create one with not_delivered status
                    if (!deliveryOrder) {
                        deliveryOrder = new DeliveryOrder({
                            orderId: order._id,
                            consumerId: order.consumerId,
                            providerId: order.providerId,
                            deliveryDate: today,
                            timeSlot: order.timeSlot,
                            status: "not_delivered",
                            items: order.items || [],
                            address: order.address,
                            notDeliveredAt: new Date(),
                            cancelReason: `Time slot expired - ${order.timeSlot} delivery window closed`
                        });

                        await deliveryOrder.save();
                        expiredOrdersCount++;
                        console.log(`[CRON] Created not_delivered order for Order ID: ${order._id}, Time Slot: ${order.timeSlot}`);
                    }
                    // If delivery order exists but not delivered, mark as not_delivered
                    else if (deliveryOrder.status !== "delivered" && deliveryOrder.status !== "not_delivered") {
                        deliveryOrder.status = "not_delivered";
                        deliveryOrder.notDeliveredAt = new Date();
                        deliveryOrder.cancelReason = `Time slot expired - ${order.timeSlot} delivery window closed`;

                        await deliveryOrder.save();
                        expiredOrdersCount++;
                        console.log(`[CRON] Updated to not_delivered - Order ID: ${order._id}, Time Slot: ${order.timeSlot}`);
                    }
                }

                processedOrdersCount++;
            } catch (orderError) {
                console.error(`[CRON] Error processing order ${order._id}:`, orderError);
            }
        }

        const summary = {
            processedOrders: processedOrdersCount,
            expiredOrders: expiredOrdersCount,
            timestamp: new Date().toISOString(),
            date: todayStart.toDateString()
        };

        console.log(`[CRON] Completed: ${JSON.stringify(summary)}`);

        return NextResponse.json({
            success: true,
            message: "Expired orders check completed",
            data: summary
        });

    } catch (error) {
        console.error("[CRON] Error in expired orders check:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// GET method for manual testing
export async function GET(request: NextRequest) {
    try {
        // Allow GET requests for testing (you might want to remove this in production)
        const testMode = request.nextUrl.searchParams.get("test");

        if (testMode !== "true") {
            return NextResponse.json(
                { error: "Use POST method for cron execution" },
                { status: 405 }
            );
        }

        // Create a mock POST request for testing
        const mockRequest = new NextRequest(request.url, {
            method: "POST",
            headers: {
                "authorization": `Bearer ${process.env.CRON_SECRET || "your-cron-secret-key"}`
            }
        });

        return POST(mockRequest);
    } catch (error) {
        return NextResponse.json(
            { error: "Test execution failed" },
            { status: 500 }
        );
    }
}