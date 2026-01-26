"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { TOrderDelivery } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Menu, X } from "lucide-react";

type Nullable<T> = T | null;

// Styles for map container
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Custom SVG icons as data URLs (simple, tweakable)
const orderMarkerSvg = (color = "#ff4d4f", label = "") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' fill='${color}'/><text x='12' y='13' text-anchor='middle' font-size='10' fill='white' font-family='Arial' dy='0'>${label}</text></svg>`,
  )}`;

const driverMarkerSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#22c55e'/><path d='M8 14c.5-1 1-2 4-2s3.5 1 4 2' stroke='white' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>`,
)}`;

// Helper: safe parse floats
const toLatLng = (lat?: number, lng?: number) =>
  typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

// Main component
export default function RouteMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [orders, setOrders] = useState<TOrderDelivery[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // UI / selection
  const [selectedOrder, setSelectedOrder] =
    useState<Nullable<TOrderDelivery>>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Map refs (we directly manage some google objects)
  const geoWatchIdRef = useRef<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const grayMarkerSvg = () =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>
      <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
        fill='#9CA3AF'/>
    </svg>`,
    )}`;
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const animatedPathRef = useRef<google.maps.LatLngLiteral[]>([]);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationIntervalRef = useRef<number | null>(null);
  const driverIntervalRef = useRef<number | null>(null);

  // Directions result (for route overview_path)
  const [directionsResult, setDirectionsResult] =
    useState<Nullable<google.maps.DirectionsResult>>(null);

  // Fetch orders (dynamic coordinates must come from orders)
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders/today?timeSlot=dinner`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      // Expect json.data to be TOrderDelivery[]
      setOrders((json.data as TOrderDelivery[]) || []);
    } catch (err) {
      console.error("fetchOrders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => {
      // cleanup intervals
      if (animationIntervalRef.current)
        window.clearInterval(animationIntervalRef.current);
      if (driverIntervalRef.current)
        window.clearInterval(driverIntervalRef.current);
    };
  }, []);

  // Compute coordinates array from orders (in original order)
  const pathCoords = useMemo(() => {
    return orders
      .map((o) => toLatLng(o.address.latitude, o.address.longitude))
      .filter((x): x is google.maps.LatLngLiteral => x !== null);
  }, [orders]);

  // Map onLoad handler to capture map instance
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Create markers + cluster when orders change or when map loads
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // 🧹 Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    const newMarkers: google.maps.Marker[] = [];

    orders.forEach((order) => {
      const pos = toLatLng(order.address.latitude, order.address.longitude);
      if (!pos) return;

      const marker = new google.maps.Marker({
        position: pos,
        map: mapRef.current!,
        title: order.consumerId?.name,
        icon: {
          url:
            order.status === "delivered" ? grayMarkerSvg() : orderMarkerSvg(),
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      marker.addListener("click", () => {
        setSelectedOrder(order);
        setShowDialog(true);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(15);
      });

      // ✅ Store by orderId
      markersRef.current[order._id] = marker;
      newMarkers.push(marker);
    });

    // Marker clustering
    clustererRef.current = new MarkerClusterer({
      markers: newMarkers,
      map: mapRef.current,
    });

    return () => {
      newMarkers.forEach((m) => m.setMap(null));
      if (clustererRef.current) clustererRef.current.clearMarkers();
    };
  }, [isLoaded, orders]);

  // When pathCoords update, request directions (we use DirectionsService component below)
  // We'll submit origin/destination/waypoints to <DirectionsService> by storing path coords in state props
  // Once directions come back, animate polyline and start driver simulation.

  // Callback when DirectionsService returns
  const handleDirectionsCallback = (
    res: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus | string,
  ) => {
    if (status === "OK" && res) {
      setDirectionsResult(res);
      directionsCalculatedRef.current = true;

      const overviewPath =
        res.routes?.[0]?.overview_path?.map((p) => ({
          lat: p.lat(),
          lng: p.lng(),
        })) || [];

      createAndAnimatePolyline(overviewPath);

      if (navigationStarted) {
        startLiveDriverTracking();
      }
    } else {
      console.warn("Directions failed", status);
    }
  };

  // Create polyline object and animate "drawing" then simulate driver movement along it
  const createAndAnimatePolyline = (path: google.maps.LatLngLiteral[]) => {
    if (!mapRef.current || path.length === 0) return;

    // Clear existing polyline and driver marker and intervals
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setMap(null);
      driverMarkerRef.current = null;
    }
    if (animationIntervalRef.current) {
      window.clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    if (driverIntervalRef.current) {
      window.clearInterval(driverIntervalRef.current);
      driverIntervalRef.current = null;
    }
    animatedPathRef.current = [];

    // Create polyline that will be drawn progressively
    polylineRef.current = new google.maps.Polyline({
      path: [],
      strokeColor: "#ff4d4f",
      strokeOpacity: 0.95,
      strokeWeight: 5,
      map: mapRef.current,
      zIndex: 5,
    });

    // Animate draw: add one point per tick
    let idx = 0;
    const tickMs = 40;
    animationIntervalRef.current = window.setInterval(() => {
      if (!polylineRef.current) return;
      if (idx >= path.length) {
        // done drawing
        if (animationIntervalRef.current) {
          window.clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
        // start driver after polyline drawn
        // startDriverSimulation(path);
        return;
      }
      animatedPathRef.current.push(path[idx]);
      polylineRef.current.setPath(animatedPathRef.current);
      idx++;
    }, tickMs);
  };

  // Simulate driver moving along the full path (looping) // Testing
  // const startDriverSimulation = (path: google.maps.LatLngLiteral[]) => {
  //   if (!mapRef.current || path.length === 0) return;

  //   // Place driver at first point
  //   driverMarkerRef.current = new google.maps.Marker({
  //     position: path[0],
  //     map: mapRef.current,
  //     icon: {
  //       url: driverMarkerSvg,
  //       scaledSize: new google.maps.Size(42, 42),
  //     },
  //     zIndex: 999,
  //     title: "Driver",
  //   });

  //   // animate driver by interpolating between path points
  //   const speedMs = 800; // time between moves (lower => faster)
  //   let i = 0;

  //   driverIntervalRef.current = window.setInterval(() => {
  //     if (!driverMarkerRef.current) return;
  //     // move to next point
  //     i = (i + 1) % path.length;
  //     const next = path[i];
  //     // smooth interpolate using simple panTo + marker.setPosition; for smoother movement you'd implement step interpolation
  //     driverMarkerRef.current.setPosition(next);
  //     // keep map centered (optional) - comment out if not desired
  //     // mapRef.current?.panTo(next);
  //   }, speedMs);
  // };

  const startLiveDriverTracking = () => {
    if (!navigator.geolocation || !mapRef.current) return;

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const livePos = { lat: latitude, lng: longitude };

        if (!driverMarkerRef.current) {
          driverMarkerRef.current = new google.maps.Marker({
            position: livePos,
            map: mapRef.current!,
            icon: {
              url: driverMarkerSvg,
              scaledSize: new google.maps.Size(42, 42),
            },
            title: "You (Driver)",
          });
        } else {
          driverMarkerRef.current.setPosition(livePos);
        }
      },
      (error) => console.error("GPS Error:", error),
      {
        enableHighAccuracy: true, // ✅ HERE
        maximumAge: 5000,
        timeout: 10000,
      },
    );
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current)
        window.clearInterval(animationIntervalRef.current);
      if (driverIntervalRef.current)
        window.clearInterval(driverIntervalRef.current);
    };
  }, []);

  // Sidebar: center and open order
  const openOrderFromSidebar = (order: TOrderDelivery) => {
    setSelectedOrder(order);
    setShowDialog(true);

    const pos = toLatLng(order.address.latitude, order.address.longitude);
    if (pos && mapRef.current) {
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(15);
    }

    // ✅ DIRECT marker access (no search needed)
    const marker = markersRef.current[order._id];
    if (marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 900);
    }
  };

  const directionsCalculatedRef = useRef(false);

  useEffect(() => {
    directionsCalculatedRef.current = false;
    setDirectionsResult(null);
  }, [orders]);

  useEffect(() => {
    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, []);

  const getDistanceInMeters = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const isDriverNearCustomer = useMemo(() => {
    if (!selectedOrder || !driverMarkerRef.current) return false;

    const driverPos = driverMarkerRef.current.getPosition();
    if (!driverPos) return false;

    const distance = getDistanceInMeters(
      driverPos.lat(),
      driverPos.lng(),
      selectedOrder.address.latitude as number,
      selectedOrder.address.longitude as number,
    );

    return distance <= 50;
  }, [selectedOrder]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: TOrderDelivery["status"],
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // 1️⃣ update orders state
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );

        // 2️⃣ update marker color
        const marker = markersRef.current[orderId];
        if (marker) {
          marker.setIcon({
            url: grayMarkerSvg(),
            scaledSize: new google.maps.Size(40, 40),
          });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (!isLoaded) {
    return <div className="p-4">Loading map...</div>;
  }

  if (!orders.length && !loadingOrders) {
    return (
      <div className="p-6">No orders available for the selected timeslot.</div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <aside
        className={`absolute left-0 top-0 z-20 h-full w-96 bg-white border-r p-4 space-y-4
    transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Button
          className="w-full mt-12"
          disabled={navigationStarted}
          onClick={() => {
            setNavigationStarted(true);
            directionsCalculatedRef.current = false;
            setDirectionsResult(null);
          }}
        >
          {navigationStarted
            ? "Let's make it quick to earn more in less time"
            : "Start Delivering orders now"}
        </Button>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Orders ({orders.length})</h3>
          <div>
            <Button
              onClick={() => {
                fetchOrders();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <Card className="p-0">
          <ScrollArea style={{ height: 600 }}>
            <div className="space-y-2 p-3">
              {orders.map((order, idx) => (
                <div
                  key={order._id}
                  className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50"
                >
                  <div className="w-10 flex items-center justify-center">
                    <div className="text-sm font-medium">{idx + 1}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">
                          {order.consumerId?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.menuId?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ₹{order.totalAmount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.timeSlot}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {order.address.city}, {order.address.region}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderFromSidebar(order)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          // center map to this order
                          const pos = toLatLng(
                            order.address.latitude,
                            order.address.longitude,
                          );
                          if (pos && mapRef.current) {
                            mapRef.current.panTo(pos);
                            mapRef.current.setZoom(15);
                          }
                        }}
                      >
                        Center
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <div>
          <p className="text-sm text-muted-foreground">Driver</p>
          <div className="mt-2">
            <Button
              onClick={() => {
                if (driverMarkerRef.current && mapRef.current) {
                  const p = driverMarkerRef.current.getPosition();
                  if (p) mapRef.current.panTo({ lat: p.lat(), lng: p.lng() });
                }
              }}
            >
              Center Driver
            </Button>
          </div>
        </div>
      </aside>

      <main className="absolute inset-0">
        <Button
          size="icon"
          className="absolute top-4 left-4 z-30 shadow-lg"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={pathCoords[0] || { lat: 0, lng: 0 }}
          zoom={13}
          onLoad={handleMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          }}
        >
          {/* If we have at least 2 points, request directions */}
          {navigationStarted &&
            pathCoords.length >= 2 &&
            !directionsCalculatedRef.current && (
              <DirectionsService
                options={{
                  origin: pathCoords[0],
                  destination: pathCoords[pathCoords.length - 1],
                  waypoints: pathCoords.slice(1, -1).map((p) => ({
                    location: p,
                    stopover: true,
                  })),
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={(res, status) => {
                  if (status === "OK" && res) {
                    directionsCalculatedRef.current = true;
                    handleDirectionsCallback(res, status);
                  }
                }}
              />
            )}

          {directionsResult && (
            <DirectionsRenderer
              options={{
                directions: directionsResult,
                preserveViewport: true,
                polylineOptions: { strokeOpacity: 0 },
                suppressMarkers: true,
              }}
            />
          )}
        </GoogleMap>
      </main>

      <Drawer
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setSelectedOrder(null);
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
          </DrawerHeader>

          {selectedOrder ? (
            <div className="space-y-4 px-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-semibold">
                    {selectedOrder.consumerId.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.consumerId.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold">₹{selectedOrder.totalAmount}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.paymentStatus}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Menu</p>
                <p className="font-medium">{selectedOrder.menuId.name}</p>
                <p className="text-sm">{selectedOrder.menuId.description}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium">
                  {selectedOrder.address.address_line_1}
                </p>
                <p className="text-sm">
                  {selectedOrder.address.address_line_2}
                </p>
                <p className="text-sm">
                  {selectedOrder.address.city}, {selectedOrder.address.region} -{" "}
                  {selectedOrder.address.postal_code}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm">
                    {format(new Date(selectedOrder.createdAt), "PPpp")}
                  </p>
                </div>

                {selectedOrder && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Order Status
                      </p>
                      <span className="text-sm font-semibold capitalize">
                        {selectedOrder.status}
                      </span>
                    </div>

                    {/* DELIVERED BUTTON */}
                    {selectedOrder.status !== "delivered" && (
                      <Button
                        className="w-full bg-success"
                        disabled={
                          !isDriverNearCustomer ||
                          selectedOrder.status !== "in_progress"
                        }
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "delivered")
                        }
                      >
                        Mark as Delivered
                      </Button>
                    )}

                    {/* Helper text */}
                    {!isDriverNearCustomer && (
                      <p className="text-xs text-muted-foreground text-center">
                        Move within 50 meters of customer to enable delivery
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>No order selected</div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

{
  /* <p className="text-xs text-muted-foreground text-center">
  Distance to customer: {Math.round(distance)} meters
</p> */
}
