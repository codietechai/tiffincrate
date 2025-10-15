import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import { ERRORMESSAGE, SUCCESSMESSAGE } from "@/constants/response-messages";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();

    const provider = await ServiceProvider.findById(params.id).populate(
      "userId",
      "name email phone address"
    );

    if (!provider) {
      return NextResponse.json(
        { error: ERRORMESSAGE.PROVIDER_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: provider,
      message: SUCCESSMESSAGE.PROVIDER_FETCH,
    });
  } catch (error) {
    return NextResponse.json({ error: ERRORMESSAGE.INTERNAL }, { status: 500 });
  }
}
