"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { TProviderQueryData } from "@/types";

interface FilterDrawerProps {
  filters: TProviderQueryData;
  setFilters: Dispatch<SetStateAction<TProviderQueryData>>;
}

export default function FilterDrawer({
  filters,
  setFilters,
}: FilterDrawerProps) {
  const [queryData, setQueryData] = useState(filters);
  const defaultFilters = {
    area: "all",
    cuisine: "all",
    search: filters.search,
    limit: filters.limit,
    sorting: "rating",
    page: filters.page,
  };
  const handleReset = () => {
    setQueryData(defaultFilters);
    setFilters(defaultFilters);
  };

  const handleSave = () => {
    setFilters(queryData);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Settings2 className="text-muted-foreground cursor-pointer" />
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Filter Tiffin Providers</DrawerTitle>
        </DrawerHeader>
        <form
          // onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 p-4"
        >
          <div className="space-y-4">
            <div>
              <Label>Cuisine</Label>
              <Select
                value={queryData.cuisine || "all"}
                onValueChange={(value) =>
                  setQueryData((prev) => ({
                    ...prev,
                    cuisine: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {/* {getAllCuisines().map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Area</Label>
              <Select
                value={queryData.area || "all"}
                onValueChange={(value) =>
                  setQueryData((prev) => ({
                    ...prev,
                    area: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {/* {getAllAreas().map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort By</Label>
              <Select
                value={queryData.sorting}
                onValueChange={(value) =>
                  setQueryData((prev) => ({ ...prev, sorting: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="orders">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
