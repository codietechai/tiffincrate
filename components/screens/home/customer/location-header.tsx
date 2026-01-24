"use client";

import { useLocation } from "@/hooks/use-location";
import { Bell, ChevronDown, NavigationIcon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function LocationHeader({ isSticky }: { isSticky: boolean }) {
  const router = useRouter();
  const { city, address_line_1 } = useLocation();

  return (
    <div
      className={`transition-all duration-300 ${
        isSticky ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="flex justify-between items-center gap-2 md:gap-0 cursor-pointer">
        <div onClick={() => router.push("/address")}>
          <div className="flex gap-2 items-center">
            <NavigationIcon className="h-4 w-4 fill-primary text-primary" />
            <span className="font-extrabold">{city}</span>
            <ChevronDown className="h-4 w-4" />
          </div>

          <div className="text-[#666] text-xs mt-1 max-w-xs truncate">
            {address_line_1 || "Fetching exact address..."}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Bell
            className="text-primary cursor-pointer"
            size={20}
            onClick={() => router.push("/notifications")}
          />
          <Settings
            className="text-primary cursor-pointer"
            size={20}
            onClick={() => router.push("/settings")}
          />
        </div>
      </div>
    </div>
  );
}
