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
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AddReview from "@/components/common/Reviews";
import { formatISTDate, formatISTShort, statusSteps } from "@/utils/utils";
import { Order, Delivery } from "@/types/order";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [menu, setMenu] = useState<any>(null);

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data.data?.[0]?.order || null);
      setDeliveries(data.data?.[0]?.deliveries || []);
      setMenu({
        ...data.data?.[0]?.menu,
        provider: data.data?.[0]?.provider,
      });
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-red-500 rounded-full mr-3"></div>
        Loading your order details...
      </div>
    );

  if (!order)
    return (
      <div className="p-10 text-center text-gray-600">Order not found</div>
    );

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

// 🚫 Cancel next delivery
const handleCancelNextDelivery = async () => {
  try {
    const nextDelivery = deliveries.find(
      (d) => !["delivered", "cancelled"].includes(d.deliveryStatus)
    );

    if (!nextDelivery) {
      alert("No upcoming deliveries to cancel.");
      return;
    }

    const confirmCancel = confirm(
      `Are you sure you want to cancel delivery on ${formatISTDate(nextDelivery.deliveryDate)}?`
    );
    if (!confirmCancel) return;

    const res = await fetch(`/api/deliveries/${nextDelivery._id}/cancel`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Failed to cancel delivery");

    alert("Next delivery cancelled successfully.");
    fetchOrder(); // refresh order data
  } catch (err) {
    console.error("Cancel delivery error:", err);
    alert("Something went wrong while cancelling delivery.");
  }
};

// ❌ Cancel entire order
const handleCancelNextOrder = async () => {
  try {
    if (order.status === "cancelled") {
      alert("This order is already cancelled.");
      return;
    }

    const confirmCancel = confirm(
      "Are you sure you want to cancel the entire order?"
    );
    if (!confirmCancel) return;

    const res = await fetch(`/api/orders/${order._id}/cancel`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Failed to cancel order");

    alert("Order cancelled successfully.");
    fetchOrder();
  } catch (err) {
    console.error("Cancel order error:", err);
    alert("Something went wrong while cancelling order.");
  }
};
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
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
              src={menu?.image}
              alt={menu?.name || "Restaurant"}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h1 className="text-xl font-semibold text-white">
                {menu?.provider?.businessName || "Restaurant"}
              </h1>
              <p className="text-sm text-gray-200">
                {menu?.name || "Food order"}
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
                <Badge
                  className={`${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ordered on {formatISTDate(order.createdAt)}
              </p>
            </div>

            {/* Items Ordered */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">
                Items Ordered
              </h4>
              <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                <div className="border-t border-gray-200 mt-2 pt-2 text-sm flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">
                Delivery Details
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {order.deliveryAddress?.address || "Not available"}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Delivery Date: {formatISTDate(order.deliveryDate)}
                </p>
              </div>
            </div>

            {/* Order Progress */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Order Status</h4>
              <div className="flex items-center justify-between w-full">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index <= currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center text-center flex-1"
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${
                          active ? "bg-green-500 text-white" : "bg-gray-200"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className={`mt-2 text-xs ${
                          active ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Schedule */}
{/* Delivery Schedule */}
{deliveries.length > 0 && (
  <div>
    <h4 className="font-semibold mb-3 text-gray-800">
      Delivery Schedule
    </h4>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
      {deliveries.map((d) => {
        let colorClasses = "";
        let label = "";

        switch (d.deliveryStatus) {
          case "pending":
            colorClasses = "bg-gray-100 text-gray-700";
            label = "Pending";
            break;
          case "confirmed":
            colorClasses = "bg-blue-100 text-blue-700";
            label = "Confirmed";
            break;
          case "ready":
            colorClasses = "bg-green-100 text-green-700";
            label = "Ready";
            break;
          case "out_for_delivery":
            colorClasses = "bg-orange-100 text-orange-700";
            label = "Out for Delivery";
            break;
          case "delivered":
            colorClasses = "bg-green-100 text-green-700";
            label = "Delivered";
            break;
          case "cancelled":
            colorClasses = "bg-red-100 text-red-700";
            label = "Cancelled";
            break;
          default:
            colorClasses = "bg-slate-100 text-slate-700";
            label = d.deliveryStatus;
        }

        return (
          <div
            key={d._id}
            className={`p-3 rounded-xl text-center text-sm font-medium border ${colorClasses}`}
          >
            <div>{formatISTShort(d.deliveryDate)}</div>
            <div className="mt-1 text-xs font-semibold">{label}</div>
          </div>
        );
      })}
    </div>

    {/* 🆕 Action Buttons Section */}
    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
      <Button
        variant="destructive"
        className="flex-1 sm:flex-none"
        onClick={handleCancelNextDelivery}
      >
        Cancel Next Delivery
      </Button>

      <Button
        variant="outline"
        className="flex-1 sm:flex-none border-red-400 text-red-600 hover:bg-red-50"
        onClick={handleCancelNextOrder}
      >
        Cancel Entire Order
      </Button>
    </div>
  </div>
)}


            {/* Notes */}
            {order.notes && (
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Rate Order */}
            {order.status === "delivered" && (
              <div className="bg-white border-t pt-6">
                <h4 className="font-semibold mb-2 text-gray-800">
                  Rate Your Order
                </h4>
                <div className="flex items-center gap-1 mb-3 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 text-gray-300 hover:text-yellow-400 cursor-pointer transition"
                    />
                  ))}
                </div>
                <AddReview
                  consumerId={order.consumerId}
                  orderId={order._id}
                  providerId={order.providerId}
                />
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
