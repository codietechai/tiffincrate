import { ERRORMESSAGE } from "@/constants/response-messages";
import { IServiceProvider } from "@/models/ServiceProvider";
import {
  TFetchProvidersResponse,
  TProvider,
  TProviderQueryData,
} from "@/types";
import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Provider Service Class (for direct API calls)
export class ProviderService {
  static async fetchProviders(
    queryData: TProviderQueryData
  ): Promise<TFetchProvidersResponse> {
    const url = buildApiUrl(ROUTES.PROVIDER.BASE, {
      search: queryData.search,
      cuisine: queryData.cuisine,
      page: queryData.page,
      limit: queryData.limit,
    });

    return httpClient.get(url);
  }

  static async fetchProvider(id: string): Promise<{
    data: IServiceProvider;
    message: string;
  }> {
    return httpClient.get(ROUTES.PROVIDER.BY_ID(id));
  }

  static async fetchProvidersLinkedWithConsumer(): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
    // Note: This endpoint doesn't exist in the routes, using a custom path
    return httpClient.get("/api/providers/users/providers");
  }

  static async updateDeliverySettings(data: any): Promise<{
    data: any;
    message: string;
  }> {
    return httpClient.put(ROUTES.PROVIDER.DELIVERY_SETTINGS, data);
  }

  static async fetchDeliverySettings(providerId: string): Promise<{
    data: any;
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.PROVIDER.DELIVERY_SETTINGS, { providerId });
    return httpClient.get(url);
  }

  static async fetchProvidersByArea(area: string): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.PROVIDER.BASE, { area });
    return httpClient.get(url);
  }

  static async fetchProvidersByCuisine(cuisine: string): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.PROVIDER.BASE, { cuisine });
    return httpClient.get(url);
  }

  static async fetchNearbyProviders(lat: number, lng: number, radius?: number): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.PROVIDER.BASE, {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius?.toString()
    });
    return httpClient.get(url);
  }
}

// React Query Hooks for Provider
export const useProviders = (queryData: TProviderQueryData) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROVIDER.ALL, queryData],
    queryFn: () => ProviderService.fetchProviders(queryData),
  });
};

export const useProvider = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROVIDER.BY_ID(id),
    queryFn: () => ProviderService.fetchProvider(id),
    enabled: !!id,
  });
};

export const useProvidersLinkedWithConsumer = () => {
  return useQuery({
    queryKey: ['provider', 'linked-with-consumer'],
    queryFn: ProviderService.fetchProvidersLinkedWithConsumer,
  });
};

export const useProvidersByArea = (area: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROVIDER.BY_AREA(area),
    queryFn: () => ProviderService.fetchProvidersByArea(area),
    enabled: !!area,
  });
};

export const useProvidersByCuisine = (cuisine: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROVIDER.BY_CUISINE(cuisine),
    queryFn: () => ProviderService.fetchProvidersByCuisine(cuisine),
    enabled: !!cuisine,
  });
};

export const useNearbyProviders = (lat: number, lng: number, radius?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROVIDER.NEARBY(lat, lng, radius),
    queryFn: () => ProviderService.fetchNearbyProviders(lat, lng, radius),
    enabled: !!(lat && lng),
  });
};

export const useProviderDeliverySettings = (providerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROVIDER.DELIVERY_SETTINGS(providerId),
    queryFn: () => ProviderService.fetchDeliverySettings(providerId),
    enabled: !!providerId,
  });
};

export const useUpdateProviderDeliverySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProviderService.updateDeliverySettings,
    onSuccess: (_, variables) => {
      // Invalidate provider-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROVIDER.ALL });
      // If we can extract providerId from variables, invalidate specific queries
      if (variables?.providerId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PROVIDER.DELIVERY_SETTINGS(variables.providerId)
        });
      }
    },
  });
};