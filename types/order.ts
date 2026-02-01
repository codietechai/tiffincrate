import { TAddress } from "./address";

export interface TDeliveryOrder {
  _id: string;
  orderId: string;
  consumerId: string;
  providerId: string;
  deliveryDate: string;
  timeSlot: "breakfast" | "lunch" | "dinner";
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled" | "not_delivered";
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  address: TAddress;

  // Status timestamps
  pendingAt?: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  notDeliveredAt?: string;

  // Delivery details
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryNotes?: string;
  cancelReason?: string;

  // Settlement tracking
  isSettled: boolean;
  settlementId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface TOrder {
  _id: string;
  consumerId: string;
  providerId: string;
  menuId: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  orderType: "month" | "specific_days" | "custom_dates";
  deliveryInfo: {
    type: "month" | "specific_days" | "custom_dates";
    startDate?: string;
    days?: string[];
    dates?: string[];
  };
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  address: string;
  timeSlot: "breakfast" | "lunch" | "dinner";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "wallet" | "razorpay" | "cod";
  notes?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TOrderDelivery {
  _id: string;
  consumerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  providerId: {
    _id: string;
    businessName: string;
    location: {
      type: "Point";
      coordinates: [number, number];
      address: string;
    };
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
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  address: TAddress;
  timeSlot: "breakfast" | "lunch" | "dinner";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "wallet" | "razorpay" | "cod";
  notes?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy interfaces for backward compatibility
export interface Delivery {
  _id: string;
  deliveryDate: string;
  deliveryStatus: "pending" | "confirmed" | "ready" | "assigned" | "out_for_delivery" | "delivered" | "not_delivered" | "cancelled";
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
