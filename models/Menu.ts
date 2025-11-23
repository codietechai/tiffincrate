import {  Schema, model, models, Types } from "mongoose";

const menuSchema = new Schema(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Menu name is required"],
    },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner"],
    },
    basePrice: { type: Number, required: true, min: 0 },
    monthlyPlanPrice: { type: Number },
    image: { type: String },
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

export default models.Menu || model("Menu", menuSchema);