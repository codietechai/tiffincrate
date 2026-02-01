import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "provider" | "consumer";
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  favorites?: mongoose.Types.ObjectId[];
  tokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "provider", "consumer"],
      default: "consumer",
      required: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
    tokenVersion: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        if (ret.password) {
          delete (ret as any).password;
        }
        return ret;
      }
    },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true, unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ isVerified: 1, role: 1 });
userSchema.index({ createdAt: -1 });

// Compound index for admin queries
userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
