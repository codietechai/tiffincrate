import { THelpRequest } from "@/types";
import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS, getRelatedQueryKeys } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Help Request Service Class (for direct API calls)
export class HelpRequestService {
  static async fetchHelpRequest(requestId: string): Promise<{
    data: THelpRequest;
    message: string;
  }> {
    return httpClient.get(ROUTES.HELP_REQUEST.BY_ID(requestId));
  }

  static async fetchHelpRequests(payload: {
    statusFilter?: string;
    typeFilter?: string;
    categoryFilter?: string;
    priorityFilter?: string;
    assignedToFilter?: string;
    search?: string;
    limit?: string;
    page?: string;
  }): Promise<{
    data: THelpRequest[];
    pagination: any;
    stats?: any;
    message: string;
  }> {
    const params: Record<string, string | undefined> = {};

    if (payload.statusFilter && payload.statusFilter !== "all") {
      params.status = payload.statusFilter;
    }
    if (payload.typeFilter && payload.typeFilter !== "all") {
      params.type = payload.typeFilter;
    }
    if (payload.categoryFilter && payload.categoryFilter !== "all") {
      params.category = payload.categoryFilter;
    }
    if (payload.priorityFilter && payload.priorityFilter !== "all") {
      params.priority = payload.priorityFilter;
    }
    if (payload.assignedToFilter && payload.assignedToFilter !== "all") {
      params.assignedTo = payload.assignedToFilter;
    }
    if (payload.search) {
      params.search = payload.search;
    }
    if (payload.limit) {
      params.limit = payload.limit;
    }
    if (payload.page) {
      params.page = payload.page;
    }

    const url = buildApiUrl(ROUTES.HELP_REQUEST.BASE, params);
    return httpClient.get(url);
  }

  static async createHelpRequest(payload: {
    toUserId?: string;
    type: "admin_support" | "provider_support" | "consumer_to_provider";
    subject: string;
    message: string;
    priority?: "low" | "medium" | "high" | "urgent";
    category?: "technical" | "billing" | "order" | "account" | "general" | "delivery" | "payment";
    attachments?: string[];
    tags?: string[];
    relatedOrderId?: string;
  }): Promise<{
    data: THelpRequest;
    message: string;
  }> {
    // Clean up payload for admin/provider support requests
    const cleanPayload = { ...payload };
    if (payload.type === "admin_support" || payload.type === "provider_support") {
      delete cleanPayload.toUserId;
    }

    return httpClient.post(ROUTES.HELP_REQUEST.BASE, cleanPayload);
  }

  static async updateHelpRequest(
    requestId: string,
    response: any
  ): Promise<{
    data: THelpRequest;
    message: string;
  }> {
    return httpClient.patch(ROUTES.HELP_REQUEST.BY_ID(requestId), response);
  }

  static async deleteHelpRequest(requestId: string): Promise<{
    message: string;
  }> {
    return httpClient.delete(ROUTES.HELP_REQUEST.BY_ID(requestId));
  }

  static async fetchCustomerProviders(): Promise<{
    data: any[];
    message: string;
  }> {
    return httpClient.get(ROUTES.HELP_REQUEST.CUSTOMER_PROVIDERS);
  }

  static async assignHelpRequest(requestId: string, assigneeId: string): Promise<{
    data: THelpRequest;
    message: string;
  }> {
    return httpClient.patch(ROUTES.HELP_REQUEST.BY_ID(requestId), {
      assignedTo: assigneeId,
      status: "in_progress"
    });
  }

  static async closeHelpRequest(requestId: string, resolution: string): Promise<{
    data: THelpRequest;
    message: string;
  }> {
    return httpClient.patch(ROUTES.HELP_REQUEST.BY_ID(requestId), {
      status: "resolved",
      resolution,
      resolvedAt: new Date().toISOString()
    });
  }
}

// React Query Hooks for Help Request
export const useHelpRequests = (payload: {
  statusFilter?: string;
  typeFilter?: string;
  categoryFilter?: string;
  priorityFilter?: string;
  assignedToFilter?: string;
  search?: string;
  limit?: string;
  page?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.HELP_REQUEST.ALL, payload],
    queryFn: () => HelpRequestService.fetchHelpRequests(payload),
  });
};

export const useHelpRequest = (requestId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.HELP_REQUEST.BY_ID(requestId),
    queryFn: () => HelpRequestService.fetchHelpRequest(requestId),
    enabled: !!requestId,
  });
};

export const useUserHelpRequests = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.HELP_REQUEST.BY_USER(userId),
    queryFn: () => HelpRequestService.fetchHelpRequests({}),
    enabled: !!userId,
  });
};

export const useCustomerProviders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.HELP_REQUEST.CUSTOMER_PROVIDERS,
    queryFn: HelpRequestService.fetchCustomerProviders,
  });
};

export const useCreateHelpRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: HelpRequestService.createHelpRequest,
    onSuccess: () => {
      // Invalidate help request queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.ALL });
    },
  });
};

export const useUpdateHelpRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, response }: { requestId: string; response: any }) =>
      HelpRequestService.updateHelpRequest(requestId, response),
    onSuccess: (_, { requestId }) => {
      // Invalidate help request queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.BY_ID(requestId) });
    },
  });
};

export const useDeleteHelpRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: HelpRequestService.deleteHelpRequest,
    onSuccess: () => {
      // Invalidate help request queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.ALL });
    },
  });
};

export const useAssignHelpRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, assigneeId }: { requestId: string; assigneeId: string }) =>
      HelpRequestService.assignHelpRequest(requestId, assigneeId),
    onSuccess: (_, { requestId }) => {
      // Invalidate help request queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.BY_ID(requestId) });
    },
  });
};

export const useCloseHelpRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, resolution }: { requestId: string; resolution: string }) =>
      HelpRequestService.closeHelpRequest(requestId, resolution),
    onSuccess: (_, { requestId }) => {
      // Invalidate help request queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HELP_REQUEST.BY_ID(requestId) });
    },
  });
};
