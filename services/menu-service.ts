import { TMenu } from "@/types";
import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Menu Service Class (for direct API calls)
export class MenuService {
  static async fetchMenus(params?: {
    providerId?: string;
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isVegetarian?: boolean;
    weekType?: string;
    isAvailable?: boolean;
    isActive?: boolean;
  }): Promise<{
    data: TMenu[];
    stats?: {
      total: number;
      available: number;
      active: number;
    };
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message: string;
  }> {
    const url = buildApiUrl(ROUTES.MENU.BASE, {
      ...params,
      isVegetarian: params?.isVegetarian !== undefined ? params.isVegetarian.toString() : undefined,
      isAvailable: params?.isAvailable !== undefined ? params.isAvailable.toString() : undefined,
      isActive: params?.isActive !== undefined ? params.isActive.toString() : undefined,
    });
    return httpClient.get(url);
  }

  static async fetchMenu(id: string): Promise<{
    data: TMenu | null;
    message: string;
  }> {
    return httpClient.get(ROUTES.MENU.BY_ID(id));
  }

  static async fetchMenuItems(menuId: string): Promise<{
    data: any[];
    message: string;
  }> {
    return httpClient.get(ROUTES.MENU.ITEMS(menuId));
  }

  static async fetchMenuItem(menuId: string, itemId: string): Promise<{
    data: any;
    message: string;
  }> {
    return httpClient.get(ROUTES.MENU.ITEM_BY_ID(menuId, itemId));
  }
}

export const useMenus = (params?: {
  providerId?: string;
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isVegetarian?: boolean;
  weekType?: string;
  isAvailable?: boolean;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.MENU.ALL,
      params?.providerId,
      params?.page,
      params?.limit,
      params?.category,
      params?.search,
      params?.isVegetarian,
      params?.weekType,
      params?.isAvailable,
      params?.isActive,
    ],
    queryFn: () => MenuService.fetchMenus(params),
  });
};

export const useMenu = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU.BY_ID(id),
    queryFn: () => MenuService.fetchMenu(id),
    enabled: !!id,
  });
};

export const useMenuItems = (menuId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU.ITEMS(menuId),
    queryFn: () => MenuService.fetchMenuItems(menuId),
    enabled: !!menuId,
  });
};

export const useMenuItem = (menuId: string, itemId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MENU.ITEM_BY_ID(menuId, itemId),
    queryFn: () => MenuService.fetchMenuItem(menuId, itemId),
    enabled: !!menuId && !!itemId,
  });
};

// Infinite Query Hook for Menus (for pagination/infinite scroll)
export const useInfiniteMenus = (params?: {
  providerId?: string;
  category?: string;
  search?: string;
  isVegetarian?: boolean;
  weekType?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: [
      ...QUERY_KEYS.MENU.INFINITE,
      params?.providerId,
      params?.category,
      params?.search,
      params?.isVegetarian,
      params?.weekType,
      params?.isAvailable,
      params?.isActive,
      params?.limit,
    ],
    queryFn: ({ pageParam = 1 }) =>
      MenuService.fetchMenus({
        ...params,
        page: pageParam,
        limit: params?.limit || 10,
      }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
