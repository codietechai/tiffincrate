import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import Menu from "@/models/Menu";
import ServiceProvider from "@/models/ServiceProvider";
import { connectMongoDB } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (role === "consumer") {
      query = { isActive: true };
    }

    if (providerId) {
      const serviceProvider = await ServiceProvider.findById(providerId);
      if (!serviceProvider) {
        return NextResponse.json(
          { error: ERRORMESSAGE.PROVIDER_NOT_FOUND },
          { status: 404 }
        );
      }
      query.providerId = new Types.ObjectId(serviceProvider._id);
    }

    if (category && category !== "all") query.category = category;

    const total = await Menu.countDocuments(query);
    const isAvailable = await Menu.countDocuments({ isAvailable: true });
    const isActive = await Menu.countDocuments({ isActive: true });

    const menus = await Menu.aggregate([
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
          draft: 1,
          userRatingCount: 1,
          createdAt: 1,
          updatedAt: 1,
          providerId: "$providerInfo._id",
          providerName: "$providerInfo.businessName",
          menuItems: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json({
      data: menus,
      stats: {
        total,
        available: isAvailable,
        active: isActive,
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
        { status: 403 }
      );
    }

    await connectMongoDB();
    const menuData = await request.json();

    // 🧩 Validate base menu data
    if (!menuData.name || !menuData.category) {
      return NextResponse.json(
        { error: "Menu name and category are required" },
        { status: 400 }
      );
    }

    // 🧠 Find provider by user ID
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // 🧾 Create the main Menu document
    const menu = await Menu.create({
      providerId: provider._id,
      name: menuData.name,
      description: menuData.description,
      category: menuData.category,
      basePrice: menuData.basePrice,
      monthlyPlanPrice: menuData.monthlyPlanPrice,
      image: menuData.image,
      isAvailable: menuData.isAvailable,
      isActive: menuData.isActive,
      isVegetarian: menuData.isVegetarian,
      weekType: menuData.weekType || "whole",
    });

    // 🥣 Create MenuItem documents for each day
    const menuItemsPayload = Array.isArray(menuData.menuItems)
      ? menuData.menuItems
      : [];

    const createdMenuItems = await Promise.all(
      menuItemsPayload.map(async (item:any) => {
        if (!item.name) return null;

        return await MenuItem.create({
          name: item.name,
          description: item.description || "",
          menuId: menu._id,
          images: item.images || [],
          day: item.day || "",
        });
      })
    );

    // 🧹 Filter out nulls (in case of invalid entries)
    const validMenuItems = createdMenuItems.filter(Boolean);

    // ✅ Add them to the menu object (optional for response clarity)
    const populatedMenu = {
      ...menu.toObject(),
      menuItems: validMenuItems,
    };

    return NextResponse.json(
      {
        message: SUCCESSMESSAGE.MENU_CREATE,
        data: populatedMenu,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(ERRORMESSAGE.MENU_CREATE_FAILED, error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL },
      { status: 500 }
    );
  }
}
