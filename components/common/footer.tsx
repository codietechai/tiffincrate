"use client";
import {
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  BarChart3,
  SettingsIcon,
  CookingPotIcon,
  ShoppingCart,
  Heart,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {} from "lucide-react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(
        currentScrollY < lastScrollY.current || currentScrollY < 100
      );
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const options = [
    {
      id: "menu",
      label: "Menu",
      icon: <UtensilsCrossed className="h-5 w-5" />,
      href: "/menu",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/home",
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: <Bike className="h-5 w-5" />,
      href: "/delivery-info",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="h-5 w-5" />,
      href: "/favorites",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon className="h-5 w-5" />,
      href: "/provider-settings",
    },
  ];

  console.log("window.location.pathname", window.location.pathname);

  return (
    <nav
      className={`fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-[1100px] mx-auto flex justify-between px-6 py-3">
        {options.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className={`flex flex-col items-center text-sm ${
              item.href === window.location.pathname
                ? "text-orange-600"
                : "text-gray-700 hover:text-black"
            } transition-colors`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Footer;
