import mongoose, { Schema, Document } from "mongoose";

export interface IDeliverySettlement extends Document {
    // Settlement identification
    settlementId: string;
    deliveryOrderId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    providerId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;

    // Settlement details
    deliveryDate: Date;
    mealAmount: number; // Amount for this specific meal
    settlementAmount: number; // Actual amount settled (may differ due to adjustments)

    // Status tracking
    status: "pending" | "settled" | "cancelled" | "disputed" | "reversed";
    settlementType: "automatic" | "manual" | "disputed_resolution";

    // Delivery confirmation
    deliveryConfirmedAt?: Date;
    deliveryConfirmedBy?: mongoose.Types.ObjectId; // Provider or system
    deliveryProof?: {
        type: "photo" | "gps" | "customer_confirmation" | "system_auto";
        data: any;
    };

    // Settlement processing
    settledAt?: Date;
    settledBy?: mongoose.Types.ObjectId; // Admin who processed
    settlementReason?: string;

    // Transaction references
    providerTransactionId?: mongoose.Types.ObjectId;
    adminTransactionId?: mongoose.Types.ObjectId;

    // Dispute handling
    disputeReason?: string;
    disputeResolvedAt?: Date;
    disputeResolvedBy?: mongoose.Types.ObjectId;

    // Metadata
    notes?: string;
    metadata?: any;

    createdAt: Date;
    updatedAt: Date;
}

const deliverySettlementSchema = new Schema<IDeliverySettlement>(
    {
        settlementId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        deliveryOrderId: {
            type: Schema.Types.ObjectId,
            ref: "DeliveryOrder",
            required: true,
            index: true
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },
        providerId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceProvider",
            required: true,
            index: true
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        deliveryDate: { type: Date, required: true, index: true },
        mealAmount: {
            type: Number,
            required: true,
            min: 0,
            set: (v: number) => Math.round(v * 100) / 100
        },
        settlementAmount: {
            type: Number,
            required: true,
            min: 0,
            set: (v: number) => Math.round(v * 100) / 100
        },

        status: {
            type: String,
            enum: ["pending", "settled", "cancelled", "disputed", "reversed"],
            default: "pending",
            index: true
        },
        settlementType: {
            type: String,
            enum: ["automatic", "manual", "disputed_resolution"],
            default: "automatic"
        },

        deliveryConfirmedAt: { type: Date },
        deliveryConfirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
        deliveryProof: {
            type: {
                type: String,
                enum: ["photo", "gps", "customer_confirmation", "system_auto"]
            },
            data: Schema.Types.Mixed
        },

        settledAt: { type: Date },
        settledBy: { type: Schema.Types.ObjectId, ref: "User" },
        settlementReason: { type: String },

        providerTransactionId: { type: Schema.Types.ObjectId, ref: "WalletTransaction" },
        adminTransactionId: { type: Schema.Types.ObjectId, ref: "WalletTransaction" },

        disputeReason: { type: String },
        disputeResolvedAt: { type: Date },
        disputeResolvedBy: { type: Schema.Types.ObjectId, ref: "User" },

        notes: { type: String },
        metadata: { type: Schema.Types.Mixed }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound indexes for efficient queries
deliverySettlementSchema.index({ providerId: 1, deliveryDate: -1 });
deliverySettlementSchema.index({ customerId: 1, deliveryDate: -1 });
deliverySettlementSchema.index({ status: 1, deliveryDate: -1 });
deliverySettlementSchema.index({ deliveryOrderId: 1 }, { unique: true }); // One settlement per delivery

// Generate unique settlement ID
deliverySettlementSchema.pre('save', function (next) {
    if (!this.settlementId) {
        this.settlementId = `SETTLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

export default mongoose.models.DeliverySettlement ||
    mongoose.model<IDeliverySettlement>("DeliverySettlement", deliverySettlementSchema);