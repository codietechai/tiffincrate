import { ERRORMESSAGE } from "@/constants/response-messages";
import { IServiceProvider } from "@/models/ServiceProvider";
import {
  TFetchProvidersResponse,
  TProvider,
  TProviderQueryData,
} from "@/types";

export class ProviderService {
  private static baseUrl = "/api/providers";

  static async fetchProviders(
    queryData: TProviderQueryData
  ): Promise<TFetchProvidersResponse> {
    try {
      const params = new URLSearchParams({
        search: queryData.search,
        cuisine: queryData.cuisine,
        page: queryData.page,
        limit: queryData.limit,
      } as any).toString();
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(ERRORMESSAGE.PROVIDERS_FETCH, error);
      throw error;
    }
  }

  static async fetchProvider(id: string): Promise<{
    data: IServiceProvider;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(ERRORMESSAGE.PROVIDER_NOT_FOUND, error);
      throw error;
    }
  }

  static async fetchProvidersLinkedWithConsumer(): Promise<{
    data: IServiceProvider[];
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/providers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching settings:", error);
      throw error;
    }
  }
}
