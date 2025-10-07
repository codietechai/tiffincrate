import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import DeliveryPartner from "@/models/DeliveryPartner";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "delivery_partner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "week";
    console.log("userId", userId);
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

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Daily earnings
    const dailyEarnings = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPartnerId: deliveryPartner._id,
          status: "delivered",
          deliveryTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$deliveryTime" },
            },
          },
          earnings: { $sum: "$deliveryFee" },
          deliveries: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
      {
        $project: {
          date: "$_id.date",
          earnings: 1,
          deliveries: 1,
        },
      },
    ]);

    // Earnings by time slot
    const slotEarnings = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPartnerId: deliveryPartner._id,
          status: "delivered",
          deliveryTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$timeSlot",
          earnings: { $sum: "$deliveryFee" },
          deliveries: { $sum: 1 },
        },
      },
      {
        $project: {
          slot: "$_id",
          earnings: 1,
          deliveries: 1,
        },
      },
    ]);

    // Total earnings calculation
    const totalEarnings = await DeliveryAssignment.aggregate([
      {
        $match: {
          deliveryPartnerId: deliveryPartner._id,
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$deliveryFee" },
          totalDeliveries: { $sum: 1 },
        },
      },
    ]);

    const earnings = {
      total: totalEarnings[0]?.total || 0,
      totalDeliveries: totalEarnings[0]?.totalDeliveries || 0,
      thisMonth: deliveryPartner.earnings.thisMonth,
      averagePerDelivery:
        totalEarnings[0]?.totalDeliveries > 0
          ? totalEarnings[0].total / totalEarnings[0].totalDeliveries
          : 0,
      dailyEarnings,
      slotEarnings,
    };

    return NextResponse.json({ earnings });
  } catch (error) {
    console.error("Get delivery earnings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
