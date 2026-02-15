import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS, getRelatedQueryKeys } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Delivery Service Class (for direct API calls)
export class DeliveryService {
    static async fetchDeliveryOrders(params?: {
        page?: number;
        limit?: number;
        status?: string;
        providerId?: string;
        date?: string;
        timeSlot?: string;
    }): Promise<{
        data: any[];
        pagination?: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.DELIVERY_ORDER.BASE, {
            page: params?.page?.toString(),
            limit: params?.limit?.toString(),
            status: params?.status,
            providerId: params?.providerId,
            date: params?.date,
            timeSlot: params?.timeSlot,
        });

        return httpClient.get(url);
    }

    static async fetchUpcomingDeliveries(): Promise<{
        data: any[];
        message: string;
    }> {
        return httpClient.get(ROUTES.DELIVERY_ORDER.UPCOMING);
    }

    static async fetchDeliveryOrdersByProvider(providerId: string): Promise<{
        data: any[];
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.DELIVERY_ORDER.BASE, { providerId });
        return httpClient.get(url);
    }

    static async fetchDeliveryOrdersByDate(date: string): Promise<{
        data: any[];
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.DELIVERY_ORDER.BASE, { date });
        return httpClient.get(url);
    }

    static async fetchTodayDeliveries(): Promise<{
        data: any[];
        message: string;
    }> {
        const today = new Date().toISOString().split('T')[0];
        return this.fetchDeliveryOrdersByDate(today);
    }

    static async updateDeliveryStatus(deliveryOrderId: string, status: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(`${ROUTES.DELIVERY_ORDER.BASE}/${deliveryOrderId}/status`, { status });
    }

    static async assignDelivery(deliveryOrderId: string, providerId: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(`${ROUTES.DELIVERY_ORDER.BASE}/${deliveryOrderId}/assign`, { providerId });
    }

    static async startDelivery(deliveryOrderId: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(`${ROUTES.DELIVERY_ORDER.BASE}/${deliveryOrderId}/start`, {});
    }

    static async completeDelivery(deliveryOrderId: string, completionData?: {
        deliveredAt?: string;
        notes?: string;
        customerSignature?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(`${ROUTES.DELIVERY_ORDER.BASE}/${deliveryOrderId}/complete`, completionData);
    }
}

// React Query Hooks for Delivery
export const useDeliveryOrders = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    providerId?: string;
    date?: string;
    timeSlot?: string;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.DELIVERY_ORDER.ALL, params],
        queryFn: () => DeliveryService.fetchDeliveryOrders(params),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useUpcomingDeliveries = () => {
    return useQuery({
        queryKey: QUERY_KEYS.DELIVERY_ORDER.UPCOMING,
        queryFn: DeliveryService.fetchUpcomingDeliveries,
        refetchInterval: 15000, // Refetch every 15 seconds for upcoming deliveries
    });
};

export const useDeliveryOrdersByProvider = (providerId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.DELIVERY_ORDER.BY_PROVIDER(providerId),
        queryFn: () => DeliveryService.fetchDeliveryOrdersByProvider(providerId),
        enabled: !!providerId,
        refetchInterval: 30000,
    });
};

export const useDeliveryOrdersByDate = (date: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.DELIVERY_ORDER.BY_DATE(date),
        queryFn: () => DeliveryService.fetchDeliveryOrdersByDate(date),
        enabled: !!date,
        refetchInterval: 30000,
    });
};

export const useTodayDeliveries = () => {
    return useQuery({
        queryKey: QUERY_KEYS.DELIVERY_ORDER.TODAY,
        queryFn: DeliveryService.fetchTodayDeliveries,
        refetchInterval: 15000, // Refetch every 15 seconds for today's deliveries
    });
};

export const useUpdateDeliveryStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ deliveryOrderId, status }: { deliveryOrderId: string; status: string }) =>
            DeliveryService.updateDeliveryStatus(deliveryOrderId, status),
        onSuccess: () => {
            // Invalidate delivery-related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.UPCOMING });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.TODAY });

            // Also invalidate order-related queries since delivery status affects orders
            const relatedKeys = getRelatedQueryKeys('order');
            relatedKeys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
    });
};

export const useAssignDelivery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ deliveryOrderId, providerId }: { deliveryOrderId: string; providerId: string }) =>
            DeliveryService.assignDelivery(deliveryOrderId, providerId),
        onSuccess: () => {
            // Invalidate delivery-related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.UPCOMING });
        },
    });
};

export const useStartDelivery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: DeliveryService.startDelivery,
        onSuccess: () => {
            // Invalidate delivery-related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.UPCOMING });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.TODAY });
        },
    });
};

export const useCompleteDelivery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ deliveryOrderId, completionData }: {
            deliveryOrderId: string;
            completionData?: any
        }) => DeliveryService.completeDelivery(deliveryOrderId, completionData),
        onSuccess: () => {
            // Invalidate delivery-related queries
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.UPCOMING });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DELIVERY_ORDER.TODAY });

            // Also invalidate order-related queries
            const relatedKeys = getRelatedQueryKeys('order');
            relatedKeys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
    });
};