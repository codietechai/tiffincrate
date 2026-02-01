"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Play, Square, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";

interface SchedulerStatus {
    isRunning: boolean;
    message: string;
}

interface CronResult {
    processedOrders: number;
    expiredOrders: number;
    timestamp: string;
    date: string;
}

export default function CronScheduler() {
    const [status, setStatus] = useState<SchedulerStatus>({ isRunning: false, message: "Unknown" });
    const [loading, setLoading] = useState(false);
    const [intervalMinutes, setIntervalMinutes] = useState(30);
    const [lastResult, setLastResult] = useState<CronResult | null>(null);

    // Check scheduler status on component mount
    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const data = await httpClient.post(ROUTES.CRON.START_SCHEDULER, { action: "status" });
            setStatus({ isRunning: data.isRunning, message: data.message });
        } catch (error) {
            console.error("Error checking scheduler status:", error);
        }
    };

    const startScheduler = async () => {
        setLoading(true);
        try {
            const data = await httpClient.post(ROUTES.CRON.START_SCHEDULER, {
                action: "start",
                intervalMinutes
            });

            if (data.success) {
                setStatus({ isRunning: true, message: data.message });
                toast.success(`Scheduler started (${intervalMinutes} min intervals)`);
            } else {
                toast.error(data.message || "Failed to start scheduler");
            }
        } catch (error) {
            toast.error("Error starting scheduler");
            console.error("Error starting scheduler:", error);
        } finally {
            setLoading(false);
        }
    };

    const stopScheduler = async () => {
        setLoading(true);
        try {
            const data = await httpClient.post(ROUTES.CRON.START_SCHEDULER, { action: "stop" });

            if (data.success) {
                setStatus({ isRunning: false, message: data.message });
                toast.success("Scheduler stopped");
            } else {
                toast.error(data.message || "Failed to stop scheduler");
            }
        } catch (error) {
            toast.error("Error stopping scheduler");
            console.error("Error stopping scheduler:", error);
        } finally {
            setLoading(false);
        }
    };

    const runManualCheck = async () => {
        setLoading(true);
        try {
            const data = await httpClient.get(`${ROUTES.CRON.CHECK_EXPIRED_ORDERS}?test=true`);

            if (data.success) {
                setLastResult(data.data);
                toast.success(`Manual check completed: ${data.data.expiredOrders} orders marked as not_delivered`);
            } else {
                toast.error(data.message || "Manual check failed");
            }
        } catch (error) {
            toast.error("Error running manual check");
            console.error("Error running manual check:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Cron Job Scheduler</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={checkStatus}
                    disabled={loading}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                </Button>
            </div>

            {/* Scheduler Status */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Scheduler Status</h3>
                    <Badge variant={status.isRunning ? "default" : "secondary"}>
                        {status.isRunning ? "Running" : "Stopped"}
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{status.message}</p>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="interval">Interval (minutes):</Label>
                        <Input
                            id="interval"
                            type="number"
                            min="1"
                            max="1440"
                            value={intervalMinutes}
                            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                            className="w-20"
                            disabled={status.isRunning}
                        />
                    </div>

                    <div className="flex gap-2">
                        {!status.isRunning ? (
                            <Button
                                onClick={startScheduler}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Start Scheduler
                            </Button>
                        ) : (
                            <Button
                                onClick={stopScheduler}
                                disabled={loading}
                                variant="destructive"
                            >
                                <Square className="w-4 h-4 mr-2" />
                                Stop Scheduler
                            </Button>
                        )}

                        <Button
                            onClick={runManualCheck}
                            disabled={loading}
                            variant="outline"
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Run Manual Check
                        </Button>
                    </div>
                </div>
            </Card>

            {/* How It Works */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Automatic Order Expiry</p>
                            <p className="text-muted-foreground">
                                Orders are automatically marked as "not_delivered" when their time slot expires and they haven't been delivered.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Time Slot Rules</p>
                            <ul className="text-muted-foreground list-disc list-inside ml-4 space-y-1">
                                <li>Breakfast (7am-8am): Expires at 9am (1 hour buffer)</li>
                                <li>Lunch (12pm-2pm): Expires at 3pm (1 hour buffer)</li>
                                <li>Dinner (7pm-8pm): Expires at 9pm (1 hour buffer)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <RefreshCw className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Scheduler Frequency</p>
                            <p className="text-muted-foreground">
                                The scheduler runs every {intervalMinutes} minutes to check for expired orders. You can adjust this interval as needed.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Last Result */}
            {lastResult && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Last Check Result</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{lastResult.date}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Processed Orders</p>
                            <p className="font-medium">{lastResult.processedOrders}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expired Orders</p>
                            <p className="font-medium text-orange-600">{lastResult.expiredOrders}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Timestamp</p>
                            <p className="font-medium text-xs">
                                {new Date(lastResult.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Development Note */}
            <Card className="p-6 border-yellow-200 bg-yellow-50">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-yellow-800">Development Mode</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            This is a development scheduler that runs in the browser. For production, consider using:
                        </p>
                        <ul className="text-sm text-yellow-700 list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Vercel Cron Jobs (if deploying to Vercel)</li>
                            <li>External cron services (cron-job.org, EasyCron)</li>
                            <li>Server-side cron jobs (if using VPS/dedicated server)</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}