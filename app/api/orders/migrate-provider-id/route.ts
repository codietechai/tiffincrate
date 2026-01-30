import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Menu from "@/models/Menu";

export async function POST(request: NextRequest) {
    try {
        const role = request.headers.get("x-user-role");

        // Only allow admin to run migration
        if (role !== "admin") {
            return NextResponse.json(
                { error: "Only admin can run migrations" },
                { status: 403 }
            );
        }

        await connectMongoDB();

        // Find all orders without providerId
        const ordersWithoutProviderId = await Order.find({
            providerId: { $exists: false }
        }).populate("menuId");

        let updatedCount = 0;
        let errorCount = 0;

        for (const order of ordersWithoutProviderId) {
            try {
                if (order.menuId && order.menuId.providerId) {
                    await Order.findByIdAndUpdate(order._id, {
                        providerId: order.menuId.providerId
                    });
                    updatedCount++;
                } else {
                    console.error(`Order ${order._id} has no valid menu or providerId`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`Error updating order ${order._id}:`, error);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration completed. Updated ${updatedCount} orders, ${errorCount} errors.`,
            data: {
                totalOrders: ordersWithoutProviderId.length,
                updatedCount,
                errorCount,
            }
        });

    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json(
            { error: "Migration failed" },
            { status: 500 }
        );
    }
}

// Alternative GET method to check how many orders need migration
export async function GET(request: NextRequest) {
    try {
        const role = request.headers.get("x-user-role");

        if (role !== "admin") {
            return NextResponse.json(
                { error: "Only admin can check migration status" },
                { status: 403 }
            );
        }

        await connectMongoDB();

        const totalOrders = await Order.countDocuments();
        const ordersWithoutProviderId = await Order.countDocuments({
            providerId: { $exists: false }
        });
        const ordersWithProviderId = await Order.countDocuments({
            providerId: { $exists: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalOrders,
                ordersWithoutProviderId,
                ordersWithProviderId,
                migrationNeeded: ordersWithoutProviderId > 0,
            }
        });

    } catch (error) {
        console.error("Migration check error:", error);
        return NextResponse.json(
            { error: "Migration check failed" },
            { status: 500 }
        );
    }
}