import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import DeliveryOrder from "@/models/deliveryOrders";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import Address from "@/models/Address";
import Menu from "@/models/Menu";

export async function POST(_request: NextRequest) {
    try {
        await connectMongoDB();

        // Get existing data
        const providers = await ServiceProvider.find().limit(3);
        const customers = await User.find({ role: "consumer" }).limit(5);
        const addresses = await Address.find().limit(5);
        const menus = await Menu.find().limit(3);

        if (!providers.length || !customers.length || !addresses.length || !menus.length) {
            return NextResponse.json({
                error: "Insufficient seed data. Please ensure you have providers, customers, addresses, and menus in the database.",
                required: {
                    providers: providers.length,
                    customers: customers.length,
                    addresses: addresses.length,
                    menus: menus.length
                }
            }, { status: 400 });
        }

        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const now = new Date();

        // Clear existing delivery orders for today
        await DeliveryOrder.deleteMany({
            deliveryDate: {
                $gte: todayStart,
                $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        const timeSlots = ["breakfast", "lunch", "dinner"];
        const statuses = ["pending", "confirmed", "preparing", "ready", "out_for_delivery"];

        const deliveryOrders = [];

        // Create sample orders first
        const sampleOrders = [];

        for (let i = 0; i < 15; i++) {
            const provider = providers[i % providers.length];
            const customer = customers[i % customers.length];
            const menu = menus[i % menus.length];

            const order = new Order({
                consumerId: customer._id,
                providerId: provider._id,
                menuId: menu._id,
                orderType: "month",
                deliveryInfo: {
                    type: "month",
                    startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
                },
                totalAmount: 150 + (i * 10),
                status: "confirmed",
                address: addresses[i % addresses.length]._id,
                timeSlot: timeSlots[i % timeSlots.length],
                paymentStatus: "paid",
                paymentMethod: "razorpay",
                notes: `Test order ${i + 1} for delivery system testing`,
                items: [
                    {
                        menuItemId: menu._id,
                        name: `${menu.name} - Item ${i + 1}`,
                        price: 150 + (i * 10),
                        quantity: 1
                    }
                ]
            });

            await order.save();
            sampleOrders.push(order);
        }

        // Create delivery orders for today
        for (let i = 0; i < sampleOrders.length; i++) {
            const order = sampleOrders[i];
            const timeSlot = timeSlots[i % timeSlots.length];
            const status = statuses[i % statuses.length];

            // Create timestamps based on status
            const now = new Date();
            const timestamps: any = {
                pendingAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            };

            if (["confirmed", "preparing", "ready", "out_for_delivery"].includes(status)) {
                timestamps.confirmedAt = new Date(now.getTime() - 50 * 60 * 1000); // 50 min ago
            }
            if (["preparing", "ready", "out_for_delivery"].includes(status)) {
                timestamps.preparingAt = new Date(now.getTime() - 40 * 60 * 1000); // 40 min ago
            }
            if (["ready", "out_for_delivery"].includes(status)) {
                timestamps.readyAt = new Date(now.getTime() - 30 * 60 * 1000); // 30 min ago
            }
            if (status === "out_for_delivery") {
                timestamps.outForDeliveryAt = new Date(now.getTime() - 20 * 60 * 1000); // 20 min ago
                timestamps.estimatedDeliveryTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 min from now
            }

            const deliveryOrder = new DeliveryOrder({
                orderId: order._id,
                consumerId: order.consumerId,
                providerId: order.providerId,
                deliveryDate: today,
                timeSlot: timeSlot,
                status: status,
                items: order.items,
                address: order.address,
                ...timestamps,
                deliveryNotes: `Test delivery for ${timeSlot} slot - Status: ${status}`,
            });

            await deliveryOrder.save();
            deliveryOrders.push(deliveryOrder);
        }

        // Create some expired orders (not_delivered) for testing cron job
        const expiredTimeSlots = ["breakfast"]; // Breakfast should be expired by now

        for (const expiredSlot of expiredTimeSlots) {
            const provider = providers[0];
            const customer = customers[0];
            const menu = menus[0];

            const expiredOrder = new Order({
                consumerId: customer._id,
                providerId: provider._id,
                menuId: menu._id,
                orderType: "month",
                deliveryInfo: {
                    type: "month",
                    startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
                },
                totalAmount: 120,
                status: "confirmed",
                address: addresses[0]._id,
                timeSlot: expiredSlot,
                paymentStatus: "paid",
                paymentMethod: "razorpay",
                notes: `Expired ${expiredSlot} order for cron job testing`,
                items: [
                    {
                        menuItemId: menu._id,
                        name: `${menu.name} - Expired ${expiredSlot}`,
                        price: 120,
                        quantity: 1
                    }
                ]
            });

            await expiredOrder.save();

            const expiredDeliveryOrder = new DeliveryOrder({
                orderId: expiredOrder._id,
                consumerId: expiredOrder.consumerId,
                providerId: expiredOrder.providerId,
                deliveryDate: today,
                timeSlot: expiredSlot,
                status: "ready", // Ready but not delivered (should be marked as not_delivered by cron)
                items: expiredOrder.items,
                address: expiredOrder.address,
                pendingAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
                confirmedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                preparingAt: new Date(now.getTime() - 90 * 60 * 1000),
                readyAt: new Date(now.getTime() - 60 * 60 * 1000),
                deliveryNotes: `Expired ${expiredSlot} order - should be marked as not_delivered`,
            });

            await expiredDeliveryOrder.save();
            deliveryOrders.push(expiredDeliveryOrder);
        }

        return NextResponse.json({
            success: true,
            message: "Delivery orders seeded successfully",
            data: {
                totalDeliveryOrders: deliveryOrders.length,
                totalOrders: sampleOrders.length + expiredTimeSlots.length,
                breakdown: {
                    breakfast: deliveryOrders.filter(d => d.timeSlot === "breakfast").length,
                    lunch: deliveryOrders.filter(d => d.timeSlot === "lunch").length,
                    dinner: deliveryOrders.filter(d => d.timeSlot === "dinner").length,
                },
                statusBreakdown: {
                    pending: deliveryOrders.filter(d => d.status === "pending").length,
                    confirmed: deliveryOrders.filter(d => d.status === "confirmed").length,
                    preparing: deliveryOrders.filter(d => d.status === "preparing").length,
                    ready: deliveryOrders.filter(d => d.status === "ready").length,
                    out_for_delivery: deliveryOrders.filter(d => d.status === "out_for_delivery").length,
                }
            }
        });

    } catch (error) {
        console.error("Seed delivery orders error:", error);
        return NextResponse.json(
            {
                error: "Failed to seed delivery orders",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}