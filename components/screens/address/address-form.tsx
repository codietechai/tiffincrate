"use client";

import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressService } from "@/services/address-service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocateFixed, Search } from "lucide-react";
import GoogleMapAutoComplete from "@/components/common/googlePlace";
import { AuthService } from "@/services/auth-service";
import { useEffect, useState } from "react";
import { TUser } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export const AddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address_line_1: z.string().min(3, "Address Line 1 is required"),
  address_line_2: z.string().min(3, "Address Line 2 is required"),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  dial_code: z.string().optional(),
  full_phone_number: z.string().optional(),
  is_default: z.boolean().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
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
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AddressFormType>({
    resolver: zodResolver(AddressSchema),
    defaultValues: defaultValues || { is_default: false },
  });

  const dial_code = "+91";
  const country = "india";
  const country_code = "IN";
  const phoneNumber = watch("phone_number");

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
      reset(defaultValues);
    } else if (user) {
      reset({
        name: user.name,
        phone_number: user.phone,
        is_default: false,
      });
    }
  }, [defaultValues, user, reset]);

  const setSelectedAddress = ({ address, components }: any) => {
    setValue("address_line_1", address);

    components.forEach((c: any) => {
      if (c.types.includes("locality")) setValue("city", c.long_name);
      if (c.types.includes("administrative_area_level_1"))
        setValue("region", c.long_name);
      if (c.types.includes("postal_code")) setValue("postal_code", c.long_name);
    });
  };

  const onSubmit = async (data: AddressFormType) => {
    setIsSaving(true);

    try {
      const payload = {
        ...data,
        country,
        country_code,
        dial_code,
        full_phone_number: `${dial_code}${phoneNumber}`,
      };

      if (onEditSubmit) {
        await onEditSubmit(payload);
        toast.success("Address updated!");
      } else {
        await AddressService.create(payload);
        toast.success("Address saved!");
      }

      router.push("/address");
      reset();
    } catch (error) {
      console.log("error", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Location */}
      <Card className="p-4 cursor-pointer hover:bg-gray-100 transition">
        <div className="flex items-center gap-3 text-red-600 font-medium">
          <LocateFixed className="h-5 w-5" />
          Use current location
        </div>
      </Card>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-20" />
        <GoogleMapAutoComplete
          placeholder="Search address"
          className="pl-9"
          setSelectedLocation={setSelectedAddress}
          setLatitude={(lat: number) => setValue("latitude", lat)}
          setLongitude={(lng: number) => setValue("longitude", lng)}
        />
      </div>

      {/* Fields */}
      <Input
        placeholder="Full Name"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        placeholder="Address Line 1"
        {...register("address_line_1")}
        error={errors.address_line_1?.message}
      />
      <Input
        placeholder="House, flat, floor number"
        {...register("address_line_2")}
        error={errors.address_line_2?.message}
      />
      <Input
        placeholder="City"
        {...register("city")}
        error={errors.city?.message}
      />
      <Input
        placeholder="Region"
        {...register("region")}
        error={errors.region?.message}
      />
      <Input
        placeholder="Postal Code"
        {...register("postal_code")}
        error={errors.postal_code?.message}
      />
      <Input
        placeholder="Phone Number"
        {...register("phone_number")}
        error={errors.phone_number?.message}
      />

      {/* Default Checkbox */}
      <Controller
        name="is_default"
        control={control}
        render={({ field }) => (
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            Set as default
          </Label>
        )}
      />

      {/* Submit */}
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
