import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { TDecoded } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const checkAuthAndRole = async (
  request: NextRequest,
  role?: "admin" | "provider" | "consumer"
) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  if (role && decoded.role !== role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return decoded;
};
