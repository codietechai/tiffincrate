"use client";
import { useEffect, useState } from "react";
import { httpClient } from "@/lib/http-client";
import { ROUTES } from "@/constants/routes";

interface LocationResult {
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): LocationResult {
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reverse Geocode Function using httpClient
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const data = await httpClient.get(`${ROUTES.REVERSE_GEOCODE}?lat=${lat}&lon=${lon}`);
      const a = data.address;

      setAddressLine1(
        [a?.house_number, a?.road, a?.neighbourhood, a?.suburb]
          .filter(Boolean)
          .join(", ")
      );

      setCity(a?.city || a?.town || a?.village || a?.county || "");

      setState(a?.state || "");

      setPincode(a?.postcode || "");
    } catch (err) {
      setError("Failed to fetch address");
    } finally {
      setLoading(false);
    }
  };

  // Get GPS Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        fetchLocationDetails(lat, lon);
      },
      () => {
        setError("Location access denied");
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
    addressLine1,
    city,
    state,
    pincode,
    latitude,
    longitude,
    loading,
    error,
  };
}
