// Wallet types
export interface TWallet {
    _id: string;
    userId: string;
    userType: "customer" | "provider" | "admin";
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalSpent: number;
    status: "active" | "frozen" | "suspended";
    freezeReason?: string;
    lastTransactionAt?: string;
    createdAt: string;
    updatedAt: string;

    // Virtual fields
    totalBalance?: number;
}

// Wallet Transaction types
export interface TWalletTransaction {
    _id: string;
    transactionId: string;
    walletId: string;
    userId: string;
    type: "credit" | "debit";
    amount: number;
    balanceAfter: number;
    category: "order_payment" | "delivery_settlement" | "cancellation_refund" | "withdrawal_request" | "withdrawal_approved" | "withdrawal_rejected" | "admin_adjustment" | "promotional_credit" | "penalty_deduction" | "reversal";
    source: "order" | "delivery" | "cancellation" | "withdrawal" | "admin" | "promotion" | "penalty";
    referenceId?: string;
    referenceType?: "order" | "delivery_order" | "withdrawal_request" | "admin_action";
    status: "pending" | "completed" | "failed" | "reversed";
    approvalStatus?: "pending" | "approved" | "rejected";
    approvedBy?: string;
    approvalReason?: string;
    description: string;
    metadata?: any;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Delivery Settlement types
export interface TDeliverySettlement {
    _id: string;
    settlementId: string;
    deliveryOrderId: string;
    orderId: string;
    providerId: string;
    customerId: string;
    deliveryDate: string;
    mealAmount: number;
    settlementAmount: number;
    status: "pending" | "settled" | "cancelled" | "disputed" | "reversed";
    settlementType: "automatic" | "manual" | "disputed_resolution";
    deliveryConfirmedAt?: string;
    deliveryConfirmedBy?: string;
    settledAt?: string;
    settledBy?: string;
    settlementReason?: string;
    providerTransactionId?: string;
    adminTransactionId?: string;
    disputeReason?: string;
    disputeResolvedAt?: string;
    disputeResolvedBy?: string;
    notes?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
}

// Withdrawal Request types
export interface TWithdrawalRequest {
    _id: string;
    requestId: string;
    userId: string;
    userType: "customer" | "provider";
    walletId: string;
    amount: number;
    availableBalanceAtRequest: number;
    bankDetails: {
        accountHolderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        branchName?: string;
    };
    status: "pending" | "approved" | "rejected" | "processed" | "failed" | "cancelled";
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    processedAt?: string;
    processedBy?: string;
    processingReference?: string;
    processingNotes?: string;
    debitTransactionId?: string;
    requestReason?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface TWalletResponse {
    success: boolean;
    wallet?: TWallet;
    message: string;
    error?: string;
}

export interface TWalletTransactionResponse {
    success: boolean;
    transaction?: TWalletTransaction;
    transactions?: TWalletTransaction[];
    message: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface TWithdrawalResponse {
    success: boolean;
    request?: TWithdrawalRequest;
    requests?: TWithdrawalRequest[];
    message: string;
    error?: string;
}

export interface TSettlementResponse {
    success: boolean;
    settlement?: TDeliverySettlement;
    settlements?: TDeliverySettlement[];
    message: string;
    error?: string;
}