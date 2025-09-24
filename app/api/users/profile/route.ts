import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import { getTokenFromRequest, verifyToken, hashPassword } from "@/lib/auth";

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
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile: any = { user };

    // If user is a provider, get their service provider profile
    if (user.role === "provider") {
      const serviceProvider = await ServiceProvider.findOne({
        userId: user._id,
      });
      profile = { ...profile, serviceProvider };
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
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
    const updateData = await request.json();

    // Update user profile
    const userUpdates: any = {};
    if (updateData.name) userUpdates.name = updateData.name;
    if (updateData.phone) userUpdates.phone = updateData.phone;
    if (updateData.address) userUpdates.address = updateData.address;
    if (updateData.password) {
      userUpdates.password = await hashPassword(updateData.password);
    }

    const user = await User.findByIdAndUpdate(decoded.userId, userUpdates, {
      new: true,
    }).select("-password");

    // If user is a provider, update service provider profile
    if (user.role === "provider" && updateData.serviceProvider) {
      await ServiceProvider.findOneAndUpdate(
        { userId: decoded.userId },
        updateData.serviceProvider,
        { new: true }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
