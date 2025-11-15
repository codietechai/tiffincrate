"use client";
import React from "react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
// import { TPreferences } from "@/app/settings/page";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { IUser } from "@/models/User";
import { TProviderSettings } from "@/types";

const ProviderPreferences = ({
  provider,
  handleProviderChange,
}: {
  provider: TProviderSettings | null;
  handleProviderChange: (key: string, value: any) => void;
}) => {
  return (
    <div className="px-4 pb-4 ">
      <Card className="pt-4">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Summary</Label>
              <p className="text-sm text-gray-500">
                Receive daily summary on email
              </p>
            </div>
            <Switch
              checked={provider?.dailySummary}
              onCheckedChange={(checked) =>
                handleProviderChange("dailySummary", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Accept orders automatically</Label>
            <Switch
              checked={provider?.autoAcceptOrders}
              onCheckedChange={(checked) =>
                handleProviderChange("autoAcceptOrders", checked)
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxOrdersPerDay">Max orders per day</Label>
              <Input
                name="maxOrdersPerDay"
                value={provider?.maxOrdersPerDay}
                type="number"
                min={1}
                onChange={(e) => {
                  handleProviderChange("maxOrdersPerDay", e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryRadius">
                Delivery Radius (in Kilometers)
              </Label>
              <Input
                value={provider?.deliveryRadius}
                type="number"
                min={0}
                onChange={(e) =>
                  handleProviderChange("deliveryRadius", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderPreferences;
