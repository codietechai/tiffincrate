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

        // Get sample data
        const sampleProviders = await ServiceProvider.find().limit(3).select('businessName');
        const sampleMenus = await Menu.find().limit(5).select('name category providerId');
        const sampleMenuItems = await MenuItem.find().limit(5).select('name day menuId');

        // Populate provider names in menus
        const menusWithProviders = await Menu.find()
            .populate('providerId', 'businessName')
            .limit(5)
            .select('name category');

        // Check if menu names include provider names
        const menuNamingCheck = menusWithProviders.map(menu => ({
            menuName: menu.name,
            providerName: (menu.providerId as any)?.businessName,
            includesProviderName: menu.name.includes((menu.providerId as any)?.businessName || '')
        }));

        // Get breakdown by category
        const menuBreakdown = {
            breakfast: await Menu.countDocuments({ category: 'breakfast' }),
            lunch: await Menu.countDocuments({ category: 'lunch' }),
            dinner: await Menu.countDocuments({ category: 'dinner' })
        };

        // Get breakdown by day
        const itemBreakdown = {
            monday: await MenuItem.countDocuments({ day: 'monday' }),
            tuesday: await MenuItem.countDocuments({ day: 'tuesday' }),
            wednesday: await MenuItem.countDocuments({ day: 'wednesday' }),
            thursday: await MenuItem.countDocuments({ day: 'thursday' }),
            friday: await MenuItem.countDocuments({ day: 'friday' }),
            saturday: await MenuItem.countDocuments({ day: 'saturday' }),
            sunday: await MenuItem.countDocuments({ day: 'sunday' })
        };

        return NextResponse.json({
            success: true,
            message: "Menu seeding test results",
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
                breakdown: {
                    menusByCategory: menuBreakdown,
                    itemsByDay: itemBreakdown
                },
                samples: {
                    providers: sampleProviders,
                    menus: sampleMenus,
                    menuItems: sampleMenuItems
                },
                menuNamingCheck: menuNamingCheck,
                allMenusHaveProviderNames: menuNamingCheck.every(check => check.includesProviderName)
            }
        });

    } catch (error) {
        console.error("Menu seeding test error:", error);
        return NextResponse.json(
            {
                error: "Failed to test menu seeding",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}