import { TMenu } from "@/types";
import { httpClient } from "@/lib/http-client";
import { ROUTES, buildApiUrl } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";

// Menu Service Class (for direct API calls)
export class MenuService {
  static async fetchMenus(params?: {
    providerId?: string;
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
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
    const url = buildApiUrl(ROUTES.MENU.BASE, params);
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
}) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.MENU.ALL,
      params?.providerId,
      params?.page,
      params?.limit,
      params?.category,
      params?.search,
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
