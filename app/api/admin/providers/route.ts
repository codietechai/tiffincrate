import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import "@/models/User";
import "@/models/ServiceProvider";
import ServiceProvider from "@/models/ServiceProvider";
import { withCors } from "@/lib/cors";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

async function handler(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const verified = searchParams.get("verified");
    const active = searchParams.get("active");
    const businessType = searchParams.get("businessType");
    const area = searchParams.get("area");
    const sorting = searchParams.get("sorting") || "rating";
    const search = searchParams.get("search");
    const minRating = searchParams.get("minRating");
    const maxServiceRadius = searchParams.get("maxServiceRadius");

    const skip = (page - 1) * limit;

    // Build query with new schema fields
    const query: any = {};
    if (verified !== null && verified !== undefined) query.isVerified = verified === "true";
    if (active !== null && active !== undefined) query.isActive = active === "true";

    if (businessType && businessType !== "all") {
      query.businessType = businessType;
    }

    if (area && area !== "all") {
      query.deliveryAreas = { $in: [area] };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxServiceRadius) {
      query.serviceRadius = { $lte: parseFloat(maxServiceRadius) };
    }

    // Use text search index for better performance
    if (search && search.trim() !== "") {
      query.$text = { $search: search };
    }

    // Build sort option
    let sortOption: Record<string, 1 | -1> = { rating: -1, totalOrders: -1 };

    switch (sorting) {
      case "rating":
        sortOption = { rating: -1, totalOrders: -1 };
        break;
      case "orders":
        sortOption = { totalOrders: -1, rating: -1 };
        break;
      case "name":
        sortOption = { businessName: 1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "revenue":
        sortOption = { totalRevenue: -1 };
        break;
      case "serviceRadius":
        sortOption = { serviceRadius: 1 };
        break;
    }

    // Add text search score to sort if searching
    if (search && search.trim() !== "") {
      sortOption = { score: { $meta: "textScore" } as any, ...sortOption };
    }

    const providers = await ServiceProvider.find(query)
      .populate("userId", "name email phone isVerified createdAt")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await ServiceProvider.countDocuments(query);

    // Get comprehensive statistics
    const stats = await ServiceProvider.aggregate([
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: {
                  isVerified: "$isVerified",
                  isActive: "$isActive"
                },
                count: { $sum: 1 }
              }
            }
          ],
          businessTypeCounts: [
            { $group: { _id: "$businessType", count: { $sum: 1 } } }
          ],
          ratingDistribution: [
            {
              $bucket: {
                groupBy: "$rating",
                boundaries: [0, 1, 2, 3, 4, 5],
                default: "unrated",
                output: { count: { $sum: 1 } }
              }
            }
          ],
          averageStats: [
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                avgOrders: { $avg: "$totalOrders" },
                avgServiceRadius: { $avg: "$serviceRadius" },
                totalProviders: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: stats[0].averageStats[0]?.totalProviders || 0,
      verified: stats[0].statusCounts.filter((s: any) => s._id.isVerified).reduce((sum: number, s: any) => sum + s.count, 0),
      active: stats[0].statusCounts.filter((s: any) => s._id.isActive).reduce((sum: number, s: any) => sum + s.count, 0),
      averages: {
        rating: Math.round((stats[0].averageStats[0]?.avgRating || 0) * 10) / 10,
        orders: Math.round(stats[0].averageStats[0]?.avgOrders || 0),
        serviceRadius: Math.round((stats[0].averageStats[0]?.avgServiceRadius || 0) * 10) / 10
      },
      businessTypes: stats[0].businessTypeCounts,
      ratingDistribution: stats[0].ratingDistribution
    };

    return NextResponse.json({
      data: {
        providers,
        stats: formattedStats,
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
