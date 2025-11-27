"use client";

import { useRouter } from "next/navigation";
import { Search, Plus, MapPin, Home, LocateFixed } from "lucide-react";
import { Card } from "@/components/ui/card";
import GoogleMapAutoComplete from "@/components/common/googlePlace";
import { useState, useEffect } from "react";
import { useLocation } from "@/hooks/use-location";
import { AddressService } from "@/services/address-service";
import { AddressCard } from "@/components/screens/address/address-card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import BackHeader from "@/components/common/back-header";

export default function SelectLocationPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const { locationName, address, latitude, longitude, loading } = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await AddressService.fetchAll();
      setAddresses(data.data);
      console.log("data", data);
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const onSetDefault = async (addressId: string) => {
    await AddressService.setDefault(addressId);
    fetchAddresses();
  };
  const onDelete = async (addressId: string) => {
    await AddressService.delete(addressId);
    setAddresses(addresses.filter((a) => a._id !== addressId));
  };

  const onEdit = (addressId: string) =>
    router.push(`/address/edit/${addressId}`);

  return (
    <>
      <BackHeader />
      <div className="min-h-screen bg-background px-4 py-6 relative ">
        <h1 className="text-2xl font-bold tracking-tight mb-6">
          Select a Location
        </h1>

        <Card
          onClick={() => router.push("/address/add")}
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

        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[130px] rounded-xl" />
              ))}
          </div>
        ) : addresses.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No addresses saved yet.
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
