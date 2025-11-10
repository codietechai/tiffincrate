"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

// ---------- Types ----------
interface Delivery {
  _id: string;
  deliveryDate: string;
deliveryStatus:
  | "pending"
  | "confirmed"
  | "ready"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "not_delivered"
  | "cancelled";

}

interface Order {
  _id: string;
  providerId: { businessName: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  deliveryAddress: { address: string };
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
  updatedAt?: string;
}

// ---------- Utility ----------
const formatISTDate = (utcDate?: string) => {
  if (!utcDate) return "N/A";
  const parsed = new Date(utcDate);
  if (isNaN(parsed.getTime())) return "Invalid Date";
  return parsed.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatISTShort = (utcDate?: string) => {
  if (!utcDate) return "N/A";
  const parsed = new Date(utcDate);
  if (isNaN(parsed.getTime())) return "Invalid Date";
  return parsed.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
};

// ---------- Component ----------
export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
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
      console.log("data", data.data?.[0]?.deliveries);
      setOrder(data.data?.[0]?.orderId || null);
      setDeliveries(data.data?.[0]?.deliveries || []);
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-500">
        <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-blue-500 rounded-full mr-3"></div>
        Loading order details...
      </div>
    );

  if (!order)
    return <div className="p-10 text-center text-gray-600">Order not found</div>;

  const statusSteps = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "preparing", label: "Preparing", icon: Package },
    { key: "ready", label: "Ready for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Calendar },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6 border-gray-300 hover:bg-gray-100"
        >
          ← Back to Orders
        </Button>

        <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <CardTitle className="text-xl font-semibold tracking-wide">
              Order #{order._id?.slice(-8)}
            </CardTitle>
            <p className="text-sm opacity-90">
              Placed on {formatISTDate(order.createdAt)}
            </p>
          </CardHeader>

          <CardContent className="space-y-8 p-6">
            {/* Provider + Payment */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="text-gray-600 text-sm">Provider</p>
                <p className="font-medium text-lg text-gray-900">
                  {order.providerId?.businessName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="font-bold text-2xl text-green-600">
                  ₹{order.totalAmount?.toFixed(2)}
                </p>
                <Badge
                  className={`mt-1 ${order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h4 className="font-semibold mb-2">Items Ordered</h4>
              <div className="space-y-2 bg-gray-100 rounded-xl p-4 shadow-inner">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm text-gray-800"
                  >
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h4 className="font-semibold mb-2">Delivery Details</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {order.deliveryAddress?.address || "N/A"}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Upcoming Delivery Date: {formatISTDate(order.deliveryDate)}
              </p>
            </div>

            {/* Order Progress */}
            <div>
              <h4 className="font-semibold mb-4">Order Progress</h4>
              <div className="relative border-l border-gray-300 ml-4 space-y-6">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex items-start gap-4 ml-2">
                      <div
                        className={`p-2 rounded-full ${active
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${active ? "text-gray-900" : "text-gray-500"
                            }`}
                        >
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-xs text-gray-400">
                            {formatISTDate(order.updatedAt || order.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {deliveries.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Delivery Schedule</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {deliveries.map((d) => {
                    let colorClasses = "";
                    let statusLabel = "";

                    switch (d.deliveryStatus) {
                      case "pending":
                        colorClasses =
                          "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200";
                        statusLabel = "Pending";
                        break;

                      case "confirmed":
                        colorClasses =
                          "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200";
                        statusLabel = "Confirmed";
                        break;

                      case "ready":
                        colorClasses =
                          "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
                        statusLabel = "Ready for Pickup";
                        break;

                      case "assigned":
                        colorClasses =
                          "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200";
                        statusLabel = "Assigned";
                        break;

                      case "out_for_delivery":
                        colorClasses =
                          "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200";
                        statusLabel = "Out for Delivery";
                        break;

                      case "delivered":
                        colorClasses =
                          "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
                        statusLabel = "Delivered";
                        break;

                      case "not_delivered":
                        colorClasses =
                          "bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200";
                        statusLabel = "Not Delivered";
                        break;

                      case "cancelled":
                        colorClasses =
                          "bg-red-100 text-red-700 border-red-300 hover:bg-red-200";
                        statusLabel = "Cancelled";
                        break;

                      default:
                        colorClasses =
                          "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200";
                        statusLabel = d.deliveryStatus;
                        break;
                    }


                    return (
                      <div
                        key={d._id}
                        className={`p-3 rounded-xl text-center text-sm font-medium shadow-sm border transition-all duration-300 ${colorClasses}`}
                      >
                        <div>{formatISTShort(d.deliveryDate)}</div>
                        <div className="mt-1 text-xs font-semibold">{statusLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Notes */}
            {order.notes && (
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
