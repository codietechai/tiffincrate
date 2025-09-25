import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate("consumerId", "name email")
      .populate({
        path: "providerId",
        select: "businessName userId",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: orders.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
