"use client";
import {
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Heart,
  User,
  Home,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { CheifIcon } from "./icons";
import { usePathname } from "next/navigation";
import { FOOTER_NAVIGATION } from "@/constants/page-links";

const Footer = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [user, setUser] = useState<any>(null);
  const [actualOptions, setActualOptions] = useState<
    {
      id: string;
      label: string;
      icon: React.ReactNode;
      href: string;
    }[]
  >([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY.current;
      setIsVisible(isScrollingDown || currentScrollY < 100);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      if (user.role === "provider") {
        // Provider-specific routes
        const providerOptions = FOOTER_NAVIGATION.PROVIDER.map(item => ({
          ...item,
          icon: getIconForNavItem(item.id),
        }));
        setActualOptions(providerOptions);
      } else if (user.role === "consumer") {
        // Consumer-specific routes
        const consumerOptions = FOOTER_NAVIGATION.CONSUMER.map(item => ({
          ...item,
          icon: getIconForNavItem(item.id),
        }));
        setActualOptions(consumerOptions);
      }
    }
  }, [user]);

  const getIconForNavItem = (id: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      home: <Home />,
      menu: <UtensilsCrossed />,
      orders: <ShoppingBag />,
      delivery: <MapPin />,
      profile: <User />,
      "browse-providers": <CheifIcon />,
      favorites: <Heart />,
      analytics: <BarChart3 />,
    };
    return iconMap[id] || <Home />;
  };

  if (pathname.includes('delivery')) {
    return <></>
  }

  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-24"
        }`}
    >
      <div className="bg-white rounded-full shadow-lg px-4 py-2 flex gap-2 items-center">
        {actualOptions.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive
                ? "bg-orange-600 text-white"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {isActive && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Footer;