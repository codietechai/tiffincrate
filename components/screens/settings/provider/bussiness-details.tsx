import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormButtons } from "@/components/common/form-buttons";
import { AlertMessages } from "@/components/common/alert-messages";

const BussinessDetails = ({ onCancel }: { onCancel: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: "",
      description: "",
      cuisine: "",
      deliveryAreas: "",
      operatingHours: {
        start: "09:00",
        end: "21:00",
      },
    },
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchBussinessDetails();
  }, []);

  const fetchBussinessDetails = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();

        reset({
          businessName: data.profile.serviceProvider?.businessName || "",
          description: data.profile.serviceProvider?.description || "",
          cuisine: data.profile.serviceProvider?.cuisine?.join(", ") || "",
          deliveryAreas:
            data.profile.serviceProvider?.deliveryAreas?.join(", ") || "",
          operatingHours: data.profile.serviceProvider?.operatingHours || {
            start: "09:00",
            end: "21:00",
          },
        });
      }
    } catch (error) {
      setError("Failed to load profile");
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError("");
    setMessage("");

    if (data.password && data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        serviceProvider: {
          businessName: data.businessName,
          description: data.description,
          cuisine: data.cuisine
            .split(",")
            .map((c: string) => c.trim())
            .filter(Boolean),
          deliveryAreas: data.deliveryAreas
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean),
          operatingHours: data.operatingHours,
        },
      };

      if (!data.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully");
        fetchBussinessDetails();
      } else {
        setError(resData.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    fetchBussinessDetails();
  };

  return (
    <>
      <AlertMessages error={error} message={message} />
      <div className="px-4 pb-4 ">
        <Card className="pt-4">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="businessName"
                  {...register("businessName", {
                    required: "Business name is required",
                  })}
                  className="pl-10"
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm">
                    {errors.businessName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Types</Label>
                <Input
                  id="cuisine"
                  {...register("cuisine")}
                  placeholder="e.g., North Indian, South Indian, Chinese"
                />
                <p className="text-xs text-gray-500">
                  Separate multiple cuisines with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAreas">Delivery Areas</Label>
                <Input
                  id="deliveryAreas"
                  {...register("deliveryAreas")}
                  placeholder="e.g., Koramangala, HSR Layout"
                />
                <p className="text-xs text-gray-500">
                  Separate multiple areas with commas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operatingHours.start">Opening Time</Label>
                <Input type="time" {...register("operatingHours.start")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operatingHours.end">Closing Time</Label>
                <Input type="time" {...register("operatingHours.end")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <FormButtons
        onCancel={onCancel}
        onReset={onReset}
        onSubmit={handleSubmit(onSubmit)}
        saving={saving}
      />
    </>
  );
};

export default BussinessDetails;
