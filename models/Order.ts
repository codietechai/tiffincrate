import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryDates: Date[]; // ← array of actual delivery dates
  totalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  deliveryAddress: {
    address: string;
    latitude: number;
    longitude: number;
  };
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

const orderSchema = new Schema<IOrder>(
  {
    consumerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "ServiceProvider", required: true },
    items: [orderItemSchema],
    deliveryDates: [{ type: Date, required: true }], // ← store all dates here
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
    timeSlot: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "DeliveryPartner" },
    deliveryAssignmentId: { type: Schema.Types.ObjectId, ref: "DeliveryAssignment" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);


export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", orderSchema);
