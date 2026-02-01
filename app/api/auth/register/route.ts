import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import { hashPassword, generateToken } from "@/lib/auth";
import { WalletService } from "@/services/wallet-service";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    const { name, email, password, role, phone, businessData } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "provider", "consumer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, provider, or consumer" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Check if phone number already exists (if provided)
    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return NextResponse.json(
          { error: "User already exists with this phone number" },
          { status: 400 }
        );
      }
    }

    // Validate provider-specific data
    if (role === "provider" && businessData) {
      if (!businessData.businessName) {
        return NextResponse.json(
          { error: "Business name is required for providers" },
          { status: 400 }
        );
      }

      // Validate location data
      if (!businessData.location ||
        (!businessData.location.coordinates && (!businessData.location.longitude || !businessData.location.latitude))) {
        return NextResponse.json(
          { error: "Valid location (coordinates or longitude/latitude) is required for providers" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone && phone.trim() ? phone.trim() : undefined, // Only set phone if provided
      isActive: true,
      isVerified: false, // Will be verified later
    });

    await user.save();

    // Create wallet for the user
    await WalletService.createWallet(
      user._id.toString(),
      role === "consumer" ? "customer" : role === "provider" ? "provider" : "admin"
    );

    // If role is provider, create service provider profile
    if (role === "provider" && businessData) {
      // Handle location coordinates - support both formats
      let coordinates;
      if (businessData.location.coordinates && Array.isArray(businessData.location.coordinates)) {
        // GeoJSON format: [longitude, latitude]
        coordinates = [
          parseFloat(businessData.location.coordinates[0]),
          parseFloat(businessData.location.coordinates[1])
        ];
      } else if (businessData.location.longitude && businessData.location.latitude) {
        // Separate longitude/latitude fields
        coordinates = [
          parseFloat(businessData.location.longitude),
          parseFloat(businessData.location.latitude)
        ];
      } else {
        return NextResponse.json(
          { error: "Invalid location format. Provide either coordinates array or longitude/latitude fields" },
          { status: 400 }
        );
      }

      const serviceProvider = new ServiceProvider({
        userId: user._id,
        businessName: businessData.businessName,
        description: businessData.description || "",
        cuisine: businessData.cuisine || [],
        deliveryAreas: businessData.deliveryAreas || [],
        businessType: businessData.businessType || "home_kitchen",
        serviceRadius: businessData.serviceRadius || 10,
        avgDeliveryTime: businessData.avgDeliveryTime || 30,
        operatingHours: businessData.operatingHours || {
          breakfast: { enabled: true, selfDelivery: true },
          lunch: { enabled: true, selfDelivery: true },
          dinner: { enabled: true, selfDelivery: true },
        },
        location: {
          type: "Point",
          coordinates: coordinates,
          address: businessData.location.address || "Address not provided",
        },
        isActive: true,
        isVerified: false, // Will be verified by admin
        rating: 0,
        totalOrders: 0,
      });

      await serviceProvider.save();
    }

    // Generate token
    const token = await generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
