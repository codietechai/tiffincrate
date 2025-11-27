"use client";
import { Settings2 } from "lucide-react";
import HomeHeader from "./home-header";
import { useEffect, useState } from "react";
import VegNonVegSwitch from "./veg-switch";
import MenuItemHome from "./menu-item-home";
import { TMenu } from "@/types";
import { MenuService } from "@/services/menu-service";
import { Skeleton } from "@/components/ui/skeleton";
import FilterDrawer from "../provider/filter-drawer";

const ConsumerHome = () => {
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<TMenu[]>([]);

  const filteredMenus = menus?.filter(
    (menu) => menu.isVegetarian === filters.isVegetarian
  );

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await MenuService.fetchMenus();
      setMenus(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
          <h3 className="font-semibold">Filters</h3>
          <Settings2 className="text-muted-foreground" />
        </div>

        <div className="mb-4">
          <VegNonVegSwitch filters={filters} setFilters={setFilters} />
        </div>
        <div className="space-y-4">
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => <Skeleton className="w-full h-[200px]" />)
            : filteredMenus.map((menu) => (
                <MenuItemHome key={menu._id} menu={menu} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default ConsumerHome;
