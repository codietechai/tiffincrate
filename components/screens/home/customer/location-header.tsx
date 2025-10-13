import { Bell, ChevronDown, NavigationIcon, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";

const LocationHeader = ({ isSticky }: { isSticky: boolean }) => {
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
          <Bell className="text-primary" size={20} />
          <Settings className="text-primary" size={20} />
        </div>
      </div>
    </div>
  );
};

export default LocationHeader;
