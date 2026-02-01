"use client";

import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressService } from "@/services/address-service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, MapPin } from "lucide-react";
import GoogleMapAutoComplete from "@/components/common/googlePlace";
import { AuthService } from "@/services/auth-service";
import { useEffect, useState } from "react";
import { TUser } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useLocation } from "@/hooks/use-location";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const AddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  addressLine1: z.string().min(3, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("India"),
  pincode: z.string().min(1, "Pincode is required").regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  addressType: z.enum(["home", "office", "other"]).default("home"),
  landmark: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.array(z.number()).length(2), // [longitude, latitude] - required
  }),
});

export type AddressFormType = z.infer<typeof AddressSchema>;

export default function AddressForm({
  defaultValues,
  onEditSubmit,
}: {
  onEditSubmit?: (data: AddressFormType) => Promise<any>;
  defaultValues?: any;
}) {
  const router = useRouter();
  const [user, setUser] = useState<null | TUser>(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    addressLine1,
    city,
    state,
    pincode,
    latitude,
    longitude,
    loading,
    error,
  } = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AddressFormType>({
    resolver: zodResolver(AddressSchema),
    defaultValues: defaultValues || {
      isDefault: false,
      addressType: "home",
      country: "India",
      location: { type: "Point", coordinates: [0, 0] }
    },
  });

  const searchParams = useSearchParams();
  const chooseAnother = searchParams.get("choose-another");
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      if (!defaultValues) {
        const data = await AuthService.checkAuth();
        setUser(data.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      // Convert defaultValues to match schema format
      const formattedDefaults = {
        ...defaultValues,
        // Ensure location is in correct format
        location: defaultValues.location || { type: "Point", coordinates: [0, 0] }
      };
      reset(formattedDefaults);
    } else if (user) {
      reset({
        name: user.name,
        phone: user.phone || "",
        isDefault: false,
        addressType: "home",
        country: "India",
        location: { type: "Point", coordinates: [0, 0] }
      });
    }
  }, [defaultValues, user, reset]);

  const setSelectedAddress = ({ address, components }: any) => {
    setValue("addressLine1", address);

    components.forEach((c: any) => {
      if (c.types.includes("locality")) setValue("city", c.long_name);
      if (c.types.includes("administrative_area_level_1"))
        setValue("state", c.long_name);
      if (c.types.includes("postal_code")) setValue("pincode", c.long_name);
    });
  };

  const setLocationCoordinates = (lat: number, lng: number) => {
    setValue("location", {
      type: "Point",
      coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
    });
  };

  const windowExist = !!(window && typeof window !== "undefined");

  const onSubmit = async (data: AddressFormType) => {
    setIsSaving(true);

    try {
      // Validate coordinates
      if (!data.location.coordinates || data.location.coordinates[0] === 0 || data.location.coordinates[1] === 0) {
        toast.error("Please select a location on the map or use current location");
        setIsSaving(false);
        return;
      }

      const payload = {
        ...data,
        // Ensure proper data formatting
        phone: data.phone.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2?.trim() || undefined,
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        landmark: data.landmark?.trim() || undefined,
        deliveryInstructions: data.deliveryInstructions?.trim() || undefined,
      };

      if (onEditSubmit) {
        await onEditSubmit(payload);
        toast.success("Address updated!");
      } else {
        await AddressService.create(payload);
        toast.success("Address saved!");
      }

      if (chooseAnother && windowExist && pathname.includes("address/add"))
        window.history.go(-2);
      else if (chooseAnother) router.back();
      else router.push("/address");

      reset();
    } catch (error: any) {
      console.log("error", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Location Card */}
      <Card
        className="p-4 cursor-pointer hover:bg-gray-100 transition"
        onClick={() => {
          if (!loading && latitude && longitude) {
            setValue("addressLine1", addressLine1 || "");
            setValue("city", city || "");
            setValue("state", state || "");
            setValue("pincode", pincode || "");
            setLocationCoordinates(latitude, longitude);
            toast.success("Location detected!");
          }
        }}
      >
        <div className="flex items-center gap-3 text-red-600 font-medium">
          <MapPin className="h-4 w-4" />
          {loading ? "Detecting..." : "Use current location"}
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </Card>

      {/* Google Places Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
        <GoogleMapAutoComplete
          placeholder="Search address"
          className="pl-9"
          setSelectedLocation={setSelectedAddress}
          setLatitude={(lat: number) => {
            const currentLng = watch("location.coordinates")?.[0] || 0;
            setLocationCoordinates(lat, currentLng);
          }}
          setLongitude={(lng: number) => {
            const currentLat = watch("location.coordinates")?.[1] || 0;
            setLocationCoordinates(currentLat, lng);
          }}
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <Input
          placeholder="Full Name"
          {...register("name")}
          error={errors.name?.message}
        />

        <Input
          placeholder="Address Line 1 (House/Building)"
          {...register("addressLine1")}
          error={errors.addressLine1?.message}
        />

        <Input
          placeholder="Address Line 2 (Area/Locality) - Optional"
          {...register("addressLine2")}
          error={errors.addressLine2?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="City"
            {...register("city")}
            error={errors.city?.message}
          />

          <Input
            placeholder="State"
            {...register("state")}
            error={errors.state?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Pincode"
            {...register("pincode")}
            error={errors.pincode?.message}
          />

          <Input
            placeholder="Phone Number"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>

        <Input
          placeholder="Landmark (Optional)"
          {...register("landmark")}
          error={errors.landmark?.message}
        />

        <div>
          <Label htmlFor="addressType">Address Type</Label>
          <Controller
            name="addressType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.addressType && (
            <p className="text-sm text-red-500 mt-1">{errors.addressType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
          <Textarea
            placeholder="e.g., Ring the bell twice, Leave at the gate"
            {...register("deliveryInstructions")}
            className="mt-1"
          />
          {errors.deliveryInstructions && (
            <p className="text-sm text-red-500 mt-1">{errors.deliveryInstructions.message}</p>
          )}
        </div>

        {/* Default Address Checkbox */}
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => (
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={field.value || !!chooseAnother}
                disabled={!!chooseAnother}
                onCheckedChange={field.onChange}
              />
              Set as default address
            </Label>
          )}
        />

        {/* Location Coordinates Display (for debugging) */}
        {watch("location.coordinates") && watch("location.coordinates")[0] !== 0 && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            Location: {watch("location.coordinates")[1]?.toFixed(6)}, {watch("location.coordinates")[0]?.toFixed(6)}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button className="w-full" type="submit" disabled={isSaving}>
        {isSaving
          ? "Saving..."
          : onEditSubmit
            ? "Update Address"
            : "Save Address"}
      </Button>
    </form>
  );
}
