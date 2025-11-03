"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value?: string | number;
  icon: LucideIcon;
  bgColor: string;
  color: string;
};

interface StatsGridProps {
  stats: Stat[];
  isLoading?: boolean;
}

export default function StatsGrid({
  stats,
  isLoading = false,
}: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 px-3 md:px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6 px-3 md:px-6">
              <div className="flex items-start flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-gray-500 text-xs md:text-sm">
                    {stat.label}
                  </p>
                  <p className="mt-1 md:mt-2 md:text-xl">{stat.value}</p>
                </div>
                <div
                  className={`${stat.bgColor} ${stat.color} p-2 md:p-3 rounded-lg w-fit`}
                >
                  <Icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
