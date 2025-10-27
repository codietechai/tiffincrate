"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, ImagePlus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TMenu } from "@/types";
// import { toast } from "react-toastify";

type WeeklyItemInput = { _id?: string; name: string; description: string };

const DAYS = [
  { key: "monday" },
  { key: "tuesday" },
  { key: "wednesday" },
  { key: "thursday" },
  { key: "friday" },
  { key: "saturday" },
  { key: "sunday" },
];

export default function MenuDrawerForm({
  menuData,
  refresh,
  open,
  setOpen,
  setMenuData,
}: {
  menuData: TMenu | null;
  refresh: any;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setMenuData: Dispatch<SetStateAction<TMenu | null>>;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState<TMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!menuData;
  useEffect(() => {
    setMenu(menuData);
  }, []);
  const defaultValues = {
    name: "",
    description: "",
    category: "",
    basePrice: 0,
    monthlyPlanPrice: 0,
    imageUrl: [""],
    isAvailable: true,
    isActive: true,
    isVegetarian: false,
    weekType: "whole",
    weeklyItems: {},
  };
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TMenu>({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      basePrice: 0,
      monthlyPlanPrice: 0,
      imageUrl: [""],
      isAvailable: true,
      isActive: true,
      isVegetarian: false,
      weekType: "whole",
      weeklyItems: {},
    },
  });

  // check auth
  const checkAuth = async () => {
    try {
      const resp = await fetch("/api/auth/me");
      if (resp.ok) {
        const data = await resp.json();
        if (data.user.role !== "provider") {
          router.push("/");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Auth check error:", err);
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    if (menuData) {
      const weekly: Record<string, WeeklyItemInput> = {};
      for (const d of DAYS) {
        const item = (menuData.weeklyItems as any)[d.key];
        weekly[d.key] = item
          ? { _id: item._id, name: item.name, description: item.description }
          : { name: "", description: "" };
      }
      reset({ ...menuData, weeklyItems: weekly });
    } else {
      reset(defaultValues as any);
    }
  }, [menuData]);

  const onSubmit = async (data: TMenu) => {
    setSaving(true);
    try {
      const method = isEdit ? "PATCH" : "POST";

      const url = isEdit ? `/api/menus/${menuData?._id}` : `/api/menus`;
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await resp.json();
      if (resp.ok) {
        refresh();
        // toast.success(
        //   isEdit ? "Menu updated successfully!" : "Menu added successfully!"
        // );
        setOpen(false);
      } else {
        // toast.error(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Submit error:", err);
      //   toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const isDayDisabled = (day: string) => {
    const weekType = watch("weekType");
    if (weekType === "weekdays") return day === "saturday" || day === "sunday";
    if (weekType === "weekends") return !["saturday", "sunday"].includes(day);
    return false;
  };

  return (
    <Drawer open={open} onOpenChange={(value) => setOpen(value)}>
      <DrawerTrigger asChild>
        <Button onClick={() => setMenuData(null)}>
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Item</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>
              {isEdit ? "Edit Menu Item" : "Add New Menu Item"}
            </DrawerTitle>
            <DrawerDescription>
              {isEdit
                ? "Update existing menu details"
                : "Add a new item to your restaurant menu"}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-4">
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
                      <SelectTrigger>
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
              <Label className="font-semibold text-lg mb-2 block">
                Week Type
              </Label>
              <RadioGroup
                value={watch("weekType")}
                onValueChange={(val) =>
                  setValue("weekType", val as TMenu["weekType"])
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
              <h3 className="text-lg font-semibold">Weekly Items</h3>
              {DAYS.map((d) => (
                <div
                  key={d.key}
                  className={`border rounded-lg p-4 ${
                    isDayDisabled(d.key) ? "opacity-60" : "bg-white/80"
                  }`}
                >
                  <Label className="capitalize font-semibold">{d.key}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Input
                      disabled={isDayDisabled(d.key)}
                      placeholder="Item name"
                      {...register(`weeklyItems.${d.key}.name` as const, {
                        required: !isDayDisabled(d.key)
                          ? `Name for ${d.key} is required`
                          : false,
                      })}
                    />
                    <Textarea
                      disabled={isDayDisabled(d.key)}
                      placeholder="Item description"
                      {...register(`weeklyItems.${d.key}.description` as const)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
              <Button type="submit" className="flex-1 h-11" disabled={saving}>
                {saving
                  ? isEdit
                    ? "Updating..."
                    : "Saving..."
                  : isEdit
                  ? "Update Menu"
                  : "Add Menu"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11"
                type="button"
                onClick={() => router.push("/dashboard/provider/menu")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
