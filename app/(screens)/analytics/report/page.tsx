"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    FileText,
    Download,
    ArrowLeft,
    Target,
    Clock,
    Star,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { LoadingPage } from "@/components/ui/loading";
import BackHeader from "@/components/common/back-header";
import TitleHeader from "@/components/common/title-header";
import { API_ROUTES } from "@/constants/api-routes";
import { PAGE_LINKS } from "@/constants/page-links";

export default function DetailedReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const reportType = searchParams.get('type') as 'weekly' | 'monthly' || 'weekly';
    const period = searchParams.get('period') || 'week';

    useEffect(() => {
        fetchReportData();
    }, [reportType, period]);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            // Use the existing digest API to get the data
            const endpoint = reportType === 'weekly'
                ? API_ROUTES.ANALYTICS.DIGEST.WEEKLY
                : API_ROUTES.ANALYTICS.DIGEST.MONTHLY;

            const response = await fetch(endpoint, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                setReportData(data.data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || `Failed to load ${reportType} report`);
            }
        } catch (error) {
            setError(`Error loading ${reportType} report`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingPage />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Failed to load report</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <div className="space-x-2">
                        <Button onClick={() => fetchReportData()}>Retry</Button>
                        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!reportData) return null;

    // Transform data for charts
    const dailyData = Object.entries(reportData.ordersByDay || {}).map(([date, orders]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: orders as number,
        revenue: Math.round((orders as number) * reportData.statistics.averageOrderValue),
    }));

    const statusData = Object.entries(reportData.ordersByStatus || {}).map(([status, count], index) => ({
        name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count as number,
        color: {
            delivered: "#10b981",
            cancelled: "#ef4444",
            pending: "#f59e0b",
            confirmed: "#3b82f6",
            preparing: "#8b5cf6",
        }[status] || "#6b7280",
    }));

    const stats = [
        {
            label: "Total Revenue",
            value: `₹${reportData.statistics.totalRevenue.toLocaleString()}`,
            change: reportData.comparison?.revenueGrowth ? `${reportData.comparison.revenueGrowth > 0 ? '+' : ''}${Math.round(reportData.comparison.revenueGrowth)}%` : null,
            isPositive: reportData.comparison?.revenueGrowth >= 0,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            label: "Total Orders",
            value: reportData.statistics.totalOrders.toString(),
            change: reportData.comparison?.orderGrowth ? `${reportData.comparison.orderGrowth > 0 ? '+' : ''}${Math.round(reportData.comparison.orderGrowth)}%` : null,
            isPositive: reportData.comparison?.orderGrowth >= 0,
            icon: ShoppingBag,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            label: "Avg Order Value",
            value: `₹${Math.round(reportData.statistics.averageOrderValue)}`,
            change: null,
            isPositive: true,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            label: "Completion Rate",
            value: `${Math.round(reportData.statistics.completionRate)}%`,
            change: null,
            isPositive: reportData.statistics.completionRate >= 80,
            icon: Target,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <BackHeader />

                <div className="flex items-center justify-between mb-6">
                    <TitleHeader
                        title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Business Report`}
                        description={`${reportData.startDate} - ${reportData.endDate} | ${reportData.providerName}`}
                        icon={<FileText />}
                    />

                    <Button
                        variant="outline"
                        onClick={() => router.push(PAGE_LINKS.ANALYTICS)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Analytics
                    </Button>
                </div>

                {/* Key Insights */}
                {reportData.insights && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Key Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {reportData.insights.map((insight: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                        <p className="text-gray-700">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label}>
                                <CardContent className="pt-6 pb-6 px-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-gray-500 text-sm">{stat.label}</p>
                                            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                                            {stat.change && (
                                                <div className="flex items-center gap-1 mt-2 text-sm">
                                                    {stat.isPositive ? (
                                                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                                                    )}
                                                    <span
                                                        className={
                                                            stat.isPositive ? "text-green-600" : "text-red-600"
                                                        }
                                                    >
                                                        {stat.change}
                                                    </span>
                                                    <span className="text-gray-500 ml-1">vs last {reportType}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Daily Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Daily Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            name === 'revenue' ? `₹${value}` : value,
                                            name === 'revenue' ? 'Revenue' : 'Orders'
                                        ]}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="orders"
                                        stackId="1"
                                        stroke="#f97316"
                                        fill="#f97316"
                                        fillOpacity={0.3}
                                        name="Orders"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stackId="2"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.3}
                                        name="Revenue (₹)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Order Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Order Status Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Trend */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Revenue & Orders Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === 'revenue' ? `₹${value}` : value,
                                        name === 'revenue' ? 'Revenue' : 'Orders'
                                    ]}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="orders" fill="#f97316" name="Orders" />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="Revenue (₹)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Completed Orders:</span>
                                <span className="font-semibold">{reportData.statistics.completedOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cancelled Orders:</span>
                                <span className="font-semibold text-red-600">{reportData.statistics.cancelledOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Success Rate:</span>
                                <span className="font-semibold text-green-600">
                                    {Math.round(reportData.statistics.completionRate)}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {reportData.comparison && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Growth Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Revenue Growth:</span>
                                    <span className={`font-semibold ${reportData.comparison.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {reportData.comparison.revenueGrowth > 0 ? '+' : ''}{Math.round(reportData.comparison.revenueGrowth)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Growth:</span>
                                    <span className={`font-semibold ${reportData.comparison.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {reportData.comparison.orderGrowth > 0 ? '+' : ''}{Math.round(reportData.comparison.orderGrowth)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Previous Period:</span>
                                    <span className="font-semibold">{reportData.comparison.previousMonthOrders} orders</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Report Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Report Type:</span>
                                <span className="font-semibold capitalize">{reportType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Period:</span>
                                <span className="font-semibold">{reportData.startDate} - {reportData.endDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Generated:</span>
                                <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}