import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import { hashPassword, generateToken } from "@/lib/auth";
import DeliveryPartner from "@/models/DeliveryPartner";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    const { name, email, password, role, phone, address, businessData } =
      await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    await user.save();

    // If role is provider, create service provider profile
    if ((role === "provider" || role === "delivery_partner") && businessData) {
      if (role === "provider") {
        const serviceProvider = new ServiceProvider({
          userId: user._id,
          businessName: businessData.businessName,
          description: businessData.description,
          cuisine: businessData.cuisine || [],
          deliveryAreas: businessData.deliveryAreas || [],
          operatingHours: {
            breakfast: { enabled: true, selfDelivery: false },
            lunch: { enabled: true, selfDelivery: false },
            dinner: { enabled: true, selfDelivery: false },
          },
          location: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: address || "Bangalore, Karnataka",
          },
        });

        await serviceProvider.save();
      } else if (role === "delivery_partner") {
        const deliveryPartner = new DeliveryPartner({
          userId: user._id,
          vehicleType: businessData.vehicleType,
          vehicleNumber: businessData.vehicleNumber,
          licenseNumber: businessData.licenseNumber,
          currentLocation: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: address || "Bangalore, Karnataka",
          },
          availableSlots: businessData.availableSlots || {
            breakfast: true,
            lunch: true,
            dinner: true,
          },
        });

        await deliveryPartner.save();
      }
    }

    const token =await generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    (response as any).cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
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
