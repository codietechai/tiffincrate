import mongoose, { Schema, Document } from "mongoose";

export interface IWalletTransaction extends Document {
    // Transaction identification
    transactionId: string; // Unique transaction ID
    walletId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;

    // Transaction details
    type: "credit" | "debit";
    amount: number;
    balanceAfter: number; // Wallet balance after this transaction

    // Transaction category
    category:
    | "order_payment"           // Customer pays for order
    | "delivery_settlement"     // Provider receives payment after delivery
    | "cancellation_refund"     // Customer gets refund for cancelled order
    | "withdrawal_request"      // User requests withdrawal
    | "withdrawal_approved"     // Admin approves withdrawal
    | "withdrawal_rejected"     // Admin rejects withdrawal
    | "admin_adjustment"        // Admin manual adjustment
    | "promotional_credit"      // Admin adds promotional credit
    | "penalty_deduction"       // Admin deducts penalty
    | "reversal";              // Transaction reversal

    // Source and reference
    source: "order" | "delivery" | "cancellation" | "withdrawal" | "admin" | "promotion" | "penalty";
    referenceId?: mongoose.Types.ObjectId; // Order ID, Delivery ID, etc.
    referenceType?: "order" | "delivery_order" | "withdrawal_request" | "admin_action";

    // Status and approval
    status: "pending" | "completed" | "failed" | "reversed";
    approvalStatus?: "pending" | "approved" | "rejected";
    approvedBy?: mongoose.Types.ObjectId; // Admin who approved
    approvalReason?: string;

    // Metadata
    description: string;
    metadata?: any; // Additional data as needed

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    processedAt?: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        walletId: {
            type: Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },

        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
            set: (v: number) => Math.round(v * 100) / 100
        },
        balanceAfter: {
            type: Number,
            required: true,
            min: 0,
            set: (v: number) => Math.round(v * 100) / 100
        },

        category: {
            type: String,
            enum: [
                "order_payment",
                "delivery_settlement",
                "cancellation_refund",
                "withdrawal_request",
                "withdrawal_approved",
                "withdrawal_rejected",
                "admin_adjustment",
                "promotional_credit",
                "penalty_deduction",
                "reversal"
            ],
            required: true
        },

        source: {
            type: String,
            enum: ["order", "delivery", "cancellation", "withdrawal", "admin", "promotion", "penalty"],
            required: true
        },
        referenceId: { type: Schema.Types.ObjectId },
        referenceType: {
            type: String,
            enum: ["order", "delivery_order", "withdrawal_request", "admin_action"]
        },

        status: {
            type: String,
            enum: ["pending", "completed", "failed", "reversed"],
            default: "pending"
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"]
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvalReason: { type: String },

        description: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed },

        processedAt: { type: Date }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound indexes for efficient queries
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ referenceId: 1, referenceType: 1 });
walletTransactionSchema.index({ status: 1, approvalStatus: 1 });
walletTransactionSchema.index({ category: 1, createdAt: -1 });

// Generate unique transaction ID
walletTransactionSchema.pre('save', function (next) {
    if (!this.transactionId) {
        this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

export default mongoose.models.WalletTransaction ||
    mongoose.model<IWalletTransaction>("WalletTransaction", walletTransactionSchema);