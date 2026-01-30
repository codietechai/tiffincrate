import { NextRequest, NextResponse } from "next/server";
import RealtimeNotificationService from "@/lib/realtime-notifications";

export async function GET(request: NextRequest) {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { error: "User ID required" },
            { status: 401 }
        );
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Create a mock response object for the notification service
            const mockResponse = {
                body: {
                    getWriter: () => ({
                        write: (chunk: Uint8Array) => {
                            controller.enqueue(chunk);
                        },
                        releaseLock: () => { },
                    }),
                },
            } as Response;

            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                    type: "connected",
                    message: "Notifications connected",
                    userId
                })}\n\n`)
            );

            // Register this connection with the notification service
            const notificationService = RealtimeNotificationService.getInstance();
            notificationService.addConnection(userId, mockResponse);

            // Send heartbeat every 30 seconds to keep connection alive
            const heartbeatInterval = setInterval(() => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            type: "heartbeat",
                            timestamp: new Date().toISOString()
                        })}\n\n`)
                    );
                } catch (error) {
                    console.error("Heartbeat error:", error);
                    clearInterval(heartbeatInterval);
                }
            }, 30000);

            // Clean up on close
            request.signal.addEventListener("abort", () => {
                clearInterval(heartbeatInterval);
                notificationService.removeConnection(userId, mockResponse);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
        },
    });
}