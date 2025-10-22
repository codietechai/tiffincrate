import mongoose, { Schema, Document } from "mongoose";

// interfaces.ts
export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IDeliveryAddress {
  address: string;
  latitude: number;
  longitude: number;
}

export interface IDeliveryInfo {
  type: "month" | "specific_days" | "custom_dates";
  startDate?: string;        // for monthly plans
  days?: string[];           // for specific days: ["monday", "wednesday"]
  dates?: string[];          // for custom dates: ["2025-10-25", "2025-10-30"]
}

export interface IOrder extends Document {
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  orderType: "month" | "specific_days" | "custom_dates";
  deliveryInfo: IDeliveryInfo;
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  deliveryAddress: IDeliveryAddress;
  timeSlot: "breakfast" | "lunch" | "dinner";
  deliveryPartnerId?: mongoose.Types.ObjectId;
  deliveryAssignmentId?: mongoose.Types.ObjectId;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
});

// Delivery Info Sub-Schema
const deliveryInfoSchema = new Schema<IDeliveryInfo>(
  {
    type: {
      type: String,
      enum: ["month", "specific_days", "custom_dates"],
      required: true,
    },
    startDate: { type: String }, // for monthly
    days: [String],              // for specific_days
    dates: [String],             // for custom_dates (ISO date strings)
  },
  { _id: false }
);

// Order Schema
const orderSchema = new Schema<IOrder>(
  {
    consumerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "ServiceProvider", required: true },
    items: [orderItemSchema],
    orderType: {
      type: String,
      enum: ["month", "specific_days", "custom_dates"],
      required: true,
    },
    deliveryInfo: { type: deliveryInfoSchema, required: true },

    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"],
      default: "pending",
    },

    deliveryAddress: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },

    timeSlot: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },

    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "DeliveryPartner" },
    deliveryAssignmentId: { type: Schema.Types.ObjectId, ref: "DeliveryAssignment" },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentMethod: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", orderSchema);

