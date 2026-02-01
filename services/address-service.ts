import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS, getRelatedQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Address Service Class (for direct API calls)
export class AddressService {
  static async fetchAll(): Promise<{
    success: boolean;
    data: any[];
  }> {
    return httpClient.get(ROUTES.ADDRESS.BASE);
  }

  static async fetchById(id: string): Promise<{
    success: boolean;
    data: any;
  }> {
    return httpClient.get(ROUTES.ADDRESS.BY_ID(id));
  }

  static async create(payload: any): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    return httpClient.post(ROUTES.ADDRESS.BASE, payload);
  }

  static async update(
    id: string,
    payload: any
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> {
    return httpClient.put(ROUTES.ADDRESS.BY_ID(id), payload);
  }

  static async delete(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return httpClient.delete(ROUTES.ADDRESS.BY_ID(id));
  }

  static async setDefault(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // Use the update method to set isDefault: true
    const res = await this.update(id, { isDefault: true });
    return {
      success: true,
      message: "Default address updated successfully"
    };
  }

  static async fetchDefault(): Promise<{
    success: boolean;
    data: any;
  }> {
    const res = await this.fetchAll();
    const defaultAddress = res.data.find((address: any) => address.isDefault);

    if (!defaultAddress) {
      // If no default address, return the first address if any exists
      const firstAddress = res.data[0] || null;
      return {
        success: true,
        data: firstAddress
      };
    }

    return {
      success: true,
      data: defaultAddress
    };
  }
}

// React Query Hooks for Address
export const useAddresses = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADDRESS.ALL,
    queryFn: AddressService.fetchAll,
  });
};

export const useAddress = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ADDRESS.BY_ID(id),
    queryFn: () => AddressService.fetchById(id),
    enabled: !!id,
  });
};

export const useDefaultAddress = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ADDRESS.DEFAULT,
    queryFn: AddressService.fetchDefault,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AddressService.create,
    onSuccess: () => {
      // Invalidate and refetch address-related queries
      const relatedKeys = getRelatedQueryKeys('address');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      AddressService.update(id, payload),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch address-related queries
      const relatedKeys = getRelatedQueryKeys('address', id);
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AddressService.delete,
    onSuccess: (_, id) => {
      // Invalidate and refetch address-related queries
      const relatedKeys = getRelatedQueryKeys('address', id);
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AddressService.setDefault,
    onSuccess: () => {
      // Invalidate and refetch address-related queries
      const relatedKeys = getRelatedQueryKeys('address');
      relatedKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};
