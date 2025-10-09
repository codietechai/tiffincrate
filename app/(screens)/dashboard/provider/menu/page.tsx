"use client";

import { useEffect, useState } from "react";
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
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchMenus();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return router.push("/auth/login");
      const data = await res.json();
      if (data.user.role !== "provider") return router.push("/");
      setUser(data.user);
    } catch {
      router.push("/auth/login");
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      if (res.ok) {
        const data = await res.json();
        setMenus(data.menus);
      }
    } catch (e) {
      console.error("Error fetching menus:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuStatus = async (menuId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setMenus((prev) =>
          prev.map((m) => (m._id === menuId ? { ...m, isActive } : m))
        );
      }
    } catch (e) {
      console.error("Error updating menu status:", e);
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (!confirm("Delete this menu permanently?")) return;
    try {
      const res = await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
      if (res.ok) setMenus((prev) => prev.filter((m) => m._id !== menuId));
    } catch (e) {
      console.error("Error deleting menu:", e);
    }
  };

  const getFilteredMenus = () =>
    menus.filter((menu) => {
      const searchMatch =
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(menu.weeklyItems).some((item) =>
          item?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const statusMatch =
        !statusFilter ||
        (statusFilter === "active" && menu.isActive) ||
        (statusFilter === "inactive" && !menu.isActive);

      const categoryMatch = !categoryFilter || menu.category === categoryFilter;

      return searchMatch && statusMatch && categoryMatch;
    });

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-gray-600">Manage your weekly menus</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/provider/menu/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
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
                setCategoryFilter("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Menu List */}
        <div className="space-y-6">
          {getFilteredMenus().length ? (
            getFilteredMenus().map((menu) => (
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
              <p className="text-gray-600">No menus found</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/provider/menu/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Menu
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
