import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { connectMongoDB } from "./mongodb";
import User from "@/models/User";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: any): Promise<string> {
  return await new SignJWT({
    ...payload,
    userId: payload.userId.toString(),
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    await connectMongoDB();
    const user = await User.findById(payload.userId);

    if (!user) return null;

    if (payload.tokenVersion !== user.tokenVersion) {
      return null;
    }

    return payload as any;
  } catch (err) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value;
  return token || null;
}

export function requireAuth(allowedRoles?: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, context: any) => {
      const token = getTokenFromRequest(request);

      if (!token) {
        return new Response("Unauthorized", { status: 401 });
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return new Response("Invalid token", { status: 401 });
      }

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return new Response("Forbidden", { status: 403 });
      }

      // Add user info to request
      (request as any).user = decoded;
      return handler(request, context);
    };
  };
}
