import { withCors } from "@/lib/cors";
import { connectMongoDB } from "@/lib/mongodb";
import Address from "@/models/Address";
import { NextRequest, NextResponse } from "next/server";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

export const GET = withCors(async (req: NextRequest, { params }: any) => {
  try {
    await connectMongoDB();
    const { id } = params;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    const address = await Address.findOne({
      _id: id,
      userId: userId,
      isActive: true
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address,
      message: SUCCESSMESSAGE.ADDRESS_FETCHED
    });
  } catch (error) {
    console.error("GET address error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});

export const PUT = withCors(async (req: NextRequest, { params }: any) => {
  try {
    await connectMongoDB();
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    // Convert coordinates to GeoJSON format if provided
    if (body.latitude && body.longitude) {
      body.location = {
        type: "Point",
        coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)]
      };
      delete body.latitude;
      delete body.longitude;
    }

    // If setting as default, unset other defaults first
    if (body.isDefault) {
      await Address.updateMany(
        { userId: userId, isDefault: true },
        { isDefault: false }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: id, userId: userId, isActive: true },
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Address not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Address updated successfully"
    });
  } catch (error) {
    console.error("PUT address error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});

export const DELETE = withCors(async (req: NextRequest, { params }: any) => {
  try {
    await connectMongoDB();
    const { id } = params;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    // Soft delete by setting isActive to false
    const deleted = await Address.findOneAndUpdate(
      { _id: id, userId: userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // If deleted address was default, set another address as default
    if (deleted.isDefault) {
      const nextAddress = await Address.findOne({
        userId: userId,
        isActive: true,
        _id: { $ne: id }
      });

      if (nextAddress) {
        await Address.findByIdAndUpdate(nextAddress._id, { isDefault: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error("DELETE address error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});

// Add PATCH method for setting default address
export const PATCH = withCors(async (req: NextRequest, { params }: any) => {
  try {
    await connectMongoDB();
    const { id } = params;
    const userId = req.headers.get("x-user-id");
    const { action } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    if (action === "set-default") {
      // Unset all other defaults
      await Address.updateMany(
        { userId: userId, isDefault: true },
        { isDefault: false }
      );

      // Set this address as default
      const updated = await Address.findOneAndUpdate(
        { _id: id, userId: userId, isActive: true },
        { isDefault: true },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Address not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Default address updated successfully"
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH address error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
});
