"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import {
  Store,
  Clock,
  Bell,
  CreditCard,
  User,
  HelpCircle,
  Star,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { ProviderSettingsContent } from "./ProviderSettingsContent"; // extracted content
import { Button } from "@/components/ui/button";

export function ProviderSettings() {
  const [openDrawer, setOpenDrawer] = useState<
    "restaurant" | "hours" | "notifications" | "payments" | null
  >(null);
  const router = useRouter();

  const options = [
    {
      key: "restaurant",
      icon: <Store className="w-5 h-5 text-orange-500" />,
      label: "Restaurant Info",
    },
    {
      key: "hours",
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      label: "Operating Hours",
    },
    {
      key: "notifications",
      icon: <Bell className="w-5 h-5 text-orange-500" />,
      label: "Notifications",
    },
    {
      key: "payments",
      icon: <CreditCard className="w-5 h-5 text-orange-500" />,
      label: "Payments",
    },
  ];

  const navigations = [
    {
      key: "profile",
      icon: <User className="w-5 h-5 text-orange-500" />,
      label: "Profile",
      path: "/profile",
    },
    {
      key: "help",
      icon: <HelpCircle className="w-5 h-5 text-orange-500" />,
      label: "Help Requests",
      path: "/help-requests",
    },
    {
      key: "reviews",
      icon: <Star className="w-5 h-5 text-orange-500" />,
      label: "Reviews",
      path: "/reviews",
    },
    {
      key: "alerts",
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      label: "Alerts & Updates",
      path: "/alerts",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      <p className="text-gray-500 text-sm">Manage your preferences</p>

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

      {/* Drawers for main options */}
      <Drawer
        open={openDrawer === "restaurant"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Restaurant Info</DrawerTitle>
          </DrawerHeader>
          <ProviderSettingsContent tab="restaurant" />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "hours"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Operating Hours</DrawerTitle>
          </DrawerHeader>
          <ProviderSettingsContent tab="hours" />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "notifications"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
          </DrawerHeader>
          <ProviderSettingsContent tab="notifications" />
        </DrawerContent>
      </Drawer>

      <Drawer
        open={openDrawer === "payments"}
        onOpenChange={() => setOpenDrawer(null)}
      >
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Payments</DrawerTitle>
          </DrawerHeader>
          <ProviderSettingsContent tab="payments" />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
