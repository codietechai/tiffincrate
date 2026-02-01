import { SUCCESSMESSAGE } from "@/constants/response-messages";
import { withCors } from "@/lib/cors";
import { connectMongoDB } from "@/lib/mongodb";
import Address from "@/models/Address";
import { NextRequest, NextResponse } from "next/server";

export const GET = withCors(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    const addresses = await Address.find({
      userId,
      isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: addresses,
      message: SUCCESSMESSAGE.ADDRESS_FETCHED,
    });
  } catch (error: any) {
    console.error("GET /addresses error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch addresses" },
      { status: 500 }
    );
  }
});

export const POST = withCors(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Convert coordinates to GeoJSON format if provided
    if (body.latitude && body.longitude) {
      body.location = {
        type: "Point",
        coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)]
      };
      // Remove old format fields
      delete body.latitude;
      delete body.longitude;
    }

    // Check if user has any addresses
    const hasDefault = await Address.exists({
      userId: userId,
      isDefault: true,
      isActive: true,
    });

    // If no default address exists, make this one default
    if (!hasDefault) {
      body.isDefault = true;
    }

    // If this is being set as default, unset other defaults
    if (body.isDefault) {
      await Address.updateMany(
        { userId: userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Set default values
    body.userId = userId;
    body.country = body.country || "India";
    body.addressType = body.addressType || "home";
    body.isActive = true;

    const created = await Address.create(body);

    return NextResponse.json({
      success: true,
      data: created,
      message: SUCCESSMESSAGE.ADDRESS_CREATED,
    });
  } catch (error: any) {
    console.error("POST /addresses error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create address" },
      { status: 500 }
    );
  }
});
