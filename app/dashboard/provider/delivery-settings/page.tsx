"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Truck, Clock, MapPin, Settings } from "lucide-react";

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "provider") {
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

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/providers/delivery-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = (slot: string, field: string, value: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [slot]: {
          ...prev.operatingHours[slot],
          [field]: value,
        },
      },
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/providers/delivery-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Delivery settings updated successfully");
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getSlotInfo = (slot: string) => {
    const slotInfo = {
      breakfast: { time: "6:00 AM - 8:00 AM", icon: "🌅" },
      lunch: { time: "1:00 PM - 3:00 PM", icon: "☀️" },
      dinner: { time: "9:00 PM - 11:00 PM", icon: "🌙" },
    };

    if (!slot || !(slot in slotInfo)) {
      return { time: "Invalid slot", icon: "❌" };
    }

    return slotInfo[slot as keyof typeof slotInfo];
  };

  if (loading) return <LoadingPage />;
  console.log("settings", settings);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="h-8 w-8 text-orange-600" />
            Delivery Settings
          </h1>
          <p className="text-gray-600">
            Configure your delivery preferences for each time slot
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {settings &&
            Object.entries(settings.operatingHours).map(
              ([slot, slotSettings]: [string, any]) => {
                const slotInfo = getSlotInfo(slot);
                return (
                  <Card
                    key={slot}
                    className="bg-gradient-to-br from-white to-orange-50 border-orange-200"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-xl">{slotInfo.icon}</span>
                        <div>
                          <h3 className="text-xl font-semibold capitalize">
                            {slot}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {slotInfo.time}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">
                            Enable {slot} service
                          </Label>
                          <p className="text-sm text-gray-600">
                            Accept orders for {slot} time slot
                          </p>
                        </div>
                        <Switch
                          checked={slotSettings.enabled}
                          onCheckedChange={(checked) =>
                            handleSlotChange(slot, "enabled", checked)
                          }
                        />
                      </div>

                      {slotSettings.enabled && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">
                              Self Delivery
                            </Label>
                            <p className="text-sm text-gray-600">
                              Deliver orders yourself instead of using delivery
                              partners
                            </p>
                            <p className="text-xs text-orange-600">
                              {slotSettings.selfDelivery
                                ? "You will handle all deliveries for this slot"
                                : "Delivery partners will be assigned automatically"}
                            </p>
                          </div>
                          <Switch
                            checked={slotSettings.selfDelivery}
                            onCheckedChange={(checked) =>
                              handleSlotChange(slot, "selfDelivery", checked)
                            }
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }
            )}

          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
