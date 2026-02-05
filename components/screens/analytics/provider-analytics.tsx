"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  FileText,
  Download,
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
} from "recharts";
import { LoadingPage } from "@/components/ui/loading";
import BackHeader from "@/components/common/back-header";
import TitleHeader from "@/components/common/title-header";
import { useProviderAnalytics } from "@/services/analytics-service";
import { API_ROUTES } from "@/constants/api-routes";
import { PAGE_LINKS } from "@/constants/page-links";

export function ProviderAnalytics() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [user, setUser] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const router = useRouter();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProviderAnalytics({ period });

  useEffect(() => {
    checkAuth();
  }, []);

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

  const navigateToDetailedReport = (reportType: 'weekly' | 'monthly') => {
    setIsGeneratingReport(true);

    // Navigate to detailed report page with the selected period
    const params = new URLSearchParams({
      type: reportType,
      period: period,
    });

    router.push(`/analytics/report?${params.toString()}`);

    // Reset loading state after navigation
    setTimeout(() => setIsGeneratingReport(false), 1000);
  };

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load analytics</h2>
          <p className="text-gray-500 mb-4">Please try again</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const analytics = analyticsData?.data;
  if (!analytics) return null;

  // Transform data for charts
  const revenueChartData = analytics.charts.revenue.map((item) => ({
    name: new Date(item._id).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  const categoryChartData = analytics.charts.categories.map((item, index) => ({
    name: item._id || "Other",
    value: item.count,
    revenue: item.revenue,
    color: [
      "#f97316", "#eab308", "#84cc16", "#06b6d4", "#8b5cf6",
      "#ec4899", "#ef4444", "#10b981", "#3b82f6", "#6366f1"
    ][index % 10],
  }));

  const deliveryStatusData = analytics.charts.deliveryStats.map((item, index) => ({
    name: item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count,
    color: {
      delivered: "#10b981",
      "out for delivery": "#f59e0b",
      ready: "#8b5cf6",
      preparing: "#06b6d4",
      confirmed: "#3b82f6",
      pending: "#6b7280",
      cancelled: "#ef4444",
      "not delivered": "#f97316",
    }[item._id] || "#6b7280",
  }));

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${analytics.overview.totalRevenue.toLocaleString()}`,
      change: `${analytics.overview.changes.revenue >= 0 ? '+' : ''}${analytics.overview.changes.revenue}%`,
      isPositive: analytics.overview.changes.revenue >= 0,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Orders",
      value: analytics.overview.totalOrders.toString(),
      change: `${analytics.overview.changes.orders >= 0 ? '+' : ''}${analytics.overview.changes.orders}%`,
      isPositive: analytics.overview.changes.orders >= 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Avg Order Value",
      value: `₹${analytics.overview.avgOrderValue}`,
      change: `${analytics.overview.changes.avgOrder >= 0 ? '+' : ''}${analytics.overview.changes.avgOrder}%`,
      isPositive: analytics.overview.changes.avgOrder >= 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Customers",
      value: analytics.overview.totalCustomers.toString(),
      change: `${analytics.overview.changes.customers >= 0 ? '+' : ''}${analytics.overview.changes.customers}%`,
      isPositive: analytics.overview.changes.customers >= 0,
      icon: Users,
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
            title="Analytics Dashboard"
            description={`Performance insights for ${analytics.provider.name}`}
            icon={<TrendingUp />}
          />

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(value: "week" | "month" | "year") => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Detailed Reports Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detailed Business Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigateToDetailedReport('weekly')}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 h-12"
              >
                <Calendar className="w-4 h-4" />
                {isGeneratingReport ? "Loading..." : "Weekly Report"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateToDetailedReport('monthly')}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 h-12"
              >
                <Download className="w-4 h-4" />
                {isGeneratingReport ? "Loading..." : "Monthly Report"}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              View comprehensive analytics with detailed graphs, insights, and performance metrics
            </p>
          </CardContent>
        </Card>

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
                        <span className="text-gray-500 ml-1">vs last {period}</span>
                      </div>
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
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'revenue' ? `₹${value}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Orders Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#f97316" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          {categoryChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
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
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.charts.topMenus.length > 0 ? (
                  analytics.charts.topMenus.slice(0, 5).map((item, index) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.orders} orders
                        </p>
                      </div>
                      <p className="text-orange-600 font-semibold flex-shrink-0">
                        ₹{item.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No menu data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Status Distribution */}
        {deliveryStatusData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Delivery Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryStatusData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
