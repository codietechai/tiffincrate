"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Navigation,
  Star,
  TrendingUp,
} from "lucide-react";

export default function DeliveryDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchAssignments();
    fetchAnalytics();
    getCurrentLocation();
  }, [selectedSlot]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "delivery_partner") {
          router.push("/");
          return;
        }
        setUser(data.data);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchAssignments = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSlot) params.append("timeSlot", selectedSlot);

      const response = await fetch(`/api/delivery/assignments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/delivery");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const updateAssignmentStatus = async (
    assignmentId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `/api/delivery/assignments/${assignmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            location: currentLocation,
          }),
        }
      );

      if (response.ok) {
        fetchAssignments();
        fetchAnalytics();
      }
    } catch (error) {
      console.error("Error updating assignment status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800";
      case "picked_up":
        return "bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-800";
      case "in_transit":
        return "bg-gradient-to-r from-purple-100 to-pink-200 text-purple-800";
      case "delivered":
        return "bg-gradient-to-r from-green-100 to-emerald-200 text-green-800";
      case "failed":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800";
    }
  };

  const getSlotTime = (slot: string) => {
    switch (slot) {
      case "breakfast":
        return "6:00 AM - 8:00 AM";
      case "lunch":
        return "1:00 PM - 3:00 PM";
      case "dinner":
        return "9:00 PM - 11:00 PM";
      default:
        return "";
    }
  };

  const router = useRouter();

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-gray-900">
            Delivery Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your delivery assignments and track earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Deliveries
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-blue-700">
                {analytics?.todayDeliveries || 0}
              </div>
              <p className="text-xs text-blue-600">Completed today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-green-700">
                ₹{analytics?.todayEarnings || 0}
              </div>
              <p className="text-xs text-green-600">Earned today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-yellow-700">
                {analytics?.averageRating?.toFixed(1) || "0.0"}
              </div>
              <p className="text-xs text-yellow-600">Customer rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Assignments
              </CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-purple-700">
                {
                  assignments.filter(
                    (a: any) => !["delivered", "failed"].includes(a.status)
                  ).length
                }
              </div>
              <p className="text-xs text-purple-600">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Slot Filter */}
        <Card className="mb-4 bg-gradient-to-r from-white to-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Filter by Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time Slots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time Slots</SelectItem>
                  <SelectItem value="breakfast">Breakfast (6-8 AM)</SelectItem>
                  <SelectItem value="lunch">Lunch (1-3 PM)</SelectItem>
                  <SelectItem value="dinner">Dinner (9-11 PM)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Optimize Route
              </Button>

              <Button
                variant="outline"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Update Location
              </Button>

              <Button
                variant="outline"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Earnings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Assignments */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedSlot
              ? `${
                  selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1)
                } Deliveries`
              : "All Assignments"}
          </h2>

          {assignments.length > 0 ? (
            assignments.map((assignment: any) => (
              <Card
                key={assignment._id}
                className="bg-gradient-to-br from-white to-orange-50 border-orange-200 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          Order #{assignment.orderId._id.slice(-8)}
                        </h3>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800">
                          {assignment.timeSlot.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getSlotTime(assignment.timeSlot)} • ₹
                        {assignment.deliveryFee} delivery fee
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{assignment.orderId.totalAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {assignment.estimatedDistance.toFixed(1)} km
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-700">
                        Pickup Location
                      </h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.providerId.businessName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {assignment.pickupLocation.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-red-700">
                        Delivery Location
                      </h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.orderId.consumerId.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {assignment.deliveryLocation.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    {assignment.status === "assigned" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateAssignmentStatus(assignment._id, "picked_up")
                        }
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Mark Picked Up
                      </Button>
                    )}

                    {assignment.status === "picked_up" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateAssignmentStatus(assignment._id, "in_transit")
                        }
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      >
                        Start Delivery
                      </Button>
                    )}

                    {assignment.status === "in_transit" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateAssignmentStatus(assignment._id, "delivered")
                        }
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Mark Delivered
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      <Navigation className="mr-2 h-4 w-4" />
                      Open in Maps
                    </Button>

                    <Button variant="outline" size="sm">
                      <Package className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No assignments available
              </h3>
              <p className="text-gray-600">
                {selectedSlot
                  ? `No deliveries assigned for ${selectedSlot} slot`
                  : "Check back later for new delivery assignments"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
