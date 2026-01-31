import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { WalletService } from "@/services/wallet-service";

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

        const result = await WalletService.addMoney(
            userId,
            amount,
            reason || "Admin credit",
            adminId
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
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