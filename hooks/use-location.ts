"use client";
import { useEffect, useState } from "react";

interface LocationResult {
  locationName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): LocationResult {
  const [locationName, setLocationName] = useState("Detecting location...");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        const data = await res.json();

        const cityName =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          "Unknown";

        const preciseAddress = [
          data.address?.house_number,
          data.address?.road,
          data.address?.neighbourhood,
          data.address?.suburb,
        ]
          .filter(Boolean)
          .join(", ");

        setLocationName(cityName);
        setAddress(preciseAddress || "Unable to determine street location");
      } catch (err) {
        setError("Failed to fetch address");
        setLocationName("Location unavailable");
      } finally {
        setLoading(false);
      }
    };

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      setLocationName("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setLatitude(latitude);
        setLongitude(longitude);

        fetchLocation(latitude, longitude);
      },
      () => {
        setError("Location access denied");
        setLocationName("Location access denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    locationName,
    address,
    latitude,
    longitude,
    loading,
    error,
  };
}
