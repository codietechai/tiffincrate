import { TOrderDelivery } from "@/types/order";

export class CustomerOrderService {
    static async fetchTodayOrders(): Promise<{ data: TOrderDelivery[]; success: boolean; message: string }> {
        try {
            const response = await fetch('/api/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const result = await response.json();
            return {
                data: result.data || [],
                success: true,
                message: result.message
            };
        } catch (error) {
            console.error('Error fetching orders:', error);
            return {
                data: [],
                success: false,
                message: 'Failed to fetch orders'
            };
        }
    }

    // Fetch upcoming delivery orders (today and next few days)
    static async fetchUpcomingDeliveries(): Promise<{ data: any[]; success: boolean; message: string }> {
        try {
            const response = await fetch('/api/delivery-orders/upcoming', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch upcoming deliveries');
            }

            const result = await response.json();
            return {
                data: result.data || [],
                success: true,
                message: result.message
            };
        } catch (error) {
            console.error('Error fetching upcoming deliveries:', error);
            return {
                data: [],
                success: false,
                message: 'Failed to fetch upcoming deliveries'
            };
        }
    }

    // Get real-time ETA from provider to customer
    static async getProviderETA(customerAddress: { latitude: number; longitude: number }): Promise<{ distance: string; time: string } | null> {
        try {
            // This would typically get the provider's current location from a real-time API
            // For now, we'll simulate it with a mock provider location
            const mockProviderLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates

            // Calculate distance using Google Distance Matrix API
            if (typeof window !== 'undefined' && window.google && window.google.maps) {
                return new Promise((resolve) => {
                    const service = new google.maps.DistanceMatrixService();
                    service.getDistanceMatrix({
                        origins: [mockProviderLocation],
                        destinations: [{ lat: customerAddress.latitude, lng: customerAddress.longitude }],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        avoidHighways: false,
                        avoidTolls: false,
                    }, (response, status) => {
                        if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
                            const element = response.rows[0].elements[0];
                            const distance = element.distance?.text || 'Unknown';
                            const time = element.duration?.text || 'Unknown';
                            resolve({ distance, time });
                        } else {
                            resolve(null);
                        }
                    });
                });
            }

            return null;
        } catch (error) {
            console.error('Error getting provider ETA:', error);
            return null;
        }
    }
}