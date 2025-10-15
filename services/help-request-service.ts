import { THelpRequest } from "@/types";

export class HelpRequestService {
  private static baseUrl = "/api/help-requests";

  static async fetchHelpRequests(payload: {
    statusFilter: string;
    typeFilter: string;
    limit: string;
  }): Promise<{
    data: THelpRequest[];
    pagination: any;
    message: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (payload.statusFilter) params.append("status", payload.statusFilter);
      if (payload.typeFilter && payload.typeFilter !== "all")
        params.append("type", payload.typeFilter);
      params.append("limit", payload.limit);

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
      throw error;
    }
  }
  static async createHelpRequest(payload: any): Promise<{
    data: THelpRequest;
    message: string;
  }> {
    try {
      if (
        payload.type === "admin_support" ||
        payload.type === "provider_support"
      ) {
        delete (payload as any).toUserId;
      }
      const response = await fetch("/api/help-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
