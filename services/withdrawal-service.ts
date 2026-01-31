import mongoose from "mongoose";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import WithdrawalRequest from "@/models/WithdrawalRequest";

export class WithdrawalService {

    // Create withdrawal request
    static async createWithdrawalRequest(
        userId: string,
        userType: "customer" | "provider",
        amount: number,
        bankDetails: {
            accountHolderName: string;
            accountNumber: string;
            ifscCode: string;
            bankName: string;
            branchName?: string;
        },
        reason?: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get user wallet
            const wallet = await Wallet.findOne({ userId }).session(session);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Check wallet status
            if (wallet.status !== "active") {
                throw new Error(`Wallet is ${wallet.status}. Cannot process withdrawal.`);
            }

            // Check minimum withdrawal amount
            const minWithdrawal = userType === "provider" ? 100 : 50;
            if (amount < minWithdrawal) {
                throw new Error(`Minimum withdrawal amount is ₹${minWithdrawal}`);
            }

            // Check available balance
            if (wallet.availableBalance < amount) {
                throw new Error("Insufficient balance for withdrawal");
            }

            // Create withdrawal request
            const withdrawalRequest = new WithdrawalRequest({
                userId: new mongoose.Types.ObjectId(userId),
                userType,
                walletId: wallet._id,
                amount,
                availableBalanceAtRequest: wallet.availableBalance,
                bankDetails,
                status: "pending",
                requestReason: reason
            });

            await withdrawalRequest.save({ session });

            // Create pending transaction (not yet processed)
            const transaction = new WalletTransaction({
                walletId: wallet._id,
                userId,
                type: "debit",
                amount,
                balanceAfter: wallet.availableBalance, // Balance unchanged until approved
                category: "withdrawal_request",
                source: "withdrawal",
                referenceId: withdrawalRequest._id,
                referenceType: "withdrawal_request",
                status: "pending",
                approvalStatus: "pending",
                description: `Withdrawal request for ₹${amount}`,
                metadata: { bankDetails }
            });

            await transaction.save({ session });

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    withdrawalRequest,
                    transaction
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Create withdrawal request error:", error);
            return { success: false, error: error.message || "Failed to create withdrawal request" };
        } finally {
            session.endSession();
        }
    }

    // Admin approve withdrawal request
    static async approveWithdrawalRequest(
        requestId: string,
        adminId: string,
        approvalNotes?: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get withdrawal request
            const withdrawalRequest = await WithdrawalRequest.findOne({
                requestId
            }).session(session);

            if (!withdrawalRequest) {
                throw new Error("Withdrawal request not found");
            }

            if (withdrawalRequest.status !== "pending") {
                throw new Error(`Request is already ${withdrawalRequest.status}`);
            }

            // Get user wallet
            const wallet = await Wallet.findById(withdrawalRequest.walletId).session(session);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Check current balance (may have changed since request)
            if (wallet.availableBalance < withdrawalRequest.amount) {
                throw new Error("Insufficient current balance for withdrawal");
            }

            // Update withdrawal request
            withdrawalRequest.status = "approved";
            withdrawalRequest.reviewedBy = new mongoose.Types.ObjectId(adminId);
            withdrawalRequest.reviewedAt = new Date();
            withdrawalRequest.reviewNotes = approvalNotes;
            await withdrawalRequest.save({ session });

            // Debit wallet
            wallet.availableBalance -= withdrawalRequest.amount;
            wallet.lastTransactionAt = new Date();
            await wallet.save({ session });

            // Update the pending transaction
            const transaction = await WalletTransaction.findOne({
                referenceId: withdrawalRequest._id,
                referenceType: "withdrawal_request",
                status: "pending"
            }).session(session);

            if (transaction) {
                transaction.status = "completed";
                transaction.approvalStatus = "approved";
                transaction.approvedBy = new mongoose.Types.ObjectId(adminId);
                transaction.approvalReason = approvalNotes;
                transaction.balanceAfter = wallet.availableBalance;
                transaction.processedAt = new Date();
                await transaction.save({ session });

                withdrawalRequest.debitTransactionId = transaction._id;
                await withdrawalRequest.save({ session });
            }

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    withdrawalRequest,
                    transaction,
                    newBalance: wallet.availableBalance
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Approve withdrawal request error:", error);
            return { success: false, error: error.message || "Failed to approve withdrawal" };
        } finally {
            session.endSession();
        }
    }

    // Admin reject withdrawal request
    static async rejectWithdrawalRequest(
        requestId: string,
        adminId: string,
        rejectionReason: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get withdrawal request
            const withdrawalRequest = await WithdrawalRequest.findOne({
                requestId
            }).session(session);

            if (!withdrawalRequest) {
                throw new Error("Withdrawal request not found");
            }

            if (withdrawalRequest.status !== "pending") {
                throw new Error(`Request is already ${withdrawalRequest.status}`);
            }

            // Update withdrawal request
            withdrawalRequest.status = "rejected";
            withdrawalRequest.reviewedBy = new mongoose.Types.ObjectId(adminId);
            withdrawalRequest.reviewedAt = new Date();
            withdrawalRequest.rejectionReason = rejectionReason;
            await withdrawalRequest.save({ session });

            // Update the pending transaction
            const transaction = await WalletTransaction.findOne({
                referenceId: withdrawalRequest._id,
                referenceType: "withdrawal_request",
                status: "pending"
            }).session(session);

            if (transaction) {
                transaction.status = "failed";
                transaction.approvalStatus = "rejected";
                transaction.approvedBy = new mongoose.Types.ObjectId(adminId);
                transaction.approvalReason = rejectionReason;
                transaction.processedAt = new Date();
                await transaction.save({ session });
            }

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    withdrawalRequest,
                    transaction
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Reject withdrawal request error:", error);
            return { success: false, error: error.message || "Failed to reject withdrawal" };
        } finally {
            session.endSession();
        }
    }

    // Get withdrawal requests for user
    static async getUserWithdrawalRequests(
        userId: string,
        page: number = 1,
        limit: number = 20
    ) {
        try {
            const skip = (page - 1) * limit;

            const requests = await WithdrawalRequest.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('reviewedBy', 'name email')
                .populate('processedBy', 'name email')
                .lean();

            const total = await WithdrawalRequest.countDocuments({ userId });

            return {
                success: true,
                data: {
                    requests,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            };

        } catch (error) {
            console.error("Get user withdrawal requests error:", error);
            return { success: false, error: "Failed to get withdrawal requests" };
        }
    }

    // Get all withdrawal requests for admin
    static async getAllWithdrawalRequests(
        status?: string,
        userType?: string,
        page: number = 1,
        limit: number = 20
    ) {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

            if (status) query.status = status;
            if (userType) query.userType = userType;

            const requests = await WithdrawalRequest.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email phone')
                .populate('reviewedBy', 'name email')
                .populate('processedBy', 'name email')
                .lean();

            const total = await WithdrawalRequest.countDocuments(query);

            return {
                success: true,
                data: {
                    requests,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            };

        } catch (error) {
            console.error("Get all withdrawal requests error:", error);
            return { success: false, error: "Failed to get withdrawal requests" };
        }
    }

    // Cancel withdrawal request (by user, only if pending)
    static async cancelWithdrawalRequest(requestId: string, userId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const withdrawalRequest = await WithdrawalRequest.findOne({
                requestId,
                userId
            }).session(session);

            if (!withdrawalRequest) {
                throw new Error("Withdrawal request not found");
            }

            if (withdrawalRequest.status !== "pending") {
                throw new Error(`Cannot cancel ${withdrawalRequest.status} request`);
            }

            // Update withdrawal request
            withdrawalRequest.status = "cancelled";
            await withdrawalRequest.save({ session });

            // Update the pending transaction
            const transaction = await WalletTransaction.findOne({
                referenceId: withdrawalRequest._id,
                referenceType: "withdrawal_request",
                status: "pending"
            }).session(session);

            if (transaction) {
                transaction.status = "failed";
                transaction.description += " (Cancelled by user)";
                transaction.processedAt = new Date();
                await transaction.save({ session });
            }

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    withdrawalRequest,
                    transaction
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Cancel withdrawal request error:", error);
            return { success: false, error: error.message || "Failed to cancel withdrawal" };
        } finally {
            session.endSession();
        }
    }
}