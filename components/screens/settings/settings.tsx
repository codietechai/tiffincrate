"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Store,
  Bell,
  CreditCard,
  User,
  HelpCircle,
  Star,
  AlertTriangle,
  ChevronRight,
  Shield,
  SettingsIcon,
  SlidersHorizontal,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { ProviderSettingsContent } from "./provider/ProviderSettingsContent"; // extracted content
import { Button } from "@/components/ui/button";
import { TSettings } from "@/types";
import { SettingsService } from "@/services/setting-service";
import { LoadingPage } from "@/components/ui/loading";
import NotificationSettings from "./notifications";
import AccountSettings from "./account";
import TitleHeader from "@/components/common/title-header";
import PrivacySettings from "./privacy";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BussinessDetails from "./provider/bussiness-details";
import { useForm } from "react-hook-form";
import { AlertMessages } from "@/components/common/alert-messages";
import { FormButtons } from "@/components/common/form-buttons";
import BackHeader from "@/components/common/back-header";

export default function Settings() {
  const [openDrawer, setOpenDrawer] = useState<
    | "restaurant"
    | "hours"
    | "notifications"
    | "payments"
    | "account"
    | "privacy"
    | "preferences"
    | null
  >(null);
  const router = useRouter();

  const options = [];

  const navigations = [
    {
      key: "profile",
      icon: <User className="w-5 h-5 text-primary" />,
      label: "Profile",
      path: "/profile",
    },
    {
      key: "help",
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      label: "Help Requests",
      path: "/help-requests",
    },
    {
      key: "reviews",
      icon: <Star className="w-5 h-5 text-primary" />,
      label: "Reviews",
      path: "/reviews",
    },
    {
      key: "notifications",
      icon: <AlertTriangle className="w-5 h-5 text-primary" />,
      label: "Alerts & Updates",
      path: "/notifications",
    },
  ];

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (user && user.role === "provider") {
    options.push({
      key: "restaurant",
      icon: <Store className="w-5 h-5 text-primary" />,
      label: "Restaurant Info",
    });
    options.push({
      key: "preferences",
      icon: <SlidersHorizontal className="w-5 h-5 text-primary" />,
      label: "Prefrences",
    });
  }

  if (user) {
    options.push(
      ...[
        {
          key: "account",
          icon: <User className="w-5 h-5 text-primary" />,
          label: "Account",
        },
        {
          key: "notifications",
          icon: <Bell className="w-5 h-5 text-primary" />,
          label: "Notifications",
        },

        {
          key: "payments",
          icon: <CreditCard className="w-5 h-5 text-primary" />,
          label: "Payments",
        },

        {
          key: "privacy",
          icon: <Shield className="w-5 h-5 text-primary" />,
          label: "Privacy",
        },
      ]
    );
  }

  const [preferences, setPreferences] = useState({
    email: false,
    sms: false,
    orderUpdates: false,
    promotions: false,
    weeklyDigest: false,
  });

  const [provider, setProvider] = useState({
    autoAcceptOrders: true,
    deliveryRadius: 50,
    maxOrdersPerDay: 10,
    dailySummary: false,
  });

  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    marketing: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.role) {
      loadSettings();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
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
      const response = await SettingsService.fetchSettings();
      setPreferences({
        ...response.data.notifications,
        // ...(response.data.preferences as any),
      });
      if (user?.role === "provider") {
        setProvider(response?.data?.provider as any);
      }

      setPrivacy(response.data.privacy as any);
      setLoading(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleProviderChange = (key: string, value: any) => {
    setProvider((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const {
    register,
    formState: { errors },
  } = useForm();

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { email, sms, orderUpdates, promotions, weeklyDigest } =
        preferences;

      let payload: TSettings = {
        notifications: {
          email,
          sms,
          orderUpdates,
          promotions,
          weeklyDigest,

          push: true,
        },

        privacy: {
          dataCollection: privacy.dataCollection,
          marketing: privacy.marketing,
        },
      };

      if (user.role === "provider") {
        payload = {
          ...payload,
          provider: {
            autoAcceptOrders: provider.autoAcceptOrders,
            deliveryRadius: provider.deliveryRadius,
            maxOrdersPerDay: provider.maxOrdersPerDay,
            dailySummary: provider.dailySummary,
          },
        };
      }
      await SettingsService.updateSettings(payload);
      setMessage("Settings saved successfully");
      loadSettings();
    } catch (error) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setOpenDrawer(null);
  };

  const onReset = () => {
    loadSettings();
  };

  useEffect(() => {
    setError("");
    setMessage("");
  }, [openDrawer]);

  return (
    <div className="p-4 pt-2 space-y-3">
      <BackHeader />

      <TitleHeader
        title="Settings"
        description="Manage your account preferences and privacy settings"
        icon={<SettingsIcon />}
      />
      <Tabs defaultValue="navigate-to" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="navigate-to">Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <Card className="divide-y">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setOpenDrawer(opt.key as any)}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  {opt.icon}
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </Card>
        </TabsContent>
        <TabsContent value="navigate-to">
          <Card className="divide-y">
            {navigations.map((nav) => (
              <button
                key={nav.key}
                onClick={() => router.push(nav.path)}
                className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  {nav.icon}
                  <span className="text-sm font-medium">{nav.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </Card>
        </TabsContent>
      </Tabs>

      <Drawer
        open={openDrawer === "account"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Management
            </DrawerTitle>
            <DrawerDescription>Manage your account here</DrawerDescription>
          </DrawerHeader>
          <AlertMessages message={message} error={error} />
          <AccountSettings setError={setError} />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "preferences"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Preferences
            </DrawerTitle>
            <DrawerDescription>Manage your perferences here</DrawerDescription>
          </DrawerHeader>
          <AlertMessages message={message} error={error} />
          <FormButtons
            onCancel={onCancel}
            onReset={onReset}
            onSubmit={saveSettings}
            saving={saving}
          />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "privacy"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </DrawerTitle>
            <DrawerDescription>
              Control your privacy and data sharing preferences
            </DrawerDescription>
          </DrawerHeader>
          <AlertMessages message={message} error={error} />
          <PrivacySettings
            privacy={privacy}
            handlePrivacyChange={handlePrivacyChange}
          />
          <FormButtons
            onCancel={onCancel}
            onReset={onReset}
            onSubmit={saveSettings}
            saving={saving}
          />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "restaurant"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Business Information
            </DrawerTitle>
            <DrawerDescription>
              Update your tiffin service details
            </DrawerDescription>
          </DrawerHeader>
          <AlertMessages message={message} error={error} />
          <BussinessDetails onCancel={onCancel} />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "notifications"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </DrawerTitle>
            <DrawerDescription>
              Choose how you want to be notified about orders and updates
            </DrawerDescription>
          </DrawerHeader>
          <AlertMessages message={message} error={error} />
          <NotificationSettings
            preferences={preferences}
            handlePreferenceChange={handlePreferenceChange}
          />
          <FormButtons
            onCancel={onCancel}
            onReset={onReset}
            onSubmit={saveSettings}
            saving={saving}
          />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "payments"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="">
          <DrawerHeader>
            <DrawerTitle>Payments</DrawerTitle>
          </DrawerHeader>
          <AlertMessages message={message} error={error} />
          <ProviderSettingsContent tab="payments" />
          <FormButtons
            onCancel={onCancel}
            onReset={onReset}
            onSubmit={saveSettings}
            saving={saving}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
