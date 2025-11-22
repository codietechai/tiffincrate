"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Search, Star, Trash2 } from "lucide-react";
import { TProvider, TReview } from "@/types";

export default function ReviewsPage() {
  const router = useRouter();

  // ✔ State
  const [reviews, setReviews] = useState<TReview[]>([]);
  const [providers, setProviders] = useState<TProvider[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✔ Debounce search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✔ Filters
  const [filters, setFilters] = useState({
    provider: "all",
    rating: "all",
    sort: "newest",
  });

  // ✔ Expand comment
  const [expanded, setExpanded] = useState<any>({});

  // ------------------------------
  // AUTH CHECK
  // ------------------------------
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  // ------------------------------
  // DEBOUNCE SEARCH EFFECT
  // ------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ------------------------------
  // FETCH REVIEWS WITH FILTERS
  // ------------------------------
  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.provider !== "all")
        params.append("providerId", filters.provider);
      if (filters.rating !== "all") params.append("rating", filters.rating);

      // SORT
      if (filters.sort === "newest") params.append("sort", "createdAt-desc");
      if (filters.sort === "oldest") params.append("sort", "createdAt-asc");
      if (filters.sort === "highest") params.append("sort", "rating-desc");
      if (filters.sort === "lowest") params.append("sort", "rating-asc");

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();

      setReviews(data.data || []);
      setProviders(data.providers || []);
      setLoading(false);
    };

    fetchReviews();
  }, [user]);

  // ------------------------------
  // DELETE REVIEW
  // ------------------------------
  const deleteReview = async (id: string) => {
    if (!confirm("Delete review?")) return;
    await fetch(`/api/review/${id}`, { method: "DELETE" });

    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  // ------------------------------
  // Expand comment
  // ------------------------------
  const toggleExpand = (id: string) => {
    setExpanded((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  // ------------------------------
  // RETURN UI
  // ------------------------------

  const stats = {
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0,
  };

  return (
    <div className="min-h-screen ">
      <Navbar />

      <div className="max-w-7xl  mx-auto bg-white rounded-2xl shadow-xl p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            What our customers say
          </h2>
          <p className="mt-1 text-gray-600">
            <span className="text-green-600 font-semibold">
              {stats?.averageRating?.toFixed(1) || "0.0"}
            </span>
            <span> rating out of </span>
            <span className="font-semibold">{stats?.totalReviews || 0}</span>
            <span className="text-gray-500"> reviews</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10 w-60 bg-gray-50"
            />
          </div>

          {/* Provider Filter */}
          {user?.role === "admin" && (
            <Select
              value={filters.provider}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger className="w-44 bg-gray-50">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Rating Filter */}
          <Select
            value={filters.rating}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, rating: value }))
            }
          >
            <SelectTrigger className="w-36 bg-gray-50">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sort: value }))
            }
          >
            <SelectTrigger className="w-40 bg-gray-50">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear */}
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                search: "",
                provider: "all",
                rating: "all",
                sort: "newest",
              })
            }
            className="bg-gray-50"
          >
            Clear
          </Button>
        </div>

        {/* ----------------- */}
        {/*     SKELETON     */}
        {/* ----------------- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="p-5 border rounded-xl shadow-sm animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>

                    <div className="h-3 bg-gray-200 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* ----------------- */
          /*   REAL REVIEWS     */
          /* ----------------- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card
                key={review._id}
                className="p-5 border rounded-xl shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <img
                    src={
                      review.consumerId?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        review.consumerId?.name || "User"
                      )}`
                    }
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">{review.consumerId.name}</h3>

                    {/* Stars */}
                    <div className="flex items-center mt-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-700">
                        {review.rating}.0
                      </span>
                    </div>

                    {/* Comment */}
                    <p
                      className={`text-sm text-gray-700 ${
                        expanded[review._id] ? "" : "line-clamp-3"
                      }`}
                    >
                      {review.comment}
                    </p>

                    {review.comment.length > 120 && (
                      <button
                        className="text-blue-600 text-sm mt-1"
                        onClick={() => toggleExpand(review._id)}
                      >
                        {expanded[review._id] ? "See less" : "See more"}
                      </button>
                    )}

                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>

                      {user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => deleteReview(review._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
