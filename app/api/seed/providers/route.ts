import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const sampleProviders = [
    {
        email: "rajesh.kitchen@example.com",
        name: "Rajesh Kumar",
        phone: "9876543210",
        businessName: "Rajesh's Home Kitchen",
        description: "Authentic North Indian home-cooked meals with love and traditional recipes",
        cuisine: ["North Indian", "Punjabi", "Vegetarian"],
        deliveryAreas: ["Sector 1", "Sector 2", "Sector 3"],
        location: {
            coordinates: [77.2090, 28.6139], // Delhi coordinates
            address: "123 Main Street, Sector 1, Delhi"
        },
        businessType: "home_kitchen" as const,
        serviceRadius: 5
    },
    {
        email: "priya.spices@example.com",
        name: "Priya Sharma",
        phone: "9876543211",
        businessName: "Priya's Spice Corner",
        description: "South Indian delicacies and traditional breakfast items made fresh daily",
        cuisine: ["South Indian", "Tamil", "Vegetarian"],
        deliveryAreas: ["Sector 4", "Sector 5", "Sector 6"],
        location: {
            coordinates: [77.2190, 28.6239], // Delhi coordinates
            address: "456 Garden Road, Sector 4, Delhi"
        },
        businessType: "home_kitchen" as const,
        serviceRadius: 7
    },
    {
        email: "amit.delights@example.com",
        name: "Amit Patel",
        phone: "9876543212",
        businessName: "Amit's Food Delights",
        description: "Multi-cuisine restaurant offering both vegetarian and non-vegetarian options",
        cuisine: ["Multi-cuisine", "Chinese", "Continental", "Indian"],
        deliveryAreas: ["Sector 7", "Sector 8", "Sector 9", "Sector 10"],
        location: {
            coordinates: [77.2290, 28.6339], // Delhi coordinates
            address: "789 Commercial Complex, Sector 7, Delhi"
        },
        businessType: "restaurant" as const,
        serviceRadius: 10
    },
    {
        email: "meera.healthy@example.com",
        name: "Meera Singh",
        phone: "9876543213",
        businessName: "Meera's Healthy Bites",
        description: "Healthy and nutritious meals focusing on organic ingredients and balanced nutrition",
        cuisine: ["Healthy", "Organic", "Salads", "Smoothies"],
        deliveryAreas: ["Sector 11", "Sector 12", "Sector 13"],
        location: {
            coordinates: [77.2390, 28.6439], // Delhi coordinates
            address: "321 Health Street, Sector 11, Delhi"
        },
        businessType: "cloud_kitchen" as const,
        serviceRadius: 8
    },
    {
        email: "ravi.traditional@example.com",
        name: "Ravi Gupta",
        phone: "9876543214",
        businessName: "Ravi's Traditional Kitchen",
        description: "Traditional Indian sweets and savory items prepared using age-old recipes",
        cuisine: ["Traditional", "Sweets", "Snacks", "Bengali"],
        deliveryAreas: ["Sector 14", "Sector 15", "Sector 16"],
        location: {
            coordinates: [77.2490, 28.6539], // Delhi coordinates
            address: "654 Sweet Lane, Sector 14, Delhi"
        },
        businessType: "home_kitchen" as const,
        serviceRadius: 6
    }
];

export async function POST(_request: NextRequest) {
    try {
        await connectMongoDB();

        // Clear existing providers and their users
        const existingProviders = await ServiceProvider.find();
        const providerUserIds = existingProviders.map(p => p.userId);

        await ServiceProvider.deleteMany({});
        await User.deleteMany({ _id: { $in: providerUserIds } });

        const createdProviders = [];

        for (const providerData of sampleProviders) {
            // Create user account for provider
            const hashedPassword = await bcrypt.hash("password123", 12);

            const user = new User({
                name: providerData.name,
                email: providerData.email,
                phone: providerData.phone,
                password: hashedPassword,
                role: "provider",
                isVerified: true,
                tokenVersion: 0
            });

            await user.save();

            // Create service provider profile
            const provider = new ServiceProvider({
                userId: user._id,
                businessName: providerData.businessName,
                description: providerData.description,
                cuisine: providerData.cuisine,
                deliveryAreas: providerData.deliveryAreas,
                location: {
                    type: "Point",
                    coordinates: providerData.location.coordinates,
                    address: providerData.location.address
                },
                businessType: providerData.businessType,
                serviceRadius: providerData.serviceRadius,
                isVerified: true,
                isActive: true,
                rating: Math.random() * 2 + 3, // 3-5 rating
                totalOrders: Math.floor(Math.random() * 100) + 50, // 50-150 orders
                avgDeliveryTime: Math.floor(Math.random() * 20) + 25, // 25-45 minutes
                operatingHours: {
                    breakfast: {
                        enabled: true,
                        selfDelivery: true
                    },
                    lunch: {
                        enabled: true,
                        selfDelivery: true
                    },
                    dinner: {
                        enabled: true,
                        selfDelivery: true
                    }
                }
            });

            await provider.save();
            createdProviders.push({
                user: user,
                provider: provider
            });
        }

        return NextResponse.json({
            success: true,
            message: "Sample providers created successfully",
            data: {
                providersCreated: createdProviders.length,
                providers: createdProviders.map(({ user, provider }) => ({
                    id: provider._id,
                    businessName: provider.businessName,
                    email: user.email,
                    phone: user.phone,
                    cuisine: provider.cuisine,
                    businessType: provider.businessType,
                    serviceRadius: provider.serviceRadius,
                    location: provider.location.address
                }))
            }
        });

    } catch (error) {
        console.error("Seed providers error:", error);
        return NextResponse.json(
            {
                error: "Failed to seed providers",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}