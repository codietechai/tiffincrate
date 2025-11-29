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
    const res = await AddressService.fetchById(id);
    const {
      name,
      address_line_1,
      address_line_2,
      city,
      region,
      latitude,
      longitude,
      postal_code,
      phone_number,
      dial_code,
      full_phone_number,
      is_default,
      country,
      country_code,
    } = res.data;
    setAddress({
      name,
      address_line_1,
      address_line_2,
      city,
      region,
      latitude,
      longitude,
      postal_code,
      phone_number,
      dial_code,
      full_phone_number,
      is_default,
      country,
      country_code,
    });
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
