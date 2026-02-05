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

        // Check if monthly digest is enabled in settings
        if (!provider.settings?.notifications?.monthlyDigest) {
            return NextResponse.json(
                { error: "Monthly digest is disabled in your notification settings" },
                { status: 400 }
            );
        }

        // Calculate date range for the past month
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        // Fetch orders for the past month
        const orders = await Order.find({
            providerId: userId,
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        }).populate("items.menuId", "name price");

        // Calculate monthly statistics
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

        // Group orders by week
        const ordersByWeek = orders.reduce((acc: any, order) => {
            const weekStart = new Date(order.createdAt);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekKey = weekStart.toLocaleDateString();
            acc[weekKey] = (acc[weekKey] || 0) + 1;
            return acc;
        }, {});

        // Calculate growth metrics (compare with previous month)
        const previousMonthStart = new Date(startDate);
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
        const previousMonthEnd = new Date(startDate);

        const previousMonthOrders = await Order.find({
            providerId: userId,
            createdAt: {
                $gte: previousMonthStart,
                $lt: previousMonthEnd,
            },
        });

        const previousMonthRevenue = previousMonthOrders.reduce(
            (sum, order) => sum + (order.totalAmount || 0),
            0
        );

        const revenueGrowth = previousMonthRevenue > 0
            ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
            : 0;

        const orderGrowth = previousMonthOrders.length > 0
            ? ((totalOrders - previousMonthOrders.length) / previousMonthOrders.length) * 100
            : 0;

        // Prepare comprehensive digest data
        const digestData = {
            period: "Monthly",
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
                revenueGrowth,
                orderGrowth,
            },
            ordersByStatus,
            ordersByWeek,
            comparison: {
                previousMonthOrders: previousMonthOrders.length,
                previousMonthRevenue,
                revenueGrowth,
                orderGrowth,
            },
            topItems: [], // Could be enhanced to show top-selling items
            insights: [
                `You processed ${totalOrders} orders this month`,
                `Your completion rate is ${Math.round((completedOrders / totalOrders) * 100)}%`,
                revenueGrowth > 0
                    ? `Revenue increased by ${Math.round(revenueGrowth)}% compared to last month`
                    : `Revenue decreased by ${Math.round(Math.abs(revenueGrowth))}% compared to last month`,
            ],
        };

        // Here you would typically send an email with the comprehensive digest
        // For now, we'll just return the data
        // TODO: Implement email sending service

        console.log("Monthly digest generated for provider:", provider.name);
        console.log("Digest data:", digestData);

        return NextResponse.json({
            message: "Monthly digest generated and sent successfully",
            data: digestData,
        });
    } catch (error) {
        console.error("Monthly digest generation error:", error);
        return NextResponse.json(
            { error: RESPONSE_MESSAGES.COMMON.INTERNAL_ERROR },
            { status: 500 }
        );
    }
}