"use client";
import { Bell, ChevronDown, NavigationIcon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LocationHeader({ isSticky }: { isSticky: boolean }) {
  const router = useRouter();

  const [locationName, setLocationName] = useState("Detecting location...");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchLocation = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        console.log("Fetched address:", data);

        const cityName =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          "Unknown";
        const preciseAddress = [
          data.address?.house_number,
          data.address?.road,
          data.address?.neighbourhood,
          data.address?.suburb,
        ]
          .filter(Boolean)
          .join(", ");

        setLocationName(cityName);
        setAddress(preciseAddress || "Unable to determine street location");
      } catch (err) {
        console.error("Error fetching address:", err);
        setLocationName("Location unavailable");
        setAddress("");
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchLocation(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationName("Location access denied");
          setAddress("");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationName("Geolocation not supported");
    }
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${
        isSticky ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="flex justify-between items-center gap-2 md:gap-0 cursor-pointer">
        <div
          onClick={() => {
            router.push("/home/address");
          }}
        >
          <div className="flex gap-2 items-center">
            <NavigationIcon className="h-4 w-4 fill-primary text-primary" />
            <span className="font-extrabold">{locationName}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="text-[#666] text-xs mt-1 max-w-xs truncate">
            {address || "Fetching exact address..."}
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
