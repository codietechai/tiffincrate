"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Plus, LocateIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { AddressService } from "@/services/address-service";
import { AddressList } from "@/components/screens/address/address-list";
import { toast } from "sonner";
import BackHeader from "@/components/common/back-header";
import TitleHeader from "@/components/common/title-header";

export default function SelectLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chooseAnother = searchParams.get("choose-another");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onSetDefault = async (addressId: string) => {
    try {
      await AddressService.setDefault(addressId);
      if (chooseAnother) {
        router.back();
      } else {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update default address");
    }
  };

  const onDelete = async (addressId: string) => {
    await AddressService.delete(addressId);
  };

  const onEdit = (addressId: string) =>
    router.push(`/address/edit/${addressId}`);

  return (
    <>
      <BackHeader />
      <div className="min-h-screen bg-background px-4 py-6 relative">
        <TitleHeader
          title="Select a Location"
          icon={<LocateIcon />}
          description={
            chooseAnother ? "Change default address for your order" : ""
          }
        />

        <Card
          onClick={() => {
            if (chooseAnother) router.push("/address/add?choose-another=true");
            else router.push("/address/add");
          }}
          className="group mt-3 p-4 cursor-pointer transition-all hover:shadow-md border border-dashed border-gray-300 hover:border-red-400"
        >
          <div className="flex items-center gap-3 font-medium text-red-600">
            <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition">
              <Plus className="h-4 w-4" />
            </div>
            Add New Address
          </div>
        </Card>

        <div className="flex items-center justify-between mt-8 mb-3">
          <h2 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
            Saved Addresses
          </h2>
          <div className="h-[1px] flex-1 ml-3 bg-gray-200" />
        </div>

        <AddressList
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          refreshTrigger={refreshTrigger}
          chooseAnother={chooseAnother ? () => router.back() : undefined}
        />
      </div>
    </>
  );
}
