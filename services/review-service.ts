import { TReview } from "@/types";

export class ReviewService {
  private static baseUrl = "/api/reviews";

  static async fetchReviews(payload: {
    id: string;
    ratingFilter?: string;
    sortBy?: string;
    sortOrder?: string;
    role?: string;
    limit?: string;
    consumerId?: string;
    page?: string;
    search?: string;
  }): Promise<{
    data: TReview[];
    message: string;
    providers?: any;
    pagination?: any;
    stats?: any;
  }> {
    try {
      const params = new URLSearchParams();
      if (payload.id) params.append("providerId", payload.id);
      if (payload.ratingFilter) params.append("rating", payload.ratingFilter);
      if (payload.sortBy) params.append("sortBy", payload.sortBy);
      if (payload.sortOrder) params.append("sortOrder", payload.sortOrder);
      if (payload.limit) params.append("limit", payload.limit);
      if (payload.consumerId) params.append("consumerId", payload.consumerId);
      if (payload.page) params.append("page", payload.page);
      if (payload.search) params.append("search", payload.search);

      const endpoint =
        payload.role === "admin" ? "/api/admin/reviews" : "/api/reviews";
      const response = await fetch(`${endpoint}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetching reviews");
      }

      const setting = await response.json();
      return setting;
    } catch (error) {
      console.log("Error fetching reviews:", error);
      throw error;
    }
  }

  static async deleteReview(id: string) {
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetching reviews");
      }

      const setting = await response.json();
      return setting;
    } catch (error) {
      console.log("Error fetching reviews:", error);
      throw error;
    }
  }
}
