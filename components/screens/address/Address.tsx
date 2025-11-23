"use client";
import { useRouter } from "next/navigation";
import { Search, Plus, MapPin, Home, LocateFixed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SelectLocationPage() {
  const router = useRouter();

  
  const savedAddresses = [
    {
      id: 1,
      label: "Home",
      address: "3305 Sector 15D Chandigarh, Ground floor, 15D, Sector 15",
      distance: "40 m",
    },
  ];

  const nearbyLocations = [
    { id: 1, name: "Punjab University", area: "Sector 14, Chandigarh", distance: "846 m" },
    { id: 2, name: "Anagha Home Stays Pg For Boys", area: "Sector 15, Chandigarh", distance: "90 m" },
    { id: 3, name: "Guru TEG Bahadur Public School", area: "Sector 15, Chandigarh", distance: "228 m" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Select a location</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search for area, street name..."
          className="pl-10"
        />
      </div>

      <div className="space-y-3 mb-6">
        <Card
          onClick={() => router.push("/use-current-location")}
          className="p-4 cursor-pointer hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 text-red-600 font-medium">
            <LocateFixed className="h-5 w-5 text-red-500" />
            Use current location
          </div>
          <p className="text-sm text-gray-600 ml-8">15D, Sector 15, Chandigarh</p>
        </Card>

        <Card
          onClick={() => router.push("/add-address")}
          className="p-4 cursor-pointer hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 font-medium text-red-500">
            <Plus className="h-5 w-5" /> Add Address
          </div>
        </Card>

      </div>

      <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
        Saved Addresses
      </h2>
      {savedAddresses.map((addr) => (
        <Card key={addr.id} className="mb-3 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">{addr.label}</h3>
                <p className="text-gray-600 text-sm leading-tight">
                  {addr.address}
                </p>
                <p className="text-gray-400 text-xs mt-1">{addr.distance}</p>
              </div>
            </div>
            <div className="flex gap-2 text-gray-400">
              <button className="hover:text-gray-600">⋯</button>
              <button className="hover:text-gray-600">↗</button>
            </div>
          </div>
        </Card>
      ))}

      <h2 className="text-sm font-semibold text-gray-500 mt-6 mb-2 uppercase">
        Nearby Locations
      </h2>
      <div className="space-y-2">
        {nearbyLocations.map((loc) => (
          <Card key={loc.id} className="p-3 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">
                {loc.name}
              </h3>
              <p className="text-gray-600 text-xs">{loc.area}</p>
            </div>
            <div className="ml-auto text-gray-400 text-xs">{loc.distance}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}