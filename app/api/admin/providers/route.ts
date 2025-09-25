import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
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
    const verified = searchParams.get("verified");
    const active = searchParams.get("active");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (verified) query.isVerified = verified === "true";
    if (active) query.isActive = active === "true";

    const providers = await ServiceProvider.find(query)
      .populate("userId", "name email phone")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ServiceProvider.countDocuments(query);

    return NextResponse.json({
      providers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: providers.length,
        totalRecords: total,
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
