"use client";
import {
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  BarChart3,
  Heart,
  User,
  Home,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { CheifIcon } from "./icons";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
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
    { id: "home", label: "Home", icon: <Home />, href: "/home" },
    { id: "menu", label: "Menu", icon: <UtensilsCrossed />, href: "/menu" },
    { id: "browse-providers", label: "Providers", icon: <CheifIcon />, href: "/browse-providers" },
    { id: "orders", label: "Orders", icon: <ShoppingBag />, href: "/order-history" },
    { id: "delivery", label: "Delivery", icon: <Bike />, href: "/delivery-info" },
    { id: "analytics", label: "Analytics", icon: <BarChart3 />, href: "/analytics" },
    { id: "favorites", label: "Favorites", icon: <Heart />, href: "/favorites" },
    { id: "profile", label: "Profile", icon: <User />, href: "/profile" },
  ];

  const consumer = ["profile", "orders", "browse-providers", "favorites", "home"];
  const provider = ["profile", "orders", "analytics", "delivery", "menu", "home"];

  // Temporary role simulation (replace with API auth later)
  const role = "consumer" as const;
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    const isScrollingDown = currentScrollY > lastScrollY.current;

    // show only when scrolling down OR near top
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

        // Redirect to appropriate dashboard if already logged in
        // if (data.user.role === "admin") {
        //   router.push("/dashboard/admin");
        // }
        //  else if (data.user.role === "provider") {
        //   router.push("/dashboard/provider");
        // }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };
  const [actualOptions, setActualOptions] = useState<
    {
      id: string;
      label: string;
      icon: React.ReactNode;
      href: string;
    }[]
  >([]);
  useEffect(() => {
    if (user?._id) {
      let o;
      if (user.role === "provider") {
        o = options.filter((item) => provider.includes(item.id));
        setActualOptions(o);
      } else if (user.role === "consumer") {
        o = options.filter((item) => consumer.includes(item.id));
        setActualOptions(o);
      }
    }
  }, [user]);
  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <div className="bg-white rounded-full shadow-lg px-4 py-2 flex gap-2 items-center">
        {actualOptions.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isActive
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
