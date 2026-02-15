import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

// Add money to wallet (Admin only or for testing)
export async function POST(request: NextRequest) {
    try {
        const adminId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!adminId || role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { userId, amount, reason } = await request.json();

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        // Find or create wallet
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = await Wallet.create({
                userId,
                balance: 0,
                frozenAmount: 0,
                currency: "INR",
            });
        }

        // Update wallet balance
        wallet.balance += amount;
        await wallet.save();

        // Create transaction record
        await WalletTransaction.create({
            walletId: wallet._id,
            type: "credit",
            amount,
            category: "admin_credit",
            description: reason || "Admin credit",
            balanceAfter: wallet.balance,
            metadata: {
                adminId,
                reason,
            },
        });

        return NextResponse.json({
            success: true,
            data: { wallet, amount },
            message: "Money added successfully"
        });

    } catch (error) {
        console.error("Add money error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}