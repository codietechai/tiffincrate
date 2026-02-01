import { TReview } from "@/types";
import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Review Service Class (for direct API calls)
export class ReviewService {
  static async fetchReviews(payload: {
    id?: string;
    providerId?: string;
    consumerId?: string;
    ratingFilter?: string;
    reviewType?: string;
    sortBy?: string;
    sortOrder?: string;
    role?: string;
    limit?: string;
    page?: string;
    search?: string;
    verified?: boolean;
  }): Promise<{
    data: TReview[];
    pagination?: any;
    message: string;
    providers?: any;
    stats?: any;
  }> {
    const params: Record<string, string | undefined> = {};

    // Handle providerId (backward compatibility)
    if (payload.id) params.providerId = payload.id;
    if (payload.providerId) params.providerId = payload.providerId;
    if (payload.consumerId) params.consumerId = payload.consumerId;

    // Rating and review type filters
    if (payload.ratingFilter && payload.ratingFilter !== "all") {
      params.rating = payload.ratingFilter;
    }
    if (payload.reviewType && payload.reviewType !== "all") {
      params.reviewType = payload.reviewType;
    }

    // Sorting
    if (payload.sortBy) params.sort = payload.sortBy;

    // Pagination
    if (payload.limit) params.limit = payload.limit;
    if (payload.page) params.page = payload.page;

    // Search
    if (payload.search) params.search = payload.search;

    // Verification filter
    if (payload.verified !== undefined) {
      params.sort = payload.verified ? "verified" : "latest";
    }

    const endpoint = payload.role === "admin" ? ROUTES.ADMIN.REVIEWS : ROUTES.REVIEW.BASE;
    const url = buildApiUrl(endpoint, params);

    return httpClient.get(url);
  }

  static async createReview(payload: {
    providerId: string;
    orderId?: string;
    rating: number;
    comment?: string;
    reviewType?: string;
  }): Promise<{
    data: TReview;
    message: string;
  }> {
    return httpClient.post(ROUTES.REVIEW.BASE, payload);
  }

  static async updateReview(id: string, payload: {
    rating?: number;
    comment?: string;
    reviewType?: string;
  }): Promise<{
    data: TReview;
    message: string;
  }> {
    return httpClient.put(`${ROUTES.REVIEW.BASE}/${id}`, payload);
  }

  static async deleteReview(id: string): Promise<{
    message: string;
  }> {
    return httpClient.delete(`${ROUTES.ADMIN.REVIEWS}/${id}`);
  }

  static async fetchReviewsByProvider(providerId: string): Promise<{
    data: TReview[];
    message: string;
    stats?: any;
  }> {
    const url = buildApiUrl(ROUTES.REVIEW.BASE, { providerId });
    return httpClient.get(url);
  }

  static async fetchReviewsByUser(userId: string): Promise<{
    data: TReview[];
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.REVIEW.BASE, { consumerId: userId });
    return httpClient.get(url);
  }

  static async fetchReviewsByOrder(orderId: string): Promise<{
    data: TReview[];
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.REVIEW.BASE, { orderId });
    return httpClient.get(url);
  }
}

// React Query Hooks for Review
export const useReviews = (payload: {
  id?: string;
  providerId?: string;
  consumerId?: string;
  ratingFilter?: string;
  reviewType?: string;
  sortBy?: string;
  sortOrder?: string;
  role?: string;
  limit?: string;
  page?: string;
  search?: string;
  verified?: boolean;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.REVIEW.ALL, payload],
    queryFn: () => ReviewService.fetchReviews(payload),
  });
};

export const useReviewsByProvider = (providerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEW.BY_PROVIDER(providerId),
    queryFn: () => ReviewService.fetchReviewsByProvider(providerId),
    enabled: !!providerId,
  });
};

export const useReviewsByUser = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEW.BY_USER(userId),
    queryFn: () => ReviewService.fetchReviewsByUser(userId),
    enabled: !!userId,
  });
};

export const useReviewsByOrder = (orderId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEW.BY_ORDER(orderId),
    queryFn: () => ReviewService.fetchReviewsByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ReviewService.createReview,
    onSuccess: (_, variables) => {
      // Invalidate review-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEW.ALL });
      if (variables.providerId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEW.BY_PROVIDER(variables.providerId)
        });
      }
      if (variables.orderId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.REVIEW.BY_ORDER(variables.orderId)
        });
      }
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      ReviewService.updateReview(id, payload),
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEW.ALL });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ReviewService.deleteReview,
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEW.ALL });
    },
  });
};
