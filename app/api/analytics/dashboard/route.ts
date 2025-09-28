import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectMongoDB();

    let analytics = {};

    if (decoded.role === "admin") {
      // Admin analytics
      const totalUsers = await User.countDocuments();
      const totalProviders = await ServiceProvider.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      // Orders by status
      const ordersByStatus = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      // Recent orders
      const recentOrders = await Order.find()
        .populate("consumerId", "name")
        .populate("providerId", "businessName")
        .sort({ createdAt: -1 })
        .limit(10);

      analytics = {
        totalUsers,
        totalProviders,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      };
    } else if (decoded.role === "provider") {
      // Provider analytics
      const totalOrders = await Order.countDocuments({
        providerId: decoded.userId,
      });
      const totalRevenue = await Order.aggregate([
        { $match: { providerId: decoded.userId, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      const ordersByStatus = await Order.aggregate([
        { $match: { providerId: decoded.userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const recentOrders = await Order.find({ providerId: decoded.userId })
        .populate("consumerId", "name")
        .sort({ createdAt: -1 })
        .limit(10);

      analytics = {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      };
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
