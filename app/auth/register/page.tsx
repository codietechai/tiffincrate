"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ChefHat, User, Mail, Lock, Phone, MapPin } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "consumer",
    phone: "",
    address: "",
  });
  const [businessData, setBusinessData] = useState({
    businessName: "",
    description: "",
    cuisine: "",
    deliveryAreas: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
    availableSlots: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBusinessData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload: any = { ...formData };

      if (formData.role === "provider") {
        payload.businessData = {
          businessName: businessData.businessName,
          description: businessData.description,
          cuisine: businessData.cuisine.split(",").map((c) => c.trim()),
          deliveryAreas: businessData.deliveryAreas
            .split(",")
            .map((a) => a.trim()),
        };
      } else if (payload.role === "delivery_partner") {
        payload.businessData = {
          vehicleType: businessData.vehicleType,
          vehicleNumber: businessData.vehicleNumber,
          licenseNumber: businessData.licenseNumber,
          availableSlots: businessData.availableSlots,
        };
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        switch (data.user.role) {
          case "admin":
            router.push("/dashboard/admin");
            break;
          case "provider":
            router.push("/dashboard/provider");
            break;
          case "consumer":
            router.push("/dashboard/consumer");
            break;
          case "delivery_partner":
            router.push("/dashboard/delivery");
            break;
          default:
            router.push("/");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Join TiffinHub</CardTitle>
          <CardDescription>
            Create your account and start your journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumer">
                    Consumer - Order meals
                  </SelectItem>
                  <SelectItem value="provider">
                    Service Provider - Offer tiffin services
                  </SelectItem>
                  <SelectItem value="delivery_partner">
                    Delivery Partner - Deliver meals
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {formData.role === "provider" && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-lg">Business Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Enter your business name"
                    value={businessData.businessName}
                    onChange={handleBusinessInputChange}
                    required={formData.role === "provider"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your tiffin service"
                    value={businessData.description}
                    onChange={handleBusinessInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine Types</Label>
                    <Input
                      id="cuisine"
                      name="cuisine"
                      placeholder="e.g., North Indian, South Indian, Chinese"
                      value={businessData.cuisine}
                      onChange={handleBusinessInputChange}
                    />
                    <p className="text-xs text-gray-500">
                      Separate multiple cuisines with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAreas">Delivery Areas</Label>
                    <Input
                      id="deliveryAreas"
                      name="deliveryAreas"
                      placeholder="e.g., Koramangala, HSR Layout"
                      value={businessData.deliveryAreas}
                      onChange={handleBusinessInputChange}
                    />
                    <p className="text-xs text-gray-500">
                      Separate multiple areas with commas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.role === "delivery_partner" && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-lg">
                  Delivery Partner Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select
                      value={businessData.vehicleType || ""}
                      onValueChange={(value) =>
                        setBusinessData((prev) => ({
                          ...prev,
                          vehicleType: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bike">Motorcycle</SelectItem>
                        <SelectItem value="scooter">Scooter</SelectItem>
                        <SelectItem value="bicycle">Bicycle</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input
                      id="vehicleNumber"
                      name="vehicleNumber"
                      placeholder="e.g., KA01AB1234"
                      value={businessData.vehicleNumber || ""}
                      onChange={handleBusinessInputChange}
                      required={formData.role === "delivery_partner"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Driving License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="Enter your license number"
                    value={businessData.licenseNumber || ""}
                    onChange={handleBusinessInputChange}
                    required={formData.role === "delivery_partner"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="breakfast"
                        checked={
                          businessData.availableSlots?.breakfast !== false
                        }
                        onChange={(e) =>
                          setBusinessData((prev) => ({
                            ...prev,
                            availableSlots: {
                              ...prev.availableSlots,
                              breakfast: e.target.checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="breakfast">Breakfast (6-8 AM)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="lunch"
                        checked={businessData.availableSlots?.lunch !== false}
                        onChange={(e) =>
                          setBusinessData((prev) => ({
                            ...prev,
                            availableSlots: {
                              ...prev.availableSlots,
                              lunch: e.target.checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="lunch">Lunch (1-3 PM)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="dinner"
                        checked={businessData.availableSlots?.dinner !== false}
                        onChange={(e) =>
                          setBusinessData((prev) => ({
                            ...prev,
                            availableSlots: {
                              ...prev.availableSlots,
                              dinner: e.target.checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="dinner">Dinner (9-11 PM)</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
