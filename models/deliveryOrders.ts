import mongoose, { Schema, Document } from "mongoose";

export interface IDeliveryOrder extends Document {
  orderId: mongoose.Types.ObjectId;
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  deliveryDate: Date;
  timeSlot: "breakfast" | "lunch" | "dinner";
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled" | "not_delivered";
  items: Array<{
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }>;
  address: mongoose.Types.ObjectId;

  // Status timestamps
  pendingAt?: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  notDeliveredAt?: Date;

  // Delivery details
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  deliveryNotes?: string;
  cancelReason?: string;

  // Settlement tracking
  isSettled: boolean;
  settlementId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const deliveryOrderSchema = new Schema<IDeliveryOrder>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
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
    deliveryDate: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlot: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled", "not_delivered"],
      default: "pending",
      index: true,
    },
    items: [{
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
      },
    }],
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    // Status timestamps
    pendingAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    notDeliveredAt: { type: Date },

    // Delivery details
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    deliveryNotes: {
      type: String,
      maxlength: 500,
    },
    cancelReason: {
      type: String,
      maxlength: 500,
    },

    // Settlement tracking
    isSettled: {
      type: Boolean,
      default: false,
      index: true,
    },
    settlementId: {
      type: Schema.Types.ObjectId,
      ref: "DeliverySettlement",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
deliveryOrderSchema.index({ providerId: 1, deliveryDate: 1 });
deliveryOrderSchema.index({ consumerId: 1, deliveryDate: -1 });
deliveryOrderSchema.index({ status: 1, deliveryDate: 1 });
deliveryOrderSchema.index({ timeSlot: 1, deliveryDate: 1 });
deliveryOrderSchema.index({ deliveryDate: 1, status: 1, timeSlot: 1 });

// Provider dashboard queries
deliveryOrderSchema.index({ providerId: 1, status: 1, timeSlot: 1 });
deliveryOrderSchema.index({ providerId: 1, deliveryDate: 1, status: 1 });

// Settlement queries
deliveryOrderSchema.index({ isSettled: 1, status: 1 });
deliveryOrderSchema.index({ providerId: 1, isSettled: 1, deliveredAt: 1 });

// Unique constraint: one delivery order per order per date
deliveryOrderSchema.index({ orderId: 1, deliveryDate: 1 }, { unique: true });

// Virtual for total amount
deliveryOrderSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for delivery duration
deliveryOrderSchema.virtual('deliveryDuration').get(function () {
  if (this.deliveredAt && this.outForDeliveryAt) {
    return Math.round((this.deliveredAt.getTime() - this.outForDeliveryAt.getTime()) / (1000 * 60)); // minutes
  }
  return null;
});

export default mongoose.models.DeliveryOrder ||
  mongoose.model<IDeliveryOrder>("DeliveryOrder", deliveryOrderSchema);

