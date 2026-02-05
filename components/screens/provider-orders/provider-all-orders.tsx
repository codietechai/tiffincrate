"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    XCircle,
    Search,
    Eye,
    Calendar,
    User,
    MapPin,
    IndianRupee,
    Filter,
} from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import { EmptyDataComponent } from "@/components/common/empty-data-component";
import { PaginationComponent } from "@/components/common/pagination-component";
import StatsGrid from "@/components/common/stats-grid";
import TitleHeader from "@/components/common/title-header";
import BackHeader from "@/components/common/back-header";
import { API_ROUTES } from "@/constants/api-routes";
import { PAGE_LINKS } from "@/constants/page-links";

interface Order {
    _id: string;
    consumerId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    menuId: {
        _id: string;
        name: string;
        description?: string;
        category: string;
    };
    address: {
        _id: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        pincode: string;
    };
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    timeSlot: string;
    orderType: string;
    deliveryInfo: any;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface OrdersResponse {
    data: Order[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
    success: boolean;
}

export function ProviderAllOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [filters, setFilters] = useState({
        status: "all",
        paymentStatus: "all",
        search: "",
        page: 1,
        limit: 10,
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrders();
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

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: filters.page.toString(),
                limit: filters.limit.toString(),
            });

            if (filters.status !== "all") params.append("status", filters.status);
            if (filters.search) params.append("search", filters.search);

            const response = await fetch(`${API_ROUTES.ORDER.BASE}?${params}`, {
                headers: {
                    "x-user-id": user.id,
                    "x-user-role": user.role,
                },
            });

            if (response.ok) {
                const data: OrdersResponse = await response.json();
                setOrders(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            preparing: "bg-purple-100 text-purple-800",
            ready: "bg-green-100 text-green-800",
            delivered: "bg-emerald-100 text-emerald-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            paid: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            failed: "bg-red-100 text-red-800",
            refunded: "bg-blue-100 text-blue-800",
        };
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: Clock,
            confirmed: CheckCircle2,
            preparing: Package,
            ready: Package,
            delivered: CheckCircle2,
            cancelled: XCircle,
        };
        const Icon = icons[status as keyof typeof icons] || Clock;
        return <Icon className="w-4 h-4" />;
    };

    const stats = [
        {
            label: "Total Orders",
            value: pagination.total,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            label: "Confirmed",
            value: orders.filter((o) => o.status === "confirmed").length,
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            label: "Delivered",
            value: orders.filter((o) => o.status === "delivered").length,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            label: "Cancelled",
            value: orders.filter((o) => o.status === "cancelled").length,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
    ];

    const handleFilterChange = (key: string, value: string | number) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key === "page" ? value : 1, // Reset to page 1 when other filters change
        }));
    };

    if (loading && !orders.length) return <LoadingPage />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <BackHeader />

                <TitleHeader
                    title="All Orders"
                    description="Manage and track all your orders"
                    icon={<Package />}
                />

                <StatsGrid stats={stats} isLoading={loading} />

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by customer name, order ID..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange("search", e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange("status", value)}
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
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.length > 0 ? (
                        <>
                            {orders.map((order) => (
                                <Card key={order._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        Order #{order._id.slice(-8)}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                                        {new Date(order.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(order.status)}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="ml-1 capitalize">{order.status}</span>
                                                </Badge>
                                                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                    {order.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium">{order.consumerId.name}</p>
                                                    <p className="text-xs text-gray-500">{order.consumerId.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium">{order.menuId.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">
                                                        {order.menuId.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium capitalize">{order.timeSlot}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{order.orderType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium">₹{order.totalAmount}</p>
                                                    <p className="text-xs text-gray-500 capitalize">
                                                        {order.paymentMethod}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                {order.address.addressLine1}
                                                {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                                                , {order.address.city} - {order.address.pincode}
                                            </p>
                                        </div>

                                        {order.notes && (
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Notes:</strong> {order.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(PAGE_LINKS.PROVIDER_ORDER_DETAIL(order._id))
                                                }
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Pagination */}
                            <PaginationComponent
                                page={pagination.page}
                                setPage={(page) => handleFilterChange("page", page)}
                                pageSize={pagination.limit}
                                totalCount={pagination.total}
                                scrollToTop={true}
                            />
                        </>
                    ) : (
                        <EmptyDataComponent
                            icon={<Package />}
                            heading="No orders found"
                            description="You haven't received any orders yet or no orders match your filters."
                        />
                    )}
                </div>
            </div>
        </div>
    );
}