import { httpClient } from "@/lib/http-client";
import { API_ROUTES, buildApiUrl } from "@/constants/api-routes";
import { QUERY_KEYS, getRelatedQueryKeys } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define TNotification type if not already defined
interface TNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion" | "delivery";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  actionUrl?: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// Notification Service Class (for direct API calls)
export class NotificationService {
  static async fetchNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
  }): Promise<{
    data: TNotification[];
    pagination: any;
    unreadCount: number;
    filters?: any;
    message: string;
  }> {
    const url = buildApiUrl(API_ROUTES.NOTIFICATION.BASE, {
      page: params?.page?.toString(),
      limit: params?.limit?.toString(),
      unreadOnly: params?.unreadOnly ? "true" : undefined,
      type: params?.type !== "all" ? params?.type : undefined,
      priority: params?.priority !== "all" ? params?.priority : undefined,
    });

    return httpClient.get(url);
  }

  static async createNotification(payload: {
    userId: string;
    title: string;
    message: string;
    type?: "order" | "payment" | "system" | "promotion" | "delivery";
    priority?: "low" | "medium" | "high" | "urgent";
    actionUrl?: string;
    data?: any;
    expiresAt?: string;
  }): Promise<{
    notification: TNotification;
    message: string;
  }> {
    return httpClient.post(API_ROUTES.NOTIFICATION.BASE, payload);
  }

  static async markAsRead(payload: {
    id?: string[];
    notificationIds?: string[];
    markAllAsRead?: boolean;
  }): Promise<{
    message: string;
    updatedCount?: number;
  }> {
    const requestBody: any = { markAsRead: true };

    if (payload.markAllAsRead) {
      requestBody.markAllAsRead = true;
    } else if (payload.id && payload.id.length > 0) {
      requestBody.notificationIds = payload.id;
    } else if (payload.notificationIds && payload.notificationIds.length > 0) {
      requestBody.notificationIds = payload.notificationIds;
    }

    return httpClient.patch(API_ROUTES.NOTIFICATION.BASE, requestBody);
  }

  static async fetchLiveNotifications(): Promise<{
    data: TNotification[];
    message: string;
  }> {
    return httpClient.get(API_ROUTES.NOTIFICATION.LIVE);
  }

  static async deleteNotification(id: string): Promise<{
    message: string;
  }> {
    return httpClient.delete(`${API_ROUTES.NOTIFICATION.BASE}/${id}`);
  }
}

// React Query Hooks for Notification
export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATION.ALL, params],
    queryFn: () => NotificationService.fetchNotifications(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATION.UNREAD,
    queryFn: () => NotificationService.fetchNotifications({ unreadOnly: true }),
    refetchInterval: 15000, // Refetch every 15 seconds for unread notifications
  });
};

export const useLiveNotifications = () => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATION.LIVE,
    queryFn: NotificationService.fetchLiveNotifications,
    refetchInterval: 5000, // Refetch every 5 seconds for live notifications
  });
};

export const useUserNotifications = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATION.BY_USER(userId),
    queryFn: () => NotificationService.fetchNotifications(),
    enabled: !!userId,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.createNotification,
    onSuccess: () => {
      // Invalidate and refetch notification-related queries
      const relatedKeys = getRelatedQueryKeys('notification');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: () => {
      // Invalidate and refetch notification-related queries
      const relatedKeys = getRelatedQueryKeys('notification');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.deleteNotification,
    onSuccess: () => {
      // Invalidate and refetch notification-related queries
      const relatedKeys = getRelatedQueryKeys('notification');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};
