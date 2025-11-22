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
  orderId:string,
  status: string;
  deliveryAddress: { address: string };
  deliveryDate: string;
  paymentStatus: string;
  createdAt: string;
  notes?: string;
  updatedAt?: string;
}