import React, { useEffect, useState } from "react";
import {
  NavigationIcon,
  ChevronDown,
  Bell,
  Settings,
  Search,
  Mic,
} from "lucide-react";
import TypewriterText from "./animated-text";
import SearchDialog from "./search-dialog";

const HomeHeader = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [modal, setModal] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 60) setIsSticky(true);
      else setIsSticky(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="px-4 py-3 bg-white shadow-sm">
      <div
        className={`transition-all duration-300 ${
          isSticky ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex justify-between">
          <div>
            <div className="flex gap-2 items-center">
              <NavigationIcon className="h-4 w-4 fill-[#ff1f01] text-[#ff1f01]" />
              <span className="font-extrabold">My Home</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="text-[#666] text-xs mt-1">
              1112 House No. Phone 3b-1, Se...
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Bell className="text-[#ff1f01]" size={20} />
            <Settings className="text-[#ff1f01]" size={20} />
          </div>
        </div>
      </div>

      <div
        id="visible-header"
        onClick={() => setModal(true)}
        className={` py-3 ${
          isSticky
            ? "fixed top-0 left-0 right-0 bg-white px-4 py-2 shadow-md z-50 transition-all"
            : ""
        }`}
      >
        <div className="border-border border-2 rounded-lg relative">
          <Search className="text-[#b7b7b7] absolute top-2 left-3" />
          <div className="h-8 w-[1px] bg-border block absolute top-1 right-[38px]"></div>
          <Mic className="text-[#ff1f01] absolute top-3 right-3 h-4 w-4" />
          <TypewriterText />
        </div>
      </div>

      {/* Spacer to avoid layout jump when fixed */}
      {isSticky && <div className="h-14"></div>}
      <SearchDialog open={modal} onOpenChange={(open) => setModal(open)} />
    </div>
  );
};

export default HomeHeader;
