import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IDeliveryInfo {
  type: "month" | "specific_days" | "custom_dates";
  startDate?: string;
  days?: string[];
  dates?: string[];
}

export interface IOrder extends Document {
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  menuId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  orderType: "month" | "specific_days" | "custom_dates";
  deliveryInfo: IDeliveryInfo;
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  address: mongoose.Types.ObjectId;
  timeSlot: "breakfast" | "lunch" | "dinner";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "wallet" | "razorpay" | "cod";
  notes?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryInfoSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["month", "specific_days", "custom_dates"],
      required: true,
    },
    startDate: { type: String },
    days: [{ type: String }],
    dates: [{ type: String }],
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    consumerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true,
    },
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    orderType: {
      type: String,
      enum: ["month", "specific_days", "custom_dates"],
      required: true,
      index: true,
    },
    deliveryInfo: {
      type: deliveryInfoSchema,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true
    },
    timeSlot: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "razorpay", "cod"],
      required: true,
      default: "wallet",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
orderSchema.index({ consumerId: 1, createdAt: -1 });
orderSchema.index({ providerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ timeSlot: 1, status: 1 });
orderSchema.index({ orderType: 1, createdAt: -1 });

// Indexes for provider dashboard
orderSchema.index({ providerId: 1, status: 1, timeSlot: 1 });
orderSchema.index({ providerId: 1, paymentStatus: 1 });

// Indexes for admin dashboard
orderSchema.index({ createdAt: -1, status: 1 });
orderSchema.index({ totalAmount: -1, createdAt: -1 });

// Virtual for order duration (for monthly orders)
orderSchema.virtual('orderDuration').get(function () {
  if (this.orderType === 'month') {
    return 30; // days
  } else if (this.orderType === 'specific_days' && this.deliveryInfo.days) {
    return this.deliveryInfo.days.length * 4; // approximate weeks in month
  } else if (this.orderType === 'custom_dates' && this.deliveryInfo.dates) {
    return this.deliveryInfo.dates.length;
  }
  return 1;
});

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", orderSchema);
