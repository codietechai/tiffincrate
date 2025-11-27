"use client";

import BackHeader from "@/components/common/back-header";
import AddressForm from "@/components/screens/address/address-form";

export default function AddAddressPage() {
  return (
    <>
      <BackHeader />
      <div className="p-6 pb-32">
        <h1 className="text-xl font-semibold mb-4">Add Address</h1>
        <AddressForm />
      </div>
    </>
  );
}
