"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Clock,
    CheckCircle2,
    Package,
    Truck,
    MapPin,
    User,
    Phone,
    IndianRupee,
    Calendar,
    AlertCircle,
    Navigation,
} from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import { EmptyDataComponent } from "@/components/common/empty-data-component";
import StatsGrid from "@/components/common/stats-grid";
import TitleHeader from "@/components/common/title-header";
import BackHeader from "@/components/common/back-header";
import { API_ROUTES } from "@/constants/api-routes";
import { PAGE_LINKS } from "@/constants/page-links";

interface DeliveryOrder {
    _id: string;
    orderId: {
        _id: string;
        totalAmount: number;
        paymentMethod: string;
        paymentStatus: string;
    };
    consumerId: {
        _id: string;
        name: string;
        phone?: string;
    };
    address: {
        _id: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        pincode: string;
        landmark?: string;
        deliveryInstructions?: string;
    };
    deliveryDate: string;
    timeSlot: string;
    status: string;
    deliveryNotes?: string;
    confirmedAt?: string;
    preparingAt?: string;
    readyAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    createdAt: string;
}

interface DeliveryOrdersResponse {
    data: DeliveryOrder[];
    pagination: {
        current: number;
        total: number;
        count: number;
        totalRecords: number;
    };
    statusCounts: Array<{ _id: string; count: number }>;
    message: string;
}

export function ProviderDeliveryOrders() {
    const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [filters, setFilters] = useState({
        status: "all",
        timeSlot: "all",
        deliveryDate: new Date().toISOString().split("T")[0], // Today's date
    });
    const [statusCounts, setStatusCounts] = useState<Array<{ _id: string; count: number }>>([]);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchDeliveryOrders();
        }
    }, [user, filters]);

    const checkAuth = async () => {
        try {
            const response = await fetch(API_ROUTES.AUTH.ME);
            if (response.ok) {
                const data = await response.json();
                if (data.data.role !== "provider") {
                    router.push(PAGE_LINKS.HOME);
                    return;
                }
                setUser(data.data);
            } else {
                router.push(PAGE_LINKS.AUTH.LOGIN);
            }
        } catch (error) {
            console.error("Auth check error:", error);
            router.push(PAGE_LINKS.AUTH.LOGIN);
        }
    };

    const fetchDeliveryOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                deliveryDate: filters.deliveryDate,
                limit: "50", // Show more items for today's view
            });

            if (filters.status !== "all") params.append("status", filters.status);
            if (filters.timeSlot !== "all") params.append("timeSlot", filters.timeSlot);

            const response = await fetch(`${API_ROUTES.DELIVERY_ORDER.BASE}?${params}`, {
                headers: {
                    "x-user-id": user.id,
                    "x-user-role": user.role,
                },
            });

            if (response.ok) {
                const data: DeliveryOrdersResponse = await response.json();
                setDeliveryOrders(data.data);
                setStatusCounts(data.statusCounts || []);
            }
        } catch (error) {
            console.error("Error fetching delivery orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveryStatus = async (deliveryOrderId: string, newStatus: string) => {
        try {
            const response = await fetch(
                `${API_ROUTES.DELIVERY_ORDER.BASE}?deliveryOrderId=${deliveryOrderId}&status=${newStatus}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": user.id,
                        "x-user-role": user.role,
                    },
                }
            );

            if (response.ok) {
                // Refresh the delivery orders
                fetchDeliveryOrders();
            }
        } catch (error) {
            console.error("Error updating delivery status:", error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            preparing: "bg-purple-100 text-purple-800",
            ready: "bg-green-100 text-green-800",
            out_for_delivery: "bg-orange-100 text-orange-800",
            delivered: "bg-emerald-100 text-emerald-800",
            cancelled: "bg-red-100 text-red-800",
            not_delivered: "bg-gray-100 text-gray-800",
        };
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: Clock,
            confirmed: CheckCircle2,
            preparing: Package,
            ready: Package,
            out_for_delivery: Truck,
            delivered: CheckCircle2,
            cancelled: AlertCircle,
            not_delivered: AlertCircle,
        };
        const Icon = icons[status as keyof typeof icons] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    const getStatusActions = (order: DeliveryOrder) => {
        const actions = [];

        switch (order.status) {
            case "pending":
                actions.push(
                    <Button
                        key="confirm"
                        size="sm"
                        onClick={() => updateDeliveryStatus(order._id, "confirmed")}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Confirm
                    </Button>
                );
                break;
            case "confirmed":
                actions.push(
                    <Button
                        key="preparing"
                        size="sm"
                        onClick={() => updateDeliveryStatus(order._id, "preparing")}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Start Preparing
                    </Button>
                );
                break;
            case "preparing":
                actions.push(
                    <Button
                        key="ready"
                        size="sm"
                        onClick={() => updateDeliveryStatus(order._id, "ready")}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Mark Ready
                    </Button>
                );
                break;
            case "ready":
                actions.push(
                    <Button
                        key="out_for_delivery"
                        size="sm"
                        onClick={() => updateDeliveryStatus(order._id, "out_for_delivery")}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        Start Delivery
                    </Button>
                );
                break;
            case "out_for_delivery":
                actions.push(
                    <Button
                        key="delivered"
                        size="sm"
                        onClick={() => updateDeliveryStatus(order._id, "delivered")}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        Mark Delivered
                    </Button>,
                    <Button
                        key="map"
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(PAGE_LINKS.DASHBOARD.DELIVERY)}
                    >
                        <Navigation className="w-4 h-4 mr-1" />
                        Map
                    </Button>
                );
                break;
        }

        return actions;
    };

    const getCountForStatus = (status: string) => {
        const statusCount = statusCounts.find(s => s._id === status);
        return statusCount ? statusCount.count : 0;
    };

    const stats = [
        {
            label: "Total Today",
            value: deliveryOrders.length,
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            label: "Pending",
            value: getCountForStatus("pending"),
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            label: "Out for Delivery",
            value: getCountForStatus("out_for_delivery"),
            icon: Truck,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            label: "Delivered",
            value: getCountForStatus("delivered"),
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
    ];

    if (loading) return <LoadingPage />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <BackHeader />

                <TitleHeader
                    title="Today's Deliveries"
                    description={`Delivery orders for ${new Date(filters.deliveryDate).toLocaleDateString()}`}
                    icon={<Truck />}
                />

                <StatsGrid stats={stats} isLoading={loading} />

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="preparing">Preparing</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.timeSlot}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, timeSlot: value }))}
                            >
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time Slots</SelectItem>
                                    <SelectItem value="breakfast">Breakfast</SelectItem>
                                    <SelectItem value="lunch">Lunch</SelectItem>
                                    <SelectItem value="dinner">Dinner</SelectItem>
                                </SelectContent>
                            </Select>
                            <input
                                type="date"
                                value={filters.deliveryDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Orders by Time Slot */}
                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All ({deliveryOrders.length})</TabsTrigger>
                        <TabsTrigger value="breakfast">
                            Breakfast ({deliveryOrders.filter(o => o.timeSlot === "breakfast").length})
                        </TabsTrigger>
                        <TabsTrigger value="lunch">
                            Lunch ({deliveryOrders.filter(o => o.timeSlot === "lunch").length})
                        </TabsTrigger>
                        <TabsTrigger value="dinner">
                            Dinner ({deliveryOrders.filter(o => o.timeSlot === "dinner").length})
                        </TabsTrigger>
                    </TabsList>

                    {["all", "breakfast", "lunch", "dinner"].map((timeSlot) => (
                        <TabsContent key={timeSlot} value={timeSlot} className="space-y-4">
                            {deliveryOrders
                                .filter(order => timeSlot === "all" || order.timeSlot === timeSlot)
                                .map((order) => (
                                    <Card key={order._id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <Truck className="w-6 h-6 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            Delivery #{order._id.slice(-8)}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            Order #{order.orderId._id.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(order.status)}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="ml-1 capitalize">{order.status.replace("_", " ")}</span>
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">{order.consumerId.name}</p>
                                                        {order.consumerId.phone && (
                                                            <p className="text-xs text-gray-500">{order.consumerId.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium capitalize">{order.timeSlot}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(order.deliveryDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <IndianRupee className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">₹{order.orderId.totalAmount}</p>
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {order.orderId.paymentMethod}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 mb-4">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700">
                                                        {order.address.addressLine1}
                                                        {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                                                        , {order.address.city} - {order.address.pincode}
                                                    </p>
                                                    {order.address.landmark && (
                                                        <p className="text-xs text-gray-500">
                                                            Landmark: {order.address.landmark}
                                                        </p>
                                                    )}
                                                    {order.address.deliveryInstructions && (
                                                        <p className="text-xs text-gray-500">
                                                            Instructions: {order.address.deliveryInstructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {order.deliveryNotes && (
                                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Delivery Notes:</strong> {order.deliveryNotes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-2">
                                                {getStatusActions(order)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                            {deliveryOrders.filter(order => timeSlot === "all" || order.timeSlot === timeSlot).length === 0 && (
                                <EmptyDataComponent
                                    icon={<Truck />}
                                    heading={`No ${timeSlot === "all" ? "" : timeSlot} deliveries`}
                                    description={`No delivery orders found for ${timeSlot === "all" ? "today" : timeSlot}.`}
                                />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}