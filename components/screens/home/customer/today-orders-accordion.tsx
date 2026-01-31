"use client";
import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Phone, Utensils, ChevronDown } from "lucide-react";
import { TOrderDelivery } from "@/types/order";
import { format } from "date-fns";

interface TodayOrdersAccordionProps {
    orders: any[]; // Updated to handle the new delivery order structure
}

const TodayOrdersAccordion: React.FC<TodayOrdersAccordionProps> = ({ orders }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Realistic delivery time calculation based on order status and time slot
    const getEstimatedDeliveryTime = (deliveryOrder: any) => {
        if (deliveryOrder.order.estimatedDeliveryTime) {
            return format(new Date(deliveryOrder.order.estimatedDeliveryTime), "HH:mm");
        }

        const now = new Date();
        let estimatedMinutes = 0;

        // Base time calculation considering current time and time slot
        const currentHour = now.getHours();
        const timeSlotHours: { [key: string]: number } = {
            breakfast: 8,
            lunch: 13,
            dinner: 20
        };

        const targetHour = timeSlotHours[deliveryOrder.order.timeSlot];

        // If it's already past the time slot, delivery is likely soon
        if (currentHour >= targetHour) {
            switch (deliveryOrder.deliveryStatus) {
                case 'confirmed':
                    estimatedMinutes = 30;
                    break;
                case 'preparing':
                    estimatedMinutes = 20;
                    break;
                case 'ready':
                    estimatedMinutes = 10;
                    break;
                case 'out_for_delivery':
                    estimatedMinutes = 5;
                    break;
                default:
                    estimatedMinutes = 45;
            }
        } else {
            // If it's before the time slot, calculate time until slot + preparation
            const minutesUntilSlot = (targetHour - currentHour) * 60;
            estimatedMinutes = minutesUntilSlot + 15; // 15 min buffer for preparation
        }

        const estimatedTime = new Date(now.getTime() + estimatedMinutes * 60000);
        return format(estimatedTime, "HH:mm");
    };

    // More realistic distance calculation based on order status
    const getEstimatedDistance = (deliveryOrder: any) => {
        // In a real app, this would come from the address coordinates
        // For now, we'll use a more realistic approach based on status
        let baseDistance = 2.5; // Average 2.5 km base distance

        switch (deliveryOrder.deliveryStatus) {
            case 'out_for_delivery':
                // Driver is on the way, distance should be reasonable
                return `${(Math.random() * 1.5 + 0.5).toFixed(1)} km`; // 0.5-2.0 km
            case 'ready':
                // Order is ready, full distance from restaurant
                return `${(baseDistance + Math.random() * 1).toFixed(1)} km`; // 2.5-3.5 km
            case 'preparing':
            case 'confirmed':
                // Order is being prepared, show restaurant distance
                return `${(baseDistance + Math.random() * 2).toFixed(1)} km`; // 2.5-4.5 km
            default:
                return `${baseDistance.toFixed(1)} km`;
        }
    };

    // Calculate estimated time in minutes for display
    const getEstimatedTimeInMinutes = (deliveryOrder: any) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const deliveryDate = new Date(deliveryOrder.deliveryDate);
        const today = new Date();

        // Check if delivery is today or future date
        const isToday = deliveryDate.toDateString() === today.toDateString();
        const isFuture = deliveryDate > today;

        if (isFuture && !isToday) {
            // For future dates, show the date
            return format(deliveryDate, "MMM dd");
        }

        const timeSlotHours: { [key: string]: number } = {
            breakfast: 8,
            lunch: 13,
            dinner: 20
        };

        const targetHour = timeSlotHours[deliveryOrder.order.timeSlot];

        if (currentHour >= targetHour && isToday) {
            switch (deliveryOrder.deliveryStatus) {
                case 'confirmed':
                    return '25-35 min';
                case 'preparing':
                    return '15-25 min';
                case 'ready':
                    return '5-15 min';
                case 'out_for_delivery':
                    return '2-8 min';
                case 'delivered':
                    return 'Delivered';
                default:
                    return '30-45 min';
            }
        } else {
            if (isToday) {
                const minutesUntilSlot = (targetHour - currentHour) * 60 - currentMinute;
                if (minutesUntilSlot > 60) {
                    const hours = Math.floor(minutesUntilSlot / 60);
                    const mins = minutesUntilSlot % 60;
                    return `${hours}h ${mins}m`;
                }
                return `${minutesUntilSlot} min`;
            } else {
                // For future dates, show time slot
                return `${deliveryOrder.order.timeSlot} slot`;
            }
        }
    };

    if (orders.length === 0) {
        return null;
    }

    return (
        <div className="w-full mb-6">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="today-orders" className="border rounded-lg">
                    <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Utensils className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">Upcoming Deliveries</h3>
                                    <p className="text-xs text-gray-500">{orders.length} delivery{orders.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {orders.map((deliveryOrder, index) => (
                                    <Badge
                                        key={deliveryOrder._id}
                                        className={`${getStatusColor(deliveryOrder.deliveryStatus)} text-xs`}
                                        variant="outline"
                                    >
                                        {formatStatus(deliveryOrder.deliveryStatus)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4">
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {orders.map((deliveryOrder, index) => (
                                <AccordionItem
                                    key={deliveryOrder._id}
                                    value={`order-${index}`}
                                    className="border rounded-lg bg-gray-50"
                                >
                                    <AccordionTrigger className="py-3 hover:no-underline">
                                        <div className="flex items-center justify-between w-full mr-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-left">
                                                    <h4 className="font-medium text-gray-900">{deliveryOrder.menu.name}</h4>
                                                    <p className="text-sm text-gray-600">{deliveryOrder.provider?.businessName}</p>
                                                    <p className="text-xs text-blue-600">
                                                        {format(new Date(deliveryOrder.deliveryDate), "MMM dd, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-right">
                                                <div>
                                                    <p className="text-sm font-semibold text-green-600">
                                                        {getEstimatedTimeInMinutes(deliveryOrder)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {getEstimatedDistance(deliveryOrder)}
                                                    </p>
                                                </div>
                                                <Badge className={`${getStatusColor(deliveryOrder.deliveryStatus)} text-xs`}>
                                                    {formatStatus(deliveryOrder.deliveryStatus)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-4">
                                            {/* Order Summary */}
                                            <div className="bg-white rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-gray-900">{deliveryOrder.menu.name}</h5>
                                                        <p className="text-sm text-gray-600 mt-1">{deliveryOrder.menu.description}</p>
                                                        <p className="text-sm font-medium text-blue-600 mt-2">
                                                            {deliveryOrder.provider?.businessName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Delivery Date: {format(new Date(deliveryOrder.deliveryDate), "EEEE, MMM dd, yyyy")}
                                                        </p>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <p className="font-bold text-lg text-gray-900">₹{deliveryOrder.order.totalAmount}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{deliveryOrder.order.timeSlot}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delivery Information */}
                                            {(deliveryOrder.deliveryStatus === 'out_for_delivery' || deliveryOrder.deliveryStatus === 'ready' || deliveryOrder.deliveryStatus === 'preparing') && (
                                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="w-4 h-4 text-green-600" />
                                                            <div>
                                                                <p className="text-xs text-green-700">Estimated Time</p>
                                                                <p className="font-semibold text-green-800">
                                                                    {getEstimatedTimeInMinutes(deliveryOrder)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="w-4 h-4 text-green-600" />
                                                            <div>
                                                                <p className="text-xs text-green-700">Distance</p>
                                                                <p className="font-semibold text-green-800">
                                                                    {getEstimatedDistance(deliveryOrder)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-green-200">
                                                        <p className="text-xs text-green-700">
                                                            Estimated Delivery: <span className="font-semibold">{getEstimatedDeliveryTime(deliveryOrder)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Delivery Address */}
                                            <div className="bg-white rounded-lg p-4 border">
                                                <div className="flex items-start space-x-3">
                                                    <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
                                                        <p className="text-sm text-gray-600 break-words">
                                                            {deliveryOrder.address.address_line_1}
                                                            {deliveryOrder.address.address_line_2 && `, ${deliveryOrder.address.address_line_2}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {deliveryOrder.address.city}, {deliveryOrder.address.region} - {deliveryOrder.address.postal_code}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Special Instructions */}
                                            {deliveryOrder.order.notes && (
                                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                                    <p className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</p>
                                                    <p className="text-sm text-yellow-700">{deliveryOrder.order.notes}</p>
                                                </div>
                                            )}

                                            {/* Order Timeline */}
                                            <div className="bg-white rounded-lg p-4 border">
                                                <p className="text-sm font-medium text-gray-900 mb-3">Order Progress</p>
                                                <div className="space-y-2">
                                                    {[
                                                        { status: 'confirmed', label: 'Order Confirmed' },
                                                        { status: 'preparing', label: 'Preparing Food' },
                                                        { status: 'ready', label: 'Ready for Pickup' },
                                                        { status: 'out_for_delivery', label: 'Out for Delivery' },
                                                        { status: 'delivered', label: 'Delivered' }
                                                    ].map((step, stepIndex) => {
                                                        const isCompleted = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
                                                            .indexOf(deliveryOrder.deliveryStatus) >= stepIndex;
                                                        const isCurrent = deliveryOrder.deliveryStatus === step.status;

                                                        return (
                                                            <div key={step.status} className="flex items-center space-x-3">
                                                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isCompleted
                                                                    ? isCurrent
                                                                        ? 'bg-blue-500 ring-2 ring-blue-200'
                                                                        : 'bg-green-500'
                                                                    : 'bg-gray-300'
                                                                    }`}></div>
                                                                <span className={`text-sm ${isCompleted
                                                                    ? isCurrent
                                                                        ? 'text-blue-700 font-medium'
                                                                        : 'text-green-700'
                                                                    : 'text-gray-500'
                                                                    }`}>
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        window.location.href = `/track-order/${deliveryOrder.order._id}`;
                                                    }}
                                                >
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    Track Order
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        window.location.href = `/order-detail/${deliveryOrder.order._id}`;
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default TodayOrdersAccordion;