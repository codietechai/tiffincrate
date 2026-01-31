"use client";
import { Settings2 } from "lucide-react";
import HomeHeader from "./home-header";
import { useEffect, useState } from "react";
import VegNonVegSwitch from "./veg-switch";
import MenuItemHome from "./menu-item-home";
import TodayOrdersAccordion from "./today-orders-accordion";
import { TMenu } from "@/types";
import { TOrderDelivery } from "@/types/order";
import { MenuService } from "@/services/menu-service";
import { CustomerOrderService } from "@/services/customer-order-service";
import { Skeleton } from "@/components/ui/skeleton";

const ConsumerHome = () => {
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [menus, setMenus] = useState<TMenu[]>([]);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);

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

  const fetchTodayOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await CustomerOrderService.fetchUpcomingDeliveries();
      if (res.success) {
        setTodayOrders(res.data);
      }
    } catch (error) {
      console.log('Error fetching upcoming deliveries:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchTodayOrders();
  }, []);

  console.log('menus :>> ', menus);
  console.log('todayOrders :>> ', todayOrders);

  return (
    <div>
      <HomeHeader />
      <div className="mt-5 px-3">
        {/* Today's Orders Accordion */}
        {ordersLoading ? (
          <div className="mb-6">
            <Skeleton className="w-full h-[80px] rounded-lg" />
          </div>
        ) : (
          <TodayOrdersAccordion orders={todayOrders} />
        )}

        {/* Filters Section */}
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-semibold">Browse Menus</h3>
          <Settings2 className="text-muted-foreground" />
        </div>

        <div className="mb-4">
          <VegNonVegSwitch filters={filters} setFilters={setFilters} />
        </div>

        {/* Menus Section */}
        <div className="space-y-4">
          {loading
            ? Array(5)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="w-full h-[200px]" />)
            : filteredMenus.map((menu) => (
              <MenuItemHome key={menu._id} menu={menu} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ConsumerHome;
