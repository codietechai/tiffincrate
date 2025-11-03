"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Search, Navigation, Check } from "lucide-react";

export default function MapSelectorPage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const loadGoogleMaps = () => {
    if ((window as any).google) {
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const defaultLocation = { lat: 12.9716, lng: 77.5946 }; // Bangalore

    const mapInstance = new (window as any).google.maps.Map(mapElement, {
      center: defaultLocation,
      zoom: 13,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#fef3e2" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
      ],
    });

    setMap(mapInstance);

    // Add click listener
    mapInstance.addListener("click", (event: any) => {
      const location = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
      };

      // Reverse geocode to get address
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode(
        { location: event.latLng },
        (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const fullLocation = {
              ...location,
              address: results[0].formatted_address,
            };
            setSelectedLocation(fullLocation);
            updateMarker(event.latLng, fullLocation.address);
          }
        }
      );
    });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance.setCenter(userLocation);
          mapInstance.setZoom(15);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  const updateMarker = (position: any, address: string) => {
    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new (window as any).google.maps.Marker({
      position,
      map,
      title: address,
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="url(#gradient)" stroke="#fff" stroke-width="2"/>
            <circle cx="20" cy="20" r="8" fill="#fff"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f97316"/>
                <stop offset="100%" style="stop-color:#dc2626"/>
              </linearGradient>
            </defs>
          </svg>
        `),
        scaledSize: new (window as any).google.maps.Size(40, 40),
      },
    });

    setMarker(newMarker);
  };

  const searchPlaces = async () => {
    if (!searchQuery.trim() || !map) return;

    const service = new (window as any).google.maps.places.PlacesService(map);
    const request = {
      query: searchQuery,
      fields: ["name", "geometry", "formatted_address"],
    };

    service.textSearch(request, (results: any, status: any) => {
      if (
        status === (window as any).google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        setSearchResults(results.slice(0, 5));
      }
    });
  };

  const selectSearchResult = (place: any) => {
    const location = {
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      address: place.formatted_address,
    };

    setSelectedLocation(location);
    map.setCenter(place.geometry.location);
    map.setZoom(15);
    updateMarker(place.geometry.location, place.formatted_address);
    setSearchResults([]);
    setSearchQuery("");
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      // Store location in localStorage or pass back to parent
      localStorage.setItem(
        "selectedDeliveryLocation",
        JSON.stringify(selectedLocation)
      );
      router.push(returnUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            Select Delivery Location
          </h1>
          <p className="text-gray-600">
            Choose your delivery location on the map
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-orange-600" />
                  Search Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchPlaces()}
                  />
                  <Button onClick={searchPlaces} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((place, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                        onClick={() => selectSearchResult(place)}
                      >
                        <p className="font-medium">{place.name}</p>
                        <p className="text-sm text-gray-600">
                          {place.formatted_address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedLocation && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Selected Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-green-800">Address:</p>
                    <p className="text-sm text-green-700">
                      {selectedLocation.address}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium text-green-800">Latitude:</p>
                      <p className="text-green-700">
                        {selectedLocation.latitude.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Longitude:</p>
                      <p className="text-green-700">
                        {selectedLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={confirmLocation}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden">
              <div id="map" className="w-full h-full"></div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
