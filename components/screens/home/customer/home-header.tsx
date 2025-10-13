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
import LocationHeader from "./location-header";

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
      <LocationHeader isSticky={isSticky} />

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
          <Mic className="text-primary absolute top-3 right-3 h-4 w-4" />
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
