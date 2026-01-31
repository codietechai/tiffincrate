import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { WalletService } from "@/services/wallet-service";

// Freeze wallet (Admin only)
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

        const { userId, reason } = await request.json();

        if (!userId || !reason) {
            return NextResponse.json(
                { error: "User ID and reason are required" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const result = await WalletService.freezeWallet(userId, reason, adminId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            message: "Wallet frozen successfully"
        });

    } catch (error) {
        console.error("Freeze wallet error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Unfreeze wallet (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const adminId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!adminId || role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const result = await WalletService.unfreezeWallet(userId, adminId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            message: "Wallet unfrozen successfully"
        });

    } catch (error) {
        console.error("Unfreeze wallet error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}