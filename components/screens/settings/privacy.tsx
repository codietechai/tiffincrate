"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { TProvider } from "@/types";
// import { TPrivacy } from "@/app/settings/page";

const PrivacySettings = ({
  privacy,
  handlePrivacyChange,
}: {
  privacy: any;
  handlePrivacyChange: (key: string, value: any) => void;
}) => {
  return (
    <div className="px-4 pb-4">
      <Card className="pt-4">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Data Collection</Label>
              <p className="text-sm text-gray-500">
                Help improve our service by sharing usage data
              </p>
            </div>
            <Switch
              checked={privacy.dataCollection}
              onCheckedChange={(checked) =>
                handlePrivacyChange("dataCollection", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Consent</Label>
              <p className="text-sm text-gray-500">
                Allow us to use your data for marketing purposes
              </p>
            </div>
            <Switch
              checked={privacy.marketing}
              onCheckedChange={(checked) =>
                handlePrivacyChange("marketing", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
