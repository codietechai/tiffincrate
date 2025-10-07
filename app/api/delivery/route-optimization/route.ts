import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import DeliveryPartner from "@/models/DeliveryPartner";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

// Google Maps API integration for route optimization
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const role = request.headers.get("x-user-role");
    if (role !== "delivery_partner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { timeSlot, currentLocation } = await request.json();

    // Get delivery partner
    const deliveryPartner = await DeliveryPartner.findOne({
      userId: userId,
    });
    if (!deliveryPartner) {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    // Get assignments for the time slot
    const assignments = await DeliveryAssignment.find({
      deliveryPartnerId: deliveryPartner._id,
      timeSlot,
      status: { $in: ["assigned", "picked_up"] },
    }).populate("orderId");

    if (assignments.length === 0) {
      return NextResponse.json({ message: "No assignments to optimize" });
    }

    // Prepare waypoints for Google Maps API
    const waypoints = assignments.map((assignment) => ({
      location: {
        lat: assignment.deliveryLocation.latitude,
        lng: assignment.deliveryLocation.longitude,
      },
      orderId: assignment.orderId._id,
      address: assignment.deliveryLocation.address,
    }));

    // Call Google Maps Directions API for route optimization
    const optimizedRoute = await optimizeRoute(currentLocation, waypoints);

    // Update assignments with optimized route
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      assignment.route = {
        waypoints: optimizedRoute.waypoints,
        optimizedOrder: optimizedRoute.order,
      };
      await assignment.save();
    }

    return NextResponse.json({
      message: "Route optimized successfully",
      route: optimizedRoute,
      estimatedDuration: optimizedRoute.duration,
      estimatedDistance: optimizedRoute.distance,
    });
  } catch (error) {
    console.error("Route optimization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function optimizeRoute(origin: any, waypoints: any[]) {
  try {
    const waypointStr = waypoints
      .map((wp) => `${wp.location.lat},${wp.location.lng}`)
      .join("|");

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${origin.latitude},${origin.longitude}&waypoints=optimize:true|${waypointStr}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const route = data.routes[0];
      const optimizedOrder = data.routes[0].waypoint_order;

      return {
        waypoints: waypoints.map((wp, index) => ({
          ...wp,
          optimizedIndex: optimizedOrder.indexOf(index),
        })),
        order: optimizedOrder,
        duration: route.legs.reduce(
          (total: number, leg: any) => total + leg.duration.value,
          0
        ),
        distance: route.legs.reduce(
          (total: number, leg: any) => total + leg.distance.value,
          0
        ),
        polyline: route.overview_polyline.points,
      };
    }

    // Fallback: return original order if optimization fails
    return {
      waypoints,
      order: waypoints.map((_, index) => index),
      duration: 0,
      distance: 0,
    };
  } catch (error) {
    console.error("Google Maps API error:", error);
    // Return original order as fallback
    return {
      waypoints,
      order: waypoints.map((_, index) => index),
      duration: 0,
      distance: 0,
    };
  }
}
