import { TAddress } from "./address";

export interface Delivery {
  _id: string;
  deliveryDate: string;
  deliveryStatus:
    | "pending"
    | "confirmed"
    | "ready"
    | "assigned"
    | "out_for_delivery"
    | "delivered"
    | "not_delivered"
    | "cancelled";
}

export interface Order {
  _id: string;
  providerId: string;
  consumerId: string;
  isReviewed: boolean;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  orderId: string;
  status: string;
  deliveryAddress: { address: string };
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
  updatedAt?: string;
}

export interface TOrderDelivery {
  _id: string;

  consumerId: {
    _id: string;
    name: string;
    email: string;
  };

  menuId: {
    _id: string;
    providerId: string;
    name: string;
    description: string;
  };

  orderType: "month" | "specific_days" | "custom_dates";

  deliveryInfo: {
    type: "month" | "specific_days" | "custom_dates";
    startDate?: string;
    days: string[];
    dates: string[];
  };

  totalAmount: number;

  status:
    | "in_progress"
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";

  address: TAddress;

  timeSlot: "breakfast" | "lunch" | "dinner";

  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
  __v: number;
}
