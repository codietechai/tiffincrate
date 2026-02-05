"use client";
import { Settings2, Loader2 } from "lucide-react";
import HomeHeader from "./home-header";
import { useEffect, useState } from "react";
import VegNonVegSwitch from "./veg-switch";
import MenuItemHome from "./menu-item-home";
import TodayOrdersAccordion from "./today-orders-accordion";
import { TMenu } from "@/types";
import { useInfiniteMenus } from "@/services/menu-service";
import { useUpcomingDeliveries } from "@/services/customer-order-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ConsumerHome = () => {
  const [filters, setFilters] = useState({
    isVegetarian: true,
  });

  // Use infinite query for menus
  const {
    data: menusData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: menusLoading,
    error: menusError,
  } = useInfiniteMenus({
    isVegetarian: filters.isVegetarian,
    isAvailable: true,
    isActive: true,
    limit: 10,
  });

  // Use React Query for upcoming deliveries
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useUpcomingDeliveries();

  // Flatten the infinite query data
  const allMenus = menusData?.pages.flatMap(page => page.data) || [];
  const todayOrders = ordersData?.data || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div>
      <HomeHeader />
      <div className="mt-5 px-3">
        {/* Today's Orders Accordion */}
        {ordersLoading ? (
          <div className="mb-6">
            <Skeleton className="w-full h-[80px] rounded-lg" />
          </div>
        ) : ordersError ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Failed to load upcoming deliveries</p>
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
          {menusLoading ? (
            // Loading skeletons
            Array(5)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="w-full h-[200px]" />)
          ) : menusError ? (
            // Error state
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-600 mb-2">Failed to load menus</p>
              <p className="text-red-500 text-sm">Please try refreshing the page</p>
            </div>
          ) : allMenus.length === 0 ? (
            // Empty state
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-600 mb-2">No menus available</p>
              <p className="text-gray-500 text-sm">
                {filters.isVegetarian ? "No vegetarian" : "No non-vegetarian"} menus found
              </p>
            </div>
          ) : (
            // Menu items
            <>
              {allMenus.map((menu) => (
                <MenuItemHome key={menu._id} menu={menu} />
              ))}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="w-full max-w-xs"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load More Menus"
                    )}
                  </Button>
                </div>
              )}

              {/* End of results indicator */}
              {!hasNextPage && allMenus.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    You've seen all available menus
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerHome;
