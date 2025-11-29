import { SUCCESSMESSAGE } from "@/constants/response-messages";
import { withCors } from "@/lib/cors";
import { connectMongoDB } from "@/lib/mongodb";
import Address from "@/models/Address";
import { NextRequest, NextResponse } from "next/server";

export const GET = withCors(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    const user_id = request.headers.get("x-user-id");
    const addresses = await Address.find({
      user_id,
      address_mutability: "mutable",
    }).sort({ isdefault: -1 });
    return NextResponse.json({
      success: true,
      data: addresses,
      message: SUCCESSMESSAGE.ADDRESS_FETCHED,
    });
  } catch (error: any) {
    console.error("GET /addresses error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch addresses" },
      { status: 500 }
    );
  }
});

export const POST = withCors(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    const user_id = request.headers.get("x-user-id");

    const body = await request.json();

    const hasDefault = await Address.exists({
      user_id: user_id,
      is_default: true,
    });

    if (!hasDefault) {
      body.is_default = true;
    }

    if (body.is_default) {
      await Address.findOneAndUpdate(
        { user_id: user_id, is_default: true },
        { is_default: false }
      );
    }

    const created = await Address.create({ ...body, user_id });
    return NextResponse.json({
      success: true,
      data: created,
      message: SUCCESSMESSAGE.ADDRESS_CREATED,
    });
  } catch (error: any) {
    console.error("POST /addresses error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create address" },
      { status: 500 }
    );
  }
});
