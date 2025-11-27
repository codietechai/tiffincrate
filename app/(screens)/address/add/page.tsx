"use client";

import AddressForm from "@/components/screens/address/address-form";
import { AddressService } from "@/services/address-service";
import { useRouter } from "next/navigation";

export default function AddAddressPage() {
  return (
    <div className="p-6 pb-32">
      <h1 className="text-xl font-semibold mb-4">Add Address</h1>
      <AddressForm />
    </div>
  );
}
