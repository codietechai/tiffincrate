export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Review from "@/models/Review";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30days";
    const timeSlot = searchParams.get("timeSlot");
    const status = searchParams.get("status");

    // Get provider details
    const provider = await ServiceProvider.findOne({ userId: userId });
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build base match query
    const baseMatch: any = {
      providerId: provider._id,
      createdAt: { $gte: startDate },
    };

    if (timeSlot && timeSlot !== "all") {
      baseMatch.timeSlot = timeSlot;
    }

    if (status && status !== "all") {
      baseMatch.status = status;
    }

    // Comprehensive orders analytics
    const orderStats = await Order.aggregate([
      { $match: baseMatch },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0
                    ]
                  }
                },
                avgOrderValue: { $avg: "$totalAmount" },
                completedOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "delivered"] }, 1, 0]
                  }
                },
                cancelledOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
                  }
                }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0
                    ]
                  }
                }
              }
            }
          ],
          timeSlotBreakdown: [
            {
              $group: {
                _id: "$timeSlot",
                count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0
                    ]
                  }
                }
              }
            }
          ],
          paymentMethodBreakdown: [
            {
              $group: {
                _id: "$paymentMethod",
                count: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0
                    ]
                  }
                }
              }
            }
          ],
          dailyTrends: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" }
                },
                orders: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$paymentStatus", "paid"] },
                      "$totalAmount",
                      0
                    ]
                  }
                }
              }
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            },
            {
              $project: {
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day"
                  }
                },
                orders: 1,
                revenue: 1
              }
            }
          ],
          topItems: [
            { $unwind: "$items" },
            {
              $group: {
                _id: {
                  name: "$items.name",
                  menuItemId: "$items.menuItemId"
                },
                quantity: { $sum: "$items.quantity" },
                revenue: {
                  $sum: { $multiply: ["$items.price", "$items.quantity"] }
                },
                orders: { $sum: 1 }
              }
            },
            { $sort: { quantity: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    // Reviews analytics with new schema
    const reviewStats = await Review.aggregate([
      {
        $match: {
          providerId: provider._id,
          createdAt: { $gte: startDate },
          isHidden: false
        }
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                verifiedReviews: {
                  $sum: { $cond: ["$isVerified", 1, 0] }
                },
                avgHelpfulCount: { $avg: "$helpfulCount" }
              }
            }
          ],
          ratingDistribution: [
            {
              $group: {
                _id: "$rating",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          reviewTypeBreakdown: [
            {
              $group: {
                _id: "$reviewType",
                count: { $sum: 1 },
                avgRating: { $avg: "$rating" }
              }
            }
          ],
          recentReviews: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "consumerId",
                foreignField: "_id",
                as: "consumer"
              }
            },
            { $unwind: "$consumer" },
            {
              $project: {
                rating: 1,
                comment: 1,
                reviewType: 1,
                isVerified: 1,
                helpfulCount: 1,
                createdAt: 1,
                "consumer.name": 1
              }
            }
          ]
        }
      }
    ]);

    // Customer analytics
    const customerStats = await Order.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$consumerId",
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0]
            }
          },
          lastOrder: { $max: "$createdAt" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          "customer.name": 1,
          "customer.email": 1,
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: 1,
          lastOrder: 1
        }
      }
    ]);

    // Compile comprehensive analytics
    const analytics = {
      overview: {
        ...orderStats[0].overview[0],
        completionRate: orderStats[0].overview[0]?.totalOrders > 0
          ? Math.round((orderStats[0].overview[0].completedOrders / orderStats[0].overview[0].totalOrders) * 100)
          : 0,
        cancellationRate: orderStats[0].overview[0]?.totalOrders > 0
          ? Math.round((orderStats[0].overview[0].cancelledOrders / orderStats[0].overview[0].totalOrders) * 100)
          : 0,
        ...reviewStats[0].overview[0]
      },
      breakdowns: {
        status: orderStats[0].statusBreakdown,
        timeSlot: orderStats[0].timeSlotBreakdown,
        paymentMethod: orderStats[0].paymentMethodBreakdown,
        reviewType: reviewStats[0].reviewTypeBreakdown
      },
      trends: {
        daily: orderStats[0].dailyTrends,
        ratingDistribution: reviewStats[0].ratingDistribution
      },
      topPerformers: {
        items: orderStats[0].topItems,
        customers: customerStats
      },
      recentActivity: {
        reviews: reviewStats[0].recentReviews
      }
    };

    return NextResponse.json({
      analytics,
      dateRange: { startDate, endDate: now },
      filters: { range, timeSlot, status }
    });
  } catch (error) {
    console.error("Get provider analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
