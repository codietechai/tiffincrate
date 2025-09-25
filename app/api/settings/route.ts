import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectMongoDB();
    const user = await User.findById(decoded.userId).select("settings");

    let providerSettings = null;
    if (decoded.role === "provider") {
      const provider = await ServiceProvider.findOne({
        userId: decoded.userId,
      });
      providerSettings = provider?.settings || {};
    }

    const defaultSettings = {
      notifications: {
        email: true,
        sms: false,
        push: true,
        orderUpdates: true,
        promotions: false,
        weeklyDigest: true,
      },
      privacy: {
        profileVisibility: "public",
        showOrderHistory: false,
        dataCollection: true,
        marketing: false,
      },
      preferences: {
        language: "en",
        timezone: "Asia/Kolkata",
        currency: "INR",
      },
      provider: providerSettings || {
        autoAcceptOrders: false,
        maxOrdersPerDay: 50,
        preparationTime: 30,
        deliveryRadius: 10,
      },
    };

    const settings = user?.settings || defaultSettings;

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectMongoDB();
    const { settings } = await request.json();

    // Update user settings
    await User.findByIdAndUpdate(decoded.userId, {
      settings: {
        notifications: settings.notifications,
        privacy: settings.privacy,
        preferences: settings.preferences,
      },
    });

    // Update provider settings if user is a provider
    if (decoded.role === "provider" && settings.provider) {
      await ServiceProvider.findOneAndUpdate(
        { userId: decoded.userId },
        { settings: settings.provider }
      );
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
