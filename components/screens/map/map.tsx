"use client";

import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useMemo } from "react";

export default function RouteMap() {
  const pathCoordinates = useMemo(
    () => [
      { lat: 30.74438, lng: 76.81164 },
      { lat: 30.75255, lng: 76.81008 },
      { lat: 30.75662, lng: 76.80236 },
    ],
    []
  );

  const [directions, setDirections] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="h-[100vh] w-[100vw]">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={pathCoordinates[0]}
        zoom={14}
      >
        <DirectionsService
          options={{
            origin: pathCoordinates[0],
            destination: pathCoordinates[pathCoordinates.length - 1],
            waypoints: pathCoordinates.slice(1, -1).map((p) => ({
              location: p,
              stopover: true,
            })),
            travelMode: google.maps.TravelMode.DRIVING,
          }}
          callback={(res, status) => {
            if (status === "OK") setDirections(res as any);
          }}
        />

        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              polylineOptions: {
                strokeColor: "#FF0000",
                strokeWeight: 4,
              },
            }}
          />
        )}

        {pathCoordinates.map((coord, i) => (
          <Marker key={i} position={coord} />
        ))}
      </GoogleMap>
    </div>
  );
}
