import mongoose from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends mongoose.Document {
  _id: string;
  consumerId: string;
  providerId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  deliveryDate: Date;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema({
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);