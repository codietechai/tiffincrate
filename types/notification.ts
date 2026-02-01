export interface TNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion" | "delivery";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  data?: any;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
