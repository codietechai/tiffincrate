import LiveTracking from "@/components/screens/order-tracking/live-tracking";

interface TrackOrderPageProps {
    params: {
        id: string;
    };
}

export default function TrackOrderPage({ params }: TrackOrderPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <LiveTracking orderId={params.id} />
        </div>
    );
}