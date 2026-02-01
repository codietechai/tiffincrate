import mongoose from "mongoose";

export interface IHelpRequest extends mongoose.Document {
  _id: string;
  fromUserId: mongoose.Types.ObjectId;
  toUserId?: mongoose.Types.ObjectId;
  type: "admin_support" | "provider_support" | "consumer_to_provider";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "order" | "account" | "general" | "delivery" | "payment";
  attachments?: string[];
  responses: Array<{
    userId: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
    isAdmin: boolean;
    attachments?: string[];
  }>;
  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  satisfactionRating?: number;
  tags: string[];
  relatedOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const helpRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["admin_support", "provider_support", "consumer_to_provider"],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: "text",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    category: {
      type: String,
      enum: ["technical", "billing", "order", "account", "general", "delivery", "payment"],
      default: "general",
      index: true,
    },
    attachments: [{
      type: String,
      maxlength: 500,
    }],
    responses: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: {
        type: String,
        required: true,
        maxlength: 2000,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      attachments: [{
        type: String,
        maxlength: 500,
      }],
    }],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    assignedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: {
      type: String,
      maxlength: 1000,
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50,
    }],
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
helpRequestSchema.index({ fromUserId: 1, createdAt: -1 });
helpRequestSchema.index({ status: 1, priority: -1 });
helpRequestSchema.index({ assignedTo: 1, status: 1 });
helpRequestSchema.index({ category: 1, status: 1 });
helpRequestSchema.index({ type: 1, status: 1 });

// Text search index
helpRequestSchema.index({
  subject: "text",
  message: "text",
  tags: "text"
});

// Virtual for response count
helpRequestSchema.virtual('responseCount').get(function () {
  return this.responses.length;
});

// Virtual for resolution time (in hours)
helpRequestSchema.virtual('resolutionTime').get(function () {
  if (this.resolvedAt) {
    const diffTime = this.resolvedAt.getTime() - this.createdAt.getTime();
    return Math.round(diffTime / (1000 * 60 * 60)); // hours
  }
  return null;
});

export default mongoose.models.HelpRequest ||
  mongoose.model<IHelpRequest>("HelpRequest", helpRequestSchema);
