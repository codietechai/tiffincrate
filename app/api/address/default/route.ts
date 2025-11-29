import { SUCCESSMESSAGE } from "@/constants/response-messages";
import { withCors } from "@/lib/cors";
import { connectMongoDB } from "@/lib/mongodb";
import Address from "@/models/Address";
import { NextRequest, NextResponse } from "next/server";

export const GET = withCors(async (request: NextRequest) => {
  await connectMongoDB();
  const user_id = request.headers.get("x-user-id");

  const address = await Address.findOne({ user_id, is_default: true });

  return NextResponse.json({
    success: true,
    data: address || null,
    message: SUCCESSMESSAGE.ADDRESS_FETCHED,
  });
});
