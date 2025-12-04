import mongoose, { Schema } from "mongoose";
const deliveryOrder = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    deliveryStatus: {
      type: String,
      
      enum: ["confirmed","pending", "delivered", "cancelled", "not_delivered","ready","assigned","out_for_delivery"],
      default: "pending",
    },    
    deliveryDate:{type:Date},
    pendingAt: { type: Date,default:null },
    confirmedAt: { type: Date,default:null },
    readyAt: { type: Date,default:null },
    assignedAt: { type: Date,default:null },
    outForDeliveryAt: { type: Date,default:null },
    deliveredAt: { type: Date,default:null },
    notDeliveredAt: { type: Date,default:null },
    cancelledAt: { type: Date,default:null },
    preparationStartAt: { type: Date,default:null },
  },
  { timestamps: true }
);

export default mongoose.models.DeliveryOrder ||
  mongoose.model<any>("DeliveryOrder", deliveryOrder);

