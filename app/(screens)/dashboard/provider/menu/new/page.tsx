"use client";

import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Pencil, Save } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MenuFormValues {
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl: string;
  weeklyItems: {
    monday: { name: string; description?: string };
    tuesday: { name: string; description?: string };
    wednesday: { name: string; description?: string };
    thursday: { name: string; description?: string };
    friday: { name: string; description?: string };
    saturday: { name: string; description?: string };
    sunday: { name: string; description?: string };
  };
  weekType: "weekdays" | "weekends" | "whole";
  isAvailable: boolean;
  isActive: boolean;
  isVegetarian: boolean;
  draft: boolean;
}

export default function NewMenuPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MenuFormValues>({
    defaultValues: {
      name: "",
      description: "",
      category: "lunch",
      basePrice: 0,
      monthlyPlanPrice: undefined,
      imageUrl: "",
      weeklyItems: {
        monday: { name: "", description: "" },
        tuesday: { name: "", description: "" },
        wednesday: { name: "", description: "" },
        thursday: { name: "", description: "" },
        friday: { name: "", description: "" },
        saturday: { name: "", description: "" },
        sunday: { name: "", description: "" },
      },
      isAvailable: true,
      isActive: true,
      weekType: "whole",
      isVegetarian: true,
      draft: false,
    },
  });

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  const onSubmit = async (data: MenuFormValues) => {
    setServerError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        ...data,

        imageUrl: data.imageUrl
          ? data.imageUrl.split(",").map((url) => url.trim())
          : [],
      };

      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccess("Menu created successfully!");
        setTimeout(() => router.push("/dashboard/provider/menu"), 1500);
      } else {
        setServerError(json.error || "Failed to create menu");
      }
    } catch {
      setServerError("Network error");
    } finally {
      setLoading(false);
    }
  };
  const weekType = watch("weekType");
  const isDayDisabled = (day: string) => {
    if (weekType === "weekdays") return day === "saturday" || day === "sunday";
    if (weekType === "weekends") return !["saturday", "sunday"].includes(day);
    return false;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-semibold">Create New Menu</h1>
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-3xl mx-auto space-y-6 p-6 bg-white rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold">Create Menu</h2>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="Menu name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Input
                {...register("description")}
                placeholder="Short description"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger defaultValue="lunch">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base Price</Label>
                <Input
                  type="number"
                  {...register("basePrice", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label>Monthly Plan Price</Label>
                <Input
                  type="number"
                  {...register("monthlyPlanPrice", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input {...register("imageUrl")} placeholder="https://..." />
            </div>

            {/* Toggles */}
            <div className="flex gap-4 items-center">
              <Switch
                checked={watch("isAvailable")}
                onCheckedChange={(v) => setValue("isAvailable", v)}
              />
              <Label>Available</Label>
            </div>

            <div className="flex gap-4 items-center">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
              <Label>Active</Label>
            </div>

            <div className="flex gap-4 items-center">
              <Switch
                checked={watch("isVegetarian")}
                onCheckedChange={(v) => setValue("isVegetarian", v)}
              />
              <Label>Vegetarian Menu</Label>
            </div>
          </div>

          {/* Week Type */}
          <div>
            <Label className="font-semibold mb-2 block">Week Type</Label>
            <RadioGroup
              value={weekType}
              onValueChange={(val) =>
                setValue("weekType", val as "weekdays" | "weekends" | "whole")
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekdays" id="weekdays" />
                <Label htmlFor="weekdays">Only Weekdays</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekends" id="weekends" />
                <Label htmlFor="weekends">Only Weekends</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whole" id="whole" />
                <Label htmlFor="whole">Whole Week</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Weekly Items */}
          <div className="space-y-6">
            <h3 className="font-semibold">Weekly Items</h3>
            {days.map((day) => (
              <div
                key={day}
                className={`border rounded-lg p-4 ${
                  isDayDisabled(day) ? "opacity-60" : "bg-white/80"
                }`}
              >
                <Label className="capitalize font-semibold">{day}</Label>
                <div className="flex flex-col gap-4 mt-2">
                  <Input
                    disabled={isDayDisabled(day)}
                    placeholder="Item name"
                    {...register(`weeklyItems.${day}.name` as const, {
                      required: !isDayDisabled(day)
                        ? `Name for ${day} is required`
                        : false,
                    })}
                  />
                  <Textarea
                    disabled={isDayDisabled(day)}
                    placeholder="Item description"
                    {...register(`weeklyItems.${day}.description` as const)}
                  />
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      {...register("imageUrl")}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant={"outline"}
            className="w-full gap-2"
            onClick={handleSubmit((data: MenuFormValues) =>
              onSubmit({ ...data, draft: true })
            )}
          >
            <Pencil className="text-black" size={16} /> Save as draft
          </Button>
          <Button type="submit" className="w-full gap-2">
            <Save className="text-white" size={16} /> Submit Menu
          </Button>
        </form>
      </div>
    </div>
  );
}
