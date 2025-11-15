"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const NotificationSettings = ({
  preferences,
  handlePreferenceChange,
}: {
  preferences: any;
  handlePreferenceChange: (key: string, value: any) => void;
}) => {
  return (
    <div className="px-4 pb-4">
      <Card className="pt-4">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.email}
              onCheckedChange={(checked) =>
                handlePreferenceChange("email", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              checked={preferences.sms}
              onCheckedChange={(checked) =>
                handlePreferenceChange("sms", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-gray-500">
                Get notified about order status changes
              </p>
            </div>
            <Switch
              checked={preferences.orderUpdates}
              onCheckedChange={(checked) =>
                handlePreferenceChange("orderUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Emails</Label>
              <p className="text-sm text-gray-500">
                Receive offers and promotional content
              </p>
            </div>
            <Switch
              checked={preferences.promotions}
              onCheckedChange={(checked) =>
                handlePreferenceChange("promotions", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-gray-500">
                Weekly summary of your orders and new providers
              </p>
            </div>
            <Switch
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) =>
                handlePreferenceChange("weeklyDigest", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
