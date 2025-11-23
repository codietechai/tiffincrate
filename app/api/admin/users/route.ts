export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { SUCCESSMESSAGE } from "@/constants/response-messages";
import { withCors } from "@/lib/cors";
import ServiceProvider from "@/models/ServiceProvider";

export async function handler(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const arole = request.headers.get("x-user-role");
    if (arole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const active = searchParams.get("active");
    const skip = (page - 1) * limit;

    const query: any = {};
    if (role && role !== "all") query.role = role;
    if (active) query.isActive = active === "true";

    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }];
    }
    let users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    users = await Promise.all(
      users.map(async (u) => {
        if (u.role === "provider") {
          const providerDetails = await ServiceProvider.findOne({
            userId: u._id,
          });
          return {
            ...u.toObject(),
            providerDetails,
          };
        }

        return u;
      })
    );

    const total = await User.countDocuments(query);
    const admins = await User.countDocuments({
      role: "admin",
    });
    const providers = await User.countDocuments({
      role: "provider",
    });
    const customers = await User.countDocuments({
      role: "customer",
    });
    const activeUsers = await User.countDocuments({
      isActive: true,
    });
    const totalUsers = await User.countDocuments({
      isActive: true,
    });

    return NextResponse.json({
      data: {
        data: users,
        count: {
          total: totalUsers,
          active: activeUsers,
          admins,
          providers,
          customers,
        },
      },
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total,
      },
      message: SUCCESSMESSAGE.PROVIDERS_FETCH,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withCors(handler);
export const OPTIONS = withCors(handler);
