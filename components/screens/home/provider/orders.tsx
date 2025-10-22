"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  Package,
  Bike,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: OrderItem[];
  deliverySlot: string;
  status: "confirmed" | "ready" | "assigned" | "out_for_delivery" | "delivered";
  time: string;
  paymentMethod: string;
  address: string;
  phone: string;
  deliveryPartner?: string;
  deliveryType: "self" | "partner";
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "#TIF-2451",
      customer: "Rahul Sharma",
      items: [
        { name: "Lunch Tiffin (Veg)", quantity: 2 },
        { name: "Breakfast Special", quantity: 1 },
      ],
      deliverySlot: "12:00 PM - 1:00 PM",
      status: "confirmed",
      time: "5 min ago",
      paymentMethod: "Online",
      address: "123, MG Road, Bangalore",
      phone: "+91 98765 43210",
      deliveryType: "partner",
    },
    {
      id: "2",
      orderNumber: "#TIF-2450",
      customer: "Priya Patel",
      items: [{ name: "Lunch Tiffin (Non-Veg)", quantity: 1 }],
      deliverySlot: "1:00 PM - 2:00 PM",
      status: "ready",
      time: "10 min ago",
      paymentMethod: "COD",
      address: "456, Indiranagar, Bangalore",
      phone: "+91 98765 43211",
      deliveryType: "partner",
    },
    {
      id: "3",
      orderNumber: "#TIF-2449",
      customer: "Amit Kumar",
      items: [{ name: "Dinner Tiffin (Veg)", quantity: 3 }],
      deliverySlot: "7:00 PM - 8:00 PM",
      status: "assigned",
      time: "15 min ago",
      paymentMethod: "Online",
      address: "789, Koramangala, Bangalore",
      phone: "+91 98765 43212",
      deliveryPartner: "Suresh (Partner)",
      deliveryType: "partner",
    },
    {
      id: "4",
      orderNumber: "#TIF-2448",
      customer: "Sneha Reddy",
      items: [{ name: "Lunch Tiffin (Veg)", quantity: 2 }],
      deliverySlot: "12:30 PM - 1:30 PM",
      status: "out_for_delivery",
      time: "25 min ago",
      paymentMethod: "Online",
      address: "321, Whitefield, Bangalore",
      phone: "+91 98765 43213",
      deliveryPartner: "Rajesh (Partner)",
      deliveryType: "partner",
    },
    {
      id: "5",
      orderNumber: "#TIF-2447",
      customer: "Kiran Joshi",
      items: [{ name: "Breakfast Special", quantity: 2 }],
      deliverySlot: "8:00 AM - 9:00 AM",
      status: "ready",
      time: "8 min ago",
      paymentMethod: "Online",
      address: "567, HSR Layout, Bangalore",
      phone: "+91 98765 43214",
      deliveryType: "self",
    },
  ]);

  const deliveryPartners = [
    "Suresh (Partner)",
    "Rajesh (Partner)",
    "Amit (Partner)",
    "Self Delivery",
  ];

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-700",
      ready: "bg-green-100 text-green-700",
      assigned: "bg-purple-100 text-purple-700",
      out_for_delivery: "bg-orange-100 text-orange-700",
      delivered: "bg-gray-100 text-gray-700",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order["status"]) => {
    const icons = {
      confirmed: Clock,
      ready: Package,
      assigned: User,
      out_for_delivery: Bike,
      delivered: CheckCircle2,
    };
    const Icon = icons[status];
    return <Icon className="w-4 h-4" />;
  };

  const getStatusLabel = (status: Order["status"]) => {
    const labels = {
      confirmed: "Confirmed",
      ready: "Ready for Pickup",
      assigned: "Assigned",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
    };
    return labels[status];
  };

  const stats = [
    {
      label: "New Orders",
      value: orders.filter((o) => o.status === "confirmed").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Ready for Pickup",
      value: orders.filter((o) => o.status === "ready").length,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Out for Delivery",
      value: orders.filter(
        (o) => o.status === "out_for_delivery" || o.status === "assigned"
      ).length,
      icon: Bike,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Today",
      value: orders.length,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const filterOrdersByStatus = (status?: Order["status"]) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleAssignPartner = (orderId: string, partner: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              deliveryPartner: partner,
              deliveryType: partner === "Self Delivery" ? "self" : "partner",
              status: "assigned",
            }
          : order
      )
    );
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-shadow active:scale-[0.98]">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base md:text-lg">
                {order.orderNumber}
              </CardTitle>
              <Badge className={`${getStatusColor(order.status)} text-xs`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  <span>{getStatusLabel(order.status)}</span>
                </span>
              </Badge>
            </div>
            <p className="text-gray-500 mt-1 text-sm truncate">
              {order.customer}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-gray-500 text-xs md:text-sm">{order.time}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        <div className="space-y-2 text-sm md:text-base">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-gray-700 gap-2">
              <span className="flex-1 min-w-0">
                <span className="text-orange-600">{item.quantity}x</span>{" "}
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-700">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Delivery: {order.deliverySlot}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 space-y-2 text-xs md:text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
            <span className="flex-1 text-gray-600">{order.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span className="text-gray-600">{order.phone}</span>
          </div>
          <p className="text-gray-600 pl-6">💳 {order.paymentMethod}</p>

          {order.deliveryPartner && (
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="text-gray-600">{order.deliveryPartner}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {order.status === "confirmed" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-11 md:h-10"
              onClick={() => handleStatusUpdate(order.id, "ready")}
            >
              <Package className="w-4 h-4 mr-2" />
              Mark Ready for Pickup
            </Button>
          )}

          {order.status === "ready" && (
            <div className="space-y-2">
              <Select
                onValueChange={(partner) =>
                  handleAssignPartner(order.id, partner)
                }
              >
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue placeholder="Assign delivery partner..." />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPartners.map((partner) => (
                    <SelectItem key={partner} value={partner}>
                      {partner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="w-full h-11 md:h-10"
                onClick={() => handleStatusUpdate(order.id, "out_for_delivery")}
              >
                <Bike className="w-4 h-4 mr-2" />
                Start Self Delivery
              </Button>
            </div>
          )}

          {order.status === "assigned" && (
            <div className="space-y-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <p className="text-sm text-purple-700">
                  Waiting for pickup by {order.deliveryPartner}
                </p>
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 h-11 md:h-10"
                onClick={() => handleStatusUpdate(order.id, "out_for_delivery")}
              >
                Mark Out for Delivery
              </Button>
            </div>
          )}

          {order.status === "out_for_delivery" && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 md:h-10"
              onClick={() => handleStatusUpdate(order.id, "delivered")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Delivered
            </Button>
          )}

          {order.status === "delivered" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm text-green-700">✓ Delivered Successfully</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 px-3 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-500 text-xs md:text-sm">
                      {stat.label}
                    </p>
                    <p className="mt-1 md:mt-2 text-lg md:text-2xl">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.bgColor} ${stat.color} p-2 md:p-3 rounded-lg w-fit`}
                  >
                    <Icon className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders */}
      <div>
        <h2 className="mb-4 px-1">Tiffin Orders</h2>
        <Tabs defaultValue="all">
          <TabsList className="mb-4 w-full flex justify-start">
            <TabsTrigger value="all" className="flex-shrink-0">
              All ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-shrink-0">
              New ({filterOrdersByStatus("confirmed").length})
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex-shrink-0">
              Ready ({filterOrdersByStatus("ready").length})
            </TabsTrigger>
            <TabsTrigger value="assigned" className="flex-shrink-0">
              Assigned ({filterOrdersByStatus("assigned").length})
            </TabsTrigger>
            <TabsTrigger value="out_for_delivery" className="flex-shrink-0">
              Delivering ({filterOrdersByStatus("out_for_delivery").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 md:space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-3 md:space-y-4">
            {filterOrdersByStatus("confirmed").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="ready" className="space-y-3 md:space-y-4">
            {filterOrdersByStatus("ready").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-3 md:space-y-4">
            {filterOrdersByStatus("assigned").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent
            value="out_for_delivery"
            className="space-y-3 md:space-y-4"
          >
            {filterOrdersByStatus("out_for_delivery").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
