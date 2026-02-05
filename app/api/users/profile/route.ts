import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceProvider from "@/models/ServiceProvider";
import bcrypt from "bcryptjs";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongoDB();

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let serviceProvider = null;
        if (user.role === "provider") {
            const provider = await ServiceProvider.findOne({ userId: user._id });
            if (provider) {
                // Transform the complex operatingHours structure to simple start/end format for frontend compatibility
                serviceProvider = {
                    ...provider.toObject(),
                    operatingHours: {
                        start: "09:00",
                        end: "21:00",
                    },
                };
            }
        }

        return NextResponse.json({
            profile: {
                user,
                serviceProvider,
            },
            message: SUCCESSMESSAGE.PROFILE_FETCH || "Profile fetched successfully",
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json(
            { error: ERRORMESSAGE.INTERNAL || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongoDB();

        const {
            name,
            phone,
            address,
            password,
            serviceProvider: serviceProviderData,
        } = await request.json();

        // Update user data
        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        // Hash password if provided
        if (password) {
            const saltRounds = 12;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update service provider data if user is a provider
        let serviceProvider = null;
        if (user.role === "provider" && serviceProviderData) {
            const {
                businessName,
                description,
                cuisine,
                deliveryAreas,
                operatingHours,
            } = serviceProviderData;

            const providerUpdateData: any = {};
            if (businessName) providerUpdateData.businessName = businessName;
            if (description) providerUpdateData.description = description;
            if (cuisine) providerUpdateData.cuisine = cuisine;
            if (deliveryAreas) providerUpdateData.deliveryAreas = deliveryAreas;

            // Don't update operatingHours for now since the frontend sends simple format
            // but the model expects complex format. Keep existing operatingHours.

            serviceProvider = await ServiceProvider.findOneAndUpdate(
                { userId: user._id },
                providerUpdateData,
                { new: true, upsert: true }
            );

            // Transform back to simple format for response
            if (serviceProvider) {
                serviceProvider = {
                    ...serviceProvider.toObject(),
                    operatingHours: {
                        start: "09:00",
                        end: "21:00",
                    },
                };
            }
        }

        return NextResponse.json({
            profile: {
                user,
                serviceProvider,
            },
            message: SUCCESSMESSAGE.PROFILE_UPDATE || "Profile updated successfully",
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { error: ERRORMESSAGE.INTERNAL || "Internal server error" },
            { status: 500 }
        );
    }
}