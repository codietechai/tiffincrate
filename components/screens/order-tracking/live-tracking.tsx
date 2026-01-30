"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    MapPin,
    Phone,
    CheckCircle,
    Circle,
    Truck,
    ChefHat,
    Package,
    Home
} from "lucide-react";
import { format } from "date-fns";

interface TrackingData {
    orderId: string;
    status: string;
    progress: number;
    customer: {
        name: string;
        email: string;
    };
    provider: {
        name: string;
        location: {
            latitude: number;
            longitude: number;
            address: string;
        };
    };
    menu: {
        name: string;
        description: string;
    };
    deliveryAddress: {
        address_line_1: string;
        address_line_2?: string;
        city: string;
        region: string;
        postal_code: string;
    };
    timeSlot: string;
    totalAmount: number;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    createdAt: string;
    timeline: Array<{
        status: string;
        timestamp: string | null;
        completed: boolean;
        title: string;
        description: string;
    }>;
}

interface LiveTrackingProps {
    orderId: string;
}

export default function LiveTracking({ orderId }: LiveTrackingProps) {
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrackingData = async () => {
        try {
            const response = await fetch(`/api/orders/track/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch tracking data');
            }
            const result = await response.json();
            setTrackingData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrackingData();

        // Set up polling for real-time updates
        const interval = setInterval(fetchTrackingData, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [orderId]);

    const getStatusIcon = (status: string, completed: boolean) => {
        const iconClass = `w-5 h-5 ${completed ? 'text-green-600' : 'text-gray-400'}`;

        switch (status) {
            case 'pending':
                return <Circle className={iconClass} />;
            case 'confirmed':
                return completed ? <CheckCircle className={iconClass} /> : <Circle className={iconClass} />;
            case 'preparing':
                return <ChefHat className={iconClass} />;
            case 'ready':
                return <Package className={iconClass} />;
            case 'out_for_delivery':
                return <Truck className={iconClass} />;
            case 'delivered':
                return <Home className={iconClass} />;
            default:
                return <Circle className={iconClass} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'confirmed': return 'bg-blue-500';
            case 'preparing': return 'bg-orange-500';
            case 'ready': return 'bg-purple-500';
            case 'out_for_delivery': return 'bg-red-500';
            case 'delivered': return 'bg-green-500';
            case 'cancelled': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !trackingData) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <Card className="p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">
                        Unable to Load Tracking Information
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error || 'Order not found'}
                    </p>
                    <Button onClick={fetchTrackingData}>
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
                <p className="text-gray-600">Order #{trackingData.orderId.slice(-8)}</p>
            </div>

            {/* Status Overview */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Badge className={`${getStatusColor(trackingData.status)} text-white`}>
                            {trackingData.status.split('_').map(word =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                            {trackingData.timeline.find(t => t.status === trackingData.status)?.description}
                        </p>
                    </div>
                    {trackingData.estimatedDeliveryTime && (
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                ETA: {format(new Date(trackingData.estimatedDeliveryTime), "HH:mm")}
                            </div>
                            <p className="text-xs text-gray-600">
                                {format(new Date(trackingData.estimatedDeliveryTime), "MMM dd")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(trackingData.status)}`}
                        style={{ width: `${trackingData.progress}%` }}
                    ></div>
                </div>
            </Card>

            {/* Order Details */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Menu:</span>
                        <span className="font-medium">{trackingData.menu.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Time Slot:</span>
                        <span className="font-medium capitalize">{trackingData.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">₹{trackingData.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-medium">{trackingData.provider.name}</span>
                    </div>
                </div>
            </Card>

            {/* Delivery Address */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                </h3>
                <div className="text-gray-700">
                    <p>{trackingData.deliveryAddress.address_line_1}</p>
                    {trackingData.deliveryAddress.address_line_2 && (
                        <p>{trackingData.deliveryAddress.address_line_2}</p>
                    )}
                    <p>
                        {trackingData.deliveryAddress.city}, {trackingData.deliveryAddress.region} - {trackingData.deliveryAddress.postal_code}
                    </p>
                </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-4">
                    {trackingData.timeline.map((item, index) => (
                        <div key={item.status} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                                {getStatusIcon(item.status, item.completed)}
                                {index < trackingData.timeline.length - 1 && (
                                    <div className={`w-0.5 h-8 mt-2 ${item.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-medium ${item.completed ? 'text-green-600' : 'text-gray-400'}`}>
                                        {item.title}
                                    </h4>
                                    {item.timestamp && (
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(item.timestamp), "HH:mm")}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Contact Provider */}
            {trackingData.status === 'out_for_delivery' && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Need Help?</h3>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Provider
                        </Button>
                        <Button variant="outline" className="flex-1">
                            Chat Support
                        </Button>
                    </div>
                </Card>
            )}

            {/* Refresh Button */}
            <div className="text-center">
                <Button variant="outline" onClick={fetchTrackingData}>
                    Refresh Status
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                    Last updated: {format(new Date(), "HH:mm:ss")}
                </p>
            </div>
        </div>
    );
}