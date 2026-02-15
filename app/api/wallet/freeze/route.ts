import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";

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

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return NextResponse.json(
                { error: "Wallet not found" },
                { status: 404 }
            );
        }

        wallet.isFrozen = true;
        wallet.frozenReason = reason;
        wallet.frozenBy = adminId;
        wallet.frozenAt = new Date();
        await wallet.save();

        return NextResponse.json({
            success: true,
            data: wallet,
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

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return NextResponse.json(
                { error: "Wallet not found" },
                { status: 404 }
            );
        }

        wallet.isFrozen = false;
        wallet.frozenReason = undefined;
        wallet.frozenBy = undefined;
        wallet.frozenAt = undefined;
        await wallet.save();

        return NextResponse.json({
            success: true,
            data: wallet,
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