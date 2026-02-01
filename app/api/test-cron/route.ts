import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Test the cron endpoint
        const cronUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/check-expired-orders?test=true`;

        console.log("Testing cron endpoint:", cronUrl);

        const response = await fetch(cronUrl);
        const data = await response.json();

        return NextResponse.json({
            success: true,
            message: "Cron test completed",
            cronResponse: data,
            status: response.status
        });

    } catch (error) {
        console.error("Cron test error:", error);
        return NextResponse.json(
            {
                error: "Cron test failed",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}