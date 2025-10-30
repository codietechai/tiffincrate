"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, MapPin, Package, Truck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface Order {
  _id: string;
  providerId: { businessName: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  deliveryAddress: {
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
  updatedAt?: string;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

//   if (loading) return <LoadingPage />;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← Back to Orders
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Order #{order._id.slice(-8)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider and Payment Info */}
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <p className="text-gray-600">Provider</p>
                <p className="font-medium">{order.providerId.businessName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Total Amount</p>
                <p className="font-bold text-xl">₹{order.totalAmount}</p>
                <Badge>{order.paymentStatus}</Badge>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-semibold mb-2">Items Ordered</h4>
              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h4 className="font-semibold mb-2">Delivery Details</h4>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {order.deliveryAddress?.address}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expected Delivery:{" "}
                {new Date(order.deliveryDate).toLocaleDateString()}
              </p>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold mb-4">Order Progress</h4>
              <div className="relative border-l border-gray-300 ml-4 space-y-6">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex items-start gap-4 ml-2">
                      <div
                        className={`p-2 rounded-full ${
                          active ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            active ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {active && (
                          <p className="text-xs text-gray-400">
                            {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
