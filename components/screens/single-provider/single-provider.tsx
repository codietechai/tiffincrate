"use client";
import React, { useEffect, useState } from "react";
import MenuItemHome from "../home/customer/menu-item-home";
import { TMenu } from "@/app/(screens)/providers/[id]/page";
import VegNonVegSwitch from "../home/customer/veg-switch";
import { IServiceProvider } from "@/models/ServiceProvider";
import LocationHeader from "../home/customer/location-header";

const SingleProvider = ({ id }: { id: string }) => {
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 60) setIsSticky(true);
      else setIsSticky(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });
  const [provider, setProvider] = useState<IServiceProvider | null>(null);
  const [menus, setMenus] = useState<TMenu[]>([]);

  const filteredMenus = menus?.filter(
    (menu) => menu.isVegetarian === filters.isVegetarian
  );

  const fetchMenus = async () => {
    const res = await fetch(`/api/menus?providerId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setMenus(data.menus);
    }
  };

  const fetchProvider = async () => {
    const res = await fetch(`/api/providers/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProvider(data.provider);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchProvider();
  }, [id]);

  return (
    <div className="px-4 py-3 bg-white shadow-sm">
      <LocationHeader isSticky={isSticky} />
      <div className="mt-5">
        <div className="py-3 space-y-2">
          <h2 className="text-2xl font-bold">{provider?.businessName}</h2>
          <p className="">{provider?.cuisine}</p>
          <p className="text-xs text-[#666]">{provider?.description}</p>
        </div>
        <div className="mb-4">
          <VegNonVegSwitch filters={filters} setFilters={setFilters} />
        </div>

        {filteredMenus.map((menu) => (
          <MenuItemHome menu={menu} />
        ))}
      </div>
    </div>
  );
};

export default SingleProvider;
