interface TNotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion";
  isRead: boolean;
  data?: any;
  createdAt: string;
}
