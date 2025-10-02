import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import DeliveryPartner from "@/models/DeliveryPartner";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "delivery_partner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    // Get delivery partner
    const deliveryPartner = await DeliveryPartner.findOne({
      userId: userId,
    });
    if (!deliveryPartner) {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeSlot = searchParams.get("timeSlot");
    const status = searchParams.get("status");

    const query: any = { deliveryPartnerId: deliveryPartner._id };
    if (timeSlot) query.timeSlot = timeSlot;
    if (status) query.status = status;

    const assignments = await DeliveryAssignment.find(query)
      .populate({
        path: "orderId",
        populate: {
          path: "consumerId",
          select: "name phone",
        },
      })
      .populate("providerId", "businessName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Get delivery assignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
