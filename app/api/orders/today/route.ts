import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ServiceProvider from "@/models/ServiceProvider";
import "@/models/Menu";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    const { searchParams } = new URL(request.url);
    const provider = await ServiceProvider.findOne({ userId });
    const providerId = provider._id;
    const search = searchParams.get("search") || "";
    const timeSlot = searchParams.get("timeSlot");

    if (role !== "provider") {
      return NextResponse.json(
        { error: "Only provider can access delivery orders" },
        { status: 403 },
      );
    }

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0]; // "2025-12-07"
    const todayDay = today
      .toLocaleString("en-IN", { weekday: "long" })
      .toLowerCase(); // tuesday
    // BASE QUERY
    let query: any = {};

    // timeSlot filter
    if (timeSlot) query.timeSlot = timeSlot;

    // Step 1: Find orders for this provider (through menu)
    const orders = await Order.find(query)
      .populate({
        path: "menuId",
        match: {
          providerId, // only provider's menus
          ...(search
            ? {
                $or: [
                  { name: { $regex: search, $options: "i" } },
                  { description: { $regex: search, $options: "i" } },
                ],
              }
            : {}),
        },
        select: "name description providerId",
      })
      .populate("consumerId", "name email")
      .populate("address")
      .sort({ createdAt: -1 });

    let validOrders = orders.filter((o) => o.menuId !== null);

    validOrders = validOrders.filter((order) => {
      const info = order.deliveryInfo;

      if (order.orderType === "month") {
        const start = new Date(info.startDate!);
        const end = new Date(start);
        end.setDate(start.getDate() + 30);

        return today >= start && today <= end;
      }

      if (order.orderType === "specific_days") {
        return info.days?.map((d: any) => d.toLowerCase()).includes(todayDay);
      }

      if (order.orderType === "custom_dates") {
        return info.dates?.includes(todayDate);
      }

      return false;
    });

    return NextResponse.json(
      {
        data: validOrders,
        message: SUCCESSMESSAGE.ORDERS_FETCH,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
