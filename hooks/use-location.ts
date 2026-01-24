"use client";
import { useEffect, useState } from "react";

interface LocationResult {
  address_line_1: string;
  city: string;
  region: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null; 
}

export function useLocation(): LocationResult {
  const [address_line_1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postal_code, setPostalCode] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reverse Geocode Function
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const a = data.address;

      setAddressLine1(
        [a?.house_number, a?.road, a?.neighbourhood, a?.suburb]
          .filter(Boolean)
          .join(", ")
      );

      setCity(a?.city || a?.town || a?.village || a?.county || "");

      setRegion(a?.state || "");

      setPostalCode(a?.postcode || "");
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
    address_line_1,
    city,
    region,
    postal_code,
    latitude,
    longitude,
    loading,
    error,
  };
}
