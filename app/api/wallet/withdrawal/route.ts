import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { WithdrawalService } from "@/services/withdrawal-service";

// Create withdrawal request
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (role === "admin") {
            return NextResponse.json(
                { error: "Admin cannot create withdrawal requests" },
                { status: 403 }
            );
        }

        const {
            amount,
            bankDetails,
            reason
        } = await request.json();

        if (!amount || !bankDetails) {
            return NextResponse.json(
                { error: "Amount and bank details are required" },
                { status: 400 }
            );
        }

        // Validate bank details
        const requiredFields = ['accountHolderName', 'accountNumber', 'ifscCode', 'bankName'];
        for (const field of requiredFields) {
            if (!bankDetails[field]) {
                return NextResponse.json(
                    { error: `${field} is required in bank details` },
                    { status: 400 }
                );
            }
        }

        await connectMongoDB();

        const userType = role === "provider" ? "provider" : "customer";

        const result = await WithdrawalService.createWithdrawalRequest(
            userId,
            userType,
            amount,
            bankDetails,
            reason
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
            message: "Withdrawal request created successfully"
        });

    } catch (error) {
        console.error("Create withdrawal request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get withdrawal requests
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        await connectMongoDB();

        let result;

        if (role === "admin") {
            // Admin can see all withdrawal requests
            const status = searchParams.get("status") || undefined;
            const userType = searchParams.get("userType") || undefined;

            result = await WithdrawalService.getAllWithdrawalRequests(
                status,
                userType,
                page,
                limit
            );
        } else {
            // Users can only see their own requests
            result = await WithdrawalService.getUserWithdrawalRequests(
                userId,
                page,
                limit
            );
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error("Get withdrawal requests error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}