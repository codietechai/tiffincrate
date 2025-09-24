import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectMongoDB();
    const { status } = await request.json();
    
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check permissions
    if (decoded.role === 'provider' && order.providerId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (decoded.role === 'consumer' && order.consumerId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    order.status = status;
    await order.save();
    
    return NextResponse.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}