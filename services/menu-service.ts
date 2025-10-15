import { TMenu } from "@/types";

export class MenuService {
  private static baseUrl = "/api/menus";

  static async fetchMenus(id?: string): Promise<{
    data: TMenu[];
    message: string;
  }> {
    try {
      const url = id ? `${this.baseUrl}?providerId=${id}` : this.baseUrl;
      const response = await fetch(url, {
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
}
