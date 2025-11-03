"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  CreditCard,
  CircleAlert as AlertCircle,
  Gift,
  MessageCircle,
  Star,
  Shield,
  Filter,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationService } from "@/services/notification-service";
import TitleHeader from "@/components/common/title-header";

interface TNotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion";
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.fetchNotifications();

      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      let payload: any = {};
      payload = { id: notificationIds };
      await NotificationService.markAsRead(payload);

      if (notificationIds) {
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-white" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-white" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-white" />;
      case "promotion":
        return <Gift className="h-5 w-5 text-white" />;
      case "review":
        return <Star className="h-5 w-5 text-white" />;
      case "help":
        return <MessageCircle className="h-5 w-5 text-white" />;
      case "verification":
        return <Shield className="h-5 w-5 text-white" />;
      default:
        return <Bell className="h-5 w-5 text-white" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case "order":
        return "bg-gradient-to-r from-blue-500 to-blue-600";
      case "payment":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      case "system":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      case "promotion":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "review":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "help":
        return "bg-gradient-to-r from-indigo-500 to-purple-500";
      case "verification":
        return "bg-gradient-to-r from-teal-500 to-cyan-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const toggleFilter = (type: string) => {
    setFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  };

  const removeFilter = (filter: string) => {
    setFilters((prev) => prev.filter((f) => f !== filter));
  };

  const getFilteredNotifications = () => {
    return notifications.filter((n) => {
      const matchesRead =
        activeTab === "read"
          ? n.isRead
          : activeTab === "unread"
          ? !n.isRead
          : true;
      const matchesFilter = filters.length ? filters.includes(n.type) : true;
      return matchesRead && matchesFilter;
    });
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-xl px-4 py-4">
        <TitleHeader
          description="Stay updated with your orders"
          title="Notifications"
          icon={<Bell />}
          rightComponent={
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {["order", "payment", "system", "promotion"].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={filters.includes(type)}
                      onCheckedChange={() => toggleFilter(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {unreadCount > 0 && (
                <Button onClick={() => markAsRead()} variant="outline">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          }
        />
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant="default"
                className="flex items-center gap-1 text-sm px-4 py-1 rounded-full"
              >
                {filter}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive transition"
                  onClick={() => removeFilter(filter)}
                />
              </Badge>
            ))}
          </div>
        )}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() =>
                    !notification.isRead && markAsRead([notification._id])
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 p-2 rounded-full ${getTypeGradient(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className={`font-medium ${
                                !notification.isRead
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${
                                !notification.isRead
                                  ? "text-gray-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {notification.message}
                            </p>
                          </div>

                          <Badge
                            className={`${getTypeGradient(
                              notification.type
                            )} text-white`}
                          >
                            {notification.type}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>

                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead([notification._id]);
                              }}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <h3 className="font-medium text-gray-900 mb-1">
                  {activeTab === "unread"
                    ? "No unread notifications"
                    : "No read notifications"}
                </h3>
                <p className="text-gray-600 text-sm lg:text-base">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
