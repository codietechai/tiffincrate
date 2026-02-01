import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryOrder from "@/models/deliveryOrders";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required", success: false },
                { status: 401 }
            );
        }

        if (role !== "consumer") {
            return NextResponse.json(
                { error: "Only consumers can access delivery orders", success: false },
                { status: 403 }
            );
        }

        await connectMongoDB();

        const { searchParams } = new URL(request.url);
        const days = Math.min(parseInt(searchParams.get("days") || "7"), 30); // Max 30 days

        // Get upcoming delivery orders (today and next N days)
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endDate = new Date(startOfToday);
        endDate.setDate(endDate.getDate() + days);

        // Query using the new schema structure
        const upcomingDeliveries = await DeliveryOrder.find({
            consumerId: userId,
            deliveryDate: {
                $gte: startOfToday,
                $lt: endDate
            },
            status: {
                $in: ["pending", "confirmed", "preparing", "ready", "out_for_delivery"]
            }
        })
            .populate({
                path: "orderId",
                select: "totalAmount paymentMethod paymentStatus items notes menuId orderType deliveryInfo timeSlot",
                populate: {
                    path: "menuId",
                    select: "name description category basePrice image isVegetarian menuItems",
                    populate: {
                        path: "providerId",
                        select: "businessName description rating location phone"
                    }
                }
            })
            .populate("providerId", "businessName description rating location phone")
            .populate("address", "addressLine1 addressLine2 city state pincode landmark deliveryInstructions location")
            .sort({ deliveryDate: 1, timeSlot: 1 })
            .lean();

        // Transform data for better frontend consumption
        const transformedDeliveries = upcomingDeliveries.map((delivery: any) => ({
            ...delivery,
            // Add convenience fields for frontend
            menu: delivery.orderId?.menuId || null,
            order: delivery.orderId || null,
            provider: delivery.providerId || null,
        }));

        // Group by delivery date for better organization
        const groupedDeliveries = transformedDeliveries.reduce((acc: Record<string, any[]>, delivery: any) => {
            const dateKey = new Date(delivery.deliveryDate).toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(delivery);
            return acc;
        }, {});

        // Get summary statistics
        const summary = {
            totalUpcoming: transformedDeliveries.length,
            byStatus: transformedDeliveries.reduce((acc: Record<string, number>, delivery: any) => {
                const status = delivery.status || 'pending';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {}),
            byTimeSlot: transformedDeliveries.reduce((acc: Record<string, number>, delivery: any) => {
                const timeSlot = delivery.timeSlot || 'lunch';
                acc[timeSlot] = (acc[timeSlot] || 0) + 1;
                return acc;
            }, {}),
            totalAmount: transformedDeliveries.reduce((sum: number, delivery: any) => {
                return sum + (delivery.order?.totalAmount || 0);
            }, 0)
        };

        return NextResponse.json({
            success: true,
            data: transformedDeliveries,
            groupedData: groupedDeliveries,
            summary,
            message: SUCCESSMESSAGE.DELIVERY_ORDERS_FETCH
        });

    } catch (error) {
        console.error("Fetch upcoming deliveries error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch upcoming deliveries",
                success: false
            },
            { status: 500 }
        );
    }
}