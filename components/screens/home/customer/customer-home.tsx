"use client";
import { Settings2 } from "lucide-react";
import HomeHeader from "./home-header";
import { useEffect, useState } from "react";
import VegNonVegSwitch from "./veg-switch";
import { Types } from "mongoose";
import { Badge } from "@/components/ui/badge";
import MenuItemHome from "./menu-item-home";
import { TMenu } from "@/types";
import { MenuService } from "@/services/menu-service";
import FilterDrawer from "../provider/filter-drawer";

const ConsumerHome = () => {
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });
  const [menus, setMenus] = useState<TMenu[]>([]);

  const filteredMenus = menus?.filter(
    (menu) => menu.isVegetarian === filters.isVegetarian
  );

  const fetchMenus = async () => {
    try {
      const res = await MenuService.fetchMenus();
      setMenus(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div>
      <HomeHeader />
      <div className="mt-5 px-3">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-bold text-lg">Filters</h3>
          <Settings2 className="text-muted-foreground" />
        </div>
        {/* <FilterDrawer /> */}

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

export default ConsumerHome;
