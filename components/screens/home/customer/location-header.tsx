import { Bell, ChevronDown, NavigationIcon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const LocationHeader = ({ isSticky }: { isSticky: boolean }) => {
  const router = useRouter();
  return (
    <div
      className={`transition-all duration-300 ${
        isSticky ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <div className="flex gap-2 items-center">
            <NavigationIcon className="h-4 w-4 fill-primary text-primary" />
            <span className="font-extrabold">My Home</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="text-[#666] text-xs mt-1">
            1112 House No. Phone 3b-1, Se...
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
            onClick={() => router.push("/provider-settings")}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationHeader;
