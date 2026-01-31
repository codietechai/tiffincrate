import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  userType: "customer" | "provider" | "admin";

  // Balance fields
  availableBalance: number;
  pendingBalance: number; // For providers: money earned but not yet withdrawable
  totalEarned: number; // For providers: lifetime earnings
  totalSpent: number; // For customers: lifetime spending

  // Status
  status: "active" | "frozen" | "suspended";
  freezeReason?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTransactionAt?: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true
    },
    userType: {
      type: String,
      enum: ["customer", "provider", "admin"],
      required: true
    },

    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100 // Round to 2 decimal places
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
      set: (v: number) => Math.round(v * 100) / 100
    },

    status: {
      type: String,
      enum: ["active", "frozen", "suspended"],
      default: "active"
    },
    freezeReason: { type: String },

    lastTransactionAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
walletSchema.index({ userId: 1, userType: 1 });
walletSchema.index({ status: 1 });

// Virtual for total balance (available + pending)
walletSchema.virtual('totalBalance').get(function () {
  return this.availableBalance + this.pendingBalance;
});

export default mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", walletSchema);