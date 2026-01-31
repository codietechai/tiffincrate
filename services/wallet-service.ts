import mongoose from "mongoose";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import DeliverySettlement from "@/models/DeliverySettlement";
import WithdrawalRequest from "@/models/WithdrawalRequest";

export class WalletService {

    // Create wallet for new user
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

    // Get wallet by user ID
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

    // Process order payment (Customer pays, Admin receives)
    static async processOrderPayment(
        customerId: string,
        orderId: string,
        amount: number,
        description: string = "Order payment"
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get customer and admin wallets
            const customerWallet = await Wallet.findOne({ userId: customerId }).session(session);
            const adminWallet = await Wallet.findOne({ userType: "admin" }).session(session);

            if (!customerWallet || !adminWallet) {
                throw new Error("Wallet not found");
            }

            // Check customer balance
            if (customerWallet.availableBalance < amount) {
                throw new Error("Insufficient balance");
            }

            // Debit customer wallet
            customerWallet.availableBalance -= amount;
            customerWallet.totalSpent += amount;
            customerWallet.lastTransactionAt = new Date();
            await customerWallet.save({ session });

            // Credit admin wallet
            adminWallet.availableBalance += amount;
            adminWallet.lastTransactionAt = new Date();
            await adminWallet.save({ session });

            // Create customer debit transaction
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

            // Create admin credit transaction
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
            return { success: false, error: error.message || "Payment processing failed" };
        } finally {
            session.endSession();
        }
    }

    // Process delivery settlement (Admin pays Provider)
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
            // Check if settlement already exists
            const existingSettlement = await DeliverySettlement.findOne({
                deliveryOrderId
            }).session(session);

            if (existingSettlement) {
                throw new Error("Settlement already processed for this delivery");
            }

            // Get provider and admin wallets
            const providerWallet = await Wallet.findOne({ userId: providerId }).session(session);
            const adminWallet = await Wallet.findOne({ userType: "admin" }).session(session);

            if (!providerWallet || !adminWallet) {
                throw new Error("Wallet not found");
            }

            // Check admin balance
            if (adminWallet.availableBalance < mealAmount) {
                throw new Error("Insufficient admin balance for settlement");
            }

            // Debit admin wallet
            adminWallet.availableBalance -= mealAmount;
            adminWallet.lastTransactionAt = new Date();
            await adminWallet.save({ session });

            // Credit provider wallet
            providerWallet.availableBalance += mealAmount;
            providerWallet.totalEarned += mealAmount;
            providerWallet.lastTransactionAt = new Date();
            await providerWallet.save({ session });

            // Create admin debit transaction
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

            // Create provider credit transaction
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

            // Create settlement record
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
            return { success: false, error: error.message || "Settlement processing failed" };
        } finally {
            session.endSession();
        }
    }

    // Process cancellation refund (Admin refunds Customer)
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
            // Get customer and admin wallets
            const customerWallet = await Wallet.findOne({ userId: customerId }).session(session);
            const adminWallet = await Wallet.findOne({ userType: "admin" }).session(session);

            if (!customerWallet || !adminWallet) {
                throw new Error("Wallet not found");
            }

            // Check admin balance
            if (adminWallet.availableBalance < refundAmount) {
                throw new Error("Insufficient admin balance for refund");
            }

            // Debit admin wallet
            adminWallet.availableBalance -= refundAmount;
            adminWallet.lastTransactionAt = new Date();
            await adminWallet.save({ session });

            // Credit customer wallet
            customerWallet.availableBalance += refundAmount;
            customerWallet.lastTransactionAt = new Date();
            await customerWallet.save({ session });

            // Create admin debit transaction
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

            // Create customer credit transaction
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
            return { success: false, error: error.message || "Refund processing failed" };
        } finally {
            session.endSession();
        }
    }

    // Add money to wallet (for testing or admin actions)
    static async addMoney(
        userId: string,
        amount: number,
        reason: string = "Admin credit",
        adminId?: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await Wallet.findOne({ userId }).session(session);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Credit wallet
            wallet.availableBalance += amount;
            wallet.lastTransactionAt = new Date();
            await wallet.save({ session });

            // Create credit transaction
            const transaction = new WalletTransaction({
                walletId: wallet._id,
                userId,
                type: "credit",
                amount,
                balanceAfter: wallet.availableBalance,
                category: "admin_adjustment",
                source: "admin",
                status: "completed",
                description: reason,
                approvedBy: adminId ? new mongoose.Types.ObjectId(adminId) : undefined,
                processedAt: new Date()
            });
            await transaction.save({ session });

            await session.commitTransaction();
            return {
                success: true,
                data: {
                    transaction,
                    newBalance: wallet.availableBalance
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("Add money error:", error);
            return { success: false, error: error.message || "Failed to add money" };
        } finally {
            session.endSession();
        }
    }

    // Get wallet transaction history
    static async getTransactionHistory(
        userId: string,
        page: number = 1,
        limit: number = 20,
        category?: string
    ) {
        try {
            const skip = (page - 1) * limit;
            const query: any = { userId };

            if (category) {
                query.category = category;
            }

            const transactions = await WalletTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('approvedBy', 'name email')
                .lean();

            const total = await WalletTransaction.countDocuments(query);

            return {
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            };

        } catch (error) {
            console.error("Get transaction history error:", error);
            return { success: false, error: "Failed to get transaction history" };
        }
    }

    // Freeze/Unfreeze wallet
    static async freezeWallet(userId: string, reason: string, adminId: string) {
        try {
            const wallet = await Wallet.findOne({ userId });
            if (!wallet) {
                return { success: false, error: "Wallet not found" };
            }

            wallet.status = "frozen";
            wallet.freezeReason = reason;
            await wallet.save();

            return { success: true, data: wallet };
        } catch (error) {
            console.error("Freeze wallet error:", error);
            return { success: false, error: "Failed to freeze wallet" };
        }
    }

    static async unfreezeWallet(userId: string, adminId: string) {
        try {
            const wallet = await Wallet.findOne({ userId });
            if (!wallet) {
                return { success: false, error: "Wallet not found" };
            }

            wallet.status = "active";
            wallet.freezeReason = undefined;
            await wallet.save();

            return { success: true, data: wallet };
        } catch (error) {
            console.error("Unfreeze wallet error:", error);
            return { success: false, error: "Failed to unfreeze wallet" };
        }
    }
}