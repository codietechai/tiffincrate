import { IOrder } from "@/models/Order";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS, getRelatedQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Order Service Class (for direct API calls)
export class OrderService {
  static async placeOrder(data: any): Promise<{ data: IOrder; message: string }> {
    return httpClient.post(ROUTES.ORDER.BASE, data);
  }

  static async fetchOrders(): Promise<{ data: IOrder[]; message: string }> {
    return httpClient.get(ROUTES.ORDER.BASE);
  }

  static async fetchOrder(id: string): Promise<{ data: IOrder; message: string }> {
    return httpClient.get(ROUTES.ORDER.BY_ID(id));
  }

  static async updateOrderStatus(id: string, status: string): Promise<{ data: IOrder; message: string }> {
    return httpClient.put(ROUTES.ORDER.STATUS(id), { status });
  }

  static async trackOrder(id: string): Promise<{ data: any; message: string }> {
    return httpClient.get(ROUTES.ORDER.TRACK(id));
  }

  static async fetchTodayOrders(): Promise<{ data: IOrder[]; message: string }> {
    return httpClient.get(ROUTES.ORDER.TODAY);
  }

  static async bulkUpdateStatus(orderIds: string[], status: string): Promise<{ message: string }> {
    return httpClient.post(ROUTES.ORDER.BULK_STATUS, { orderIds, status });
  }

  static async calculateETA(orderId: string): Promise<{ data: any; message: string }> {
    return httpClient.post(ROUTES.ORDER.CALCULATE_ETA, { orderId });
  }

  static async getLiveUpdates(): Promise<{ data: any[]; message: string }> {
    return httpClient.get(ROUTES.ORDER.LIVE_UPDATES);
  }
}

// React Query Hooks for Order
export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER.ALL,
    queryFn: OrderService.fetchOrders,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER.BY_ID(id),
    queryFn: () => OrderService.fetchOrder(id),
    enabled: !!id,
  });
};

export const useTodayOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER.TODAY,
    queryFn: OrderService.fetchTodayOrders,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useTrackOrder = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER.TRACK(id),
    queryFn: () => OrderService.trackOrder(id),
    enabled: !!id,
    refetchInterval: 10000, // Refetch every 10 seconds for live tracking
  });
};

export const useLiveOrderUpdates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER.LIVE_UPDATES,
    queryFn: OrderService.getLiveUpdates,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
};

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: OrderService.placeOrder,
    onSuccess: () => {
      // Invalidate and refetch order-related queries
      const relatedKeys = getRelatedQueryKeys('order');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      OrderService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch order-related queries
      const relatedKeys = getRelatedQueryKeys('order', id);
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[]; status: string }) =>
      OrderService.bulkUpdateStatus(orderIds, status),
    onSuccess: () => {
      // Invalidate and refetch order-related queries
      const relatedKeys = getRelatedQueryKeys('order');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useCalculateETA = () => {
  return useMutation({
    mutationFn: OrderService.calculateETA,
  });
};
