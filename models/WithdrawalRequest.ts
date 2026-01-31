import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawalRequest extends Document {
    // Request identification
    requestId: string;
    userId: mongoose.Types.ObjectId;
    userType: "customer" | "provider";
    walletId: mongoose.Types.ObjectId;

    // Withdrawal details
    amount: number;
    availableBalanceAtRequest: number; // Wallet balance when request was made

    // Bank details
    bankDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        branchName?: string;
    };

    // Status and processing
    status: "pending" | "approved" | "rejected" | "processed" | "failed" | "cancelled";

    // Admin processing
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    reviewNotes?: string;
    rejectionReason?: string;

    // Processing details
    processedAt?: Date;
    processedBy?: mongoose.Types.ObjectId;
    processingReference?: string; // Bank transaction reference
    processingNotes?: string;

    // Transaction references
    debitTransactionId?: mongoose.Types.ObjectId; // Transaction that debited wallet

    // Metadata
    requestReason?: string;
    metadata?: any;

    createdAt: Date;
    updatedAt: Date;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>(
    {
        requestId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        userType: {
            type: String,
            enum: ["customer", "provider"],
            required: true
        },
        walletId: {
            type: Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
            index: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
            set: (v: number) => Math.round(v * 100) / 100
        },
        availableBalanceAtRequest: {
            type: Number,
            required: true,
            min: 0,
            set: (v: number) => Math.round(v * 100) / 100
        },

        bankDetails: {
            accountHolderName: { type: String, required: true },
            accountNumber: { type: String, required: true },
            ifscCode: { type: String, required: true },
            bankName: { type: String, required: true },
            branchName: { type: String }
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "processed", "failed", "cancelled"],
            default: "pending",
            index: true
        },

        reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date },
        reviewNotes: { type: String },
        rejectionReason: { type: String },

        processedAt: { type: Date },
        processedBy: { type: Schema.Types.ObjectId, ref: "User" },
        processingReference: { type: String },
        processingNotes: { type: String },

        debitTransactionId: { type: Schema.Types.ObjectId, ref: "WalletTransaction" },

        requestReason: { type: String },
        metadata: { type: Schema.Types.Mixed }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound indexes for efficient queries
withdrawalRequestSchema.index({ userId: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });
withdrawalRequestSchema.index({ userType: 1, status: 1 });

// Generate unique request ID
withdrawalRequestSchema.pre('save', function (next) {
    if (!this.requestId) {
        this.requestId = `WDR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

export default mongoose.models.WithdrawalRequest ||
    mongoose.model<IWithdrawalRequest>("WithdrawalRequest", withdrawalRequestSchema);