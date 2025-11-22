import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@radix-ui/react-dropdown-menu";

export function MenuItemDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-32 animate-pulse">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <Card className="rounded-none overflow-hidden">
          {/* Image */}
          <Skeleton className="w-full aspect-[16/10]" />

          <div className="p-6 space-y-6">
            {/* Title + Description */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Separator />

            {/* Weekly Menu Items */}
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Delivery Form */}
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-md" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>

              {/* Button */}
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
