"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
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

export function ProviderAnalytics() {
  const revenueData = [
    { name: "Mon", revenue: 4200, orders: 42 },
    { name: "Tue", revenue: 3800, orders: 38 },
    { name: "Wed", revenue: 5100, orders: 51 },
    { name: "Thu", revenue: 4700, orders: 47 },
    { name: "Fri", revenue: 6200, orders: 62 },
    { name: "Sat", revenue: 7800, orders: 78 },
    { name: "Sun", revenue: 7200, orders: 72 },
  ];

  const categoryData = [
    { name: "Main Course", value: 45, color: "#f97316" },
    { name: "Starters", value: 25, color: "#eab308" },
    { name: "Breads", value: 15, color: "#84cc16" },
    { name: "Desserts", value: 10, color: "#06b6d4" },
    { name: "Beverages", value: 5, color: "#8b5cf6" },
  ];

  const topItems = [
    { name: "Butter Chicken", orders: 156, revenue: 54600 },
    { name: "Chicken Biryani", orders: 142, revenue: 49700 },
    { name: "Paneer Tikka", orders: 98, revenue: 31360 },
    { name: "Garlic Naan", orders: 234, revenue: 14040 },
    { name: "Dal Makhani", orders: 87, revenue: 24360 },
  ];

  const stats = [
    {
      label: "Total Revenue",
      value: "₹39,100",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Orders",
      value: "390",
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Avg Order Value",
      value: "₹100",
      change: "+3.1%",
      isPositive: true,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Customers",
      value: "324",
      change: "+15.3%",
      isPositive: true,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2>Analytics</h2>
        <p className="text-gray-500 mt-1 text-sm">Track your performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 px-3 md:px-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-gray-500 text-xs md:text-sm">
                      {stat.label}
                    </p>
                    <p className="mt-1 md:mt-2 text-lg md:text-2xl">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1 md:mt-2 text-xs md:text-sm">
                      {stat.isPositive ? (
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                      )}
                      <span
                        className={
                          stat.isPositive ? "text-green-600" : "text-red-600"
                        }
                      >
                        {stat.change}
                      </span>
                    </div>
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

      {/* Charts */}
      <div className="space-y-4 md:space-y-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-base md:text-lg">
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-base md:text-lg">
              Weekly Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="orders" fill="#f97316" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-base md:text-lg">
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: "11px" }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-base md:text-lg">
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 md:gap-4"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm md:text-base truncate">
                      {item.name}
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {item.orders} orders
                    </p>
                  </div>
                  <p className="text-orange-600 flex-shrink-0 text-sm md:text-base">
                    ₹{item.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
