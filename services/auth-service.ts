import { TUser } from "@/types";
import { httpClient } from "@/lib/http-client";
import { API_ROUTES } from "@/constants/api-routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Auth Service Class (for direct API calls)
export class AuthService {
  static async checkAuth(): Promise<{ data: TUser | null; message: string }> {
    return httpClient.get(API_ROUTES.AUTH.ME);
  }

  static async signin(data: {
    email: string;
    password: string;
  }): Promise<{ user: TUser; message: string }> {
    return httpClient.post(API_ROUTES.AUTH.LOGIN, data);
  }

  static async signup(data: unknown): Promise<{ user: TUser; message: string }> {
    return httpClient.post(API_ROUTES.AUTH.REGISTER, data);
  }

  static async logoutAllDevices(): Promise<{ message: string }> {
    return httpClient.post(API_ROUTES.AUTH.LOGOUT_ALL);
  }

  static async deleteAccount(): Promise<{ message: string }> {
    return httpClient.delete(API_ROUTES.AUTH.DELETE_ACCOUNT);
  }
}

// React Query Hooks for Auth
export const useAuthCheck = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: AuthService.checkAuth,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSignin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.signin,
    onSuccess: (data) => {
      // Update the auth cache with the new user data
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, {
        data: data.user,
        message: data.message,
      });
    },
    onError: (error) => {
      // Clear auth cache on login error
      queryClient.removeQueries({ queryKey: QUERY_KEYS.AUTH.ME });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.signup,
    onSuccess: (data) => {
      // Update the auth cache with the new user data
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, {
        data: data.user,
        message: data.message,
      });
    },
  });
};

export const useLogoutAllDevices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.logoutAllDevices,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.deleteAccount,
    onSuccess: () => {
      // Clear all cached data on account deletion
      queryClient.clear();
    },
  });
};
