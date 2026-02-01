export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const paymentMethod = searchParams.get("paymentMethod");
    const timeSlot = searchParams.get("timeSlot");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build comprehensive query
    const query: any = {};

    if (status && status !== "all") query.status = status;
    if (paymentStatus && paymentStatus !== "all") query.paymentStatus = paymentStatus;
    if (paymentMethod && paymentMethod !== "all") query.paymentMethod = paymentMethod;
    if (timeSlot && timeSlot !== "all") query.timeSlot = timeSlot;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }

    // Text search on order items or customer/provider names
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");
      query.$or = [
        { "items.name": regex },
        { notes: regex }
      ];
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    const orders = await Order.find(query)
      .populate("consumerId", "name email phone")
      .populate({
        path: "providerId",
        select: "businessName userId location rating",
        populate: {
          path: "userId",
          select: "name phone",
        },
      })
      .populate("address", "addressLine1 addressLine2 city pincode")
      .skip(skip)
      .limit(limit)
      .sort(sortObj);

    const total = await Order.countDocuments(query);

    // Get comprehensive statistics
    const stats = await Order.aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          paymentStatusCounts: [
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
          ],
          paymentMethodCounts: [
            { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
          ],
          timeSlotCounts: [
            { $group: { _id: "$timeSlot", count: { $sum: 1 } } }
          ],
          revenueStats: [
            {
              $match: { paymentStatus: "paid" }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                avgOrderValue: { $avg: "$totalAmount" },
                totalPaidOrders: { $sum: 1 }
              }
            }
          ],
          dailyStats: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" }
                },
                orders: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0
                    ]
                  }
                }
              }
            },
            { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
            { $limit: 30 } // Last 30 days
          ]
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: total,
      revenue: stats[0].revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0, totalPaidOrders: 0 },
      statusBreakdown: stats[0].statusCounts,
      paymentStatusBreakdown: stats[0].paymentStatusCounts,
      paymentMethodBreakdown: stats[0].paymentMethodCounts,
      timeSlotBreakdown: stats[0].timeSlotCounts,
      dailyTrends: stats[0].dailyStats
    };

    return NextResponse.json({
      data: {
        orders,
        stats: formattedStats,
      },
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: orders.length,
        totalRecords: total,
      },
      message: "Orders fetched successfully",
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
