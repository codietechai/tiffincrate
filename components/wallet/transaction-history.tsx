"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

interface Transaction {
    _id: string;
    transactionId: string;
    type: "credit" | "debit";
    amount: number;
    balanceAfter: number;
    category: string;
    source: string;
    status: "pending" | "completed" | "failed" | "reversed";
    description: string;
    createdAt: string;
    processedAt?: string;
    approvedBy?: {
        name: string;
        email: string;
    };
}

interface TransactionHistoryProps {
    userId?: string;
    showFilters?: boolean;
    maxHeight?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    userId,
    showFilters = true,
    maxHeight = "400px"
}) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const categories = [
        { value: "all", label: "All Transactions" },
        { value: "order_payment", label: "Order Payments" },
        { value: "delivery_settlement", label: "Delivery Settlements" },
        { value: "cancellation_refund", label: "Refunds" },
        { value: "withdrawal_request", label: "Withdrawals" },
        { value: "admin_adjustment", label: "Admin Adjustments" },
        { value: "promotional_credit", label: "Promotional Credits" }
    ];

    useEffect(() => {
        fetchTransactions();
    }, [page, selectedCategory]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10"
            });

            if (selectedCategory !== "all") {
                params.append("category", selectedCategory);
            }

            const response = await fetch(`/api/wallet/transactions?${params}`);
            const data = await response.json();

            if (data.success) {
                setTransactions(data.data.transactions);
                setTotalPages(data.data.pagination.pages);
            } else {
                setError(data.error || 'Failed to fetch transactions');
            }
        } catch (err) {
            setError('Failed to fetch transaction history');
            console.error('Transaction fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type: string, category: string) => {
        if (type === "credit") {
            return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
        } else {
            return <ArrowUpRight className="h-4 w-4 text-red-600" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case "failed":
            case "reversed":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "failed":
                return "bg-red-100 text-red-800 border-red-200";
            case "reversed":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatCategory = (category: string) => {
        return category.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading && transactions.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Transaction History
                    </CardTitle>
                    {showFilters && (
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {error ? (
                    <div className="p-6 text-center text-red-600">
                        <p>{error}</p>
                        <Button
                            variant="outline"
                            onClick={fetchTransactions}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <p>No transactions found</p>
                    </div>
                ) : (
                    <>
                        <div
                            className="space-y-1 overflow-y-auto"
                            style={{ maxHeight }}
                        >
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction._id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                                            {getTransactionIcon(transaction.type, transaction.category)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {transaction.description}
                                                </p>
                                                {getStatusIcon(transaction.status)}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500">
                                                    {formatCategory(transaction.category)}
                                                </p>
                                                <span className="text-xs text-gray-400">•</span>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>

                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={`${getStatusColor(transaction.status)} border text-xs`}>
                                                {transaction.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1 || loading}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>

                                <span className="text-sm text-gray-600">
                                    Page {page} of {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages || loading}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TransactionHistory;