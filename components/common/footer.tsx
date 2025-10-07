"use client";
import { CookingPotIcon, Heart, ShoppingCart, User } from "lucide-react";
import React, { useEffect, useState } from "react";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  const options = [
    {
      icon: (
        <CookingPotIcon className="h-4 w-4 md:h-6 md:w-6" color="#ff1f01" />
      ),
      text: "Menu",
      href: "/menu",
    },
    {
      icon: <ShoppingCart className="h-4 w-4 md:h-6 md:w-6" color="#ff1f01" />,
      text: "Orders",
      href: "/orders",
    },
    {
      icon: <Heart className="h-4 w-4 md:h-6 md:w-6" color="#ff1f01" />,
      text: "Favouraties",
      href: "/menu",
    },
    {
      icon: <User className="h-4 w-4 md:h-6 md:w-6" color="#ff1f01" />,
      text: "Profile",
      href: "/menu",
    },
  ];
  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white shadow-md transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-[1100px] mx-auto flex justify-between px-6 py-3">
        {options.map((item, i) => (
          <div
            key={i}
            className="flex cursor-pointer flex-col items-center text-gray-700 hover:text-black transition-colors"
          >
            {item.icon}
            <span className="text-xs md:text-sm mt-1">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Footer;
