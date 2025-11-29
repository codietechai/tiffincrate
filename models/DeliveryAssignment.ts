import mongoose from "mongoose";

export interface IDeliveryAssignment extends mongoose.Document {
  _id: string;
  orderId: string;
  providerId: string;
  deliveryPartnerId: string;
  timeSlot: "breakfast" | "lunch" | "dinner";
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    
    address: string;
  };
  estimatedDistance: number; // in km
  estimatedDuration: number; // in minutes
  actualDistance?: number;
  actualDuration?: number;
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
  pickupTime?: Date;
  deliveryTime?: Date;
  deliveryFee: number;
  route: {
    waypoints: Array<{
      latitude: number;
      longitude: number;
      address: string;
      orderId: string;
    }>;
    optimizedOrder: number[];
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      required: true,
    },
    timeSlot: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    pickupLocation: {
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
    deliveryLocation: {
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
    estimatedDistance: {
      type: Number,
      required: true,
    },
    estimatedDuration: {
      type: Number,
      required: true,
    },
    actualDistance: Number,
    actualDuration: Number,
    status: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "delivered", "failed"],
      default: "assigned",
    },
    pickupTime: Date,
    deliveryTime: Date,
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    route: {
      waypoints: [
        {
          latitude: Number,
          longitude: Number,
          address: String,
          orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
          },
        },
      ],
      optimizedOrder: [Number],
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DeliveryAssignment ||
  mongoose.model<IDeliveryAssignment>(
    "DeliveryAssignment",
    deliveryAssignmentSchema
  );
