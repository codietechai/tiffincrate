import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { WithdrawalService } from "@/services/withdrawal-service";

// Approve withdrawal request (Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { requestId: string } }
) {
    try {
        const adminId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!adminId || role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { requestId } = params;
        const { action, notes, rejectionReason } = await request.json();

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "Valid action (approve/reject) is required" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        let result;

        if (action === "approve") {
            result = await WithdrawalService.approveWithdrawalRequest(
                requestId,
                adminId,
                notes
            );
        } else {
            if (!rejectionReason) {
                return NextResponse.json(
                    { error: "Rejection reason is required" },
                    { status: 400 }
                );
            }

            result = await WithdrawalService.rejectWithdrawalRequest(
                requestId,
                adminId,
                rejectionReason
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
            data: result.data,
            message: `Withdrawal request ${action}d successfully`
        });

    } catch (error) {
        console.error("Process withdrawal request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Cancel withdrawal request (User only, if pending)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { requestId: string } }
) {
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
                { error: "Admin cannot cancel withdrawal requests" },
                { status: 403 }
            );
        }

        const { requestId } = params;

        await connectMongoDB();

        const result = await WithdrawalService.cancelWithdrawalRequest(
            requestId,
            userId
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
            message: "Withdrawal request cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel withdrawal request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}