import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import ServiceProvider from "@/models/ServiceProvider";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);

    const providerId = searchParams.get("providerId");
    const consumerId = searchParams.get("consumerId");
    const rating = searchParams.get("rating");
    const reviewType = searchParams.get("reviewType");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build query with new schema fields
    const query: any = { isHidden: false }; // Only show non-hidden reviews

    if (providerId && providerId !== "all") query.providerId = providerId;
    if (consumerId && consumerId !== "all") query.consumerId = consumerId;
    if (rating && rating !== "all") query.rating = Number(rating);
    if (reviewType && reviewType !== "all") query.reviewType = reviewType;

    // Use text search index for better performance
    if (search && search.trim() !== "") {
      query.$text = { $search: search };
    }

    // Sort logic with new fields
    let sortQuery: any = { createdAt: -1 };

    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "high":
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case "low":
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortQuery = { helpfulCount: -1, createdAt: -1 };
        break;
      case "verified":
        query.isVerified = true;
        sortQuery = { createdAt: -1 };
        break;
    }

    // Fetch reviews with pagination
    const reviews = await Review.find(query)
      .populate("consumerId", "name")
      .populate("providerId", "businessName")
      .populate("orderId", "totalAmount createdAt")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      data: reviews,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: reviews.length,
        totalRecords: total,
      },
      message: "Reviews fetched successfully",
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "consumer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const {
      providerId,
      orderId,
      deliveryOrderId,
      rating,
      comment,
      reviewType = "order",
      images = []
    } = await request.json();

    // Validate required fields
    if (!providerId || !orderId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: providerId, orderId, rating" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({
      consumerId: userId,
      orderId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this order" },
        { status: 400 }
      );
    }

    // Create review with new schema fields
    const review = new Review({
      consumerId: userId,
      providerId,
      orderId,
      deliveryOrderId,
      rating,
      comment: comment?.trim(),
      reviewType,
      images: images.slice(0, 5), // Limit to 5 images
      isVerified: true, // Mark as verified since it's from a completed order
      helpfulCount: 0,
      reportCount: 0,
      isHidden: false,
    });

    await review.save();

    // Update provider's average rating and review count
    const allReviews = await Review.find({
      providerId,
      isHidden: false
    });

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await ServiceProvider.findByIdAndUpdate(providerId, {
      rating: Math.round(averageRating * 10) / 10,
      // Update review count if field exists in ServiceProvider schema
    });

    return NextResponse.json(
      {
        message: "Review added successfully",
        review: await review.populate([
          { path: "consumerId", select: "name" },
          { path: "providerId", select: "businessName" },
          { path: "orderId", select: "totalAmount createdAt" }
        ])
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
