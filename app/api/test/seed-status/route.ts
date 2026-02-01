import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import Menu from "@/models/Menu";
import MenuItem from "@/models/MenuItem";

export async function GET(_request: NextRequest) {
    try {
        await connectMongoDB();

        // Get counts
        const providerCount = await ServiceProvider.countDocuments();
        const menuCount = await Menu.countDocuments();
        const menuItemCount = await MenuItem.countDocuments();

        // Get sample data with provider names
        const sampleProviders = await ServiceProvider.find()
            .limit(5)
            .select('businessName cuisine location.address');

        const sampleMenus = await Menu.find()
            .populate('providerId', 'businessName')
            .limit(10)
            .select('name category');

        const sampleMenuItems = await MenuItem.find()
            .limit(10)
            .select('name day');

        // Check if menu names include provider names
        const menuNamingCheck = sampleMenus.map(menu => ({
            menuName: menu.name,
            providerName: (menu.providerId as any)?.businessName,
            includesProviderName: menu.name.includes((menu.providerId as any)?.businessName || '')
        }));

        return NextResponse.json({
            success: true,
            message: "Seed status check completed",
            data: {
                counts: {
                    providers: providerCount,
                    menus: menuCount,
                    menuItems: menuItemCount
                },
                expectedCounts: {
                    providers: 5,
                    menusPerProvider: 6,
                    totalMenus: 30,
                    itemsPerMenu: 7,
                    totalMenuItems: 210
                },
                isCorrect: {
                    providers: providerCount === 5,
                    menus: menuCount === 30,
                    menuItems: menuItemCount === 210
                },
                samples: {
                    providers: sampleProviders.map(p => ({
                        businessName: p.businessName,
                        cuisine: p.cuisine,
                        address: p.location.address
                    })),
                    menus: sampleMenus.map(m => ({
                        name: m.name,
                        category: m.category,
                        provider: (m.providerId as any)?.businessName
                    })),
                    menuItems: sampleMenuItems.map(mi => ({
                        name: mi.name,
                        day: mi.day
                    }))
                },
                menuNamingCheck: {
                    allMenusHaveProviderNames: menuNamingCheck.every(check => check.includesProviderName),
                    samples: menuNamingCheck.slice(0, 5)
                }
            }
        });

    } catch (error) {
        console.error("Seed status check error:", error);
        return NextResponse.json(
            {
                error: "Failed to check seed status",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}