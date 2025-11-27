"use client";

import React, { useEffect, useRef, useState } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";

interface AddressPayload {
  address: string;
  components: google.maps.GeocoderAddressComponent[];
}

interface Props {
  setSelectedLocation: (v: AddressPayload) => void;
  setLongitude: (v: number) => void;
  setLatitude: (v: number) => void;
  isError?: (v: boolean) => void;
  placeholder: string;
  className?: string;
}

export default function GoogleMapAutoComplete({
  setSelectedLocation,
  setLongitude,
  setLatitude,
  isError,
  placeholder,
  className,
}: Props) {
  const [state, setState] = useState("");

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let detectedState = "";

    place.address_components?.forEach((component) => {
      if (component.types.includes("administrative_area_level_1")) {
        detectedState = component.long_name;
      }
    });

    setState(detectedState);
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <PlaceAutocomplete
        onPlaceSelect={handlePlaceSelect}
        setState={setState}
        isError={isError}
        setSelectedLocation={setSelectedLocation}
        setLongitude={setLongitude}
        setLatitude={setLatitude}
        placeholder={placeholder}
        className={className}
      />
    </APIProvider>
  );
}

const PlaceAutocomplete = ({
  onPlaceSelect,
  setState,
  isError,
  setSelectedLocation,
  setLongitude,
  setLatitude,
  placeholder,
  className,
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  setState: (v: string) => void;
  isError?: (v: boolean) => void;
  setSelectedLocation: (v: {
    address: string;
    components: google.maps.GeocoderAddressComponent[];
  }) => void;
  setLongitude: (v: number) => void;
  setLatitude: (v: number) => void;
  placeholder: string;
  className?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "address_components"],
      componentRestrictions: { country: "in" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place) return;

      onPlaceSelect(place);

      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (lat && lng) {
        setLatitude(lat);
        setLongitude(lng);
      }

      setSelectedLocation({
        address: place.formatted_address || "",
        components: place.address_components || [],
      });

      isError?.(false);
    });
  }, [places]);

  console.log("placeholder", placeholder);
  return (
    <>
      <Input
        className={`border z-[999] max-w-[700px] w-full ${className}`}
        placeholder={placeholder}
        ref={inputRef}
        name="location"
      />
    </>
  );
};
