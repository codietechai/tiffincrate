import mongoose from "mongoose";

export interface IDeliveryPartner extends mongoose.Document {
  _id: string;
  userId: string;
  vehicleType: "bike" | "scooter" | "bicycle" | "car";
  vehicleNumber: string;
  licenseNumber: string;
  isVerified: boolean;
  isActive: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  serviceRadius: number; // in km
  maxDeliveriesPerSlot: number;
  availableSlots: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  rating: number;
  totalDeliveries: number;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  bankDetails: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  documents: {
    license?: string;
    aadhar?: string;
    vehicleRC?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "car"],
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    serviceRadius: {
      type: Number,
      default: 50, // 50 km radius
      min: 1,
      max: 100,
    },
    maxDeliveriesPerSlot: {
      type: Number,
      default: 40,
      min: 1,
      max: 50,
    },
    availableSlots: {
      breakfast: {
        type: Boolean,
        default: true,
      },
      lunch: {
        type: Boolean,
        default: true,
      },
      dinner: {
        type: Boolean,
        default: true,
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    earnings: {
      today: {
        type: Number,
        default: 0,
      },
      thisWeek: {
        type: Number,
        default: 0,
      },
      thisMonth: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    documents: {
      license: String,
      aadhar: String,
      vehicleRC: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DeliveryPartner ||
  mongoose.model<IDeliveryPartner>("DeliveryPartner", deliveryPartnerSchema);
