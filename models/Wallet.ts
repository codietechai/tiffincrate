import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    transactionAmount: {
      type: Number,
      required: true,
    },

    walletBalance: {
      type: Number,
      required: true,
    },

    transactionType: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);