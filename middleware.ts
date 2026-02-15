import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

type Role = "admin" | "provider" | "consumer";

const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/reverse-geocode", // Public geocoding service
  "api/seed/all"
];

// Admin-only API routes
const ADMIN_API_ROUTES = [
  "/api/admin",
  "/api/seed", // Seeding operations should be admin-only
  "/api/test", // Test endpoints should be admin-only
  "/api/cron", // Cron management should be admin-only
];

// Provider-only API routes
const PROVIDER_API_ROUTES = [
  "/api/providers/delivery-settings",
  // Note: /api/menus is accessible to all roles - consumers can view, providers can manage
];

// Consumer-only API routes  
const CONSUMER_API_ROUTES = [
  "/api/favorites",
  "/api/razorpay", // Payment operations are consumer-only
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get and verify token
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Check role-based access
  const userRole = decoded.role as Role;

  // Admin-only routes
  // if (ADMIN_API_ROUTES.some(route => pathname.startsWith(route))) {
  //   if (userRole !== "admin") {
  //     return NextResponse.json(
  //       { error: "Admin access required" },
  //       { status: 403 }
  //     );
  //   }
  // }

  // Provider-only routes
  if (PROVIDER_API_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== "provider" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Provider access required" },
        { status: 403 }
      );
    }
  }

  // Consumer-only routes
  if (CONSUMER_API_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== "consumer" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Consumer access required" },
        { status: 403 }
      );
    }
  }

  // Special handling for specific endpoints
  if (pathname.startsWith("/api/orders")) {
    // Orders API is accessible by all authenticated users but with different data
    // The API itself handles role-based filtering
  }

  if (pathname.startsWith("/api/delivery-orders")) {
    // Delivery orders are primarily for providers but consumers can view their own
    // The API itself handles role-based filtering
  }

  if (pathname.startsWith("/api/menus")) {
    // Menus API is accessible by all authenticated users
    // - Consumers: Can view available menus (GET)
    // - Providers: Can manage their own menus (GET/POST)
    // - Role-based filtering is handled at the API level
  }

  if (pathname.startsWith("/api/users/profile")) {
    // Profile API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/address")) {
    // Address API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/notifications")) {
    // Notifications API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/help-requests")) {
    // Help requests API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/reviews")) {
    // Reviews API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/settings")) {
    // Settings API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/wallet")) {
    // Wallet API is accessible by all authenticated users
  }

  if (pathname.startsWith("/api/analytics")) {
    // Analytics API is accessible by providers and admins
    if (userRole === "consumer") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
  }

  // Add user information to request headers for API routes
  const response = NextResponse.next();
  response.headers.set("x-user-id", decoded.userId);
  response.headers.set("x-user-role", decoded.role);
  response.headers.set("x-user-token-version", decoded.tokenVersion?.toString() || "0");

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Optionally match protected pages (uncomment if needed)
    // "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
