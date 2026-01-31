"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  Star,
  ChevronLeft,
  Package,
  CheckCircle2,
} from "lucide-react";
import AddReview from "@/components/common/Reviews";
import { formatISTDate, formatISTShort } from "@/utils/utils";
import { toast } from "sonner";

// Updated status steps to match actual order statuses
const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "ready", label: "Ready", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

interface DeliveryOrder {
  _id: string;
  deliveryDate: string;
  deliveryStatus: "confirmed" | "pending" | "delivered" | "cancelled" | "not_delivered" | "ready" | "assigned" | "out_for_delivery";
  pendingAt?: string;
  confirmedAt?: string;
  readyAt?: string;
  assignedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  notDeliveredAt?: string;
  cancelledAt?: string;
  preparationStartAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderData {
  _id: string;
  consumerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  providerId: {
    _id: string;
    businessName: string;
    description?: string;
    rating?: number;
    location?: any;
  };
  menuId: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    price?: number;
  };
  address: {
    _id: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    region: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
  };
  orderType: string;
  deliveryInfo: any;
  totalAmount: number;
  status: string;
  timeSlot: string;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  deliveryOrders: DeliveryOrder[];
  deliveryAddress: { address: string };
  deliveryDate: string;
  items: { name: string; quantity: number; price: number }[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancellingDelivery, setCancellingDelivery] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  // Cancel entire order
  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      if (order.status === "cancelled") {
        toast.error("This order is already cancelled.");
        return;
      }

      if (order.status === "delivered") {
        toast.error("Cannot cancel a delivered order.");
        return;
      }

      const confirmCancel = window.confirm(
        "Are you sure you want to cancel the entire order? This will cancel all remaining deliveries and cannot be undone."
      );
      if (!confirmCancel) return;

      setCancelling(true);
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel_whole_order" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      toast.success("Entire order cancelled successfully.");
      fetchOrder(); // Refresh order data
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error("Something went wrong while cancelling the order.");
    } finally {
      setCancelling(false);
    }
  };

  // Cancel individual delivery
  const handleCancelDelivery = async (deliveryOrderId: string, deliveryDate: string) => {
    if (!order) return;

    try {
      // Import and check cancellation rules
      const { canCancelDelivery } = await import("@/utils/time-slots");
      const cancellationCheck = canCancelDelivery(
        new Date(deliveryDate),
        order.timeSlot as 'breakfast' | 'lunch' | 'dinner'
      );

      if (!cancellationCheck.canCancel) {
        toast.error(cancellationCheck.reason || "Cannot cancel this delivery");
        return;
      }

      const confirmCancel = window.confirm(
        `Are you sure you want to cancel the delivery for ${new Date(deliveryDate).toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'short'
        })}? This action cannot be undone.`
      );
      if (!confirmCancel) return;

      setCancellingDelivery(deliveryOrderId);
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancel_delivery",
          deliveryOrderId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel delivery");
      }

      toast.success("Delivery cancelled successfully.");
      fetchOrder(); // Refresh order data
    } catch (err) {
      console.error("Cancel delivery error:", err);
      toast.error("Something went wrong while cancelling the delivery.");
    } finally {
      setCancellingDelivery(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "preparing":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ready":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "assigned":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "not_delivered":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDeliveryStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "ready":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "assigned":
        return "bg-cyan-50 text-cyan-600 border-cyan-200";
      case "out_for_delivery":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "delivered":
        return "bg-green-50 text-green-600 border-green-200";
      case "not_delivered":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "cancelled":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getOrderTypeSummary = (orderType: string, deliveryInfo: any) => {
    switch (orderType) {
      case "month":
        return `Monthly delivery${deliveryInfo?.startDate ? ` from ${formatISTShort(deliveryInfo.startDate)}` : ''}`;
      case "specific_days":
        return `Specific days: ${deliveryInfo?.days?.join(', ') || 'Not specified'}`;
      case "custom_dates":
        return `Custom dates: ${deliveryInfo?.dates?.length || 0} selected dates`;
      default:
        return "Unknown delivery type";
    }
  };

  const canCancelDeliveryCheck = (deliveryDate: string, timeSlot: string) => {
    try {
      const now = new Date();
      const delivery = new Date(deliveryDate);

      // Reset time to start of day for comparison
      const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const deliveryDay = new Date(delivery.getFullYear(), delivery.getMonth(), delivery.getDate());

      // Can't cancel deliveries in the past
      if (deliveryDay < nowDay) {
        return { canCancel: false, reason: "Cannot cancel past deliveries" };
      }

      // Can cancel up to 2 days from now
      const maxCancelDate = new Date(nowDay);
      maxCancelDate.setDate(maxCancelDate.getDate() + 2);

      if (deliveryDay > maxCancelDate) {
        return { canCancel: false, reason: "Can only cancel up to 2 days in advance" };
      }

      return { canCancel: true };
    } catch (error) {
      return { canCancel: false, reason: "Error checking cancellation eligibility" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-blue-500 rounded-full mr-3"></div>
        Loading your order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-gray-600">
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 mb-4"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" /> Back
        </Button>

        {/* Restaurant Info */}
        <div className="bg-white shadow rounded-2xl overflow-hidden border border-gray-100">
          <div className="relative h-60 bg-gray-200">
            <img
              src={order.menuId?.image || "/placeholder-food.jpg"}
              alt={order.menuId?.name || "Food"}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-food.jpg";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h1 className="text-xl font-semibold text-white">
                {order.providerId?.businessName || "Restaurant"}
              </h1>
              <p className="text-sm text-gray-200">
                {order.menuId?.name || "Food order"}
              </p>
            </div>
          </div>

          <CardContent className="p-5 space-y-6">
            {/* Order Summary */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order #{order._id?.slice(-6)}
                </h2>
                <Badge className={`${getStatusBadgeColor(order.status)} border`}>
                  {formatStatus(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ordered on {formatISTDate(order.createdAt)}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-600">
                  Time Slot: <span className="font-medium capitalize">{order.timeSlot}</span>
                </span>
                <span className="text-gray-600">
                  Payment: <span className="font-medium capitalize">{order.paymentStatus}</span>
                </span>
                <span className="text-gray-600">
                  Type: <span className="font-medium capitalize">{order.orderType.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">
                Order Details
              </h4>
              <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.menuId?.name || 'Menu Item'}</p>
                    <p className="text-sm text-gray-600">{order.menuId?.description || 'No description available'}</p>
                    <p className="text-xs text-blue-600 mt-1">{getOrderTypeSummary(order.orderType, order.deliveryInfo)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.totalAmount}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 text-sm flex justify-between font-semibold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">
                Delivery Information
              </h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-gray-600">
                      {order.address ?
                        `${order.address.address_line_1}${order.address.address_line_2 ? ', ' + order.address.address_line_2 : ''}, ${order.address.city}, ${order.address.region} - ${order.address.postal_code}`
                        : order.deliveryAddress?.address || 'Address not available'
                      }
                    </p>
                  </div>
                </div>

                {order.estimatedDeliveryTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-gray-600">{formatISTDate(order.estimatedDeliveryTime)}</p>
                    </div>
                  </div>
                )}

                {order.actualDeliveryTime && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Delivered At</p>
                      <p className="text-gray-600">{formatISTDate(order.actualDeliveryTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Days */}
            {order.deliveryOrders && order.deliveryOrders.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">
                  Delivery Schedule ({order.deliveryOrders.length} days)
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {order.deliveryOrders.map((delivery, index) => {
                    const cancellationCheck = canCancelDeliveryCheck(delivery.deliveryDate, order.timeSlot);
                    const canCancel = cancellationCheck.canCancel &&
                      !['delivered', 'cancelled'].includes(delivery.deliveryStatus);

                    return (
                      <div
                        key={delivery._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              Day {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatISTShort(delivery.deliveryDate)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(delivery.deliveryDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`${getDeliveryStatusBadgeColor(delivery.deliveryStatus)} border text-xs`}>
                            {formatStatus(delivery.deliveryStatus)}
                          </Badge>

                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                              onClick={() => handleCancelDelivery(delivery._id, delivery.deliveryDate)}
                              disabled={cancellingDelivery === delivery._id}
                            >
                              {cancellingDelivery === delivery._id ? "Cancelling..." : "Cancel"}
                            </Button>
                          )}

                          {!canCancel && !['delivered', 'cancelled'].includes(delivery.deliveryStatus) && (
                            <span className="text-xs text-gray-400" title={cancellationCheck.reason}>
                              Can't cancel
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-700">
                        {order.deliveryOrders.filter(d => d.deliveryStatus === 'delivered').length}
                      </div>
                      <div className="text-blue-600">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-indigo-700">
                        {order.deliveryOrders.filter(d => d.deliveryStatus === 'out_for_delivery').length}
                      </div>
                      <div className="text-indigo-600">Out for Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-700">
                        {order.deliveryOrders.filter(d => ['pending', 'confirmed', 'ready', 'assigned'].includes(d.deliveryStatus)).length}
                      </div>
                      <div className="text-yellow-600">Upcoming</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-700">
                        {order.deliveryOrders.filter(d => ['cancelled', 'not_delivered'].includes(d.deliveryStatus)).length}
                      </div>
                      <div className="text-red-600">Issues</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Progress */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Order Status</h4>
              <div className="flex items-center justify-between w-full overflow-x-auto">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index <= currentStepIndex;
                  const current = order.status === step.key;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center text-center flex-1 min-w-0"
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${current
                          ? "bg-blue-500 text-white ring-2 ring-blue-200"
                          : active
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className={`mt-2 text-xs ${current
                          ? "text-blue-600 font-medium"
                          : active
                            ? "text-green-600"
                            : "text-gray-400"
                          }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Special Instructions</h4>
                <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1"
                >
                  {cancelling ? "Cancelling..." : "Cancel Entire Order"}
                </Button>
                <div className="text-xs text-gray-500 sm:flex-1">
                  <p className="mb-1">Cancellation Rules:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Breakfast: Cancel before 7am same day</li>
                    <li>Lunch: Cancel before 12pm same day</li>
                    <li>Dinner: Cancel before 7pm same day</li>
                    <li>Can cancel up to 2 days in advance</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Rate Order */}
            {order.status === "delivered" && (
              <div className="bg-white border-t pt-6">
                <h4 className="font-semibold mb-4 text-gray-800">
                  Rate Your Experience
                </h4>
                <AddReview
                  consumerId={order.consumerId?._id}
                  orderId={order._id}
                  providerId={order.providerId?._id}
                />
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
