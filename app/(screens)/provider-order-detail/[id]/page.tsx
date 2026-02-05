import { ProviderOrderDetail } from "@/components/screens/provider-orders/provider-order-detail";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
    return <ProviderOrderDetail orderId={params.id} />;
};

export default page;