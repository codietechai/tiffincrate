"use client";
import React, { useEffect, useState } from "react";
import MenuItemHome from "../home/customer/menu-item-home";
import VegNonVegSwitch from "../home/customer/veg-switch";
import LocationHeader from "../home/customer/location-header";
import { MenuService } from "@/services/menu-service";
import { TMenu, TProvider } from "@/types";
import { ProviderService } from "@/services/provider-service";
import { CheifHatIcon } from "@/components/common/icons";
import { Badge } from "@/components/ui/badge";

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
    <div className="mx-auto max-w-xl lg:max-w-4xl px-4 py-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CheifHatIcon className="h-5 w-5 lg:h-8 lg:w-8" />
            <h1 className="text-xl font-semibold text-gray-900">
              {provider?.businessName}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">{provider?.description}</p>
          <p className="flex gap-2 flex-wrap mt-3">
            {provider?.cuisine?.map((item) => (
              <Badge>{item}</Badge>
            ))}
          </p>
        </div>
      </div>
      <div className="mb-4">
        <VegNonVegSwitch filters={filters} setFilters={setFilters} />
      </div>

      {filteredMenus.map((menu) => (
        <MenuItemHome menu={menu} />
      ))}
    </div>
  );
};

export default SingleProvider;
