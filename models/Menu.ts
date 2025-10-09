import mongoose, { model, models } from "mongoose";

const weeklyMenuSchema = new mongoose.Schema(
  {
    monday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
    tuesday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
    wednesday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
    thursday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
    friday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
    saturday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
    sunday: {
      type: mongoose.Types.ObjectId,
      ref: "MenuItem",
    },
  },
  { _id: false }
);

const menuSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    weeklyItems: weeklyMenuSchema,
    basePrice: { type: Number, required: true, min: 0 },
    monthlyPlanPrice: { type: Number },
    imageUrl: [String],
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
