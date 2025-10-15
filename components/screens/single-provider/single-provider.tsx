"use client";
import React, { useEffect, useState } from "react";
import MenuItemHome from "../home/customer/menu-item-home";
import VegNonVegSwitch from "../home/customer/veg-switch";
import LocationHeader from "../home/customer/location-header";
import { MenuService } from "@/services/menu-service";
import { TMenu, TProvider } from "@/types";
import { ProviderService } from "@/services/provider-service";

const SingleProvider = ({ id }: { id: string }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });
  const [provider, setProvider] = useState<TProvider | null>(null);
  const [menus, setMenus] = useState<TMenu[]>([]);

  const filteredMenus = menus?.filter(
    (menu) => menu.isVegetarian === filters.isVegetarian
  );

  const fetchMenus = async () => {
    try {
      const res = await MenuService.fetchMenus(id);
      setMenus(res?.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchProvider = async () => {
    try {
      const res = await ProviderService.fetchProvider(id);
      setProvider(res.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchProvider();
  }, [id]);

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
      <div className="mt-5">
        <div className="py-3 space-y-2">
          <h2 className="text-2xl font-bold">{provider?.businessName}</h2>
          <p className="">
            {provider?.cuisine?.map((item) => (
              <p>item</p>
            ))}
          </p>
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
