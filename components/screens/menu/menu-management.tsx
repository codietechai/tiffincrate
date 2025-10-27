"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Edit, Trash2, ImagePlus, Plus } from "lucide-react";
import MenuDrawerForm from "./menu-drawer";
import { TMenu } from "@/types";
import { toTitleCase } from "@/lib/utils";
import { PaginationComponent } from "@/components/common/pagination-component";

export function MenuManagement() {
  const [selectedMenu, setSelectedMenu] = useState<null | TMenu>(null);
  const [queryData, setQueryData] = useState({
    page: 1,
    limit: 2,
    category: "all",
    search: "",
  });

  const categories = ["all", "breakfast", "lunch", "dinner"];

  const [menus, setMenus] = useState<{
    data: TMenu[];
    stats: {
      total: number;
      available: number;
      active: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null>(null);
  const fetchMenus = async () => {
    try {
      const params = new URLSearchParams({
        search: queryData.search,
        category: queryData.category,
        page: queryData.page,
        limit: queryData.limit,
      } as any).toString();
      const res = await fetch(`/api/menus?${params}`);

      if (res.ok) {
        const data = await res.json();
        console.log("data", data);
        setMenus(data);
      }
    } catch (e) {
      console.error("Error fetching menus:", e);
    } finally {
      // setLoading(false);
    }
  };

  const toggleMenuStatus = async (
    menuId: string,
    boolean: boolean,
    type: "isActive" | "isAvailable"
  ) => {
    try {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: boolean }),
      });
      if (res.ok) {
        fetchMenus();
      }
    } catch (e) {
      console.error("Error updating menu status:", e);
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (!confirm("Delete this menu permanently?")) return;
    try {
      const res = await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
      if (res.ok) fetchMenus();
    } catch (e) {
      console.error("Error deleting menu:", e);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [queryData]);
  const [open, setOpen] = useState(false);

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
          refresh={fetchMenus}
          setMenuData={setSelectedMenu}
          open={open}
          setOpen={setOpen}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Total Items</p>
            <p className="mt-1 md:mt-2 text-lg md:text-2xl">
              {menus?.stats?.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Available</p>
            <p className="text-green-600 mt-1 md:mt-2 text-lg md:text-2xl">
              {menus?.stats?.available}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Unavailable</p>
            <p className="text-red-600 mt-1 md:mt-2 text-lg md:text-2xl">
              {(menus?.stats?.total as number) -
                (menus?.stats?.available as number)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Active</p>
            <p className="mt-1 md:mt-2 text-lg md:text-2xl">
              {menus?.stats?.active}
            </p>
          </CardContent>
        </Card>
      </div>

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
              className={`flex-shrink-0 ${
                queryData.category === category ? "" : ""
              }`}
            >
              {category === "all" ? "All Items" : toTitleCase(category)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="px-1">Menu Items ({menus?.pagination.total})</h3>
        <div className="my-3">
          {!!menus?.pagination.total && (
            <PaginationComponent
              page={menus.pagination.page}
              setPage={(value) =>
                setQueryData((prev) => {
                  return { ...prev, page: value };
                })
              }
              pageSize={queryData.limit}
              totalCount={menus?.pagination.total || 0}
              scrollToTop={true}
            />
          )}
        </div>
        <div className="space-y-3">
          {menus && menus?.data?.length > 0 ? (
            menus?.data?.map((item) => (
              <Card
                key={item._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl?.length ? (
                        <img
                          src={item.imageUrl[0]}
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
                            <h3 className="text-base md:text-lg truncate">
                              {item.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.isVegetarian
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

                      {item.weeklyItems && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(item.weeklyItems)
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
                                console.log("value", value);
                              }}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
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
              {!queryData.search && (
                //  !categoryFilter && !statusFilter &&
                <Button asChild>
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Menu
                  </>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
