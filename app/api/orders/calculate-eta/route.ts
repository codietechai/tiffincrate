import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (role !== "provider") {
            return NextResponse.json(
                { error: "Only providers can calculate ETA" },
                { status: 403 },
            );
        }

        await connectMongoDB();

        const { orderIds, driverLocation } = await request.json();

        if (!driverLocation || !orderIds?.length) {
            return NextResponse.json(
                { error: "Driver location and order IDs are required" },
                { status: 400 },
            );
        }

        // Get provider info
        const provider = await ServiceProvider.findOne({ userId });
        if (!provider) {
            return NextResponse.json(
                { error: "Provider not found" },
                { status: 404 },
            );
        }

        // Get orders with addresses
        const orders = await Order.find({
            _id: { $in: orderIds },
            providerId: provider._id,
        }).populate("address");

        if (!orders.length) {
            return NextResponse.json(
                { error: "No orders found" },
                { status: 404 },
            );
        }

        // Calculate ETAs using Google Distance Matrix API
        const destinations = orders.map(order =>
            `${order.address.latitude},${order.address.longitude}`
        ).join('|');

        const origin = `${driverLocation.lat},${driverLocation.lng}`;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&mode=driving&traffic_model=best_guess&departure_time=now`
            );

            const data = await response.json();

            if (data.status === 'OK') {
                const etaResults = orders.map((order, index) => {
                    const element = data.rows[0].elements[index];

                    if (element.status === 'OK') {
                        const durationInTraffic = element.duration_in_traffic || element.duration;
                        const estimatedDeliveryTime = new Date(Date.now() + durationInTraffic.value * 1000);

                        return {
                            orderId: order._id,
                            customerId: order.consumerId,
                            estimatedDeliveryTime,
                            durationMinutes: Math.ceil(durationInTraffic.value / 60),
                            distance: element.distance.text,
                        };
                    }

                    return {
                        orderId: order._id,
                        customerId: order.consumerId,
                        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // Default 30 minutes
                        durationMinutes: 30,
                        distance: 'Unknown',
                    };
                });

                // Update orders with calculated ETAs
                const updatePromises = etaResults.map(eta =>
                    Order.findByIdAndUpdate(eta.orderId, {
                        estimatedDeliveryTime: eta.estimatedDeliveryTime,
                    })
                );

                await Promise.all(updatePromises);

                return NextResponse.json({
                    success: true,
                    message: "ETAs calculated successfully",
                    data: etaResults,
                });
            } else {
                throw new Error(`Google API error: ${data.status}`);
            }
        } catch (apiError) {
            console.error("Google Distance Matrix API error:", apiError);

            // Fallback: Calculate basic ETA based on straight-line distance
            const fallbackETAs = orders.map(order => {
                const distance = calculateDistance(
                    driverLocation.lat,
                    driverLocation.lng,
                    order.address.latitude,
                    order.address.longitude
                );

                // Assume average speed of 30 km/h in city traffic
                const durationMinutes = Math.ceil((distance / 30) * 60);
                const estimatedDeliveryTime = new Date(Date.now() + durationMinutes * 60 * 1000);

                return {
                    orderId: order._id,
                    customerId: order.consumerId,
                    estimatedDeliveryTime,
                    durationMinutes,
                    distance: `${distance.toFixed(1)} km`,
                };
            });

            return NextResponse.json({
                success: true,
                message: "ETAs calculated using fallback method",
                data: fallbackETAs,
            });
        }
    } catch (error) {
        console.error("Calculate ETA error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// Helper function to calculate straight-line distance
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}