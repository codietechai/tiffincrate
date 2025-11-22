export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { withCors } from "@/lib/cors";
import { SUCCESSMESSAGE } from "@/constants/response-messages";

async function handler(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    await connectMongoDB();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // if (Number(tokenVersion) !== Number(user.tokenVersion)) {
    //   return NextResponse.json(
    //     { error: "Invalid or expired token" },
    //     { status: 401 }
    //   );
    // }

    return NextResponse.json({
      data: user,
      message: SUCCESSMESSAGE.AUTHENTICATED,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withCors(handler);
