import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { RESPONSE_MESSAGES } from "@/constants/response-messages";

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const userRole = request.headers.get("x-user-role");

        if (userRole !== "provider") {
            return NextResponse.json(
                { error: "Provider access required" },
                { status: 403 }
            );
        }

        await connectMongoDB();

        // Get provider details
        const provider = await User.findById(userId).select("name email settings");
        if (!provider) {
            return NextResponse.json(
                { error: "Provider not found" },
                { status: 404 }
            );
        }

        // Check if weekly digest is enabled in settings
        if (!provider.settings?.notifications?.weeklyDigest) {
            return NextResponse.json(
                { error: "Weekly digest is disabled in your notification settings" },
                { status: 400 }
            );
        }

        // Calculate date range for the past week
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Fetch orders for the past week
        const orders = await Order.find({
            providerId: userId,
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        }).populate("items.menuId", "name price");

        // Calculate weekly statistics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const completedOrders = orders.filter(order => order.status === "delivered").length;
        const cancelledOrders = orders.filter(order => order.status === "cancelled").length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Group orders by status
        const ordersByStatus = orders.reduce((acc: any, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        // Group orders by day
        const ordersByDay = orders.reduce((acc: any, order) => {
            const day = order.createdAt.toLocaleDateString();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        // Prepare digest data
        const digestData = {
            period: "Weekly",
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            providerName: provider.name,
            statistics: {
                totalOrders,
                totalRevenue,
                completedOrders,
                cancelledOrders,
                averageOrderValue,
                completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
            },
            ordersByStatus,
            ordersByDay,
            topItems: [], // Could be enhanced to show top-selling items
        };

        // Here you would typically send an email with the digest
        // For now, we'll just return the data
        // TODO: Implement email sending service

        console.log("Weekly digest generated for provider:", provider.name);
        console.log("Digest data:", digestData);

        return NextResponse.json({
            message: "Weekly digest generated and sent successfully",
            data: digestData,
        });
    } catch (error) {
        console.error("Weekly digest generation error:", error);
        return NextResponse.json(
            { error: RESPONSE_MESSAGES.COMMON.INTERNAL_ERROR },
            { status: 500 }
        );
    }
}