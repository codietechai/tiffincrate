import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "promotion" | "delivery";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  data?: any;
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["order", "payment", "system", "promotion", "delivery"],
      default: "system",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    actionUrl: {
      type: String,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ userId: 1, type: 1, isRead: 1 });

// TTL index for expired notifications
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
