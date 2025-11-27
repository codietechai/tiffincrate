import { withCors } from "@/lib/cors";
import { connectMongoDB } from "@/lib/mongodb";
import Address from "@/models/Address";
import { NextRequest, NextResponse } from "next/server";

export const GET = withCors(async (req: NextRequest, { params }: any) => {
  await connectMongoDB();
  const { id } = params;

  const address = await Address.findById(id);
  if (!address)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );

  return NextResponse.json({ success: true, data: address });
});

export const PUT = withCors(async (req: NextRequest, { params }: any) => {
  await connectMongoDB();
  const { id } = params;
  const body = await req.json();

  const updated = await Address.findByIdAndUpdate(id, body, { new: true });

  if (!updated)
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 404 }
    );

  return NextResponse.json({ success: true, data: updated });
});

export const DELETE = withCors(async (req: NextRequest, { params }: any) => {
  await connectMongoDB();
  const { id } = params;

  const deleted = await Address.findByIdAndDelete(id);
  if (!deleted)
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 404 }
    );

  return NextResponse.json({ success: true, message: "Address deleted" });
});
