"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Save, ArrowLeft } from "lucide-react";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

interface WeeklyItemInput {
  _id?: string;
  name: string;
  description: string;
}

interface Menu {
  _id: string;
  name: string;
  description?: string;
  category: string;
  weeklyItems: Partial<Record<string, WeeklyItemInput>>;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: string;
  draft: boolean;
}

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuData, setMenuData] = useState<Partial<Menu>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const categories = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
  ];
  useEffect(() => {
    checkAuth();
    fetchMenu();
  }, [params.id]);

  const checkAuth = async () => {
    try {
      const resp = await fetch("/api/auth/me");
      if (resp.ok) {
        const data = await resp.json();
        if (data.user.role !== "provider") {
          router.push("/");
        }
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Auth check error:", err);
      router.push("/auth/login");
    }
  };

  const fetchMenu = async () => {
    try {
      const resp = await fetch(`/api/menus/${params.id}`);
      if (!resp.ok) {
        setError("Menu not found");
        return;
      }
      const data = await resp.json();
      const m: Menu = data.menu;

      setMenu(m);
      setMenuData({
        name: m.name,
        description: m.description,
        category: m.category,
        basePrice: m.basePrice,
        monthlyPlanPrice: m.monthlyPlanPrice,
        imageUrl: m.imageUrl,
        isAvailable: m.isAvailable,
        isVegetarian: m.isVegetarian,
        isActive: m.isActive,
        weekType: m.weekType,
        draft: m.draft,
        weeklyItems: {},
      });
      // initialize weeklyItems in menuData
      const wi: Record<string, WeeklyItemInput> = {};
      for (const d of DAYS) {
        const item = (m.weeklyItems as any)[d.key];
        if (item) {
          wi[d.key] = {
            _id: item._id,
            name: item.name,
            description: item.description || "",
          };
        } else {
          wi[d.key] = { name: "", description: "" };
        }
      }
      setMenuData((prev) => ({
        ...prev,
        weeklyItems: wi,
      }));
    } catch (err) {
      console.error("Fetch menu error:", err);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuDataChange = (field: string, value: any) => {
    setMenuData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWeeklyItemChange = (
    dayKey: string,
    field: keyof WeeklyItemInput,
    value: any
  ) => {
    setMenuData((prev) => {
      const wi = prev.weeklyItems ?? {};
      const prevItem = wi[dayKey] ?? { name: "", description: "" };
      return {
        ...prev,
        weeklyItems: {
          ...wi,
          [dayKey]: { ...prevItem, [field]: value },
        },
      };
    });
  };

  const validateForm = () => {
    if (!menuData.name || !menuData.name.trim()) {
      setError("Menu name is required");
      return false;
    }
    if (!menuData.category) {
      setError("Category is required");
      return false;
    }
    if (
      menuData.basePrice === undefined ||
      menuData.basePrice === null ||
      menuData.basePrice < 0
    ) {
      setError("Base price must be a non-negative number");
      return false;
    }
    // At least one valid daily item:
    const wi = menuData.weeklyItems || {};
    const hasAtLeastOne = DAYS.some((d) => {
      const it = wi[d.key];
      return it && it.name.trim();
    });
    if (!hasAtLeastOne) {
      setError("At least one daily menu item is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    setSaving(true);
    try {
      const resp = await fetch(`/api/menus/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      });
      const data = await resp.json();
      if (resp.ok) {
        setSuccess("Menu updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/provider/menu");
        }, 1500);
      } else {
        setError(data.error || "Failed to update");
      }
    } catch (err) {
      setError("Network error");
      console.error("Submit error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>Menu not found.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Edit Menu</h1>
            <p className="text-gray-600">Update your menu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Menu Main Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Menu Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={menuData.name || ""}
                  onChange={(e) => handleMenuDataChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={menuData.description || ""}
                  onChange={(e) =>
                    handleMenuDataChange("description", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={menuData.category || ""}
                    onValueChange={(v) => handleMenuDataChange("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuData.basePrice ?? ""}
                    onChange={(e) =>
                      handleMenuDataChange(
                        "basePrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isAvailable">Available</Label>
                  <Input
                    type="checkbox"
                    id="isAvailable"
                    checked={menuData.isAvailable ?? false}
                    onChange={(e) =>
                      handleMenuDataChange("isAvailable", e.target.checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isVegetarian">Vegetarian</Label>
                  <Input
                    type="checkbox"
                    id="isVegetarian"
                    checked={menuData.isVegetarian ?? false}
                    onChange={(e) =>
                      handleMenuDataChange("isVegetarian", e.target.checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Active</Label>
                <Input
                  type="checkbox"
                  id="isActive"
                  checked={menuData.isActive ?? false}
                  onChange={(e) =>
                    handleMenuDataChange("isActive", e.target.checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekType">Week Type</Label>
                <Select
                  value={menuData.weekType || ""}
                  onValueChange={(v) => handleMenuDataChange("weekType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole">Whole Week</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Items */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Items</CardTitle>
              <CardDescription>
                Enter a menu item (name + description) for each day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {DAYS.map((d) => {
                const wi = (menuData.weeklyItems ?? {})[d.key] || {
                  name: "",
                  description: "",
                };
                return (
                  <div key={d.key} className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">{d.label}</h4>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={wi.name}
                        onChange={(e) =>
                          handleWeeklyItemChange(d.key, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={wi.description}
                        onChange={(e) =>
                          handleWeeklyItemChange(
                            d.key,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                "Updating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
