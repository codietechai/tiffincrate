"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import StatsGrid from "@/components/common/stats-grid";
import { LoadingPage } from "@/components/ui/loading";

interface OrderItem {
  name: string;
  quantity: number;
}

interface APIOrder {
  _id: string;
  deliveryStatus: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  order: {
    _id: string;
    consumerId: string;
    providerId: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    deliveryAddress: {
      address: string;
    };
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: OrderItem[];
  deliverySlot: string;
  status:
  | "confirmed"
  | "ready"
  | "assigned"
  | "out_for_delivery"
  | "delivered";
  time: string;
  paymentMethod: string;
  address: string;
  phone: string;
  deliveryPartner?: string;
  deliveryType: "self" | "partner";
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const deliveryPartners = [
    "Suresh (Partner)",
    "Rajesh (Partner)",
    "Amit (Partner)",
    "Self Delivery",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 Fetch Orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();

      // 🧩 Flatten and transform data for UI
      const transformedOrders: Order[] = data.orders.map((o: APIOrder) => ({
        id: o._id,
        orderNumber: `#ORD-${o._id.slice(-5)}`,
        customer: o.order.consumerId || "Unknown Customer",
        items: o.order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
        })),
        deliveryDate: o.deliveryDate,
        deliverySlot: new Date(o.deliveryDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: mapDeliveryStatus(o.deliveryStatus),
        time: new Date(o.createdAt).toLocaleDateString(),
        paymentMethod: o.order.paymentMethod,
        address: o.order.deliveryAddress.address,
        phone: "N/A",
        deliveryType: "partner",
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

const mapDeliveryStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "confirmed";
    case "confirmed":
      return "ready";
    case "ready":
      return "ready";
    case "assigned":
      return "assigned";
    case "out_for_delivery":
      return "out_for_delivery";
    case "delivered":
      return "delivered";
    default:
      return "confirmed";
  }
};


  // 🟩 Colors + Icons
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


  const updateDeliveryOrderStatus = async (
    orderDeliveryId: string,
    status: string
  ) => {
    try {
      const res = await fetch(
        `/api/delivery-orders?orderDeliveryId=${orderDeliveryId}&status=${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": "provider",
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      await fetchOrders();
    } catch (error) {
      console.error("❌ Error updating delivery order:", error);
    }
  };

  const filterOrdersByStatus = (status?: Order["status"]) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // 🔥 Call the backend API to update actual delivery order
    await updateDeliveryOrderStatus(orderId, newStatus);
  };

  const handleAssignPartner = (orderId: any, partner: string) => {
    console.log(orderId)
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
            <p className="text-gray-500 text-xs md:text-sm">{(order as any).deliveryDate.split('T')[0]}</p>
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
                  handleAssignPartner(order, partner)
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
                onClick={() =>
                  handleStatusUpdate(order.id, "out_for_delivery")
                }
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
                onClick={() =>
                  handleStatusUpdate(order.id, "out_for_delivery")
                }
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

  if (loading) return <LoadingPage />;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <StatsGrid stats={stats} isLoading={loading} />

      <div>
        <h2 className="mb-4 px-1">Tiffin Orders</h2>
        <Tabs defaultValue="all">
          <TabsList className="mb-4 w-full flex justify-start">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="confirmed">
              New ({filterOrdersByStatus("confirmed").length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready ({filterOrdersByStatus("ready").length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({filterOrdersByStatus("assigned").length})
            </TabsTrigger>
            <TabsTrigger value="out_for_delivery">
              Delivering ({filterOrdersByStatus("out_for_delivery").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 md:space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          {["confirmed", "ready", "assigned", "out_for_delivery"].map(
            (status) => (
              <TabsContent key={status} value={status} className="space-y-3">
                {filterOrdersByStatus(status as Order["status"]).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </TabsContent>
            )
          )}
        </Tabs>
      </div>
    </div>
  );
}
