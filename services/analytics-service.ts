import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";

// Analytics Service Class (for direct API calls)
export class AnalyticsService {
    static async fetchDashboardAnalytics(params?: {
        period?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ANALYTICS.DASHBOARD, {
            period: params?.period,
            startDate: params?.startDate,
            endDate: params?.endDate,
        });

        return httpClient.get(url);
    }

    static async fetchProviderAnalytics(providerId: string, params?: {
        period?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ANALYTICS.PROVIDER, {
            providerId,
            period: params?.period,
            startDate: params?.startDate,
            endDate: params?.endDate,
        });

        return httpClient.get(url);
    }

    static async fetchOrderAnalytics(period: string): Promise<{
        data: any;
        message: string;
    }> {
        // This would be a custom endpoint for order analytics
        const url = buildApiUrl(`${ROUTES.ANALYTICS.DASHBOARD}/orders`, { period });
        return httpClient.get(url);
    }

    static async fetchRevenueAnalytics(period: string): Promise<{
        data: any;
        message: string;
    }> {
        // This would be a custom endpoint for revenue analytics
        const url = buildApiUrl(`${ROUTES.ANALYTICS.DASHBOARD}/revenue`, { period });
        return httpClient.get(url);
    }

    static async fetchUserAnalytics(period: string): Promise<{
        data: any;
        message: string;
    }> {
        // This would be a custom endpoint for user analytics
        const url = buildApiUrl(`${ROUTES.ANALYTICS.DASHBOARD}/users`, { period });
        return httpClient.get(url);
    }

    static async fetchDeliveryAnalytics(period: string): Promise<{
        data: any;
        message: string;
    }> {
        // This would be a custom endpoint for delivery analytics
        const url = buildApiUrl(`${ROUTES.ANALYTICS.DASHBOARD}/delivery`, { period });
        return httpClient.get(url);
    }

    static async fetchProviderPerformance(providerId: string, period: string): Promise<{
        data: any;
        message: string;
    }> {
        const url = buildApiUrl(`${ROUTES.ANALYTICS.PROVIDER}/performance`, {
            providerId,
            period
        });
        return httpClient.get(url);
    }

    static async fetchProviderEarnings(providerId: string, period: string): Promise<{
        data: any;
        message: string;
    }> {
        const url = buildApiUrl(`${ROUTES.ANALYTICS.PROVIDER}/earnings`, {
            providerId,
            period
        });
        return httpClient.get(url);
    }

    static async fetchProviderOrderStats(providerId: string, period: string): Promise<{
        data: any;
        message: string;
    }> {
        const url = buildApiUrl(`${ROUTES.ANALYTICS.PROVIDER}/orders`, {
            providerId,
            period
        });
        return httpClient.get(url);
    }
}

// React Query Hooks for Analytics
export const useDashboardAnalytics = (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.ANALYTICS.DASHBOARD, params],
        queryFn: () => AnalyticsService.fetchDashboardAnalytics(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useProviderAnalytics = (providerId: string, params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.ANALYTICS.PROVIDER(providerId), params],
        queryFn: () => AnalyticsService.fetchProviderAnalytics(providerId, params),
        enabled: !!providerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useOrderAnalytics = (period: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.ORDERS(period),
        queryFn: () => AnalyticsService.fetchOrderAnalytics(period),
        enabled: !!period,
        staleTime: 5 * 60 * 1000,
    });
};

export const useRevenueAnalytics = (period: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.ANALYTICS.REVENUE(period),
        queryFn: () => AnalyticsService.fetchRevenueAnalytics(period),
        enabled: !!period,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserAnalytics = (period: string) => {
    return useQuery({
        queryKey: ['analytics', 'users', period],
        queryFn: () => AnalyticsService.fetchUserAnalytics(period),
        enabled: !!period,
        staleTime: 5 * 60 * 1000,
    });
};

export const useDeliveryAnalytics = (period: string) => {
    return useQuery({
        queryKey: ['analytics', 'delivery', period],
        queryFn: () => AnalyticsService.fetchDeliveryAnalytics(period),
        enabled: !!period,
        staleTime: 5 * 60 * 1000,
    });
};

export const useProviderPerformance = (providerId: string, period: string) => {
    return useQuery({
        queryKey: ['analytics', 'provider', 'performance', providerId, period],
        queryFn: () => AnalyticsService.fetchProviderPerformance(providerId, period),
        enabled: !!(providerId && period),
        staleTime: 5 * 60 * 1000,
    });
};

export const useProviderEarnings = (providerId: string, period: string) => {
    return useQuery({
        queryKey: ['analytics', 'provider', 'earnings', providerId, period],
        queryFn: () => AnalyticsService.fetchProviderEarnings(providerId, period),
        enabled: !!(providerId && period),
        staleTime: 5 * 60 * 1000,
    });
};

export const useProviderOrderStats = (providerId: string, period: string) => {
    return useQuery({
        queryKey: ['analytics', 'provider', 'order-stats', providerId, period],
        queryFn: () => AnalyticsService.fetchProviderOrderStats(providerId, period),
        enabled: !!(providerId && period),
        staleTime: 5 * 60 * 1000,
    });
};