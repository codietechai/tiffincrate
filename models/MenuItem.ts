import mongoose, { Document, Schema } from "mongoose";

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    menuId: { type: Schema.Types.ObjectId, ref: "Menu" },
    images: [{ type: String }],
    day: { type: String },
  },
  { timestamps: true }
);

const MenuItem =
  mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
