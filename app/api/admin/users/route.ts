export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { SUCCESSMESSAGE } from "@/constants/response-messages";
import { withCors } from "@/lib/cors";
import ServiceProvider from "@/models/ServiceProvider";

async function handler(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const userRole = searchParams.get("role");
    const search = searchParams.get("search");
    const active = searchParams.get("active");
    const verified = searchParams.get("verified");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build query with new schema fields
    const query: any = {};
    if (userRole && userRole !== "all") query.role = userRole;
    if (active !== null && active !== undefined) query.isActive = active === "true";
    if (verified !== null && verified !== undefined) query.isVerified = verified === "true";

    // Text search on name and email
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex }
      ];
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    // Fetch users with optimized query
    let users = await User.find(query)
      .select("-password") // Exclude password field
      .skip(skip)
      .limit(limit)
      .sort(sortObj);

    // Populate provider details for provider users
    users = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();

        if (user.role === "provider") {
          const providerDetails = await ServiceProvider.findOne({
            userId: user._id,
          }).select("businessName isVerified rating totalOrders location businessType");

          return {
            ...userObj,
            providerDetails,
          };
        }

        return userObj;
      })
    );

    const total = await User.countDocuments(query);

    // Get comprehensive statistics
    const stats = await User.aggregate([
      {
        $facet: {
          roleCounts: [
            { $group: { _id: "$role", count: { $sum: 1 } } }
          ],
          statusCounts: [
            { $group: { _id: "$isActive", count: { $sum: 1 } } }
          ],
          verificationCounts: [
            { $group: { _id: "$isVerified", count: { $sum: 1 } } }
          ],
          totalUsers: [
            { $count: "count" }
          ],
          recentUsers: [
            { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Format stats for easier consumption
    const formattedStats = {
      total: stats[0].totalUsers[0]?.count || 0,
      recent: stats[0].recentUsers[0]?.count || 0,
      byRole: stats[0].roleCounts.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byStatus: stats[0].statusCounts.reduce((acc: any, item: any) => {
        acc[item._id ? 'active' : 'inactive'] = item.count;
        return acc;
      }, {}),
      byVerification: stats[0].verificationCounts.reduce((acc: any, item: any) => {
        acc[item._id ? 'verified' : 'unverified'] = item.count;
        return acc;
      }, {})
    };

    return NextResponse.json({
      data: {
        users,
        stats: formattedStats,
      },
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total,
      },
      message: SUCCESSMESSAGE.USERS_FETCH || "Users fetched successfully",
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
