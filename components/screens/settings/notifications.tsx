"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Smartphone, Globe, Bell } from "lucide-react";

const NotificationSettings = ({
  preferences,
  handlePreferenceChange,
  userRole,
}: {
  preferences: any;
  handlePreferenceChange: (key: string, value: any) => void;
  userRole?: string;
}) => {
  // Define which notifications can be sent via email
  const emailEnabledNotifications = [
    'promotions',
    'weeklyDigest',
    'monthlyDigest', // New for providers
    'accountUpdates',
    'securityAlerts'
  ];

  // Define which notifications should NOT be sent via email
  const emailDisabledNotifications = [
    'orderUpdates', // Order status updates should not be sent via email
    'deliveryUpdates',
    'realTimeAlerts'
  ];

  return (
    <div className="px-4 pb-4">
      <Card className="pt-4">
        <CardContent className="space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Notification Channels</h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <Label>Email Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Receive notifications via email (for promotions, digests, and account updates)
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
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-600" />
                  <Label>Web Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Receive notifications in your browser
                </p>
              </div>
              <Switch
                checked={preferences.web}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("web", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                  <Label>App Notifications</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Receive push notifications on your mobile app
                </p>
              </div>
              <Switch
                checked={preferences.app}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("app", checked)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-semibold">Notification Types</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label>Order Updates</Label>
                  <Badge variant="outline" className="text-xs">
                    Web & App Only
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Get notified about order status changes (real-time notifications only)
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
                <div className="flex items-center gap-2">
                  <Label>Promotional Emails</Label>
                  <Badge variant="outline" className="text-xs">
                    Email Enabled
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Receive offers and promotional content via email
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
                <div className="flex items-center gap-2">
                  <Label>Weekly Digest</Label>
                  <Badge variant="outline" className="text-xs">
                    Email Enabled
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {userRole === 'provider'
                    ? 'Weekly summary of your orders, revenue, and performance metrics'
                    : 'Weekly summary of your orders and new providers'
                  }
                </p>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("weeklyDigest", checked)
                }
              />
            </div>

            {/* Monthly Digest for Providers */}
            {userRole === 'provider' && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Monthly Digest</Label>
                    <Badge variant="outline" className="text-xs">
                      Email Enabled
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Monthly business report with detailed analytics and insights
                  </p>
                </div>
                <Switch
                  checked={preferences.monthlyDigest}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("monthlyDigest", checked)
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label>Account Updates</Label>
                  <Badge variant="outline" className="text-xs">
                    Email Enabled
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Important account and security notifications
                </p>
              </div>
              <Switch
                checked={preferences.accountUpdates}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("accountUpdates", checked)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Email Configuration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Email Notification Policy</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Email Enabled:</strong> Promotions, Weekly/Monthly Digests, Account Updates</p>
              <p>• <strong>Real-time Only:</strong> Order Updates, Delivery Updates (Web & App notifications)</p>
              <p>• Email notifications help reduce spam while keeping you informed about important updates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
