import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

// Get wallet transaction history
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const category = searchParams.get("category") || undefined;

        await connectMongoDB();

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return NextResponse.json(
                { error: "Wallet not found" },
                { status: 404 }
            );
        }

        const query: any = { walletId: wallet._id };
        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;
        const transactions = await WalletTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await WalletTransaction.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: transactions,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: transactions.length,
                totalRecords: total,
            },
            message: "Transactions fetched successfully"
        });

    } catch (error) {
        console.error("Get transaction history error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}