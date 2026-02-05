"use client";
import { useState } from "react";
import { Boxes, CheckCircle, XCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Edit, Trash2, ImagePlus } from "lucide-react";
import MenuDrawerForm from "./menu-drawer";
import { TMenu } from "@/types";
import { toTitleCase } from "@/lib/utils";
import { PaginationComponent } from "@/components/common/pagination-component";
import StatsGrid from "@/components/common/stats-grid";
import { useMenus } from "@/services/menu-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";

export function MenuManagement() {
  const [selectedMenu, setSelectedMenu] = useState<null | TMenu>(null);
  const [queryData, setQueryData] = useState({
    page: 1,
    limit: 10,
    category: "all",
    search: "",
    isAvailable: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined,
    isVegetarian: undefined as boolean | undefined,
  });
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const categories = ["all", "breakfast", "lunch", "dinner"];

  // Use React Query hook for fetching menus with query parameters
  const { data: menusResponse, isLoading: loading } = useMenus({
    page: queryData.page,
    limit: queryData.limit,
    category: queryData.category !== "all" ? queryData.category : undefined,
    search: queryData.search || undefined,
    isAvailable: queryData.isAvailable,
    isActive: queryData.isActive,
    isVegetarian: queryData.isVegetarian,
  });

  const menus = menusResponse?.data || [];
  const stats = menusResponse?.stats;
  const pagination = menusResponse?.pagination;

  // Create stats from server response or calculate from client data
  const menuStats = [
    {
      label: "Total Items",
      value: stats?.total || menus.length,
      icon: Boxes,
      bgColor: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      label: "Available",
      value: stats?.available || menus.filter(menu => menu.isAvailable).length,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      color: "text-green-600",
    },
    {
      label: "Unavailable",
      value: stats ? (stats.total - stats.available) : menus.filter(menu => !menu.isAvailable).length,
      icon: XCircle,
      bgColor: "bg-red-100",
      color: "text-red-600",
    },
    {
      label: "Active",
      value: stats?.active || menus.filter(menu => menu.isActive).length,
      icon: Zap,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600",
    },
  ];

  // Mutations for menu operations
  const toggleMenuStatusMutation = useMutation({
    mutationFn: ({ menuId, data }: { menuId: string; data: any }) =>
      httpClient.patch(ROUTES.MENU.BY_ID(menuId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (menuId: string) => httpClient.delete(ROUTES.MENU.BY_ID(menuId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });

  const toggleMenuStatus = (
    menuId: string,
    boolean: boolean,
    type: "isActive" | "isAvailable"
  ) => {
    toggleMenuStatusMutation.mutate({ menuId, data: { [type]: boolean } });
  };

  const deleteMenu = (menuId: string) => {
    if (!confirm("Delete this menu permanently?")) return;
    deleteMenuMutation.mutate(menuId);
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="truncate">Menu</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage your menu</p>
        </div>

        <MenuDrawerForm
          menuData={selectedMenu}
          refresh={() => queryClient.invalidateQueries({ queryKey: ['menu'] })}
          setMenuData={setSelectedMenu}
          open={open}
          setOpen={setOpen}
        />
      </div>

      <StatsGrid stats={menuStats} isLoading={loading} />

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search menu items..."
            value={queryData.search}
            onChange={(e) =>
              setQueryData((prev) => {
                return {
                  ...prev,
                  search: e.target.value,
                };
              })
            }
            className="pl-10 h-11 md:h-10"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 -mx-4 px-4">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={queryData.category === category ? "default" : "outline"}
              onClick={() =>
                setQueryData((prev) => {
                  return {
                    ...prev,
                    category,
                  };
                })
              }
              className={`flex-shrink-0 ${queryData.category === category ? "" : ""
                }`}
            >
              {category === "all" ? "All Items" : toTitleCase(category)}
            </Button>
          ))}
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-2 pb-2">
          <Button
            size="sm"
            variant={queryData.isAvailable === undefined ? "default" : "outline"}
            onClick={() =>
              setQueryData((prev) => ({
                ...prev,
                isAvailable: undefined,
              }))
            }
          >
            All Status
          </Button>
          <Button
            size="sm"
            variant={queryData.isAvailable === true ? "default" : "outline"}
            onClick={() =>
              setQueryData((prev) => ({
                ...prev,
                isAvailable: true,
              }))
            }
          >
            Available
          </Button>
          <Button
            size="sm"
            variant={queryData.isAvailable === false ? "default" : "outline"}
            onClick={() =>
              setQueryData((prev) => ({
                ...prev,
                isAvailable: false,
              }))
            }
          >
            Unavailable
          </Button>
          <Button
            size="sm"
            variant={queryData.isVegetarian === undefined ? "outline" : "default"}
            onClick={() =>
              setQueryData((prev) => ({
                ...prev,
                isVegetarian: prev.isVegetarian === undefined ? true : undefined,
              }))
            }
          >
            🥬 Veg Only
          </Button>
        </div>
      </div>

      <div>
        <h3 className="px-1">Menu Items ({pagination?.total || menus.length})</h3>
        <div className="my-3">
          {(pagination?.total || menus.length) > 0 && (
            <PaginationComponent
              page={pagination?.page || queryData.page}
              setPage={(value) =>
                setQueryData((prev) => {
                  return { ...prev, page: value };
                })
              }
              pageSize={pagination?.limit || queryData.limit}
              totalCount={pagination?.total || menus.length}
              scrollToTop={true}
            />
          )}
        </div>
        <div className="space-y-3">
          {menus.length > 0 ? (
            menus.map((item) => (
              <Card
                key={item._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <h3 className="text-base md:truncate">
                              {item.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${item.isVegetarian
                                ? "border-green-500 text-green-700"
                                : "border-red-500 text-red-700"
                                }`}
                            >
                              {item.isVegetarian ? "🟢" : "🔴"}
                            </Badge>
                            {!item.isAvailable && (
                              <Badge
                                variant="outline"
                                className="border-red-500 text-red-700 text-xs"
                              >
                                Off
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-gray-500 mt-1 text-sm line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <p className="text-gray-500 mt-1 text-xs md:text-sm">
                            {toTitleCase(item.category)}
                          </p>
                        </div>
                        <p className="flex-shrink-0 md:text-lg">
                          ₹{item.basePrice}
                        </p>
                      </div>

                      {item.menuItems && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(item.menuItems)
                            .filter(([_, menuItem]) => menuItem) // only include defined days
                            .map(([day]) => (
                              <Badge
                                key={day}
                                variant="secondary"
                                className="text-xs capitalize bg-gray-100"
                              >
                                {day.slice(0, 3)}
                              </Badge>
                            ))}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={(value) =>
                                toggleMenuStatus(item._id, value, "isAvailable")
                              }
                              disabled={toggleMenuStatusMutation.isPending}
                            />
                            <span className="text-gray-600 text-sm">
                              Available
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isActive}
                              onCheckedChange={(value) => {
                                toggleMenuStatus(item._id, value, "isActive");
                              }}
                              disabled={toggleMenuStatusMutation.isPending}
                            />
                            <span className="text-gray-600 text-sm">
                              Active
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9"
                            onClick={() => {
                              setSelectedMenu(item);
                              setOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 h-9"
                            onClick={() => deleteMenu(item._id)}
                            disabled={deleteMenuMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-medium text-gray-900 mb-2">
                {queryData.search
                  ? // || categoryFilter || statusFilter
                  "No menus found"
                  : "No menus created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {queryData.search
                  ? //  || categoryFilter || statusFilter
                  "Try adjusting your filters"
                  : "Create your first menu to start offering your tiffin services"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
