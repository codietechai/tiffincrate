import mongoose, { Schema, Model, Document } from "mongoose";

export interface IAddress extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone?: string;
  isDefault: boolean;
  addressType: "home" | "office" | "other";
  landmark?: string;
  deliveryInstructions?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "India",
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere", // Geospatial index
      },
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    addressType: {
      type: String,
      enum: ["home", "office", "other"],
      default: "home",
      index: true,
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    deliveryInstructions: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
addressSchema.index({ userId: 1, isActive: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ pincode: 1, city: 1 });

// Ensure only one default address per user
addressSchema.index({ userId: 1, isDefault: 1 }, {
  unique: true,
  partialFilterExpression: { isDefault: true }
});

// Virtual for formatted address
addressSchema.virtual('fullAddress').get(function () {
  let address = this.addressLine1;
  if (this.addressLine2) address += ', ' + this.addressLine2;
  if (this.landmark) address += ', ' + this.landmark;
  address += ', ' + this.city + ', ' + this.state + ' - ' + this.pincode;
  return address;
});

// Virtual for coordinates in lat/lng format
addressSchema.virtual('coordinates').get(function () {
  return {
    lat: this.location.coordinates[1],
    lng: this.location.coordinates[0]
  };
});

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('Address').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

let Address: Model<IAddress>;

try {
  Address = mongoose.model<IAddress>("Address");
} catch {
  Address = mongoose.model<IAddress>("Address", addressSchema);
}

export default Address;
