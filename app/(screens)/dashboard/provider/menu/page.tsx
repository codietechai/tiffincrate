"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Plus, Search, Edit, Trash2, Leaf } from "lucide-react";
import { useAuthCheck } from "@/services/auth-service";
import { useMenus } from "@/services/menu-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
}

interface WeeklyItems {
  monday?: MenuItem;
  tuesday?: MenuItem;
  wednesday?: MenuItem;
  thursday?: MenuItem;
  friday?: MenuItem;
  saturday?: MenuItem;
  sunday?: MenuItem;
}

interface Menu {
  _id: string;
  name: string;
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  weeklyItems: WeeklyItems;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "week";
  draft: boolean;
  rating: number;
  createdAt: string;
}

export default function ProviderMenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query hooks
  const { data: authData, isLoading: authLoading } = useAuthCheck();
  const { data: menusData, isLoading: menusLoading } = useMenus();

  // Check authentication and redirect if needed
  if (authLoading) return <LoadingPage />;

  if (!authData?.data || authData.data.role !== "provider") {
    router.push(authData?.data ? "/" : "/auth/login");
    return <LoadingPage />;
  }

  const user = authData.data;
  const menus = menusData?.data || [];
  const loading = menusLoading;

  // Mutations for menu operations
  const toggleMenuStatusMutation = useMutation({
    mutationFn: ({ menuId, isActive }: { menuId: string; isActive: boolean }) =>
      httpClient.patch(ROUTES.MENU.BY_ID(menuId), { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MENU.ALL });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (menuId: string) => httpClient.delete(ROUTES.MENU.BY_ID(menuId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MENU.ALL });
    },
  });

  const toggleMenuStatus = (menuId: string, isActive: boolean) => {
    toggleMenuStatusMutation.mutate({ menuId, isActive });
  };

  const deleteMenu = (menuId: string) => {
    if (!confirm("Delete this menu permanently?")) return;
    deleteMenuMutation.mutate(menuId);
  };

  const getFilteredMenus = () =>
    menus?.filter((menu) => {
      const searchMatch =
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(menu.weeklyItems).some((item) =>
          item?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && menu.isActive) ||
        (statusFilter === "inactive" && !menu.isActive);

      const categoryMatch =
        categoryFilter === "all" || menu.category === categoryFilter;

      return searchMatch && statusMatch && categoryMatch;
    });

  const getActiveMenus = () => {
    return menus?.filter((item) => item.isActive === true).length;
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold">Menu Management</h1>
            <p className="text-gray-600">Manage your weekly menus</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/provider/menu/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Menus</p>
                  <p className="text-xl font-semibold">{menus?.length}</p>
                </div>
                <div className="text-blue-500">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Menus</p>
                  <p className="text-xl font-semibold text-green-600">
                    {getActiveMenus()}
                  </p>
                </div>
                <div className="text-green-500">✅</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menus or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Menu List */}
        <div className="space-y-6">
          {getFilteredMenus()?.length ? (
            getFilteredMenus()?.map((menu) => (
              <Card key={menu._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {menu.name}
                        <Badge
                          variant={menu.isActive ? "default" : "secondary"}
                        >
                          {menu.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {menu.description || "No description provided"}
                      </CardDescription>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: {menu.category} • Price: ₹{menu.basePrice}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={menu.isActive}
                        onCheckedChange={(checked) =>
                          toggleMenuStatus(menu._id, checked)
                        }
                        disabled={toggleMenuStatusMutation.isPending}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/provider/menu/${menu._id}/edit`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMenu(menu._id)}
                        className="text-red-600"
                        disabled={deleteMenuMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <h4 className="font-medium mb-2">Weekly Items</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(menu.weeklyItems).map(([day, item]) => (
                      <div
                        key={day}
                        className="border rounded-lg p-3 text-center"
                      >
                        <p className="font-semibold capitalize">{day}</p>
                        {item ? (
                          <>
                            <p className="text-sm mt-1">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.description}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">No item</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-medium text-gray-900 mb-2">
                {searchTerm || categoryFilter || statusFilter
                  ? "No menus found"
                  : "No menus created yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter || statusFilter
                  ? "Try adjusting your filters"
                  : "Create your first menu to start offering your tiffin services"}
              </p>
              {!searchTerm && !categoryFilter && !statusFilter && (
                <Button
                  onClick={() => router.push("/dashboard/provider/menu/new")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Menu
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
