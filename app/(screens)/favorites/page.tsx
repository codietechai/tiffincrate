"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Heart, Star, ChefHat, MapPin, TrendingUp, Trash2 } from "lucide-react";
import TitleHeader from "@/components/common/title-header";
import { ElseComponent } from "@/components/common/else-component";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceProvider {
  _id: string;
  businessName: string;
  description: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  userId: {
    name: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchFavorites();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "consumer") {
          router.push("/");
          return;
        }
        setUser(data.data);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (providerId: string) => {
    try {
      const response = await fetch(`/api/favorites?providerId=${providerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((fav) => fav._id !== providerId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl lg:max-w-4xl px-4 py-4 mx-auto">
        <TitleHeader
          title="My Favorite Providers"
          icon={<Heart />}
          description="Your saved tiffin providers for quick access"
        />
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => <Skeleton className="h-[283px]" />)
              : favorites.map((provider) => (
                  <Card
                    key={provider._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-0">
                            {provider.businessName}
                            {provider.isVerified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            by {provider.userId.name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {provider.rating.toFixed(1)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(provider._id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/providers/${provider._id}`}
                          className="flex-1"
                        >
                          <Button className="w-full">View Menu</Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFavorite(provider._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        ) : (
          <ElseComponent
            button={
              <Button asChild>
                <Link href="/browse-providers">Browse Providers</Link>
              </Button>
            }
            description="Start exploring providers and add them to your favorites for quick access"
            heading="No favorites yet"
            icon={<Heart />}
          />
        )}
      </div>
    </div>
  );
}
