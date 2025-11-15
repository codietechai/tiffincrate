import React from "react";
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

const BussinessTab = ({ errors, register }: { errors: any; register: any }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Update your tiffin service details</CardDescription>
      </CardHeader>
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
          <Textarea id="description" {...register("description")} rows={3} />
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
  );
};

export default BussinessTab;
