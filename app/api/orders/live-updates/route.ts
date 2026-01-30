import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "provider") {
        return NextResponse.json(
            { error: "Only providers can access live updates" },
            { status: 403 },
        );
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected", message: "Live updates connected" })}\n\n`)
            );

            // Set up interval to send updates every 30 seconds
            const interval = setInterval(async () => {
                try {
                    await connectMongoDB();

                    const provider = await ServiceProvider.findOne({ userId });
                    if (!provider) return;

                    // Get today's orders for this provider
                    const today = new Date();
                    const todayDate = today.toISOString().split("T")[0];
                    const todayDay = today.toLocaleString("en-IN", { weekday: "long" }).toLowerCase();

                    const orders = await Order.find({ providerId: provider._id })
                        .populate("consumerId", "name email phone")
                        .populate("menuId", "name description")
                        .populate("address")
                        .sort({ createdAt: -1 });

                    // Filter for today's deliveries
                    const todayOrders = orders.filter((order) => {
                        const info = order.deliveryInfo;

                        if (order.orderType === "month") {
                            const start = new Date(info.startDate!);
                            const end = new Date(start);
                            end.setDate(start.getDate() + 30);
                            return today >= start && today <= end;
                        }

                        if (order.orderType === "specific_days") {
                            return info.days?.map((d: any) => d.toLowerCase()).includes(todayDay);
                        }

                        if (order.orderType === "custom_dates") {
                            return info.dates?.includes(todayDate);
                        }

                        return false;
                    });

                    const updateData = {
                        type: "orders_update",
                        data: todayOrders,
                        timestamp: new Date().toISOString(),
                    };

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(updateData)}\n\n`)
                    );
                } catch (error) {
                    console.error("Live updates error:", error);
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Update failed" })}\n\n`)
                    );
                }
            }, 30000); // Update every 30 seconds

            // Clean up on close
            request.signal.addEventListener("abort", () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        },
    });
}