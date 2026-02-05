import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import Menu from "@/models/Menu";
import DeliveryOrder from "@/models/deliveryOrders";
import mongoose from "mongoose";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (!userId || (role !== "provider" && role !== "admin")) {
      return NextResponse.json(
        { error: "Provider or admin access required" },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // week, month, year
    const providerId = searchParams.get("providerId");

    // Find provider
    let provider;
    if (role === "provider") {
      provider = await ServiceProvider.findOne({ userId });
      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }
    } else if (providerId) {
      provider = await ServiceProvider.findById(providerId);
      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Provider ID required for admin access" },
        { status: 400 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "%Y-%m-%d";
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "%Y-%m-%d";
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "%Y-%m";
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "%Y-%m-%d";
    }

    // Get basic stats
    const totalOrders = await Order.countDocuments({
      providerId: provider._id,
      status: { $ne: "cancelled" },
    });

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(provider._id.toString()),
          status: { $ne: "cancelled" },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalCustomers = await Order.distinct("consumerId", {
      providerId: provider._id,
      status: { $ne: "cancelled" },
    });

    const avgOrderValue = totalRevenue[0]?.total && totalOrders > 0
      ? Math.round(totalRevenue[0].total / totalOrders)
      : 0;

    // Get period-based revenue data
    const revenueData = await Order.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(provider._id.toString()),
          status: { $ne: "cancelled" },
          paymentStatus: "paid",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupBy, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get category distribution
    const categoryData = await Order.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(provider._id.toString()),
          status: { $ne: "cancelled" },
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "menuId",
          foreignField: "_id",
          as: "menu",
        },
      },
      {
        $unwind: "$menu",
      },
      {
        $group: {
          _id: "$menu.category",
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get top selling menus
    const topMenus = await Order.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(provider._id.toString()),
          status: { $ne: "cancelled" },
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "menuId",
          foreignField: "_id",
          as: "menu",
        },
      },
      {
        $unwind: "$menu",
      },
      {
        $group: {
          _id: "$menuId",
          name: { $first: "$menu.name" },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { orders: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get recent orders trend (last 7 days vs previous 7 days)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentPeriodStats, previousPeriodStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            providerId: new mongoose.Types.ObjectId(provider._id.toString()),
            status: { $ne: "cancelled" },
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
              },
            },
            customers: { $addToSet: "$consumerId" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            providerId: new mongoose.Types.ObjectId(provider._id.toString()),
            status: { $ne: "cancelled" },
            createdAt: { $gte: previous7Days, $lt: last7Days },
          },
        },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
              },
            },
            customers: { $addToSet: "$consumerId" },
          },
        },
      ]),
    ]);

    const current = currentPeriodStats[0] || { orders: 0, revenue: 0, customers: [] };
    const previous = previousPeriodStats[0] || { orders: 0, revenue: 0, customers: [] };

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const revenueChange = calculateChange(current.revenue, previous.revenue);
    const ordersChange = calculateChange(current.orders, previous.orders);
    const customersChange = calculateChange(current.customers.length, previous.customers.length);
    const avgOrderChange = calculateChange(
      current.orders > 0 ? current.revenue / current.orders : 0,
      previous.orders > 0 ? previous.revenue / previous.orders : 0
    );

    // Get delivery performance
    const deliveryStats = await DeliveryOrder.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(provider._id.toString()),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders,
          totalCustomers: totalCustomers.length,
          avgOrderValue,
          changes: {
            revenue: revenueChange,
            orders: ordersChange,
            customers: customersChange,
            avgOrder: avgOrderChange,
          },
        },
        charts: {
          revenue: revenueData,
          categories: categoryData,
          topMenus,
          deliveryStats,
        },
        period,
        provider: {
          id: provider._id,
          name: provider.businessName,
        },
      },
      message: "Analytics data fetched successfully",
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL },
      { status: 500 }
    );
  }
}