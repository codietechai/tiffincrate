"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

interface SystemStatus {
    database: "connected" | "disconnected" | "error";
    deliveryOrders: {
        total: number;
        byTimeSlot: {
            breakfast: number;
            lunch: number;
            dinner: number;
        };
        byStatus: {
            pending: number;
            confirmed: number;
            preparing: number;
            ready: number;
            out_for_delivery: number;
            delivered: number;
            not_delivered: number;
        };
    };
    currentTime: string;
    navigationAvailability: {
        breakfast: { available: boolean; timeUntil: string };
        lunch: { available: boolean; timeUntil: string };
        dinner: { available: boolean; timeUntil: string };
    };
}

export default function SystemStatus() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchSystemStatus = async () => {
        setLoading(true);
        try {
            // This would be a real API endpoint in production
            // For now, we'll simulate the data
            const mockStatus: SystemStatus = {
                database: "connected",
                deliveryOrders: {
                    total: 15,
                    byTimeSlot: {
                        breakfast: 5,
                        lunch: 5,
                        dinner: 5,
                    },
                    byStatus: {
                        pending: 2,
                        confirmed: 3,
                        preparing: 2,
                        ready: 3,
                        out_for_delivery: 2,
                        delivered: 2,
                        not_delivered: 1,
                    },
                },
                currentTime: new Date().toLocaleString(),
                navigationAvailability: {
                    breakfast: {
                        available: false,
                        timeUntil: "Available tomorrow at 6:30am"
                    },
                    lunch: {
                        available: false,
                        timeUntil: "Available tomorrow at 11:30am"
                    },
                    dinner: {
                        available: new Date().getHours() >= 18 && new Date().getHours() <= 20,
                        timeUntil: new Date().getHours() < 18 ? `Available in ${18 - new Date().getHours()}h ${30 - new Date().getMinutes()}m` : "Available now"
                    },
                },
            };

            setStatus(mockStatus);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch system status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemStatus();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchSystemStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (available: boolean) => {
        return available ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
            <Clock className="w-4 h-4 text-orange-500" />
        );
    };

    const getStatusBadge = (available: boolean) => {
        return (
            <Badge variant={available ? "default" : "secondary"} className={available ? "bg-green-500" : ""}>
                {available ? "Available" : "Waiting"}
            </Badge>
        );
    };

    if (!status) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading system status...</span>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">System Status</h2>
                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <span className="text-sm text-muted-foreground">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSystemStatus}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* System Health */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Database</span>
                        <Badge variant="default" className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">API Services</span>
                        <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Current Time</span>
                        <span className="text-sm font-mono">{status.currentTime}</span>
                    </div>
                </div>
            </Card>

            {/* Navigation Availability */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Navigation Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(status.navigationAvailability).map(([timeSlot, info]) => (
                        <div key={timeSlot} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium capitalize">{timeSlot}</span>
                                {getStatusIcon(info.available)}
                            </div>
                            <div className="space-y-2">
                                {getStatusBadge(info.available)}
                                <p className="text-sm text-muted-foreground">{info.timeUntil}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Delivery Orders Overview */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Delivery Orders Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{status.deliveryOrders.total}</div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{status.deliveryOrders.byStatus.delivered}</div>
                        <div className="text-sm text-muted-foreground">Delivered</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{status.deliveryOrders.byStatus.out_for_delivery}</div>
                        <div className="text-sm text-muted-foreground">Out for Delivery</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{status.deliveryOrders.byStatus.not_delivered}</div>
                        <div className="text-sm text-muted-foreground">Not Delivered</div>
                    </div>
                </div>

                {/* Time Slot Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-medium mb-2">By Time Slot</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Breakfast</span>
                                <span className="font-medium">{status.deliveryOrders.byTimeSlot.breakfast}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lunch</span>
                                <span className="font-medium">{status.deliveryOrders.byTimeSlot.lunch}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Dinner</span>
                                <span className="font-medium">{status.deliveryOrders.byTimeSlot.dinner}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Active Orders</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Preparing</span>
                                <span className="font-medium">{status.deliveryOrders.byStatus.preparing}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ready</span>
                                <span className="font-medium">{status.deliveryOrders.byStatus.ready}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Out for Delivery</span>
                                <span className="font-medium">{status.deliveryOrders.byStatus.out_for_delivery}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Completed Orders</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Delivered</span>
                                <span className="font-medium text-green-600">{status.deliveryOrders.byStatus.delivered}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Not Delivered</span>
                                <span className="font-medium text-red-600">{status.deliveryOrders.byStatus.not_delivered}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Success Rate</span>
                                <span className="font-medium">
                                    {Math.round((status.deliveryOrders.byStatus.delivered / (status.deliveryOrders.byStatus.delivered + status.deliveryOrders.byStatus.not_delivered)) * 100) || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                        View Delivery Dashboard
                    </Button>
                    <Button variant="outline" size="sm">
                        Manage Cron Jobs
                    </Button>
                    <Button variant="outline" size="sm">
                        Seed Test Data
                    </Button>
                    <Button variant="outline" size="sm">
                        View System Logs
                    </Button>
                </div>
            </Card>
        </div>
    );
}