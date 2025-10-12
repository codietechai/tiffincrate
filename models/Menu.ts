import mongoose, { Document, Schema, model, models, Types } from "mongoose";

export interface IWeeklyMenu {
  monday?: Types.ObjectId;
  tuesday?: Types.ObjectId;
  wednesday?: Types.ObjectId;
  thursday?: Types.ObjectId;
  friday?: Types.ObjectId;
  saturday?: Types.ObjectId;
  sunday?: Types.ObjectId;
}

export interface IMenu extends Document {
  providerId: Types.ObjectId;
  name: string;
  description?: string;
  category: "breakfast" | "lunch" | "dinner";
  weeklyItems: IWeeklyMenu;
  basePrice: number;
  monthlyPlanPrice?: number;
  imageUrl?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isActive: boolean;
  weekType: "whole" | "weekdays" | "weekends";
  rating: number;
  draft: boolean;
  userRatingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const weeklyMenuSchema = new Schema<IWeeklyMenu>(
  {
    monday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    tuesday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    wednesday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    thursday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    friday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    saturday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    sunday: { type: Schema.Types.ObjectId, ref: "MenuItem" },
  },
  { _id: false }
);

const menuSchema = new Schema<IMenu>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
    },
    description: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner"],
    },
    weeklyItems: { type: weeklyMenuSchema, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    monthlyPlanPrice: { type: Number },
    imageUrl: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    weekType: {
      type: String,
      default: "whole",
      enum: ["whole", "weekdays", "weekends"],
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    draft: { type: Boolean, default: false },
    userRatingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Menu || model<IMenu>("Menu", menuSchema);
