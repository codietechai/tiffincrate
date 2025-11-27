"use client";

import { useEffect, useState } from "react";
import { AddressService } from "@/services/address-service";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/screens/address/address-form";

export default function EditAddressPage({ params }: any) {
  const { id } = params;
  const router = useRouter();

  const [address, setAddress] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await AddressService.fetchById(id);
      setAddress(res.data);
    })();
  }, [id]);

  const submit = async (data: any) => {
    await AddressService.update(id, data);
    router.push("/locations");
  };

  if (!address) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Address</h1>
      <AddressForm defaultValues={address} onSubmit={submit} />
    </div>
  );
}
