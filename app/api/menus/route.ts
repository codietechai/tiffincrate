import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import Menu from "@/models/Menu";
import ServiceProvider from "@/models/ServiceProvider";
import { connectMongoDB } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isVegetarian = searchParams.get("isVegetarian");
    const weekType = searchParams.get("weekType");
    const isAvailable = searchParams.get("isAvailable");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query: any = {};

    // Text search using MongoDB text index
    if (search) {
      query.$text = { $search: search };
    }

    // Role-based filtering
    if (role === "consumer") {
      query.isActive = true;
      query.isAvailable = true;
    }

    // Provider filtering - Auto-filter by logged-in provider for provider role
    if (role === "provider" && userId) {
      // Find the provider by userId to get their providerId
      const serviceProvider = await ServiceProvider.findOne({ userId });
      if (!serviceProvider) {
        return NextResponse.json(
          { error: "Provider not found for this user" },
          { status: 404 },
        );
      }
      query.providerId = new Types.ObjectId(serviceProvider._id.toString());
    } else if (providerId) {
      // Explicit provider filtering (for consumers browsing specific provider)
      const serviceProvider = await ServiceProvider.findById(providerId);
      if (!serviceProvider) {
        return NextResponse.json(
          { error: ERRORMESSAGE.PROVIDER_NOT_FOUND },
          { status: 404 },
        );
      }
      query.providerId = new Types.ObjectId(serviceProvider._id.toString());
    }

    // Category filtering
    if (category && category !== "all") query.category = category;

    // Vegetarian filtering
    if (isVegetarian === "true") query.isVegetarian = true;
    else if (isVegetarian === "false") query.isVegetarian = false;

    // Week type filtering
    if (weekType && weekType !== "all") query.weekType = weekType;

    // Availability filtering
    if (isAvailable === "true") query.isAvailable = true;
    else if (isAvailable === "false") query.isAvailable = false;

    // Active status filtering
    if (isActive === "true") query.isActive = true;
    else if (isActive === "false") query.isActive = false;

    // Get counts for stats
    const total = await Menu.countDocuments(query);
    const availableCount = await Menu.countDocuments({
      ...query,
      isAvailable: true,
    });
    const activeCount = await Menu.countDocuments({ ...query, isActive: true });

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "menuId",
          as: "menuItems",
        },
      },
      {
        $lookup: {
          from: "serviceproviders",
          localField: "providerId",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      {
        $unwind: "$providerInfo",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          category: 1,
          basePrice: 1,
          monthlyPlanPrice: 1,
          image: 1,
          isAvailable: 1,
          isActive: 1,
          isVegetarian: 1,
          weekType: 1,
          rating: 1,
          userRatingCount: 1,
          tags: 1,
          preparationTime: 1,
          servingSize: 1,
          createdAt: 1,
          updatedAt: 1,
          providerId: "$providerInfo._id",
          providerName: "$providerInfo.businessName",
          menuItems: 1,
          ...(search && { score: { $meta: "textScore" } }),
        },
      },
    ];

    if (search) {
      pipeline.push({ $sort: { score: { $meta: "textScore" }, rating: -1 } });
    } else {
      pipeline.push({ $sort: { rating: -1, createdAt: 1 } });
    }

    pipeline.push({ $skip: skip }, { $limit: limit });

    const menus = await Menu.aggregate(pipeline);

    return NextResponse.json({
      data: menus,
      stats: {
        total,
        available: availableCount,
        active: activeCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: SUCCESSMESSAGE.MENUS_FETCH,
    });
  } catch (error) {
    console.error(ERRORMESSAGE.MENUS_FETCH_FAILED, error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (!userId || role !== "provider") {
      return NextResponse.json(
        { error: ERRORMESSAGE.FORBIDDEN },
        { status: 403 },
      );
    }

    await connectMongoDB();
    const menuData = await request.json();

    // Validate required fields
    if (!menuData.name || !menuData.category || !menuData.basePrice) {
      return NextResponse.json(
        { error: "Menu name, category, and base price are required" },
        { status: 400 },
      );
    }

    // Find provider by user ID
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    // Create the main Menu document
    const menu = await Menu.create({
      providerId: provider._id,
      name: menuData.name,
      description: menuData.description,
      category: menuData.category,
      basePrice: menuData.basePrice,
      monthlyPlanPrice: menuData.monthlyPlanPrice,
      image: menuData.image,
      isAvailable: menuData.isAvailable !== false, // Default to true
      isActive: menuData.isActive !== false, // Default to true
      isVegetarian: menuData.isVegetarian !== false, // Default to true
      weekType: menuData.weekType || "whole",
      tags: menuData.tags || [],
      preparationTime: menuData.preparationTime || 30,
      servingSize: menuData.servingSize || 1,
    });

    // Create MenuItem documents for each day
    const menuItemsPayload = Array.isArray(menuData.menuItems)
      ? menuData.menuItems
      : [];

    const createdMenuItems = await Promise.all(
      menuItemsPayload.map(async (item: any) => {
        if (!item.name) return null;

        return await MenuItem.create({
          name: item.name,
          description: item.description || "",
          menuId: menu._id,
          images: item.images || [],
          day: item.day || "",
          nutritionInfo: item.nutritionInfo || {},
          allergens: item.allergens || [],
          isSpicy: item.isSpicy || false,
          spiceLevel: item.spiceLevel || "mild",
          ingredients: item.ingredients || [],
        });
      }),
    );

    // Filter out nulls
    const validMenuItems = createdMenuItems.filter(Boolean);

    // Return populated menu
    const populatedMenu = {
      ...menu.toObject(),
      menuItems: validMenuItems,
    };

    return NextResponse.json(
      {
        message: SUCCESSMESSAGE.MENU_CREATE,
        data: populatedMenu,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(ERRORMESSAGE.MENU_CREATE_FAILED, error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}
