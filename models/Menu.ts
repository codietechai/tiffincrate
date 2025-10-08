import mongoose from "mongoose";

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
    weeklyItems: weeklyMenuSchema, // ✅ flexible per-day food list
    basePrice: { type: Number, required: true, min: 0 },
    monthlyPlanPrice: { type: Number }, // optional
    imageUrl: [String],
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    userRatingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);
