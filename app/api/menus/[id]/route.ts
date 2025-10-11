import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import MenuItem from "@/models/MenuItem";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    console.log("params", params);

    const menu = await Menu.findById(params.id)
      .populate({
        path: "weeklyItems.monday",
        model: "MenuItem",
      })
      .populate({
        path: "weeklyItems.tuesday",
        model: "MenuItem",
      })
      .populate({
        path: "weeklyItems.wednesday",
        model: "MenuItem",
      })
      .populate({
        path: "weeklyItems.thursday",
        model: "MenuItem",
      })
      .populate({
        path: "weeklyItems.friday",
        model: "MenuItem",
      })
      .populate({
        path: "weeklyItems.saturday",
        model: "MenuItem",
      })
      .populate({
        path: "weeklyItems.sunday",
        model: "MenuItem",
      })
      .populate("providerId", "businessName");

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");

    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const updateData = await request.json();

    const menu = await Menu.findById(params.id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu.providerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle weeklyItems: for each day, if an object is provided, either create or update MenuItem
    const newWeeklyItems: Partial<Record<string, any>> = {};

    if (updateData.weeklyItems) {
      for (const day of DAYS) {
        const dayItem = updateData.weeklyItems[day];
        if (dayItem) {
          // dayItem might have id (existing) or fresh data
          if (dayItem._id) {
            // existing MenuItem, update it
            await MenuItem.findByIdAndUpdate(dayItem._id, {
              name: dayItem.name,
              description: dayItem.description,
            });
            newWeeklyItems[day] = dayItem._id;
          } else {
            // create new MenuItem
            const created = await MenuItem.create({
              name: dayItem.name,
              description: dayItem.description,
            });
            newWeeklyItems[day] = created._id;
          }
        }
      }
    }

    // Prepare the rest of the menu-level updates (category, basePrice, etc.)
    const allowedFields = [
      "name",
      "description",
      "category",
      "basePrice",
      "monthlyPlanPrice",
      "imageUrl",
      "isAvailable",
      "isVegetarian",
      "isActive",
      "weekType",
      "draft",
    ];

    const menuUpdates: any = {};
    for (const field of allowedFields) {
      if (field in updateData) {
        menuUpdates[field] = (updateData as any)[field];
      }
    }
    if (Object.keys(newWeeklyItems).length > 0) {
      menuUpdates.weeklyItems = newWeeklyItems;
    }

    const updatedMenu = await Menu.findByIdAndUpdate(params.id, menuUpdates, {
      new: true,
    });

    return NextResponse.json({
      message: "Menu updated successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const menu = await Menu.findById(params.id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu.providerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optionally delete associated MenuItems?
    // If you want to cascade delete the menuItem docs referenced (monday, tuesday, …),
    // you can do that here. But be cautious: those items might be reused or referenced elsewhere.
    // For example:
    // for each day in menu.weeklyItems, if non-null, delete that MenuItem.

    await Menu.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
