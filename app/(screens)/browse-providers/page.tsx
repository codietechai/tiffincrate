"use client";
import { useEffect, useState } from "react";
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
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Search, MapPin, Star, ChefHat, Heart, TrendingUp } from "lucide-react";
import { CheifHatIcon } from "@/components/common/icons";
import FilterDrawer from "@/components/screens/home/provider/filter-drawer";
import {
  TFetchProvidersResponse,
  TProvider,
  TProviderQueryData,
} from "@/types";
import { ProviderService } from "@/services/provider-service";
import { Skeleton } from "@/components/ui/skeleton";
import TitleHeader from "@/components/common/title-header";

export default function BrowseProvidersPage() {
  const [providers, setProviders] = useState<TFetchProvidersResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [queryData, setQueryData] = useState<TProviderQueryData>({
    area: "all",
    cuisine: "all",
    sorting: "",
    page: 1,
    limit: 10,
    search: "",
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchProviders();
    fetchFavorites();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await ProviderService.fetchProviders(queryData);
      setProviders(data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites.map((fav: any) => fav._id));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (providerId: string) => {
    if (!user || user.role !== "consumer") return;

    try {
      const isFavorite = favorites.includes(providerId);

      if (isFavorite) {
        const response = await fetch(
          `/api/favorites?providerId=${providerId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setFavorites((prev) => prev.filter((id) => id !== providerId));
        }
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ providerId }),
        });
        if (response.ok) {
          setFavorites((prev) => [...prev, providerId]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-xl lg:max-w-4xl mx-auto px-4 py-4">
        <TitleHeader
          icon={<CheifHatIcon />}
          title="Browse Tiffin Providers"
          description="Discover delicious home-cooked meals from local providers"
        />
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search providers, cuisine, or dishes..."
            value={queryData.search}
            onChange={(e) =>
              setQueryData((prev) => {
                return {
                  ...prev,
                  search: e.target.value,
                };
              })
            }
            className="pl-10"
          />
        </div>
        <div className="my-3 flex justify-between items-center">
          <h3 className="font-semibold">Filters</h3>
          <FilterDrawer filters={queryData} setFilters={setQueryData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => <Skeleton className="h-[420px]" />)
            : providers?.data.map((provider) => (
                <Card
                  key={provider._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {provider.businessName}
                          {provider.isVerified && (
                            <Badge variant="default" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          by {provider?.userId?.name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {provider.rating.toFixed(1)}
                          </span>
                        </div>
                        {user?.role === "consumer" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(provider._id)}
                            className="p-1"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                favorites.includes(provider._id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400"
                              }`}
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {provider.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {provider.cuisine.slice(0, 3).map((c, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {c}
                            </Badge>
                          ))}
                          {provider.cuisine.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{provider.cuisine.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {provider.deliveryAreas.slice(0, 2).join(", ")}
                          {provider.deliveryAreas.length > 2 &&
                            ` +${provider.deliveryAreas.length - 2} more`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {provider.totalOrders} orders completed
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link href={`/new-provider/${provider._id}`}>
                        <Button className="w-full">View Tiffins</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {providers?.data?.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
