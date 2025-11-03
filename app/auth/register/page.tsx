"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChefHat,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "consumer",
    phone: "",
    address: "",
  });

  const [addresses, setAddresses] = useState<string[]>([]);
  const [currentAddress, setCurrentAddress] = useState("");

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const value = formData.address.trim();
      if (value && !addresses.includes(value)) {
        setAddresses((prev) => [...prev, value]);
        setFormData((prev) => ({ ...prev, address: "" }));
      }
    }
  };

  const removeAddress = (addr: string) => {
    setAddresses((prev) => prev.filter((a) => a !== addr));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload: any = { ...formData, addresses };

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/${data.user.role}`);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[#f7f7f8] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Left gradient section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-[#6E56CF] to-[#A594F9] text-white p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md text-center space-y-4"
        >
          <ChefHat className="h-12 w-12 mx-auto" />
          <h1 className="text-4xl font-semibold tracking-tight">
            Join TiffinCrate
          </h1>
          <p className="text-sm text-white/80">
            Sign up to serve, deliver, or enjoy fresh home meals. Start your
            culinary journey today 🍱
          </p>
        </motion.div>
      </div>

      {/* Right form section */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl backdrop-blur-xl bg-white/60 dark:bg-neutral-900/60 border border-white/40 dark:border-neutral-800/50 rounded-3xl shadow-xl"
        >
          <Card className="bg-transparent border-none">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Create Account
              </CardTitle>
              <CardDescription>
                Fill in the details below to get started
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <Label>Account Type</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="provider">Service Provider</SelectItem>
                      <SelectItem value="delivery_partner">
                        Delivery Partner
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone */}
                <div>
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Address bubbles for delivery partner */}
                {formData.role === "delivery_partner" && (
                  <div className="space-y-4">
                    <Label htmlFor="addresses">Delivery Addresses</Label>

                    <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[46px] bg-white">
                      {addresses.map((addr, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {addr}
                          <button
                            type="button"
                            onClick={() =>
                              setAddresses(
                                addresses.filter((_, i) => i !== index)
                              )
                            }
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      <input
                        type="text"
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const trimmed = currentAddress.trim();
                            if (trimmed && !addresses.includes(trimmed)) {
                              setAddresses([...addresses, trimmed]);
                            }
                            setCurrentAddress("");
                          }
                        }}
                        placeholder="Type address and press Enter or comma"
                        className="flex-grow outline-none bg-transparent text-sm min-w-[120px]"
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      Add multiple addresses by pressing Enter or comma
                    </p>
                  </div>
                )}

                {/* Provider fields */}
                {formData.role === "provider" && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Business Information</h3>
                    <Label>Business Name</Label>
                    <Input
                      name="businessName"
                      value={businessData.businessName}
                      onChange={handleBusinessInputChange}
                    />
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={businessData.description}
                      onChange={handleBusinessInputChange}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Cuisine Types</Label>
                        <Input
                          name="cuisine"
                          value={businessData.cuisine}
                          onChange={handleBusinessInputChange}
                          placeholder="e.g., North Indian, Chinese"
                        />
                      </div>
                      <div>
                        <Label>Delivery Areas</Label>
                        <Input
                          name="deliveryAreas"
                          value={businessData.deliveryAreas}
                          onChange={handleBusinessInputChange}
                          placeholder="e.g., Sector 15, HSR Layout"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery partner fields */}
                {formData.role === "delivery_partner" && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Delivery Partner Info</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Vehicle Type</Label>
                        <Select
                          value={businessData.vehicleType}
                          onValueChange={(v) =>
                            setBusinessData((p) => ({ ...p, vehicleType: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bike">Motorcycle</SelectItem>
                            <SelectItem value="scooter">Scooter</SelectItem>
                            <SelectItem value="bicycle">Bicycle</SelectItem>
                            <SelectItem value="car">Car</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Vehicle Number</Label>
                        <Input
                          name="vehicleNumber"
                          value={businessData.vehicleNumber}
                          onChange={handleBusinessInputChange}
                        />
                      </div>
                    </div>

                    <Label>License Number</Label>
                    <Input
                      name="licenseNumber"
                      value={businessData.licenseNumber}
                      onChange={handleBusinessInputChange}
                    />

                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {["breakfast", "lunch", "dinner"].map((slot) => (
                        <label key={slot} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={
                              businessData.availableSlots[
                                slot as keyof typeof businessData.availableSlots
                              ]
                            }
                            onChange={(e) =>
                              setBusinessData((prev) => ({
                                ...prev,
                                availableSlots: {
                                  ...prev.availableSlots,
                                  [slot]: e.target.checked,
                                },
                              }))
                            }
                          />
                          <span className="capitalize">{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#6E56CF] hover:bg-[#5b46b1]"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-[#6E56CF] hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
