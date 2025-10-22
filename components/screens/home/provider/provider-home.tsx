"use client";
import React, { useState } from "react";
import {
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Menu,
  Bike,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DeliveryInfo } from "../../delivery/provider/delivery-info";

const ProviderHome = () => {
  const [notificationCount] = useState(5);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "partners", label: "Delivery", icon: Bike },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  const handleNavClick = (id: string) => {
    setIsMenuOpen(false);
  };
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {" "}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-gray-200">
                    <h1 className="text-orange-500">Tiffin Service</h1>
                  </div>

                  <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            "orders" === item.id
                              ? "bg-orange-50 text-orange-600"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  <div className="p-4 border-t border-gray-200">
                    <div className="px-4 py-3">
                      <p className="text-gray-900">HomeMade Tiffins</p>
                      <p className="text-gray-500">homemade@tiffin.com</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-orange-500">Swiggy Partner</h1>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                {notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>
      {/* <Analytics /> */}
      {/* <OrdersPage /> */}
      {/* <ProviderSettings /> */}
      {/* <MenuManagement /> */}
      <DeliveryInfo />
    </div>
  );
};

export default ProviderHome;
