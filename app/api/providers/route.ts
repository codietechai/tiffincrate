export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const cuisine = searchParams.get("cuisine");
    const area = searchParams.get("area");
    const sorting = searchParams.get("sorting");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const query: any = { isActive: true };

    if (cuisine && cuisine !== "all") {
      query.cuisine = { $in: [cuisine] };
    }

    if (area && area !== "all") {
      query.deliveryAreas = { $in: [area] };
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");
      query.$or = [
        { businessName: regex },
        { description: regex },
        { cuisine: { $in: [regex] } },
      ];
    }

    // 🔽 Determine sorting order based on param
    let sortOption: Record<string, 1 | -1> = { rating: -1, totalOrders: -1 }; // default

    if (sorting === "rating") sortOption = { rating: -1 };
    else if (sorting === "orders") sortOption = { totalOrders: -1 };
    else if (sorting === "name") sortOption = { businessName: 1 };

    const providers = await ServiceProvider.find(query)
      .populate("userId", "name email phone")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await ServiceProvider.countDocuments(query);

    return NextResponse.json({
      data: providers,
      message: SUCCESSMESSAGE.PROVIDERS_FETCH,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get providers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
