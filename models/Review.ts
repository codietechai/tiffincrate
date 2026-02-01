import mongoose from "mongoose";

export interface IReview extends mongoose.Document {
  _id: string;
  consumerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  deliveryOrderId?: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  isVerified: boolean;
  reviewType: "order" | "provider" | "delivery";
  images?: string[];
  helpfulCount: number;
  reportCount: number;
  isHidden: boolean;
  moderatedAt?: Date;
  moderatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    deliveryOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryOrder",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewType: {
      type: String,
      enum: ["order", "provider", "delivery"],
      default: "order",
      index: true,
    },
    images: [{
      type: String,
      maxlength: 500,
    }],
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    moderatedAt: {
      type: Date,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
reviewSchema.index({ providerId: 1, rating: -1 });
reviewSchema.index({ consumerId: 1, createdAt: -1 });
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, isHidden: 1 });
reviewSchema.index({ providerId: 1, isHidden: 1, createdAt: -1 });

// Ensure one review per order per consumer
reviewSchema.index({ consumerId: 1, orderId: 1 }, { unique: true });

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function () {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", reviewSchema);
