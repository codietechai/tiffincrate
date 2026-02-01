import mongoose from "mongoose";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import DeliverySettlement from "@/models/DeliverySettlement";
import WithdrawalRequest from "@/models/WithdrawalRequest";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Wallet Service Class (for direct API calls and server-side operations)
export class WalletService {
    // API-based methods (for client-side use)
    static async getWalletBalance(): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.get(ROUTES.WALLET.BASE);
    }

    static async addMoney(payload: {
        amount: number;
        paymentMethod: string;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.post(ROUTES.WALLET.ADD_MONEY, payload);
    }

    static async getTransactionHistory(params?: {
        page?: number;
        limit?: number;
        category?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: any[];
        pagination: any;
        message: string;
    }> {
        const url = ROUTES.WALLET.TRANSACTIONS;
        return httpClient.get(url);
    }

    static async freezeWallet(payload: {
        reason: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.post(ROUTES.WALLET.FREEZE, payload);
    }

    static async requestWithdrawal(payload: {
        amount: number;
        bankDetails: {
            accountNumber: string;
            ifscCode: string;
            accountHolderName: string;
            bankName: string;
        };
        reason?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.post(ROUTES.WALLET.WITHDRAWAL, payload);
    }

    static async getWithdrawalRequests(): Promise<{
        data: any[];
        message: string;
    }> {
        return httpClient.get(ROUTES.WALLET.WITHDRAWAL);
    }

    static async updateWithdrawalRequest(requestId: string, payload: {
        status: "approved" | "rejected";
        adminNotes?: string;
    }): Promise<{
        data: any;
        message: string;
    }> {
        return httpClient.put(ROUTES.WALLET.WITHDRAWAL_BY_ID(requestId), payload);
    }

    // Server-side methods (for internal use in API routes)
    static async createWallet(userId: string, userType: "customer" | "provider" | "admin") {
        try {
            const existingWallet = await Wallet.findOne({ userId });
            if (existingWallet) {
                return { success: false, error: "Wallet already exists" };
            }

            const wallet = new Wallet({
                userId: new mongoose.Types.ObjectId(userId),
                userType,
                availableBalance: 0,
                pendingBalance: 0,
                totalEarned: 0,
                totalSpent: 0,
                status: "active"
            });

            await wallet.save();
            return { success: true, data: wallet };
        } catch (error) {
            console.error("Create wallet error:", error);
            return { success: false, error: "Failed to create wallet" };
        }
    }

    static async getWallet(userId: string) {
        try {
            const wallet = await Wallet.findOne({ userId });
            if (!wallet) {
                return { success: false, error: "Wallet not found" };
            }
            return { success: true, data: wallet };
        } catch (error) {
            console.error("Get wallet error:", error);
            return { success: false, error: "Failed to get wallet" };
        }
    }

    static async processOrderPayment(
        customerId: string,
        orderId: string,
        amount: number,
        description: string = "Order payment"
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const customerWallet = await Wallet.findOne({ userId: customerId }).session(session);
            const adminWallet = await Wallet.findOne({ userType: "admin" }).session(session);

            if (!customerWallet || !adminWallet) {
                throw new Error("Wallet not found");
            }

            if (customerWallet.availableBalance < amount) {
                throw new Error("Insufficient balance");
            }

            customerWallet.availableBalance -= amount;
            customerWallet.totalSpent += amount;
            customerWallet.lastTransactionAt = new Date();
            await customerWallet.save({ session });

            adminWallet.availableBalance += amount;
            adminWallet.lastTransactionAt = new Date();
            await adminWallet.save({ session });

            const customerTransaction = new WalletTransaction({
                walletId: customerWallet._id,
                userId: customerId,
                type: "debit",
                amount,
                balanceAfter: customerWallet.availableBalance,
                category: "order_payment",
                source: "order",
                referenceId: new mongoose.Types.ObjectId(orderId),
                referenceType: "order",
                status: "completed",
                description,
                processedAt: new Date()
            });
            await customerTransaction.save({ session });

            const adminTransaction = new WalletTransaction({
                walletId: adminWallet._id,
                userId: adminWallet.userId,
                type: "credit",
                amount,
                balanceAfter: adminWallet.availableBalance,
                category: "order_payment",
                source: "order",
                referenceId: new mongoose.Types.ObjectId(orderId),
                referenceType: "order",
                status: "completed",
                description: `Order payment from customer`,
                processedAt: new Date()
            });
            await adminTransaction.save({ session });

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    customerTransaction,
                    adminTransaction,
                    customerBalance: customerWallet.availableBalance,
                    adminBalance: adminWallet.availableBalance
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Process order payment error:", error);
            return { success: false, error: (error as Error).message || "Payment processing failed" };
        } finally {
            session.endSession();
        }
    }

    static async processDeliverySettlement(
        deliveryOrderId: string,
        providerId: string,
        orderId: string,
        customerId: string,
        mealAmount: number,
        deliveryDate: Date,
        settlementType: "automatic" | "manual" = "automatic"
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const existingSettlement = await DeliverySettlement.findOne({
                deliveryOrderId
            }).session(session);

            if (existingSettlement) {
                throw new Error("Settlement already processed for this delivery");
            }

            const providerWallet = await Wallet.findOne({ userId: providerId }).session(session);
            const adminWallet = await Wallet.findOne({ userType: "admin" }).session(session);

            if (!providerWallet || !adminWallet) {
                throw new Error("Wallet not found");
            }

            if (adminWallet.availableBalance < mealAmount) {
                throw new Error("Insufficient admin balance for settlement");
            }

            adminWallet.availableBalance -= mealAmount;
            adminWallet.lastTransactionAt = new Date();
            await adminWallet.save({ session });

            providerWallet.availableBalance += mealAmount;
            providerWallet.totalEarned += mealAmount;
            providerWallet.lastTransactionAt = new Date();
            await providerWallet.save({ session });

            const adminTransaction = new WalletTransaction({
                walletId: adminWallet._id,
                userId: adminWallet.userId,
                type: "debit",
                amount: mealAmount,
                balanceAfter: adminWallet.availableBalance,
                category: "delivery_settlement",
                source: "delivery",
                referenceId: new mongoose.Types.ObjectId(deliveryOrderId),
                referenceType: "delivery_order",
                status: "completed",
                description: `Settlement for delivery on ${deliveryDate.toDateString()}`,
                processedAt: new Date()
            });
            await adminTransaction.save({ session });

            const providerTransaction = new WalletTransaction({
                walletId: providerWallet._id,
                userId: providerId,
                type: "credit",
                amount: mealAmount,
                balanceAfter: providerWallet.availableBalance,
                category: "delivery_settlement",
                source: "delivery",
                referenceId: new mongoose.Types.ObjectId(deliveryOrderId),
                referenceType: "delivery_order",
                status: "completed",
                description: `Delivery settlement for ${deliveryDate.toDateString()}`,
                processedAt: new Date()
            });
            await providerTransaction.save({ session });

            const settlement = new DeliverySettlement({
                deliveryOrderId: new mongoose.Types.ObjectId(deliveryOrderId),
                orderId: new mongoose.Types.ObjectId(orderId),
                providerId: new mongoose.Types.ObjectId(providerId),
                customerId: new mongoose.Types.ObjectId(customerId),
                deliveryDate,
                mealAmount,
                settlementAmount: mealAmount,
                status: "settled",
                settlementType,
                deliveryConfirmedAt: new Date(),
                settledAt: new Date(),
                providerTransactionId: providerTransaction._id,
                adminTransactionId: adminTransaction._id
            });
            await settlement.save({ session });

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    settlement,
                    providerTransaction,
                    adminTransaction,
                    providerBalance: providerWallet.availableBalance,
                    adminBalance: adminWallet.availableBalance
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Process delivery settlement error:", error);
            return { success: false, error: (error as Error).message || "Settlement processing failed" };
        } finally {
            session.endSession();
        }
    }

    static async processCancellationRefund(
        customerId: string,
        orderId: string,
        deliveryOrderId: string,
        refundAmount: number,
        reason: string = "Order cancellation refund"
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const customerWallet = await Wallet.findOne({ userId: customerId }).session(session);
            const adminWallet = await Wallet.findOne({ userType: "admin" }).session(session);

            if (!customerWallet || !adminWallet) {
                throw new Error("Wallet not found");
            }

            if (adminWallet.availableBalance < refundAmount) {
                throw new Error("Insufficient admin balance for refund");
            }

            adminWallet.availableBalance -= refundAmount;
            adminWallet.lastTransactionAt = new Date();
            await adminWallet.save({ session });

            customerWallet.availableBalance += refundAmount;
            customerWallet.lastTransactionAt = new Date();
            await customerWallet.save({ session });

            const adminTransaction = new WalletTransaction({
                walletId: adminWallet._id,
                userId: adminWallet.userId,
                type: "debit",
                amount: refundAmount,
                balanceAfter: adminWallet.availableBalance,
                category: "cancellation_refund",
                source: "cancellation",
                referenceId: new mongoose.Types.ObjectId(deliveryOrderId),
                referenceType: "delivery_order",
                status: "completed",
                description: `Refund: ${reason}`,
                processedAt: new Date()
            });
            await adminTransaction.save({ session });

            const customerTransaction = new WalletTransaction({
                walletId: customerWallet._id,
                userId: customerId,
                type: "credit",
                amount: refundAmount,
                balanceAfter: customerWallet.availableBalance,
                category: "cancellation_refund",
                source: "cancellation",
                referenceId: new mongoose.Types.ObjectId(deliveryOrderId),
                referenceType: "delivery_order",
                status: "completed",
                description: reason,
                processedAt: new Date()
            });
            await customerTransaction.save({ session });

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    customerTransaction,
                    adminTransaction,
                    customerBalance: customerWallet.availableBalance,
                    adminBalance: adminWallet.availableBalance
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Process cancellation refund error:", error);
            return { success: false, error: (error as Error).message || "Refund processing failed" };
        } finally {
            session.endSession();
        }
    }
}

// React Query Hooks for Wallet
export const useWallet = () => {
    return useQuery({
        queryKey: QUERY_KEYS.WALLET.BALANCE,
        queryFn: () => WalletService.getWalletBalance(),
    });
};

export const useWalletTransactions = (params?: {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery({
        queryKey: QUERY_KEYS.WALLET.TRANSACTIONS(params),
        queryFn: () => WalletService.getTransactionHistory(params),
    });
};

export const useWithdrawalRequests = () => {
    return useQuery({
        queryKey: QUERY_KEYS.WALLET.WITHDRAWAL_REQUESTS,
        queryFn: WalletService.getWithdrawalRequests,
    });
};

export const useAddMoney = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: WalletService.addMoney,
        onSuccess: () => {
            // Invalidate wallet-related queries
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
};

export const useFreezeWallet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: WalletService.freezeWallet,
        onSuccess: () => {
            // Invalidate wallet-related queries
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
};

export const useRequestWithdrawal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: WalletService.requestWithdrawal,
        onSuccess: () => {
            // Invalidate wallet-related queries
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
};

export const useUpdateWithdrawalRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ requestId, payload }: { requestId: string; payload: any }) =>
            WalletService.updateWithdrawalRequest(requestId, payload),
        onSuccess: () => {
            // Invalidate wallet-related queries
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
};