import { withCors } from "@/lib/cors";
import { connectMongoDB } from "@/lib/mongodb";
import Address from "@/models/Address";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = withCors(async (req: NextRequest, { params }: any) => {
  await connectMongoDB();
  const { id } = params;

  const address = await Address.findById(id);
  if (!address)
    return NextResponse.json(
      { success: false, message: "Address not found" },
      { status: 404 }
    );

  await Address.updateMany(
    { user_id: address.user_id },
    { $set: { is_default: false } }
  );

  address.is_default = true;
  await address.save();

  return NextResponse.json({
    success: true,
    message: "Default updated",
    data: address,
  });
});
