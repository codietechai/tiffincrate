import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import "@/models/User";
import "@/models/ServiceProvider";
import ServiceProvider from "@/models/ServiceProvider";
import { withCors } from "@/lib/cors";
import { SUCCESSMESSAGE } from "@/constants/response-messages";
import User from "@/models/User";

async function handler(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const verified = searchParams.get("verified");
    const active = searchParams.get("active");
    const cuisine = searchParams.get("cuisine");
    const area = searchParams.get("area");
    const sorting = searchParams.get("sorting");
    const search = searchParams.get("search");

    const query: any = {};
    if (verified) query.isVerified = verified === "true";
    if (active) query.isActive = active === "true";
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
    const skip = (page - 1) * limit;

    let sortOption: Record<string, 1 | -1> = { rating: -1, totalOrders: -1 };
    console.log("skip", skip);
    if (sorting === "rating") sortOption = { rating: -1 };
    else if (sorting === "orders") sortOption = { totalOrders: -1 };
    else if (sorting === "name") sortOption = { businessName: 1 };

    const providers = await ServiceProvider.find(query)
      .populate("userId", "name email phone")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const verifiedProviders = await ServiceProvider.countDocuments({
      isVerified: true,
    });
    const activeProviders = await ServiceProvider.countDocuments({
      isActive: true,
    });

    const totalProviders = await ServiceProvider.countDocuments();

    const total = await ServiceProvider.countDocuments(query);

    return NextResponse.json({
      data: {
        data: providers,
        count: {
          verified: verifiedProviders,
          active: activeProviders,
          total: totalProviders,
        },
      },
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: providers.length,
        totalRecords: total,
      },
      message: SUCCESSMESSAGE.PROVIDERS_FETCH,
    });
  } catch (error) {
    console.error("Get providers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withCors(handler);
export const OPTIONS = withCors(handler);
