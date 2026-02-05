import { httpClient } from "@/lib/http-client";
import { API_ROUTES } from "@/constants/api-routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";

export interface AnalyticsOverview {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    changes: {
        revenue: number;
        orders: number;
        customers: number;
        avgOrder: number;
    };
}

export interface RevenueData {
    _id: string;
    revenue: number;
    orders: number;
}

export interface CategoryData {
    _id: string;
    count: number;
    revenue: number;
}

export interface TopMenu {
    _id: string;
    name: string;
    orders: number;
    revenue: number;
}

export interface DeliveryStats {
    _id: string;
    count: number;
}

export interface AnalyticsData {
    overview: AnalyticsOverview;
    charts: {
        revenue: RevenueData[];
        categories: CategoryData[];
        topMenus: TopMenu[];
        deliveryStats: DeliveryStats[];
    };
    period: string;
    provider: {
        id: string;
        name: string;
    };
}

export interface AnalyticsResponse {
    success: boolean;
    data: AnalyticsData;
    message: string;
}

// Analytics Service Class
export class AnalyticsService {
    static async fetchProviderAnalytics(params?: {
        period?: "week" | "month" | "year";
        providerId?: string;
    }): Promise<AnalyticsResponse> {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append("period", params.period);
        if (params?.providerId) queryParams.append("providerId", params.providerId);

        const url = `${API_ROUTES.ANALYTICS.PROVIDER}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        return httpClient.get(url);
    }

    static async fetchDashboardAnalytics(): Promise<AnalyticsResponse> {
        return httpClient.get(API_ROUTES.ANALYTICS.DASHBOARD);
    }
}

// React Query Hooks
export const useProviderAnalytics = (params?: {
    period?: "week" | "month" | "year";
    providerId?: string;
}) => {
    return useQuery({
        queryKey: [
            ...QUERY_KEYS.ANALYTICS.PROVIDER(params?.providerId || "current"),
            params?.period,
        ],
        queryFn: () => AnalyticsService.fetchProviderAnalytics(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });
};

export const useDashboardAnalytics = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.DASHBOARD,
        queryFn: AnalyticsService.fetchDashboardAnalytics,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });
};