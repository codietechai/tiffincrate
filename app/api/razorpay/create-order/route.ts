import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body?.amount);
    const currency = body?.currency || "INR";

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be a positive number." },
        { status: 400 }
      );
    }

    const order = await createRazorpayOrder(amount, currency);

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("/api/razorpay/create-order error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create order" }, { status: 500 });
  }
}
