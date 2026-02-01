import { TSettings } from "@/types";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Settings Service Class (for direct API calls)
export class SettingsService {
  static async fetchSettings(): Promise<{ data: TSettings; message: string }> {
    return httpClient.get(ROUTES.SETTINGS.BASE);
  }

  static async updateSettings(
    payload: TSettings
  ): Promise<{ data: TSettings; message: string }> {
    return httpClient.put(ROUTES.SETTINGS.BASE, payload);
  }

  static async fetchUserSettings(userId: string): Promise<{ data: any; message: string }> {
    // This would be a custom endpoint for user-specific settings
    return httpClient.get(`${ROUTES.SETTINGS.BASE}/user/${userId}`);
  }

  static async updateUserSettings(userId: string, payload: any): Promise<{ data: any; message: string }> {
    return httpClient.put(`${ROUTES.SETTINGS.BASE}/user/${userId}`, payload);
  }

  static async fetchProviderSettings(providerId: string): Promise<{ data: any; message: string }> {
    // This would be a custom endpoint for provider-specific settings
    return httpClient.get(`${ROUTES.SETTINGS.BASE}/provider/${providerId}`);
  }

  static async updateProviderSettings(providerId: string, payload: any): Promise<{ data: any; message: string }> {
    return httpClient.put(`${ROUTES.SETTINGS.BASE}/provider/${providerId}`, payload);
  }

  static async fetchSystemSettings(): Promise<{ data: any; message: string }> {
    // This would be a custom endpoint for system-wide settings
    return httpClient.get(`${ROUTES.SETTINGS.BASE}/system`);
  }

  static async updateSystemSettings(payload: any): Promise<{ data: any; message: string }> {
    return httpClient.put(`${ROUTES.SETTINGS.BASE}/system`, payload);
  }
}

// React Query Hooks for Settings
export const useSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS.SYSTEM,
    queryFn: SettingsService.fetchSettings,
  });
};

export const useUserSettings = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS.USER(userId),
    queryFn: () => SettingsService.fetchUserSettings(userId),
    enabled: !!userId,
  });
};

export const useProviderSettings = (providerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS.PROVIDER(providerId),
    queryFn: () => SettingsService.fetchProviderSettings(providerId),
    enabled: !!providerId,
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS.SYSTEM,
    queryFn: SettingsService.fetchSystemSettings,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SettingsService.updateSettings,
    onSuccess: () => {
      // Invalidate settings queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS.SYSTEM });
    },
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: any }) =>
      SettingsService.updateUserSettings(userId, payload),
    onSuccess: (_, { userId }) => {
      // Invalidate user settings queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS.USER(userId) });
    },
  });
};

export const useUpdateProviderSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, payload }: { providerId: string; payload: any }) =>
      SettingsService.updateProviderSettings(providerId, payload),
    onSuccess: (_, { providerId }) => {
      // Invalidate provider settings queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS.PROVIDER(providerId) });
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SettingsService.updateSystemSettings,
    onSuccess: () => {
      // Invalidate system settings queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS.SYSTEM });
    },
  });
};
