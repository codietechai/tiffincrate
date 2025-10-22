"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, ImagePlus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
}

export function MenuManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Lunch Tiffin (Veg)",
      category: "Lunch",
      price: 120,
      description: "Dal, Sabzi, 3 Chapati, Rice, Salad",
      isVeg: true,
      isAvailable: true,
    },
    {
      id: "2",
      name: "Lunch Tiffin (Non-Veg)",
      category: "Lunch",
      price: 150,
      description: "Chicken Curry, 3 Chapati, Rice, Salad",
      isVeg: false,
      isAvailable: true,
    },
    {
      id: "3",
      name: "Breakfast Special",
      category: "Breakfast",
      price: 80,
      description: "Paratha with curd and pickle",
      isVeg: true,
      isAvailable: true,
    },
    {
      id: "4",
      name: "Dinner Tiffin (Veg)",
      category: "Dinner",
      price: 120,
      description: "Dal, Paneer Sabzi, 3 Chapati, Rice",
      isVeg: true,
      isAvailable: true,
    },
    {
      id: "5",
      name: "Dinner Tiffin (Non-Veg)",
      category: "Dinner",
      price: 150,
      description: "Mutton Curry, 3 Chapati, Rice",
      isVeg: false,
      isAvailable: true,
    },
    {
      id: "6",
      name: "Mini Tiffin",
      category: "Lunch",
      price: 90,
      description: "Sabzi, 2 Chapati, Rice",
      isVeg: true,
      isAvailable: false,
    },
  ]);

  const categories = [
    "all",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = (id: string) => {
    setMenuItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const stats = {
    total: menuItems.length,
    available: menuItems.filter((i) => i.isAvailable).length,
    unavailable: menuItems.filter((i) => !i.isAvailable).length,
    categories: categories.length - 1,
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="truncate">Menu</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage your menu</p>
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 h-11 md:h-10 flex-shrink-0">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Add Item</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <div className="overflow-y-auto">
              <DrawerHeader>
                <DrawerTitle>Add New Menu Item</DrawerTitle>
                <DrawerDescription>
                  Add a new item to your restaurant menu
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" placeholder="e.g., Butter Chicken" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" placeholder="Main Course" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" type="number" placeholder="350" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your dish..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Item Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-orange-500 transition-colors cursor-pointer active:scale-95">
                    <ImagePlus className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-600 text-sm">
                      Click to upload image
                    </p>
                    <p className="text-gray-400 text-xs">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="veg" />
                    <Label htmlFor="veg">Vegetarian</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="available" defaultChecked />
                    <Label htmlFor="available">Available</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600 h-11">
                    Add Item
                  </Button>
                  <Button variant="outline" className="flex-1 h-11">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Total Items</p>
            <p className="mt-1 md:mt-2 text-lg md:text-2xl">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Available</p>
            <p className="text-green-600 mt-1 md:mt-2 text-lg md:text-2xl">
              {stats.available}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Unavailable</p>
            <p className="text-red-600 mt-1 md:mt-2 text-lg md:text-2xl">
              {stats.unavailable}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 px-3 md:pt-6 md:pb-6 md:px-6">
            <p className="text-gray-500 text-xs md:text-sm">Categories</p>
            <p className="mt-1 md:mt-2 text-lg md:text-2xl">
              {stats.categories}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 md:h-10"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 ${
                selectedCategory === category
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }`}
            >
              {category === "all" ? "All Items" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <h3 className="mb-3 px-1">Menu Items ({filteredItems.length})</h3>
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImagePlus className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
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
                              item.isVeg
                                ? "border-green-500 text-green-700"
                                : "border-red-500 text-red-700"
                            }`}
                          >
                            {item.isVeg ? "🟢" : "🔴"}
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
                        <p className="text-gray-500 mt-1 text-sm line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-gray-500 mt-1 text-xs md:text-sm">
                          {item.category}
                        </p>
                      </div>
                      <p className="text-orange-600 flex-shrink-0 md:text-lg">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleAvailability(item.id)}
                        />
                        <span className="text-gray-600 text-sm">Available</span>
                      </div>

                      <div className="flex gap-2 ml-auto">
                        <Button variant="outline" size="sm" className="h-9">
                          <Edit className="w-4 h-4 md:mr-2" />
                          <span className="hidden md:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50 h-9"
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
          ))}
        </div>
      </div>
    </div>
  );
}
