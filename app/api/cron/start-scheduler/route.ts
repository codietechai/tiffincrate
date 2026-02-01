import { NextRequest, NextResponse } from "next/server";

// Simple in-memory scheduler for development/testing
let schedulerInterval: NodeJS.Timeout | null = null;
let isSchedulerRunning = false;

const runExpiredOrdersCheck = async () => {
    try {
        console.log("[SCHEDULER] Running expired orders check...");

        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/check-expired-orders`, {
            method: "POST",
            headers: {
                "authorization": `Bearer ${process.env.CRON_SECRET || "your-cron-secret-key"}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log("[SCHEDULER] Expired orders check completed:", result.data);
        } else {
            console.error("[SCHEDULER] Expired orders check failed:", response.status);
        }
    } catch (error) {
        console.error("[SCHEDULER] Error running expired orders check:", error);
    }
};

export async function POST(request: NextRequest) {
    try {
        const { action, intervalMinutes = 30 } = await request.json();

        if (action === "start") {
            if (isSchedulerRunning) {
                return NextResponse.json({
                    success: false,
                    message: "Scheduler is already running"
                });
            }

            // Start the scheduler
            schedulerInterval = setInterval(runExpiredOrdersCheck, intervalMinutes * 60 * 1000);
            isSchedulerRunning = true;

            // Run immediately once
            runExpiredOrdersCheck();

            console.log(`[SCHEDULER] Started with ${intervalMinutes} minute intervals`);

            return NextResponse.json({
                success: true,
                message: `Scheduler started with ${intervalMinutes} minute intervals`,
                intervalMinutes
            });

        } else if (action === "stop") {
            if (schedulerInterval) {
                clearInterval(schedulerInterval);
                schedulerInterval = null;
            }
            isSchedulerRunning = false;

            console.log("[SCHEDULER] Stopped");

            return NextResponse.json({
                success: true,
                message: "Scheduler stopped"
            });

        } else if (action === "status") {
            return NextResponse.json({
                success: true,
                isRunning: isSchedulerRunning,
                message: isSchedulerRunning ? "Scheduler is running" : "Scheduler is stopped"
            });

        } else {
            return NextResponse.json(
                { error: "Invalid action. Use 'start', 'stop', or 'status'" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("[SCHEDULER] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        isRunning: isSchedulerRunning,
        message: isSchedulerRunning ? "Scheduler is running" : "Scheduler is stopped",
        endpoints: {
            start: "POST /api/cron/start-scheduler with { action: 'start', intervalMinutes: 30 }",
            stop: "POST /api/cron/start-scheduler with { action: 'stop' }",
            status: "POST /api/cron/start-scheduler with { action: 'status' }",
            manual: "GET /api/cron/check-expired-orders?test=true"
        }
    });
}