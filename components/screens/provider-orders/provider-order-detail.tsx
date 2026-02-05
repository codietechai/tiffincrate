"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    MapPin,
    Truck,
    Clock,
    CheckCircle,
    ChevronLeft,
    Package,
    CheckCircle2,
    User,
    Phone,
    IndianRupee,
    AlertCircle,
    Navigation,
    Edit3,
    Save,
    X,
} from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import BackHeader from "@/components/common/back-header";
import TitleHeader from "@/components/common/title-header";
import { API_ROUTES } from "@/constants/api-routes";
import { PAGE_LINKS } from "@/constants/page-links";
import { toast } from "sonner";

interface DeliveryOrder {
    _id: string;
    deliveryDate: string;
    status: string;
    pendingAt?: string;
    confirmedAt?: string;
    readyAt?: string;
    assignedAt?: string;
    outForDeliveryAt?: string;
    deliveredAt?: string;
    notDeliveredAt?: string;
    cancelledAt?: string;
    preparationStartAt?: string;
    deliveryNotes?: string;
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
}

interface ProviderOrderDetailProps {
    orderId: string;
}

export function ProviderOrderDetail({ orderId }: ProviderOrderDetailProps) {
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [notesValue, setNotesValue] = useState("");
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user && orderId) {
            fetchOrder();
        }
    }, [user, orderId]);

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

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_ROUTES.ORDER.BY_ID(orderId)}`, {
                headers: {
                    "x-user-id": user.id,
                    "x-user-role": user.role,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setOrder(data.data);
                } else {
                    throw new Error(data.error || "Failed to fetch order");
                }
            } else {
                throw new Error("Failed to fetch order");
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            toast.error("Failed to fetch order details");
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveryStatus = async (deliveryOrderId: string, newStatus: string) => {
        try {
            setUpdatingStatus(deliveryOrderId);
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
                toast.success("Status updated successfully");
                fetchOrder(); // Refresh order data
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const updateDeliveryNotes = async (deliveryOrderId: string, notes: string) => {
        try {
            const response = await fetch(
                `${API_ROUTES.DELIVERY_ORDER.BASE}?deliveryOrderId=${deliveryOrderId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": user.id,
                        "x-user-role": user.role,
                    },
                    body: JSON.stringify({
                        status: order?.deliveryOrders.find(d => d._id === deliveryOrderId)?.status,
                        deliveryNotes: notes,
                    }),
                }
            );

            if (response.ok) {
                toast.success("Notes updated successfully");
                setEditingNotes(null);
                fetchOrder(); // Refresh order data
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update notes");
            }
        } catch (error) {
            console.error("Error updating notes:", error);
            toast.error("Failed to update notes");
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
            delivered: CheckCircle,
            cancelled: AlertCircle,
            not_delivered: AlertCircle,
        };
        const Icon = icons[status as keyof typeof icons] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    const getNextStatusOptions = (currentStatus: string) => {
        const statusFlow = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["preparing", "cancelled"],
            preparing: ["ready", "cancelled"],
            ready: ["out_for_delivery", "cancelled"],
            out_for_delivery: ["delivered", "not_delivered"],
            delivered: [],
            cancelled: [],
            not_delivered: [],
        };
        return statusFlow[currentStatus as keyof typeof statusFlow] || [];
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getOrderTypeSummary = (orderType: string, deliveryInfo: any) => {
        switch (orderType) {
            case "month":
                return `Monthly delivery${deliveryInfo?.startDate ? ` from ${new Date(deliveryInfo.startDate).toLocaleDateString()}` : ''}`;
            case "specific_days":
                return `Specific days: ${deliveryInfo?.days?.join(', ') || 'Not specified'}`;
            case "custom_dates":
                return `Custom dates: ${deliveryInfo?.dates?.length || 0} selected dates`;
            default:
                return "Unknown delivery type";
        }
    };

    if (loading) return <LoadingPage />;

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Order not found</h2>
                    <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <BackHeader />

                <TitleHeader
                    title={`Order #${order._id.slice(-8)}`}
                    description={`Order details and delivery management`}
                    icon={<Package />}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Order Summary</span>
                                    <Badge className={getStatusColor(order.status)}>
                                        {getStatusIcon(order.status)}
                                        <span className="ml-1 capitalize">{formatStatus(order.status)}</span>
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Time Slot</p>
                                        <p className="font-medium capitalize">{order.timeSlot}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Status</p>
                                        <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Method</p>
                                        <p className="font-medium capitalize">{order.paymentMethod}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Menu Item</h4>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{order.menuId.name}</p>
                                            <p className="text-sm text-gray-600">{order.menuId.description}</p>
                                            <p className="text-xs text-blue-600 mt-1">{getOrderTypeSummary(order.orderType, order.deliveryInfo)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₹{order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                {order.notes && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold mb-2">Special Instructions</h4>
                                        <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delivery Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Schedule ({order.deliveryOrders?.length || 0} days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.deliveryOrders?.map((delivery, index) => (
                                        <div key={delivery._id} className="border rounded-lg p-4 bg-white">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm font-semibold text-blue-600">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {new Date(delivery.deliveryDate).toLocaleDateString('en-IN', {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(delivery.deliveryDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(delivery.status)}>
                                                    {getStatusIcon(delivery.status)}
                                                    <span className="ml-1">{formatStatus(delivery.status)}</span>
                                                </Badge>
                                            </div>

                                            {/* Status Update */}
                                            {getNextStatusOptions(delivery.status).length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium mb-2">Update Status:</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {getNextStatusOptions(delivery.status).map((status) => (
                                                            <Button
                                                                key={status}
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateDeliveryStatus(delivery._id, status)}
                                                                disabled={updatingStatus === delivery._id}
                                                                className={
                                                                    status === "delivered" ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" :
                                                                        status === "cancelled" ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" :
                                                                            "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                                                }
                                                            >
                                                                {updatingStatus === delivery._id ? "Updating..." : formatStatus(status)}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Delivery Notes */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium">Delivery Notes:</p>
                                                    {editingNotes !== delivery._id && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingNotes(delivery._id);
                                                                setNotesValue(delivery.deliveryNotes || "");
                                                            }}
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {editingNotes === delivery._id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={notesValue}
                                                            onChange={(e) => setNotesValue(e.target.value)}
                                                            placeholder="Add delivery notes..."
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateDeliveryNotes(delivery._id, notesValue)}
                                                            >
                                                                <Save className="w-4 h-4 mr-1" />
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingNotes(null)}
                                                            >
                                                                <X className="w-4 h-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 min-h-[2.5rem] flex items-center">
                                                        {delivery.deliveryNotes || "No notes added"}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Timestamps */}
                                            <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
                                                {delivery.confirmedAt && (
                                                    <p>Confirmed: {formatDateTime(delivery.confirmedAt)}</p>
                                                )}
                                                {delivery.preparationStartAt && (
                                                    <p>Preparing: {formatDateTime(delivery.preparationStartAt)}</p>
                                                )}
                                                {delivery.readyAt && (
                                                    <p>Ready: {formatDateTime(delivery.readyAt)}</p>
                                                )}
                                                {delivery.outForDeliveryAt && (
                                                    <p>Out for Delivery: {formatDateTime(delivery.outForDeliveryAt)}</p>
                                                )}
                                                {delivery.deliveredAt && (
                                                    <p>Delivered: {formatDateTime(delivery.deliveredAt)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Customer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{order.consumerId.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{order.consumerId.email}</p>
                                </div>
                                {order.consumerId.phone && (
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{order.consumerId.phone}</p>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`tel:${order.consumerId.phone}`}>
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delivery Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Delivery Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        {order.address.address_line_1}
                                        {order.address.address_line_2 && `, ${order.address.address_line_2}`}
                                    </p>
                                    <p className="text-sm">
                                        {order.address.city}, {order.address.region} - {order.address.postal_code}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-3"
                                        onClick={() => router.push(PAGE_LINKS.DASHBOARD.DELIVERY)}
                                    >
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Open in Map
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push(PAGE_LINKS.PROVIDER_ORDERS)}
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    All Orders
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push(PAGE_LINKS.PROVIDER_DELIVERY_ORDERS)}
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Today's Deliveries
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push(PAGE_LINKS.DASHBOARD.DELIVERY)}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Delivery Map
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}