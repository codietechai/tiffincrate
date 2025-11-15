"use client";
import {
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  BarChart3,
  SettingsIcon,
  Heart,
  User,
  Home,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { CheifIcon } from "./icons";
import { useRouter } from "next/navigation";

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
      id: "home",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      href: "/home",
    },
    {
      id: "menu",
      label: "Menu",
      icon: <UtensilsCrossed className="h-5 w-5" />,
      href: "/menu",
    },
    {
      id: "browse-providers",
      label: "Providers",
      icon: <CheifIcon />,
      href: "/browse-providers",
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/order-history",
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
  ];

  const consumer = [
    "profile",
    "orders",
    "browse-providers",
    "favorites",
    "home",
  ];
  const provider = [
    "profile",
    "orders",
    "analytics",
    "delivery",
    "menu",
    "home",
  ];

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

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
      className={`fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-[1100px] mx-auto flex justify-between px-6 py-3">
        {actualOptions.map((item) => (
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
