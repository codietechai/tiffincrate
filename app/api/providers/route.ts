export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import { SUCCESSMESSAGE } from "@/constants/response-messages";
import { withCors } from "@/lib/cors";

async function handler(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const cuisine = searchParams.get("cuisine");
    const area = searchParams.get("area");
    const sorting = searchParams.get("sorting");
    const search = searchParams.get("search");
    const businessType = searchParams.get("businessType");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius"); // in km

    const skip = (page - 1) * limit;

    const query: any = { isActive: true, isVerified: true };

    // Cuisine filter
    if (cuisine && cuisine !== "all") {
      query.cuisine = { $in: [cuisine] };
    }

    // Delivery area filter
    if (area && area !== "all") {
      query.deliveryAreas = { $in: [area] };
    }

    // Business type filter
    if (businessType && businessType !== "all") {
      query.businessType = businessType;
    }

    // Location-based search (geospatial query)
    if (lat && lng && radius) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Text search
    if (search && search.trim() !== "") {
      query.$text = { $search: search };
    }

    // Sorting options
    let sortOption: Record<string, 1 | -1> = { rating: -1, totalOrders: -1 };

    if (sorting === "rating") sortOption = { rating: -1 };
    else if (sorting === "orders") sortOption = { totalOrders: -1 };
    else if (sorting === "name") sortOption = { businessName: 1 };
    else if (sorting === "distance" && lat && lng) {
      // Sort by distance (only if location provided)
      sortOption = {};
    }

    let providersQuery = ServiceProvider.find(query)
      .populate("userId", "name email phone")
      .skip(skip)
      .limit(limit);

    // Apply sorting
    if (Object.keys(sortOption).length > 0) {
      providersQuery = providersQuery.sort(sortOption);
    }

    const providers = await providersQuery;

    const total = await ServiceProvider.countDocuments(query);

    // Transform location data for backward compatibility
    const transformedProviders = providers.map(provider => ({
      ...provider.toObject(),
      location: {
        ...provider.location,
        latitude: provider.location.coordinates[1],
        longitude: provider.location.coordinates[0],
      }
    }));

    return NextResponse.json({
      data: transformedProviders,
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
      { status: 500 },
    );
  }
}

export const GET = withCors(handler);
