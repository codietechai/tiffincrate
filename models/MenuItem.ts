import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description?: string;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const MenuItem =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>("MenuItem", menuItemSchema);

export default MenuItem;
