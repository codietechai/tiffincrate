export class NotificationService {
  private static baseUrl = "/api/notifications";

  static async fetchNotifications(): Promise<{
    data: TNotification[];
    pagination: any;
    unreadCount: number;
    message: string;
  }> {
    try {
      const response = await fetch(this.baseUrl, {
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
  static async createNotification(payload: any): Promise<{
    data: TNotification;
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

  static async markAsRead(payload: { id?: string[] }): Promise<{
    message: string;
  }> {
    try {
      let object: any = { markAsRead: true };
      if (payload.id) {
        object = {
          ...object,
          notificationIds: payload.id,
        };
      }
      const response = await fetch(this.baseUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(object),
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
