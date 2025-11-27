"use client";

import { useRouter } from "next/navigation";
import { Search, Plus, MapPin, Home, LocateFixed } from "lucide-react";
import { Card } from "@/components/ui/card";
import GoogleMapAutoComplete from "@/components/common/googlePlace";
import { useState, useEffect } from "react";
import { useLocation } from "@/hooks/use-location";
import { AddressService } from "@/services/address-service";
import AddressCard from "@/components/screens/address/address-card";

export default function SelectLocationPage() {
  const router = useRouter();

  // Auto-detected
  const { locationName, address, latitude, longitude, loading } = useLocation();

  // Google locations
  const [gLatitude, setGLatitude] = useState<number | null>(null);
  const [gLongitude, setGLongitude] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);

  // Fetch from API
  useEffect(() => {
    (async () => {
      const all = await AddressService.fetchAll();
      const def = await AddressService.fetchDefault();
      setAddresses(all.data);
      setDefaultAddress(def.data);
    })();
  }, []);

  const handleUseCurrentLocation = async () => {
    if (!latitude || !longitude) return;

    await AddressService.create({
      first_name: "Auto",
      last_name: "Detected",
      address_line_1: address,
      address_line_2: "",
      city: locationName,
      region: "",
      country: "India",
      country_code: "IN",
      postal_code: "",
      latitude,
      longitude,
      is_default: true,
    });

    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Select a location</h1>

      {/* Search Box */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

        {/* <GoogleMapAutoComplete
          setSelectedLocation={setSelectedAddress}
          setLongitude={setGLongitude}
          setlatitude={setGLatitude}
          placeholder="Enter your delivery address"
          className="pl-9"
        /> */}
      </div>

      {/* Current Location */}
      <Card
        onClick={handleUseCurrentLocation}
        className="p-4 cursor-pointer hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-3 text-red-600 font-medium">
          <LocateFixed className="h-5 w-5 text-red-500" />
          Use current location
        </div>

        <p className="text-sm text-gray-600 ml-8">
          {loading
            ? "Detecting location..."
            : address || locationName || "Unable to detect"}
        </p>
      </Card>

      {/* Add Address */}
      <Card
        onClick={() => router.push("/address/add")}
        className="mt-3 p-4 cursor-pointer hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-3 font-medium text-red-500">
          <Plus className="h-5 w-5" /> Add Address
        </div>
      </Card>

      {/* Saved Addresses */}
      <h2 className="text-sm font-semibold text-gray-500 mt-6 mb-2 uppercase">
        Saved Addresses
      </h2>

      {addresses.map((addr) => (
        <AddressCard
          key={addr._id}
          address={addr}
          isDefault={defaultAddress?._id === addr._id}
          onEdit={() => router.push(`/address/edit/${addr._id}`)}
          onSetDefault={async () => {
            await AddressService.setDefault(addr._id);
            const def = await AddressService.fetchDefault();
            setDefaultAddress(def.data);
          }}
          onDelete={async () => {
            await AddressService.delete(addr._id);
            setAddresses(addresses.filter((a) => a._id !== addr._id));
          }}
        />
      ))}
    </div>
  );
}
