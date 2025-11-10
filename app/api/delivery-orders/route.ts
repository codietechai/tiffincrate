import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import deliveryOrders from "@/models/deliveryOrders";
import { ERRORMESSAGE } from "@/constants/response-messages";

export async function PATCH(request: NextRequest) {
  try {
    const role = request.headers.get("x-user-role");
    const { searchParams } = new URL(request.url);
    const orderDeliveryId = searchParams.get("orderDeliveryId");
    const status = searchParams.get("status");

    if (!orderDeliveryId || !status) {
      return NextResponse.json(
        { error: "Missing orderDeliveryId or status" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    if (role !== "provider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Updating delivery:", orderDeliveryId, "→", status);

    const data = await deliveryOrders
      .findByIdAndUpdate(
        orderDeliveryId,
        { deliveryStatus: status },
        { new: true } // return updated document
      )
      .lean(); // return plain JS object, no circular refs

    if (!data) {
      return NextResponse.json(
        { error: "Delivery order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(ERRORMESSAGE.MENUS_FETCH_FAILED, error);
    return NextResponse.json(
      { error: ERRORMESSAGE.INTERNAL || "Internal server error" },
      { status: 500 }
    );
  }
}
