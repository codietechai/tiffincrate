import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  APIProvider,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

const GoogleMapAutoComplete = ({
  setSelectedLocation,
  setLongitude,
  setlatitude,
  isError,
  placeholder,
}: {
  setSelectedLocation: any;
  setLongitude: any;
  setlatitude: any;
  isError: any;
  placeholder: string;
}) => {
  const [state, setState] = useState<string>("");

  useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const mapRef = useRef<google.maps.Map | null>(null);
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
    }
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      let neighbourhood = "";
      let city = "";
      let state = "";
      let country = "";
      if (place.address_components) {
        place.address_components.forEach((component) => {
          if (
            component.types.includes("sublocality_level_1") ||
            component.types.includes("neighborhood")
          ) {
            neighbourhood = component.long_name;
          }
          if (
            component.types.includes("locality") ||
            component.types.includes("postal_town")
          ) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (component.types.includes("country")) {
            country = component.long_name;
          }
        });
      }
      setState(state);
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <div className="autocomplete-control">
        <PlaceAutocomplete
          onPlaceSelect={handlePlaceSelect}
          setState={setState}
          state={state}
          isError={isError}
          setSelectedLocation={setSelectedLocation}
          setLongitude={setLongitude}
          setLatitude={setlatitude}
          placeholder={placeholder}
        />
      </div>
    </APIProvider>
  );
};

const PlaceAutocomplete = ({
  onPlaceSelect,
  setState,
  state,
  isError,
  setSelectedLocation,
  setLongitude,
  setLatitude,
  placeholder,
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  setState: any;
  state: string;
  setSelectedLocation: any;
  setLongitude: any;
  setLatitude: any;
  placeholder: string;

  isError: (log: boolean) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const {
    control,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: "",
      State: state,
    },
  });

  const [location, setLocation] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);

  useEffect(() => {
    reset({
      location: "",
      State: state,
    });
  }, []);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address", "address_components"],
      componentRestrictions: { country: "in" },
    });

    autocomplete.addListener("place_changed", async () => {
      const place = autocomplete.getPlace();
      if (place) {
        onPlaceSelect(place);
        setIsPlaceSelected(true);
        let state = "";

        if (place.address_components) {
          place.address_components.forEach((component) => {
            if (component.types.includes("administrative_area_level_1")) {
              state = component.long_name;
            }
          });
        }

        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        if (lat && lng) {
          setLatitude(lat);
          setLongitude(lng);
        }

        setError(false);

        setSelectedLocation(place?.formatted_address || "");
        setValue("location", place.formatted_address || "");
        setValue("State", state);
        setState(state);
      }
    });

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.placeholder = "";
      }
    }, 100);
  }, [places, onPlaceSelect]);

  return (
    <div className="">
      <Input
        className="border  z-[999]  max-w-[700px] w-full"
        // labelStyle={{ top: "0.6rem" }}
        placeholder={placeholder}
        ref={inputRef}
        name="location"
        // errors={errors}
        required={true}
        // control={control}
        // setValue={setLocation}
        defaultValue={location}
      />
    </div>
  );
};

export default GoogleMapAutoComplete;
