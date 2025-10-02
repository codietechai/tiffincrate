import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import DeliveryPartner from "@/models/DeliveryPartner";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import ServiceProvider from "@/models/ServiceProvider";
import Notification from "@/models/Notification";

// Auto-assign delivery partners when orders are placed
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    const { orderId } = await request.json();

    const order = await Order.findById(orderId)
      .populate("providerId")
      .populate("consumerId");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const provider = await ServiceProvider.findById(order.providerId._id);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Check if provider handles delivery themselves
    const timeSlotSettings = provider.operatingHours[order.timeSlot];
    if (timeSlotSettings?.selfDelivery) {
      return NextResponse.json({
        message: "Provider handles delivery themselves",
      });
    }

    // Find available delivery partners in the region
    const availablePartners = await findAvailableDeliveryPartners(
      provider.location,
      order.timeSlot,
      order.deliveryDate
    );

    if (availablePartners.length === 0) {
      return NextResponse.json(
        { error: "No delivery partners available" },
        { status: 400 }
      );
    }

    // Assign to the best available partner
    const selectedPartner = selectBestPartner(
      availablePartners,
      provider.location,
      order.deliveryAddress
    );

    // Calculate delivery fee and distance
    const { distance, duration, fee } = await calculateDeliveryDetails(
      provider.location,
      order.deliveryAddress
    );

    // Create delivery assignment
    const assignment = new DeliveryAssignment({
      orderId: order._id,
      providerId: order.providerId._id,
      deliveryPartnerId: selectedPartner._id,
      timeSlot: order.timeSlot,
      pickupLocation: {
        latitude: provider.location.latitude,
        longitude: provider.location.longitude,
        address: provider.location.address,
      },
      deliveryLocation: {
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude,
        address: order.deliveryAddress.address,
      },
      estimatedDistance: distance,
      estimatedDuration: duration,
      deliveryFee: fee,
    });

    await assignment.save();

    // Update order with delivery assignment
    await Order.findByIdAndUpdate(orderId, {
      deliveryPartnerId: selectedPartner._id,
      deliveryAssignmentId: assignment._id,
    });

    // Create notifications
    await Promise.all([
      new Notification({
        userId: selectedPartner.userId,
        title: "New Delivery Assignment",
        message: `You have been assigned a new delivery for ${order.timeSlot} slot.`,
        type: "order",
        data: { assignmentId: assignment._id, orderId: order._id },
      }).save(),

      new Notification({
        userId: order.consumerId._id,
        title: "Delivery Partner Assigned",
        message: "A delivery partner has been assigned to your order.",
        type: "order",
        data: { assignmentId: assignment._id, orderId: order._id },
      }).save(),
    ]);

    return NextResponse.json({
      message: "Delivery partner assigned successfully",
      assignment,
    });
  } catch (error) {
    console.error("Auto-assign delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function findAvailableDeliveryPartners(
  providerLocation: any,
  timeSlot: string,
  deliveryDate: Date
) {
  const partners = await DeliveryPartner.find({
    isActive: true,
    isVerified: true,
    [`availableSlots.${timeSlot}`]: true,
  }).populate("userId");

  // Filter partners within service radius
  const availablePartners = partners.filter((partner) => {
    const distance = calculateDistance(
      providerLocation.latitude,
      providerLocation.longitude,
      partner.currentLocation.latitude,
      partner.currentLocation.longitude
    );
    return distance <= partner.serviceRadius;
  });

  // Check current assignments for the time slot
  const today = new Date(deliveryDate);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const partnersWithCapacity = [];

  for (const partner of availablePartners) {
    const currentAssignments = await DeliveryAssignment.countDocuments({
      deliveryPartnerId: partner._id,
      timeSlot,
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $nin: ["delivered", "failed"] },
    });

    if (currentAssignments < partner.maxDeliveriesPerSlot) {
      partnersWithCapacity.push({
        ...partner.toObject(),
        availableCapacity: partner.maxDeliveriesPerSlot - currentAssignments,
      });
    }
  }

  return partnersWithCapacity;
}

function selectBestPartner(
  partners: any[],
  providerLocation: any,
  deliveryLocation: any
) {
  // Score partners based on distance, rating, and available capacity
  const scoredPartners = partners.map((partner) => {
    const distanceToProvider = calculateDistance(
      providerLocation.latitude,
      providerLocation.longitude,
      partner.currentLocation.latitude,
      partner.currentLocation.longitude
    );

    const distanceToDelivery = calculateDistance(
      partner.currentLocation.latitude,
      partner.currentLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );

    // Lower distance and higher rating = better score
    const score =
      partner.rating * 20 +
      partner.availableCapacity * 5 -
      (distanceToProvider + distanceToDelivery);

    return { ...partner, score };
  });

  // Return partner with highest score
  return scoredPartners.sort((a, b) => b.score - a.score)[0];
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function calculateDeliveryDetails(
  providerLocation: any,
  deliveryLocation: any
) {
  // In a real implementation, this would use Google Maps API
  // For now, we'll use a simple calculation
  const distance = calculateDistance(
    providerLocation.latitude,
    providerLocation.longitude,
    deliveryLocation.latitude,
    deliveryLocation.longitude
  );

  const duration = Math.max(15, distance * 3); // Minimum 15 minutes, 3 minutes per km
  const fee = Math.max(20, distance * 5); // Minimum ₹20, ₹5 per km

  return { distance, duration, fee };
}
