import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

export function withCors<
  T extends (req: NextRequest, ...args: any[]) => Promise<Response> | Response
>(handler: T) {
  return async function (req: NextRequest) {
    const origin = req.headers.get("origin") || "";
    const isAllowed = allowedOrigins.includes(origin);

    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": isAllowed ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-user-id, x-user-token-version",
      "Access-Control-Allow-Credentials": "true",
    };

    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 👇 TS now allows handlers with extra args (like params)
    const response = await handler(req);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });

    return response;
  };
}
