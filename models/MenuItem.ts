import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  menuId: mongoose.Types.ObjectId;
  images: string[];
  day?: string;
  nutritionInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  allergens: string[];
  isSpicy: boolean;
  spiceLevel: "mild" | "medium" | "hot" | "extra-hot";
  ingredients: string[];
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: "text",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
      index: true,
    },
    images: [{
      type: String,
      maxlength: 500,
    }],
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      index: true,
    },
    nutritionInfo: {
      calories: { type: Number, min: 0 },
      protein: { type: String, maxlength: 20 },
      carbs: { type: String, maxlength: 20 },
      fat: { type: String, maxlength: 20 },
      fiber: { type: String, maxlength: 20 },
    },
    allergens: [{
      type: String,
      trim: true,
      maxlength: 50,
    }],
    isSpicy: {
      type: Boolean,
      default: false,
      index: true,
    },
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra-hot"],
      default: "mild",
    },
    ingredients: [{
      type: String,
      trim: true,
      maxlength: 100,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
menuItemSchema.index({ menuId: 1, day: 1 });
menuItemSchema.index({ menuId: 1, isSpicy: 1 });

// Text search index
menuItemSchema.index({
  name: "text",
  description: "text",
  ingredients: "text"
});

const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", menuItemSchema);

export default MenuItem;
