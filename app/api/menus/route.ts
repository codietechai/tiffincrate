import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import Menu from "@/models/Menu";
import ServiceProvider from "@/models/ServiceProvider";
import { connectMongoDB } from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const category = searchParams.get("category");
    const query: any = { isActive: true };
    if (providerId) {
      const serviceProvider = await ServiceProvider.findById(providerId);
      if (!serviceProvider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }
      query.providerId = new Types.ObjectId(serviceProvider.userId);
    }
    if (category) query.category = category;
    const menus = await Menu.find(query)
      .populate("providerId", "businessName")
      .populate({
        path: "weeklyItems.monday weeklyItems.tuesday weeklyItems.wednesday weeklyItems.thursday weeklyItems.friday weeklyItems.saturday weeklyItems.sunday",
        model: "MenuItem",
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ menus });
  } catch (error) {
    console.error("Get menus error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const menuData = await request.json();

    const weekDays = Object.keys(menuData.weeklyItems);
    const weeklyItems: any = {};

    for (const day of weekDays) {
      const itemData = menuData.weeklyItems[day];
      if (itemData?.name) {
        const menuItem = await MenuItem.create(itemData);
        weeklyItems[day] = menuItem._id;
      }
    }

    const menu = await Menu.create({
      ...menuData,
      weeklyItems,
      providerId: userId,
    });

    return NextResponse.json(
      { message: "Menu created successfully", menu },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
