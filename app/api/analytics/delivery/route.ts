import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import DeliveryPartner from "@/models/DeliveryPartner";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "delivery_partner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    // Get delivery partner
    const deliveryPartner = await DeliveryPartner.findOne({
      userId: userId,
    });
    if (!deliveryPartner) {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's deliveries
    const todayDeliveries = await DeliveryAssignment.countDocuments({
      deliveryPartnerId: deliveryPartner._id,
      status: "delivered",
      deliveryTime: { $gte: today },
    });

    // Today's earnings
    const todayEarnings = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPartnerId: deliveryPartner._id,
          status: "delivered",
          deliveryTime: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$deliveryFee" },
        },
      },
    ]);

    // Weekly performance
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - 7);

    const weeklyStats = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPartnerId: deliveryPartner._id,
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          deliveries: { $sum: 1 },
          earnings: { $sum: "$deliveryFee" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    const analytics = {
      todayDeliveries,
      todayEarnings: todayEarnings[0]?.total || 0,
      averageRating: deliveryPartner.rating,
      totalDeliveries: deliveryPartner.totalDeliveries,
      weeklyStats,
      earnings: deliveryPartner.earnings,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Get delivery analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
