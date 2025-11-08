import mongoose, { Schema } from "mongoose";
const deliveryOrder = new Schema<any>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    deliveryStatus: {
      type: String,
      enum: ["confirmed","pending", "delivered", "cancelled", "not_delivered","ready","assigned","out_for_delivery"],
      default: "pending",
    },    
    deliveryDate:{type:Date}
  },
  { timestamps: true }
);

export default mongoose.models.DeliveryOrder ||
  mongoose.model<any>("DeliveryOrder", deliveryOrder);

