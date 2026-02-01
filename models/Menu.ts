import { Schema, model, models, Document } from "mongoose";

export interface IMenu extends Document {
  providerId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  basePrice: number;
  monthlyPlanPrice?: number;
  image?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
  userRatingCount: number;
  tags: string[];
  preparationTime: number; // in minutes
  servingSize: number; // number of people it serves
  createdAt: Date;
  updatedAt: Date;
}

const menuSchema = new Schema<IMenu>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
      maxlength: 200,
      index: "text", // Text search index
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner"],
      index: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100,
    },
    monthlyPlanPrice: {
      type: Number,
      min: 0,
      set: (v: number) => v ? Math.round(v * 100) / 100 : v,
    },
    image: {
      type: String,
      maxlength: 500,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVegetarian: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    weekType: {
      type: String,
      default: "whole",
      enum: ["whole", "weekdays", "weekends"],
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: -1, // Descending index for sorting
    },
    userRatingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50,
    }],
    preparationTime: {
      type: Number,
      default: 30, // 30 minutes default
      min: 10,
      max: 180,
    },
    servingSize: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
menuSchema.index({ providerId: 1, isActive: 1 });
menuSchema.index({ category: 1, isAvailable: 1 });
menuSchema.index({ isVegetarian: 1, category: 1 });
menuSchema.index({ rating: -1, userRatingCount: -1 });
menuSchema.index({ basePrice: 1, category: 1 });
menuSchema.index({ weekType: 1, category: 1 });
menuSchema.index({ providerId: 1, category: 1, isActive: 1 });

// Text search index
menuSchema.index({
  name: "text",
  description: "text",
  tags: "text"
}, {
  weights: {
    name: 10,
    tags: 5,
    description: 1
  }
});

// Virtual for average rating display
menuSchema.virtual('displayRating').get(function () {
  return this.userRatingCount > 0 ? this.rating : null;
});

// Virtual for price per serving
menuSchema.virtual('pricePerServing').get(function () {
  return Math.round((this.basePrice / this.servingSize) * 100) / 100;
});

export default models.Menu || model<IMenu>("Menu", menuSchema);