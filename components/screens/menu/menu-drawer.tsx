"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const isEdit = !!menuData;

  const DAYS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

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
      image: "",
      isAvailable: true,
      isActive: true,
      isVegetarian: false,
      weekType: "whole",
      menuItems: [],
    },
  });

  // 🧩 Image state for each day
  const [dayImages, setDayImages] = useState<Record<string, string[]>>({});

  const addImageField = (day: string) => {
    setDayImages((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), ""],
    }));
  };

  const updateImageValue = (day: string, index: number, value: string) => {
    setDayImages((prev) => {
      const imgs = [...(prev[day] || [])];
      imgs[index] = value;
      return { ...prev, [day]: imgs };
    });
  };

  const removeImage = (day: string, index: number) => {
    setDayImages((prev) => {
      const imgs = [...(prev[day] || [])];
      imgs.splice(index, 1);
      return { ...prev, [day]: imgs };
    });
  };

  const isDayDisabled = (day: string) => {
    const weekType = watch("weekType");
    if (weekType === "weekdays") return day === "saturday" || day === "sunday";
    if (weekType === "weekends") return !["saturday", "sunday"].includes(day);
    return false;
  };

  // 🧠 Load form data and existing images on open
  useEffect(() => {
    if (open) {
      if (menuData) {
        // Preload existing menu data
        const imageMap: Record<string, string[]> = {};
        menuData.menuItems?.forEach((item: any) => {
          if (item.day && item.images?.length) {
            imageMap[item.day.toLowerCase()] = [...item.images];
          }
        });

        setDayImages(imageMap);
        reset({ ...menuData, menuItems: menuData.menuItems || [] });
      } else {
        // New Menu
        reset({
          name: "",
          description: "",
          category: "",
          basePrice: 0,
          monthlyPlanPrice: 0,
          image: "",
          isAvailable: true,
          isActive: true,
          isVegetarian: false,
          weekType: "whole",
          menuItems: [],
        });
        setDayImages({});
      }
    }
  }, [menuData, open, reset]);

  // 🧾 Submit
  const onSubmit = async (data: TMenu) => {
    setSaving(true);
    try {
      const form = document.querySelector("form");
      const menuItems: any[] = [];

      DAYS.forEach((d) => {
        const name = (form?.querySelector(`#name-${d.key}`) as HTMLInputElement)
          ?.value;
        const description = (
          form?.querySelector(`#desc-${d.key}`) as HTMLTextAreaElement
        )?.value;

        if (name && name.trim()) {
          menuItems.push({
            name: name.trim(),
            description: description?.trim() || "",
            day: d.key,
            images: (dayImages[d.key] || []).filter((x) => x.trim() !== ""),
          });
        }
      });

      const finalPayload = { ...data, menuItems };

      console.log("✅ Final Payload:", finalPayload);

      const method = isEdit ? "PATCH" : "POST";
      const url = isEdit ? `/api/menus/${menuData?._id}` : `/api/menus`;

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      const result = await resp.json();
      if (resp.ok) {
        refresh();
        setOpen(false);
      } else {
        console.error("Error:", result);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSaving(false);
    }
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
                <Input {...register("image")} placeholder="https://..." />
              </div>

              {/* ✅ Keep your toggles */}
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

            {/* Weekly Items */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Weekly Items</h3>

              {DAYS.map((d) => {
                const isDisabled = isDayDisabled(d.key);
                const images = dayImages[d.key] || [];
                const existingItem = menuData?.menuItems?.find(
                  (m:any) => m.day?.toLowerCase() === d.key
                );

                return (
                  <div
                    key={d.key}
                    className={`border rounded-lg p-4 ${
                      isDisabled ? "opacity-60 bg-gray-100" : "bg-white"
                    }`}
                  >
                    <Label className="capitalize font-semibold text-sm">
                      {d.label}
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <Input
                        id={`name-${d.key}`}
                        disabled={isDisabled}
                        placeholder="Item name"
                        defaultValue={existingItem?.name || ""}
                      />
                      <Textarea
                        id={`desc-${d.key}`}
                        disabled={isDisabled}
                        placeholder="Item description"
                        defaultValue={existingItem?.description || ""}
                      />
                    </div>

                    {/* 🖼 Show existing and new images */}
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-3">
                        {images.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-24 h-24 border rounded-md overflow-hidden group"
                          >
                            <img
                              src={url}
                              alt=""
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(d.key, idx)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new image URL fields */}
                      {images.map((img, idx) => (
                        <div key={`input-${idx}`} className="flex gap-2 mt-2">
                          <Input
                            value={img}
                            onChange={(e) =>
                              updateImageValue(d.key, idx, e.target.value)
                            }
                            placeholder="Image URL"
                            className="flex-1"
                          />
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => addImageField(d.key)}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Image
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

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
                onClick={() => setOpen(false)}
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
