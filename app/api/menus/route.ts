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
    let query: any = { isAvailable: true };
    if (role === "consumer") {
      query = {
        isActive: true,
      };
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
    if (category) query.category = category;
    const menus = await Menu.find(query)
      .populate("providerId", "businessName")
      .populate({
        path: "weeklyItems.monday weeklyItems.tuesday weeklyItems.wednesday weeklyItems.thursday weeklyItems.friday weeklyItems.saturday weeklyItems.sunday",
        model: "MenuItem",
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({
      data: menus,
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

    if (role !== "provider") {
      return NextResponse.json(
        { error: ERRORMESSAGE.FORBIDDEN },
        { status: 403 }
      );
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

    const provider = await ServiceProvider.findOne({ userId });

    const menu = await Menu.create({
      ...menuData,
      weeklyItems,
      providerId: provider._id,
    });

    return NextResponse.json(
      { message: SUCCESSMESSAGE.MENU_CREATE, data: menu },
      { status: 201 }
    );
  } catch (error) {
    console.error(ERRORMESSAGE.MENU_CREATE_FAILED, error);
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}
