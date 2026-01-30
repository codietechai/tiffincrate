// Real-time notification service for order updates

interface NotificationData {
    type: 'order_status_update' | 'driver_location_update' | 'eta_update';
    orderId: string;
    customerId: string;
    providerId: string;
    data: any;
    timestamp: string;
}

class RealtimeNotificationService {
    private static instance: RealtimeNotificationService;
    private connections: Map<string, Set<Response>> = new Map();

    static getInstance(): RealtimeNotificationService {
        if (!RealtimeNotificationService.instance) {
            RealtimeNotificationService.instance = new RealtimeNotificationService();
        }
        return RealtimeNotificationService.instance;
    }

    // Add a new SSE connection
    addConnection(userId: string, response: Response): void {
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId)!.add(response);
    }

    // Remove SSE connection
    removeConnection(userId: string, response: Response): void {
        const userConnections = this.connections.get(userId);
        if (userConnections) {
            userConnections.delete(response);
            if (userConnections.size === 0) {
                this.connections.delete(userId);
            }
        }
    }

    // Send notification to specific user
    sendToUser(userId: string, notification: NotificationData): void {
        const userConnections = this.connections.get(userId);
        if (userConnections) {
            const message = `data: ${JSON.stringify(notification)}\n\n`;
            const encoder = new TextEncoder();

            userConnections.forEach((response) => {
                try {
                    const writer = response.body?.getWriter();
                    writer?.write(encoder.encode(message));
                    writer?.releaseLock();
                } catch (error) {
                    console.error('Error sending notification:', error);
                    this.removeConnection(userId, response);
                }
            });
        }
    }

    // Send notification to multiple users
    sendToUsers(userIds: string[], notification: NotificationData): void {
        userIds.forEach(userId => this.sendToUser(userId, notification));
    }

    // Broadcast order status update
    broadcastOrderUpdate(orderId: string, customerId: string, providerId: string, status: string, additionalData?: any): void {
        const notification: NotificationData = {
            type: 'order_status_update',
            orderId,
            customerId,
            providerId,
            data: {
                status,
                ...additionalData,
            },
            timestamp: new Date().toISOString(),
        };

        // Send to both customer and provider
        this.sendToUsers([customerId, providerId], notification);
    }

    // Broadcast driver location update
    broadcastDriverLocation(orderId: string, customerId: string, providerId: string, location: { lat: number; lng: number }): void {
        const notification: NotificationData = {
            type: 'driver_location_update',
            orderId,
            customerId,
            providerId,
            data: {
                location,
            },
            timestamp: new Date().toISOString(),
        };

        // Send to customer only
        this.sendToUser(customerId, notification);
    }

    // Broadcast ETA update
    broadcastETAUpdate(orderId: string, customerId: string, providerId: string, eta: string): void {
        const notification: NotificationData = {
            type: 'eta_update',
            orderId,
            customerId,
            providerId,
            data: {
                estimatedDeliveryTime: eta,
            },
            timestamp: new Date().toISOString(),
        };

        // Send to customer
        this.sendToUser(customerId, notification);
    }
}

export default RealtimeNotificationService;