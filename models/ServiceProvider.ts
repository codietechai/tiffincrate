import mongoose from "mongoose";

export interface IServiceProvider extends mongoose.Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description?: string;
  cuisine: string[];
  deliveryAreas: string[];
  rating: number;
  totalOrders: number;
  isVerified: boolean;
  isActive: boolean;
  operatingHours: {
    breakfast: {
      enabled: boolean;
      selfDelivery: boolean;
    };
    lunch: {
      enabled: boolean;
      selfDelivery: boolean;
    };
    dinner: {
      enabled: boolean;
      selfDelivery: boolean;
    };
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  businessType: "restaurant" | "home_kitchen" | "cloud_kitchen";
  serviceRadius: number; // in km
  avgDeliveryTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: 200,
      index: "text", // Text search index
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    cuisine: [
      {
        type: String,
        required: true,
        maxlength: 50,
      },
    ],
    deliveryAreas: [
      {
        type: String,
        required: true,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: -1, // Descending index for sorting
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
      index: -1, // Descending index for sorting
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    operatingHours: {
      breakfast: {
        enabled: {
          type: Boolean,
          default: true,
        },
        selfDelivery: {
          type: Boolean,
          default: true, // Changed default to true since providers deliver themselves
        },
      },
      lunch: {
        enabled: {
          type: Boolean,
          default: true,
        },
        selfDelivery: {
          type: Boolean,
          default: true,
        },
      },
      dinner: {
        enabled: {
          type: Boolean,
          default: true,
        },
        selfDelivery: {
          type: Boolean,
          default: true,
        },
      },
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
        index: "2dsphere", // Geospatial index for location queries
      },
      address: {
        type: String,
        required: true,
        maxlength: 500,
      },
    },
    businessType: {
      type: String,
      enum: ["restaurant", "home_kitchen", "cloud_kitchen"],
      default: "home_kitchen",
      index: true,
    },
    serviceRadius: {
      type: Number,
      default: 10, // 10 km default
      min: 1,
      max: 50,
    },
    avgDeliveryTime: {
      type: Number,
      default: 30, // 30 minutes default
      min: 15,
      max: 120,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

serviceProviderSchema.index({ isActive: 1, isVerified: 1 });
serviceProviderSchema.index({ deliveryAreas: 1, isActive: 1 });
serviceProviderSchema.index({ cuisine: 1, isActive: 1 });
serviceProviderSchema.index({ rating: -1, totalOrders: -1 });
serviceProviderSchema.index({ businessType: 1, isActive: 1 });
serviceProviderSchema.index({ createdAt: -1 });

serviceProviderSchema.index({
  businessName: "text",
  description: "text"
}, {
  weights: {
    businessName: 10,
    description: 5
  }
});

serviceProviderSchema.virtual('coordinates').get(function () {
  return {
    lat: (this as any).location.coordinates[1],
    lng: (this as any).location.coordinates[0]
  };
});

export default mongoose.models.ServiceProvider ||
  mongoose.model<IServiceProvider>("ServiceProvider", serviceProviderSchema);
