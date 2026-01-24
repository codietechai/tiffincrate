import mongoose, { Schema, Model } from "mongoose";

/**
 * Address Interface
 */
export interface IAddress {
  user_id?: mongoose.Types.ObjectId;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  country_code: string;
  postal_code: string;
  dial_code?: string;
  phone_number?: string;
  full_phone_number?: string;
  is_default: boolean;
  email?: string;
  address_mutability: "mutable" | "immutable";
  ref_address?: mongoose.Types.ObjectId;
}

/**
 * Address Schema (NO GENERICS HERE ❗)
 */
const addressSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address_line_1: {
      type: String,
      required: true,
      trim: true,
    },
    address_line_2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: Number,
    longitude: Number,
    country_code: {
      type: String,
      required: true,
      trim: true,
    },
    postal_code: {
      type: String,
      required: true,
      trim: true,
    },
    dial_code: String,
    phone_number: String,
    full_phone_number: String,
    is_default: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address_mutability: {
      type: String,
      enum: ["mutable", "immutable"],
      default: "mutable",
    },
    ref_address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

/**
 * Model Loader (TS + Next.js safe)
 */
let Address: Model<IAddress>;

try {
  Address = mongoose.model<IAddress>("Address");
} catch {
  Address = mongoose.model<IAddress>("Address", addressSchema);
}

export default Address;
