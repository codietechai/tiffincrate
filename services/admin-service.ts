import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Admin Service Class (for direct API calls)
export class AdminService {
    // Order Management
    static async fetchAdminOrders(params?: {
        page?: number;
        limit?: number;
        status?: string;
        providerId?: string;
        customerId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: any[];
        pagination?: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ADMIN.ORDERS, {
            page: params?.page?.toString(),
            limit: params?.limit?.toString(),
            status: params?.status,
            providerId: params?.providerId,
            customerId: params?.customerId,
            startDate: params?.startDate,
            endDate: params?.endDate,
        });

        return httpClient.get(url);
    }

    static async fetchAdminOrder(id: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.get(ROUTES.ADMIN.ORDER_BY_ID(id));
    }

    static async updateAdminOrderStatus(id: string, status: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(ROUTES.ADMIN.ORDER_STATUS(id), { status });
    }

    // Provider Management
    static async fetchAdminProviders(params?: {
        page?: number;
        limit?: number;
        status?: string;
        verified?: boolean;
        businessType?: string;
    }): Promise<{
        data: any[];
        pagination?: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ADMIN.PROVIDERS, {
            page: params?.page?.toString(),
            limit: params?.limit?.toString(),
            status: params?.status,
            verified: params?.verified?.toString(),
            businessType: params?.businessType,
        });

        return httpClient.get(url);
    }

    static async fetchAdminProvider(id: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.get(ROUTES.ADMIN.PROVIDER_BY_ID(id));
    }

    static async updateAdminProvider(id: string, payload: any): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(ROUTES.ADMIN.PROVIDER_BY_ID(id), payload);
    }

    static async verifyProvider(id: string, verified: boolean): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(ROUTES.ADMIN.PROVIDER_VERIFY(id), { verified });
    }

    // User Management
    static async fetchAdminUsers(params?: {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        verified?: boolean;
    }): Promise<{
        data: any[];
        pagination?: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ADMIN.USERS, {
            page: params?.page?.toString(),
            limit: params?.limit?.toString(),
            role: params?.role,
            status: params?.status,
            verified: params?.verified?.toString(),
        });

        return httpClient.get(url);
    }

    static async fetchAdminUser(id: string): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.get(ROUTES.ADMIN.USER_BY_ID(id));
    }

    static async updateAdminUser(id: string, payload: any): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(ROUTES.ADMIN.USER_BY_ID(id), payload);
    }

    static async deleteAdminUser(id: string): Promise<{
        message: string;
    }> {
        return httpClient.delete(ROUTES.ADMIN.USER_BY_ID(id));
    }

    // Reports
    static async fetchAdminReports(params?: {
        type?: string;
        period?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ADMIN.REPORTS, {
            type: params?.type,
            period: params?.period,
            startDate: params?.startDate,
            endDate: params?.endDate,
        });

        return httpClient.get(url);
    }

    // Reviews Management
    static async fetchAdminReviews(params?: {
        page?: number;
        limit?: number;
        rating?: string;
        providerId?: string;
        verified?: boolean;
    }): Promise<{
        data: any[];
        pagination?: any;
        message: string;
    }> {
        const url = buildApiUrl(ROUTES.ADMIN.REVIEWS, {
            page: params?.page?.toString(),
            limit: params?.limit?.toString(),
            rating: params?.rating,
            providerId: params?.providerId,
            verified: params?.verified?.toString(),
        });

        return httpClient.get(url);
    }

    static async deleteAdminReview(id: string): Promise<{
        message: string;
    }> {
        return httpClient.delete(`${ROUTES.ADMIN.REVIEWS}/${id}`);
    }

    static async verifyReview(id: string, verified: boolean): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(`${ROUTES.ADMIN.REVIEWS}/${id}/verify`, { verified });
    }
}

// React Query Hooks for Admin
export const useAdminOrders = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    providerId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.ADMIN.ORDERS, params],
        queryFn: () => AdminService.fetchAdminOrders(params),
    });
};

export const useAdminOrder = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN.ORDER_BY_ID(id),
        queryFn: () => AdminService.fetchAdminOrder(id),
        enabled: !!id,
    });
};

export const useAdminProviders = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    verified?: boolean;
    businessType?: string;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.ADMIN.PROVIDERS, params],
        queryFn: () => AdminService.fetchAdminProviders(params),
    });
};

export const useAdminProvider = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN.PROVIDER_BY_ID(id),
        queryFn: () => AdminService.fetchAdminProvider(id),
        enabled: !!id,
    });
};

export const useAdminUsers = (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    verified?: boolean;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.ADMIN.USERS, params],
        queryFn: () => AdminService.fetchAdminUsers(params),
    });
};

export const useAdminUser = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN.USER_BY_ID(id),
        queryFn: () => AdminService.fetchAdminUser(id),
        enabled: !!id,
    });
};

export const useAdminReports = (params?: {
    type?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN.REPORTS,
        queryFn: () => AdminService.fetchAdminReports(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useAdminReviews = (params?: {
    page?: number;
    limit?: number;
    rating?: string;
    providerId?: string;
    verified?: boolean;
}) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.ADMIN.REVIEWS, params],
        queryFn: () => AdminService.fetchAdminReviews(params),
    });
};

// Mutations
export const useUpdateAdminOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            AdminService.updateAdminOrderStatus(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.ORDERS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.ORDER_BY_ID(id) });
        },
    });
};

export const useUpdateAdminProvider = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            AdminService.updateAdminProvider(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.PROVIDERS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.PROVIDER_BY_ID(id) });
        },
    });
};

export const useVerifyProvider = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
            AdminService.verifyProvider(id, verified),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.PROVIDERS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.PROVIDER_BY_ID(id) });
        },
    });
};

export const useUpdateAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            AdminService.updateAdminUser(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USER_BY_ID(id) });
        },
    });
};

export const useDeleteAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: AdminService.deleteAdminUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.USERS });
        },
    });
};

export const useDeleteAdminReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: AdminService.deleteAdminReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.REVIEWS });
        },
    });
};

export const useVerifyReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
            AdminService.verifyReview(id, verified),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.REVIEWS });
        },
    });
};