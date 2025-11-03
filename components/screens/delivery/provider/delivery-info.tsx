"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bike,
  Package,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Plus,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PartnerOrder {
  orderNumber: string;
  customer: string;
  address: string;
  deliverySlot: string;
  status: "ready" | "picked_up" | "delivered";
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  status: "available" | "on_delivery";
  todayDeliveries: number;
  activeOrders: PartnerOrder[];
  rating: number;
}

export function DeliveryInfo() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([
    {
      id: "1",
      name: "Suresh Kumar",
      phone: "+91 98765 11111",
      status: "on_delivery",
      todayDeliveries: 12,
      activeOrders: [
        {
          orderNumber: "#TIF-2449",
          customer: "Amit Kumar",
          address: "789, Koramangala",
          deliverySlot: "7:00 PM - 8:00 PM",
          status: "picked_up",
        },
        {
          orderNumber: "#TIF-2445",
          customer: "Neha Singh",
          address: "234, BTM Layout",
          deliverySlot: "7:00 PM - 8:00 PM",
          status: "picked_up",
        },
      ],
      rating: 4.8,
    },
    {
      id: "2",
      name: "Rajesh Patil",
      phone: "+91 98765 22222",
      status: "on_delivery",
      todayDeliveries: 15,
      activeOrders: [
        {
          orderNumber: "#TIF-2448",
          customer: "Sneha Reddy",
          address: "321, Whitefield",
          deliverySlot: "12:30 PM - 1:30 PM",
          status: "picked_up",
        },
      ],
      rating: 4.9,
    },
    {
      id: "3",
      name: "Amit Sharma",
      phone: "+91 98765 33333",
      status: "available",
      todayDeliveries: 8,
      activeOrders: [],
      rating: 4.7,
    },
  ]);

  // Orders ready for pickup
  const [readyOrders] = useState([
    {
      orderNumber: "#TIF-2450",
      customer: "Priya Patel",
      address: "456, Indiranagar, Bangalore",
      deliverySlot: "1:00 PM - 2:00 PM",
      phone: "+91 98765 43211",
    },
    {
      orderNumber: "#TIF-2446",
      customer: "Rohit Mehta",
      address: "890, Koramangala, Bangalore",
      deliverySlot: "1:00 PM - 2:00 PM",
      phone: "+91 98765 43215",
    },
  ]);

  const togglePartnerStatus = (id: string) => {
    setPartners(
      partners.map((partner) =>
        partner.id === id
          ? {
              ...partner,
              status:
                partner.status === "available" ? "on_delivery" : "available",
            }
          : partner
      )
    );
  };

  const markOrderDelivered = (partnerId: string, orderNumber: string) => {
    setPartners(
      partners.map((partner) => {
        if (partner.id === partnerId) {
          return {
            ...partner,
            activeOrders: partner.activeOrders.filter(
              (o) => o.orderNumber !== orderNumber
            ),
            todayDeliveries: partner.todayDeliveries + 1,
          };
        }
        return partner;
      })
    );
  };

  const stats = [
    {
      label: "Active Partners",
      value: partners.filter((p) => p.status === "on_delivery").length,
      total: partners.length,
      icon: Bike,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Ready for Pickup",
      value: readyOrders.length,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "In Transit",
      value: partners.reduce((sum, p) => sum + p.activeOrders.length, 0),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed Today",
      value: partners.reduce((sum, p) => sum + p.todayDeliveries, 0),
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const PartnerCard = ({ partner }: { partner: DeliveryPartner }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg">{partner.name}</h3>
                <Badge
                  className={
                    partner.status === "on_delivery"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }
                >
                  {partner.status === "on_delivery"
                    ? "On Delivery"
                    : "Available"}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {partner.phone}
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-gray-600">⭐ {partner.rating}</span>
                <span className="text-gray-600">
                  📦 {partner.todayDeliveries} today
                </span>
              </div>
            </div>
            <Switch
              checked={partner.status === "on_delivery"}
              onCheckedChange={() => togglePartnerStatus(partner.id)}
            />
          </div>

          {partner.activeOrders.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Active Deliveries ({partner.activeOrders.length})
              </p>
              {partner.activeOrders.map((order, idx) => (
                <Card key={idx} className="bg-orange-50 border-orange-200">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{order.orderNumber}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.status === "picked_up" ? "Picked Up" : "Ready"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{order.customer}</p>
                      <div className="flex items-start gap-1 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{order.deliverySlot}</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-9 bg-green-600 hover:bg-green-700 mt-2"
                        onClick={() =>
                          markOrderDelivered(partner.id, order.orderNumber)
                        }
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Mark Delivered
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="truncate">Delivery Partners</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage delivery partners</p>
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 h-11 md:h-10 flex-shrink-0">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Add Partner</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <div className="overflow-y-auto">
              <DrawerHeader>
                <DrawerTitle>Add Delivery Partner</DrawerTitle>
                <DrawerDescription>
                  Add a new delivery partner to your team
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Partner Name</Label>
                  <Input
                    id="partner-name"
                    placeholder="e.g., Suresh Kumar"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner-phone">Phone Number</Label>
                  <Input
                    id="partner-phone"
                    placeholder="+91 98765 43210"
                    className="h-11"
                  />
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600 h-11">
                    Add Partner
                  </Button>
                  <Button variant="outline" className="flex-1 h-11">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

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
                    <p className="mt-1 md:mt-2 md:text-xl">
                      {stat.value}
                      {stat.total && (
                        <span className="text-gray-400">/{stat.total}</span>
                      )}
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

      {/* Tabs */}
      <Tabs defaultValue="partners">
        <TabsList className="w-full overflow-x-auto flex justify-start mb-4">
          <TabsTrigger value="partners" className="flex-shrink-0">
            Partners ({partners.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex-shrink-0">
            Ready for Pickup ({readyOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-3 md:space-y-4">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </TabsContent>

        <TabsContent value="ready" className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              📦 {readyOrders.length} tiffins are ready for pickup. Assign them
              to delivery partners from the Orders page.
            </p>
          </div>
          {readyOrders.map((order, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base">{order.orderNumber}</h3>
                    <Badge className="bg-green-100 text-green-700">
                      <Package className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </div>
                  <p className="text-gray-700">{order.customer}</p>
                  <div className="flex items-start gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{order.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{order.deliverySlot}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{order.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
