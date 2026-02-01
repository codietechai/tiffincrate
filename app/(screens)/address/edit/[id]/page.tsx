"use client";

import { useEffect, useState } from "react";
import { AddressService } from "@/services/address-service";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/screens/address/address-form";
import BackHeader from "@/components/common/back-header";
import { toast } from "sonner";

export default function EditAddressPage({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [address, setAddress] = useState<any>(null);

  const fetchAddress = async () => {
    try {
      const res = await AddressService.fetchById(id);
      const addressData = res.data;

      // Convert API response to form format
      setAddress({
        name: addressData.name,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        pincode: addressData.pincode,
        phone: addressData.phone,
        addressType: addressData.addressType,
        landmark: addressData.landmark,
        deliveryInstructions: addressData.deliveryInstructions,
        isDefault: addressData.isDefault,
        location: addressData.location || { type: "Point", coordinates: [0, 0] }
      });
    } catch (error: any) {
      console.error("Error fetching address:", error);
      toast.error(error.message || "Failed to fetch address");
    }
  };
  useEffect(() => {
    fetchAddress();
  }, [id]);

  const submit = async (data: any) => {
    await AddressService.update(id, data);
    toast.success("Address updated successfully");
    router.push("/address");
  };

  return (
    <>
      <BackHeader />
      <div className="p-6 pb-32">
        <h1 className="text-xl font-semibold mb-4">Edit Address</h1>
        <AddressForm defaultValues={address} onEditSubmit={submit} />
      </div>
    </>
  );
}
