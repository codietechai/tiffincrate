"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Eye, EyeOff, Plus, Minus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface WalletData {
    _id: string;
    userId: string;
    userType: "customer" | "provider" | "admin";
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalSpent: number;
    status: "active" | "frozen" | "suspended";
    freezeReason?: string;
    totalBalance: number;
    lastTransactionAt?: string;
}

interface WalletBalanceProps {
    showActions?: boolean;
    onAddMoney?: () => void;
    onWithdraw?: () => void;
    onViewTransactions?: () => void;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({
    showActions = true,
    onAddMoney,
    onWithdraw,
    onViewTransactions
}) => {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBalance, setShowBalance] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/wallet');
            const data = await response.json();

            if (data.success) {
                setWallet(data.data);
            } else {
                setError(data.error || 'Failed to fetch wallet');
            }
        } catch (err) {
            setError('Failed to fetch wallet data');
            console.error('Wallet fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'frozen':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'suspended':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !wallet) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        <p>{error || 'Wallet not found'}</p>
                        <Button
                            variant="outline"
                            onClick={fetchWallet}
                            className="mt-2"
                        >
                            Retry
                        </Button>
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
                        <Wallet className="h-5 w-5" />
                        My Wallet
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(wallet.status)} border text-xs`}>
                            {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBalance(!showBalance)}
                        >
                            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Main Balance */}
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {showBalance ? formatCurrency(wallet.availableBalance) : '••••••'}
                    </p>
                    {wallet.pendingBalance > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            + {showBalance ? formatCurrency(wallet.pendingBalance) : '••••'} pending
                        </p>
                    )}
                </div>

                {/* Freeze Warning */}
                {wallet.status === 'frozen' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 font-medium">Wallet Frozen</p>
                        {wallet.freezeReason && (
                            <p className="text-xs text-yellow-700 mt-1">{wallet.freezeReason}</p>
                        )}
                    </div>
                )}

                {/* Stats for Providers */}
                {wallet.userType === 'provider' && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Total Earned</p>
                            <p className="font-semibold text-green-600">
                                {showBalance ? formatCurrency(wallet.totalEarned) : '••••••'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="font-semibold text-orange-600">
                                {showBalance ? formatCurrency(wallet.pendingBalance) : '••••••'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats for Customers */}
                {wallet.userType === 'customer' && (
                    <div className="text-center pt-2 border-t">
                        <p className="text-xs text-gray-500">Total Spent</p>
                        <p className="font-semibold text-blue-600">
                            {showBalance ? formatCurrency(wallet.totalSpent) : '••••••'}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && wallet.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                        {wallet.userType === 'customer' && onAddMoney && (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onAddMoney}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Money
                            </Button>
                        )}

                        {wallet.availableBalance > 0 && onWithdraw && (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onWithdraw}
                            >
                                <Minus className="h-4 w-4 mr-2" />
                                Withdraw
                            </Button>
                        )}

                        {onViewTransactions && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onViewTransactions}
                            >
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                History
                            </Button>
                        )}
                    </div>
                )}

                {/* Last Transaction */}
                {wallet.lastTransactionAt && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        Last activity: {new Date(wallet.lastTransactionAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WalletBalance;