"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: false,
    weeklyDigest: true,
    language: "en",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showOrderHistory: false,
    allowDataCollection: true,
    marketingConsent: false,
  });

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const loadSettings = async () => {
    try {
      // In a real app, you'd fetch user preferences from the API
      // For now, we'll use default values
      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      // In a real app, you'd save settings to the API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setMessage("Settings saved successfully");
    } catch (error) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // In a real app, you'd call the delete account API
      alert(
        "Account deletion requested. You will receive a confirmation email."
      );
    } catch (error) {
      setError("Failed to delete account");
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      // In a real app, you'd call the logout all devices API
      await fetch("/api/auth/logout-all", { method: "POST" });
      router.push("/auth/login");
    } catch (error) {
      setError("Failed to logout from all devices");
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {message && (
            <Alert>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about orders and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("emailNotifications", checked)
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
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("smsNotifications", checked)
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
                    checked={preferences.promotionalEmails}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("promotionalEmails", checked)
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
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        handlePreferenceChange("language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                        <SelectItem value="kn">Kannada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) =>
                        handlePreferenceChange("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          India Standard Time
                        </SelectItem>
                        <SelectItem value="Asia/Dubai">
                          Gulf Standard Time
                        </SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      handlePreferenceChange("currency", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) =>
                      handlePrivacyChange("profileVisibility", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Control who can see your profile information
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Order History</Label>
                    <p className="text-sm text-gray-500">
                      Allow others to see your order history
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showOrderHistory}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("showOrderHistory", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Data Collection</Label>
                    <p className="text-sm text-gray-500">
                      Help improve our service by sharing usage data
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowDataCollection}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("allowDataCollection", checked)
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
                    checked={privacy.marketingConsent}
                    onCheckedChange={(checked) =>
                      handlePrivacyChange("marketingConsent", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your account security and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Security Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={handleLogoutAllDevices}
                      >
                        Logout from all devices
                      </Button>
                      <p className="text-sm text-gray-500">
                        This will log you out from all devices and you'll need
                        to sign in again
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Danger Zone
                    </h4>
                    <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h5 className="font-medium text-red-800">
                          Delete Account
                        </h5>
                        <p className="text-sm text-red-600 mb-2">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
