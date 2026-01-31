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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Menu, X, Clock, MapPin, Phone, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TIME_SLOT_PERIODS, isTimeSlotActive, getNextTimeSlot, getTimeUntilSlot } from "@/utils/time-slots";

type Nullable<T> = T | null;

// Styles for map container
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Uber-style destination marker
const uberDestinationMarkerSvg = (orderNumber: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='50' viewBox='0 0 40 50'>
      <!-- Drop shadow -->
      <ellipse cx='20' cy='47' rx='8' ry='3' fill='rgba(0,0,0,0.2)'/>
      <!-- Main pin -->
      <path d='M20 2C12.3 2 6 8.3 6 16c0 11.25 14 32 14 32s14-20.75 14-32c0-7.7-6.3-14-14-14z' fill='#1976D2'/>
      <!-- White circle -->
      <circle cx='20' cy='16' r='8' fill='white'/>
      <!-- Order number -->
      <text x='20' y='21' text-anchor='middle' font-size='12' font-weight='bold' fill='#1976D2' font-family='Arial'>${orderNumber}</text>
    </svg>`,
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

  const [driverLocation, setDriverLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('dinner');
  const [orders, setOrders] = useState<TOrderDelivery[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Nullable<TOrderDelivery>>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [liveUpdatesConnected, setLiveUpdatesConnected] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [alternativeRoutes, setAlternativeRoutes] = useState<google.maps.DirectionsResult[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [etaCalculating, setEtaCalculating] = useState(false);
  const [customerETAs, setCustomerETAs] = useState<Record<string, { distance: number; time: number }>>({});
  const [liveNavigation, setLiveNavigation] = useState({
    distanceToNext: 0,
    timeToNext: 0,
    nextCustomer: null as TOrderDelivery | null,
    totalDistance: 0,
    totalTime: 0,
  });
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Map refs
  const geoWatchIdRef = useRef<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const animatedPathRef = useRef<google.maps.LatLngLiteral[]>([]);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationIntervalRef = useRef<number | null>(null);
  const driverIntervalRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Directions result
  const [directionsResult, setDirectionsResult] =
    useState<Nullable<google.maps.DirectionsResult>>(null);
  const directionsCalculatedRef = useRef(false);

  // Enhanced fetch orders with real-time updates
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders/today?timeSlot=${selectedTimeSlot}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setOrders((json.data as TOrderDelivery[]) || []);
    } catch (err) {
      console.error("fetchOrders:", err);
      setOrders([]);
      toast.error("Failed to fetch orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Setup live updates via Server-Sent Events
  const setupLiveUpdates = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/orders/live-updates');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setLiveUpdatesConnected(true);
      toast.success("Live updates connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'orders_update') {
          setOrders(data.data);
        } else if (data.type === 'error') {
          console.error('Live update error:', data.message);
        }
      } catch (error) {
        console.error('Error parsing live update:', error);
      }
    };

    eventSource.onerror = () => {
      setLiveUpdatesConnected(false);
      toast.error("Live updates disconnected");
    };
  };

  // Bulk update orders to out_for_delivery when navigation starts
  const startNavigation = async () => {
    // Check if it's the right time for the selected time slot
    const timeUntilSlot = getTimeUntilSlot(selectedTimeSlot);
    const isSlotActive = isTimeSlotActive(selectedTimeSlot);

    if (!isSlotActive && timeUntilSlot > 30) {
      const slotPeriod = TIME_SLOT_PERIODS[selectedTimeSlot];
      toast.error(`Navigation can only start 30 minutes before ${slotPeriod.label}. Time remaining: ${Math.floor(timeUntilSlot / 60)}h ${timeUntilSlot % 60}m`);
      return;
    }

    try {
      const orderIds = orders.map(order => order._id);

      // Update all orders to out_for_delivery
      const response = await fetch('/api/orders/bulk-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'out_for_delivery',
          orderIds,
        }),
      });

      if (response.ok) {
        setNavigationStarted(true);
        directionsCalculatedRef.current = false;
        setDirectionsResult(null);

        // Start GPS tracking
        startLiveDriverTracking();

        // Calculate real-time ETAs for all customers
        if (driverLocation) {
          calculateCustomerETAs(driverLocation);
          // Initialize live navigation data immediately
          updateLiveNavigation(driverLocation);
        } else {
          // Start GPS tracking first, then update navigation data
          startLiveDriverTracking();

          // Also try to get current position immediately for faster initialization
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const currentPos = { lat: latitude, lng: longitude };
                setDriverLocation(currentPos);
                calculateCustomerETAs(currentPos);
                updateLiveNavigation(currentPos);
              },
              (error) => {
                console.error('Failed to get current position:', error);
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
            );
          }
        }

        const slotPeriod = TIME_SLOT_PERIODS[selectedTimeSlot];
        toast.success(`Navigation started for ${slotPeriod.label}! All orders marked as out for delivery`);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error starting navigation:', error);
      toast.error("Failed to start navigation");
    }
  };

  // Calculate real-time ETAs for all customers
  const calculateCustomerETAs = async (providerLocation: google.maps.LatLngLiteral) => {
    if (!orders.length) return;

    try {
      const service = new google.maps.DistanceMatrixService();
      const destinations = orders.map(order => ({
        lat: order.address.latitude as number,
        lng: order.address.longitude as number
      }));

      service.getDistanceMatrix({
        origins: [providerLocation],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        if (status === 'OK' && response?.rows[0]) {
          const newETAs: Record<string, { distance: number; time: number }> = {};

          response.rows[0].elements.forEach((element, index) => {
            if (element.status === 'OK' && orders[index]) {
              newETAs[orders[index]._id] = {
                distance: element.distance?.value || 0,
                time: element.duration?.value || 0
              };
            }
          });

          setCustomerETAs(newETAs);
        }
      });
    } catch (error) {
      console.error('Error calculating customer ETAs:', error);
    }
  };

  // Cancel navigation and reset orders to previous status
  const cancelNavigation = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel navigation? This will reset all orders to 'ready' status."
    );

    if (!confirmCancel) return;

    try {
      const orderIds = orders.map(order => order._id);

      // Update all orders back to ready status
      const response = await fetch('/api/orders/bulk-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ready',
          orderIds,
        }),
      });

      if (response.ok) {
        setNavigationStarted(false);
        directionsCalculatedRef.current = false;
        setDirectionsResult(null);

        // Stop GPS tracking
        if (geoWatchIdRef.current !== null) {
          navigator.geolocation.clearWatch(geoWatchIdRef.current);
          geoWatchIdRef.current = null;
        }

        // Remove driver marker
        if (driverMarkerRef.current) {
          driverMarkerRef.current.setMap(null);
          driverMarkerRef.current = null;
        }

        // Clear route polyline
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
          polylineRef.current = null;
        }

        // Stop animations
        if (animationIntervalRef.current) {
          window.clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }

        // Reset driver location
        setDriverLocation(null);

        // Reset live navigation data
        setLiveNavigation({
          distanceToNext: 0,
          timeToNext: 0,
          nextCustomer: null,
          totalDistance: 0,
          totalTime: 0,
        });

        // Reset map view to Uber-style
        if (mapRef.current && pathCoords.length > 0) {
          mapRef.current.setZoom(13);
          mapRef.current.setTilt(45); // Uber-style tilt
          mapRef.current.setHeading(0);
          mapRef.current.panTo(pathCoords[0]);
        }

        toast.success("Navigation cancelled. Orders reset to ready status");
      } else {
        throw new Error('Failed to cancel navigation');
      }
    } catch (error) {
      console.error('Error cancelling navigation:', error);
      toast.error("Failed to cancel navigation");
    }
  };

  useEffect(() => {
    fetchOrders();
    setupLiveUpdates();

    return () => {
      // cleanup intervals and connections
      if (animationIntervalRef.current)
        window.clearInterval(animationIntervalRef.current);
      if (driverIntervalRef.current)
        window.clearInterval(driverIntervalRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, [selectedTimeSlot]); // Re-fetch when time slot changes

  // Initialize live navigation data when navigation starts
  useEffect(() => {
    if (navigationStarted && orders.length > 0) {
      // Find the first order that needs delivery
      const nextOrder = orders.find(order =>
        order.status === 'out_for_delivery' || order.status === 'ready'
      );

      if (nextOrder) {
        // Always update the next customer immediately
        setLiveNavigation(prev => ({
          ...prev,
          nextCustomer: nextOrder,
        }));

        // If we have driver location, update distance and time immediately
        if (driverLocation) {
          updateLiveNavigation(driverLocation);
        } else {
          // If no GPS yet, set initial values that will be updated when GPS starts
          setLiveNavigation(prev => ({
            ...prev,
            nextCustomer: nextOrder,
            distanceToNext: 0,
            timeToNext: 0,
          }));
        }
      }
    }
  }, [navigationStarted, orders]);

  // Update live navigation when driver location changes during navigation
  useEffect(() => {
    if (navigationStarted && driverLocation && orders.length > 0) {
      updateLiveNavigation(driverLocation);
    }
  }, [driverLocation, navigationStarted, orders]);

  // Map onLoad handler to capture map instance
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Enhanced marker creation with status-based colors
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24'; // yellow
      case 'confirmed': return '#3b82f6'; // blue
      case 'preparing': return '#f97316'; // orange
      case 'ready': return '#8b5cf6'; // purple
      case 'out_for_delivery': return '#ef4444'; // red
      case 'delivered': return '#9ca3af'; // gray
      case 'cancelled': return '#6b7280'; // dark gray
      default: return '#ef4444';
    }
  };

  const grayMarkerSvg = () =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>
      <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
        fill='#9CA3AF'/>
    </svg>`,
    )}`;

  // Create markers + cluster when orders change or when map loads
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    const newMarkers: google.maps.Marker[] = [];

    orders.forEach((order, index) => {
      const pos = toLatLng(order.address.latitude, order.address.longitude);
      if (!pos) return;

      const marker = new google.maps.Marker({
        position: pos,
        map: mapRef.current!,
        title: `${order.consumerId?.name} - ${order.status}`,
        icon: {
          url: uberDestinationMarkerSvg(index + 1),
          scaledSize: new google.maps.Size(40, 50),
          anchor: new google.maps.Point(20, 50),
        },
      });

      marker.addListener("click", () => {
        setSelectedOrder(order);
        setShowDialog(true);
        mapRef.current?.panTo(pos);
        mapRef.current?.setZoom(17);
      });

      markersRef.current[order._id] = marker;
      newMarkers.push(marker);
    });

    // No clustering for Uber-style - show all markers
    return () => {
      newMarkers.forEach((m) => m.setMap(null));
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

      // Store alternative routes if available
      if (res.routes.length > 1) {
        setAlternativeRoutes([res]);
        toast.info(`${res.routes.length} routes available. Tap to switch.`);
      }

      const overviewPath =
        res.routes[selectedRouteIndex]?.overview_path?.map((p) => ({
          lat: p.lat(),
          lng: p.lng(),
        })) || [];

      createAndAnimatePolyline(overviewPath);

      // Voice navigation announcement
      if (voiceEnabled && res.routes[selectedRouteIndex]) {
        const route = res.routes[selectedRouteIndex];
        const totalDuration = route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0);
        const totalDistance = route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0);

        speakInstruction(
          `Route calculated. Total distance: ${(totalDistance / 1000).toFixed(1)} kilometers. ` +
          `Estimated time: ${Math.round(totalDuration / 60)} minutes. Starting navigation.`
        );
      }
    } else {
      console.warn("Directions failed", status);
      if (voiceEnabled) {
        speakInstruction("Route calculation failed. Please try again.");
      }
    }
  };

  // Create polyline object with Uber-style blue route
  const createAndAnimatePolyline = (path: google.maps.LatLngLiteral[]) => {
    if (!mapRef.current || path.length === 0) return;

    // 🔹 Clear ONLY the existing polyline (never touch driver marker here)
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // 🔹 Stop only polyline animation
    if (animationIntervalRef.current) {
      window.clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    // 🔹 Reset animated path
    animatedPathRef.current = [];

    // 🔹 Create fresh polyline with Uber-style blue color
    polylineRef.current = new google.maps.Polyline({
      path: [],
      strokeColor: "#1976D2", // Uber blue color
      strokeOpacity: 0.9,
      strokeWeight: 8,
      map: mapRef.current,
      zIndex: 5,
    });

    // 🔹 Animate polyline drawing
    let idx = 0;
    const tickMs = 30; // Faster animation like Uber

    animationIntervalRef.current = window.setInterval(() => {
      if (!polylineRef.current) return;

      if (idx >= path.length) {
        window.clearInterval(animationIntervalRef.current!);
        animationIntervalRef.current = null;
        return;
      }

      animatedPathRef.current.push(path[idx]);
      polylineRef.current.setPath(animatedPathRef.current);
      idx++;
    }, tickMs);
  };

  // Uber-style map styling
  const uberMapStyle = [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#bdbdbd" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#eeeeee" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#e5e5e5" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#ffffff" }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#dadada" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{ "color": "#e5e5e5" }]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{ "color": "#eeeeee" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#c9c9c9" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    }
  ];


  const getBearing = (
    from: google.maps.LatLngLiteral,
    to: google.maps.LatLngLiteral
  ) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;

    const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
    const x =
      Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
      Math.sin(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.cos(toRad(to.lng - from.lng));

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  useEffect(() => {
    if (!navigationStarted) return;

    directionsCalculatedRef.current = false;
    setDirectionsResult(null);
  }, [navigationStarted]);

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

  // Uber-style driver marker with white circle and black car icon
  const uberDriverMarkerSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
  <!-- White circle background -->
  <circle cx="30" cy="30" r="28" fill="white" stroke="#000000" stroke-width="2"/>
  <!-- Car icon -->
  <g transform="translate(30,30)">
    <path d="M-8,-4 L-6,-8 L6,-8 L8,-4 L8,4 L6,4 L6,2 L-6,2 L-6,4 L-8,4 Z" fill="#000000"/>
    <!-- Wheels -->
    <circle cx="-5" cy="4" r="2" fill="#000000"/>
    <circle cx="5" cy="4" r="2" fill="#000000"/>
    <!-- Windows -->
    <path d="M-5,-6 L-2,-4 L2,-4 L5,-6 Z" fill="#666666"/>
  </g>
</svg>
`)}`;

  const startLiveDriverTracking = () => {
    if (!navigator.geolocation || !mapRef.current) return;

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        const livePos = { lat: latitude, lng: longitude };

        setDriverLocation(livePos);

        if (!driverMarkerRef.current) {
          // Initial setup - Uber-style navigation view
          driverMarkerRef.current = new google.maps.Marker({
            position: livePos,
            map: mapRef.current!,
            icon: {
              url: uberDriverMarkerSvg,
              scaledSize: new google.maps.Size(60, 60),
              anchor: new google.maps.Point(30, 30),
              rotation: heading || 0,
            },
            zIndex: 999,
            title: "You (Driver)",
          });

          // Uber-style navigation view - moderate zoom, slight tilt
          mapRef.current?.setZoom(17);
          mapRef.current?.setTilt(45); // Slight 3D tilt like Uber
          mapRef.current?.setHeading(heading || 0);
          mapRef.current?.panTo(livePos);

          // Enable traffic layer for real-time traffic info
          const trafficLayer = new google.maps.TrafficLayer();
          trafficLayer.setMap(mapRef.current!);

          // Immediately update live navigation data with first GPS position
          updateLiveNavigation(livePos);

        } else {
          const prevPos = driverMarkerRef.current.getPosition();
          if (prevPos) {
            const from = { lat: prevPos.lat(), lng: prevPos.lng() };
            const to = livePos;

            // Calculate bearing for smooth rotation
            const bearing = getBearing(from, to);
            const actualHeading = heading || bearing;

            // Check if driver has deviated significantly from route
            const shouldRecalculateRoute = checkRouteDeviation(to);

            // Smooth map following with Uber-style navigation view
            mapRef.current?.setHeading(actualHeading);
            mapRef.current?.setTilt(45); // Maintain slight tilt
            mapRef.current?.setZoom(17);
            mapRef.current?.panTo(to);

            // Update driver marker with rotation
            driverMarkerRef.current.setPosition(to);
            driverMarkerRef.current.setIcon({
              url: uberDriverMarkerSvg,
              scaledSize: new google.maps.Size(60, 60),
              anchor: new google.maps.Point(30, 30),
              rotation: actualHeading,
            });

            // Auto-recalculate route if driver deviated
            if (shouldRecalculateRoute) {
              recalculateRoute(to);
            }

            // Voice navigation instructions
            if (voiceEnabled && orders.length > 0) {
              const nextOrder = orders.find(order => order.status === 'out_for_delivery');
              if (nextOrder) {
                const nextDestination = toLatLng(nextOrder.address.latitude, nextOrder.address.longitude);
                if (nextDestination) {
                  const distanceToNext = getDistanceInMeters(to.lat, to.lng, nextDestination.lat, nextDestination.lng);

                  // Give voice instructions at specific distances
                  if (distanceToNext < 200 && distanceToNext > 150) {
                    speakInstruction(`Approaching ${nextOrder.consumerId.name}'s location in 200 meters`);
                  } else if (distanceToNext < 50) {
                    speakInstruction(`You have arrived at ${nextOrder.consumerId.name}'s location`);
                  }
                }
              }
            }

            // Update live navigation data
            updateLiveNavigation(to);

            // Update customer ETAs every 30 seconds
            if (Date.now() % 30000 < 1000) {
              calculateCustomerETAs(to);
            }

            // Speed-based zoom adjustment for Uber-style view
            if (speed !== null && speed !== undefined) {
              const speedKmh = speed * 3.6; // Convert m/s to km/h
              let zoomLevel = 17;

              if (speedKmh > 60) zoomLevel = 15; // Highway speed
              else if (speedKmh > 40) zoomLevel = 16; // Fast city speed
              else if (speedKmh > 20) zoomLevel = 17; // Normal city speed
              else if (speedKmh > 5) zoomLevel = 18; // Slow speed
              else zoomLevel = 19; // Very slow/stopped

              mapRef.current?.setZoom(zoomLevel);
            }
          }
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        toast.error("GPS tracking failed. Please enable location services.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 500, // More frequent updates like Uber
        timeout: 3000,
      }
    );
  };

  // Check if driver has deviated from the planned route
  const checkRouteDeviation = (currentPos: google.maps.LatLngLiteral): boolean => {
    if (!directionsResult || !animatedPathRef.current.length) return false;

    // Find the closest point on the route
    let minDistance = Infinity;
    let closestPointIndex = -1;

    animatedPathRef.current.forEach((point, index) => {
      const distance = getDistanceInMeters(
        currentPos.lat,
        currentPos.lng,
        point.lat,
        point.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = index;
      }
    });

    // If driver is more than 100 meters away from the route, recalculate
    const deviationThreshold = 100; // meters
    return minDistance > deviationThreshold;
  };

  // Recalculate route when driver deviates
  const recalculateRoute = (currentPos: google.maps.LatLngLiteral) => {
    if (!orders.length) return;

    console.log('Recalculating route due to deviation...');

    // Reset directions calculation flag to trigger new route
    directionsCalculatedRef.current = false;
    setDirectionsResult(null);

    // Update driver location to trigger new route calculation
    setDriverLocation(currentPos);

    toast.info("Route updated based on your current location");

    if (voiceEnabled) {
      speakInstruction("Route recalculated. Continue following the updated path.");
    }
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


  useEffect(() => {
    directionsCalculatedRef.current = false;
    setDirectionsResult(null);
  }, [orders]);

  // Enhanced order status display
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'preparing': return 'outline';
      case 'ready': return 'secondary';
      case 'out_for_delivery': return 'destructive';
      case 'delivered': return 'default';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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

  // Enhanced route optimization with traffic and multi-stop
  const optimizeRouteWithTraffic = async (waypoints: google.maps.LatLngLiteral[]) => {
    if (!driverLocation || waypoints.length === 0) return waypoints;

    try {
      // Use Google Routes API for advanced optimization
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.optimizedIntermediateWaypointIndex'
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: driverLocation.lat,
                  longitude: driverLocation.lng
                }
              }
            },
            destination: {
              location: {
                latLng: {
                  latitude: waypoints[waypoints.length - 1].lat,
                  longitude: waypoints[waypoints.length - 1].lng
                }
              }
            },
            intermediates: waypoints.slice(0, -1).map(point => ({
              location: {
                latLng: {
                  latitude: point.lat,
                  longitude: point.lng
                }
              }
            })),
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
            optimizeWaypointOrder: true,
            computeAlternativeRoutes: true
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const route = data.routes[0];

        if (route.optimizedIntermediateWaypointIndex) {
          // Reorder waypoints based on optimization
          const optimizedOrder = route.optimizedIntermediateWaypointIndex;
          const optimizedWaypoints = optimizedOrder.map((index: number) => waypoints[index]);
          optimizedWaypoints.push(waypoints[waypoints.length - 1]); // Add destination

          toast.success(`Route optimized! Saved ${Math.round((route.duration?.seconds || 0) / 60)} minutes`);
          return optimizedWaypoints;
        }
      }
    } catch (error) {
      console.error('Route optimization failed:', error);
      toast.warning('Using basic route optimization');
    }

    // Fallback to basic distance-based optimization
    return sortOrdersByDistance(driverLocation, orders)
      .map(o => toLatLng(o.address.latitude, o.address.longitude))
      .filter((p): p is google.maps.LatLngLiteral => p !== null);
  };

  // Update live navigation data
  const updateLiveNavigation = async (currentPos: google.maps.LatLngLiteral) => {
    console.log('updateLiveNavigation called with:', { currentPos, navigationStarted, ordersLength: orders.length });

    if (!orders.length || !navigationStarted) {
      console.log('Early return: no orders or navigation not started');
      return;
    }

    // Find next undelivered order
    const nextOrder = orders.find(order =>
      order.status === 'out_for_delivery' || order.status === 'ready'
    );

    console.log('Next order found:', nextOrder?.consumerId?.name || 'none');

    if (!nextOrder) {
      setLiveNavigation(prev => ({ ...prev, nextCustomer: null }));
      return;
    }

    const nextDestination = toLatLng(nextOrder.address.latitude, nextOrder.address.longitude);
    if (!nextDestination) return;

    // Calculate straight-line distance (fallback)
    const straightLineDistance = getDistanceInMeters(
      currentPos.lat,
      currentPos.lng,
      nextDestination.lat,
      nextDestination.lng
    );

    // Estimate time based on average city speed (25 km/h)
    const estimatedTimeMinutes = Math.ceil((straightLineDistance / 1000) / 25 * 60);

    // Try to get more accurate data from Google Distance Matrix API
    try {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [currentPos],
        destinations: [nextDestination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        console.log('Distance Matrix API response:', { status, response });

        if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
          const element = response.rows[0].elements[0];
          const distance = element.distance?.value || straightLineDistance;
          const duration = element.duration?.value || (estimatedTimeMinutes * 60);

          console.log('Setting live navigation with API data:', { distance, duration, customerName: nextOrder.consumerId.name });

          setLiveNavigation(prev => ({
            ...prev,
            distanceToNext: distance,
            timeToNext: duration,
            nextCustomer: nextOrder,
          }));
        } else {
          console.log('Using fallback calculation:', { straightLineDistance, estimatedTimeMinutes });

          // Fallback to straight-line calculation
          setLiveNavigation(prev => ({
            ...prev,
            distanceToNext: straightLineDistance,
            timeToNext: estimatedTimeMinutes * 60,
            nextCustomer: nextOrder,
          }));
        }
      });
    } catch (error) {
      console.error('Distance Matrix API error:', error);

      // Fallback to straight-line calculation
      setLiveNavigation(prev => ({
        ...prev,
        distanceToNext: straightLineDistance,
        timeToNext: estimatedTimeMinutes * 60,
        nextCustomer: nextOrder,
      }));
    }
  };
  console.log('liveNavigating :>> ', liveNavigation);

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  // Format ETA for display
  const formatETA = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Get customer ETA
  const getCustomerETA = (orderId: string): string => {
    const eta = customerETAs[orderId];
    if (!eta) return 'Calculating...';
    return formatETA(eta.time);
  };

  // Get customer distance
  const getCustomerDistance = (orderId: string): string => {
    const eta = customerETAs[orderId];
    if (!eta) return 'Calculating...';

    if (eta.distance < 1000) {
      return `${Math.round(eta.distance)} m`;
    } else {
      return `${(eta.distance / 1000).toFixed(1)} km`;
    }
  };

  // Voice Navigation Integration
  const initializeVoiceNavigation = () => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      setVoiceEnabled(true);
      toast.success("Voice navigation enabled");
    } else {
      toast.error("Voice navigation not supported on this device");
    }
  };

  const speakInstruction = (instruction: string) => {
    if (!voiceEnabled || !speechSynthesisRef.current) return;

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Use a clear voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    speechSynthesisRef.current.speak(utterance);
  };

  // Generate navigation instructions based on current location and next destination
  const generateNavigationInstruction = (
    currentPos: google.maps.LatLngLiteral,
    nextDestination: google.maps.LatLngLiteral,
    customerName: string
  ) => {
    const distance = getDistanceInMeters(
      currentPos.lat,
      currentPos.lng,
      nextDestination.lat,
      nextDestination.lng
    );

    if (distance < 100) {
      return `Arriving at ${customerName}'s location in 100 meters`;
    } else if (distance < 500) {
      return `Continue straight for ${Math.round(distance)} meters to reach ${customerName}`;
    } else {
      const distanceKm = (distance / 1000).toFixed(1);
      return `Continue to ${customerName}'s location, ${distanceKm} kilometers ahead`;
    }
  };

  const sortOrdersByDistance = (
    from: google.maps.LatLngLiteral,
    orders: TOrderDelivery[],
  ) => {
    return [...orders]
      .map((order) => ({
        order,
        distance: getDistanceInMeters(
          from.lat,
          from.lng,
          order.address.latitude as number,
          order.address.longitude as number,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .map((x) => x.order);
  };

  // Alternative Routes Functionality
  const fetchAlternativeRoutes = async (origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    try {
      const directionsService = new google.maps.DirectionsService();

      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: true,
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          setAlternativeRoutes(result.routes.length > 1 ? [result] : []);

          if (result.routes.length > 1) {
            toast.info(`Found ${result.routes.length} alternative routes`);
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch alternative routes:', error);
    }
  };

  const selectAlternativeRoute = (routeIndex: number) => {
    setSelectedRouteIndex(routeIndex);

    if (alternativeRoutes.length > 0) {
      const selectedRoute = alternativeRoutes[0].routes[routeIndex];
      const duration = selectedRoute.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0);
      const distance = selectedRoute.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0);

      toast.success(`Route selected: ${Math.round(duration / 60)} min, ${(distance / 1000).toFixed(1)} km`);

      if (voiceEnabled) {
        speakInstruction(`Alternative route selected. Estimated time: ${Math.round(duration / 60)} minutes`);
      }
    }
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

        // 2️⃣ update marker color based on new status
        const marker = markersRef.current[orderId];
        if (marker) {
          const orderIndex = orders.findIndex(o => o._id === orderId);
          marker.setIcon({
            url: uberDestinationMarkerSvg(orderIndex + 1),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50),
          });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Compute coordinates array from orders (in original order)
  const pathCoords = useMemo(() => {
    return orders
      .map((o) => toLatLng(o.address.latitude, o.address.longitude))
      .filter((x): x is google.maps.LatLngLiteral => x !== null);
  }, [orders]);

  const routingPoints = useMemo(() => {
    if (!driverLocation || !orders.length) return [];

    const sortedOrders = sortOrdersByDistance(driverLocation, orders);

    return sortedOrders
      .map((o) => toLatLng(o.address.latitude, o.address.longitude))
      .filter((p): p is google.maps.LatLngLiteral => p !== null);
  }, [driverLocation, orders]);

  if (!isLoaded) {
    return <div className="p-4">Loading map...</div>;
  }



  return (
    <div className="relative h-screen w-full overflow-hidden">
      <aside
        className={`absolute overflow-y-scroll left-0 top-0 z-20 h-full w-96 bg-white border-r p-4 space-y-4
    transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {orders.length && !loadingOrders ? <div className="flex items-center justify-between">
          <Button
            className="flex-1 mr-2"
            disabled={loadingOrders}
            onClick={navigationStarted ? cancelNavigation : startNavigation}
            variant={navigationStarted ? "destructive" : "default"}
          >
            {navigationStarted
              ? "Cancel Navigation"
              : etaCalculating
                ? "Calculating Routes..."
                : "Start Delivery Route"}
          </Button>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${liveUpdatesConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {liveUpdatesConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            {navigationStarted && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600 font-medium">
                  Navigation Active
                </span>
              </div>
            )}
          </div>
        </div> : <div className="h-8"></div>}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Time Slot</label>
          <Select
            value={selectedTimeSlot}
            onValueChange={setSelectedTimeSlot}
            disabled={navigationStarted}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIME_SLOT_PERIODS).map(([key, period]) => {
                const isActive = isTimeSlotActive(key);
                const timeUntil = getTimeUntilSlot(key);

                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{period.label}</span>
                      {isActive && (
                        <Badge variant="default" className="ml-2 text-xs bg-green-500">
                          Active
                        </Badge>
                      )}
                      {!isActive && timeUntil > 0 && timeUntil <= 60 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {timeUntil}m
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {!isTimeSlotActive(selectedTimeSlot) && (
            <p className="text-xs text-gray-500">
              Navigation available 30 minutes before slot time
            </p>
          )}
        </div>

        {orders.length && !loadingOrders ? <><div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Today's Orders ({orders.length})
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

          {/* Advanced Navigation Controls */}
          <Card className="p-3">
            <h4 className="font-medium mb-3">Navigation Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice Navigation</span>
                <Button
                  variant={voiceEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!voiceEnabled) {
                      initializeVoiceNavigation();
                    } else {
                      setVoiceEnabled(false);
                      speechSynthesisRef.current?.cancel();
                      toast.info("Voice navigation disabled");
                    }
                  }}
                >
                  {voiceEnabled ? "ON" : "OFF"}
                </Button>
              </div>

              {alternativeRoutes.length > 0 && (
                <div>
                  <span className="text-sm">Alternative Routes</span>
                  <div className="flex gap-1 mt-1">
                    {alternativeRoutes[0].routes.map((_, index) => (
                      <Button
                        key={index}
                        variant={selectedRouteIndex === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectAlternativeRoute(index)}
                      >
                        Route {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Status Summary */}
          <Card className="p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(
                orders.reduce((acc, order) => {
                  acc[order.status] = (acc[order.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(status)} className="text-xs">
                    {formatStatus(status)}
                  </Badge>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Live Navigation Info in Sidebar */}
          {navigationStarted && liveNavigation.nextCustomer && (
            <Card className="p-3 border-blue-200 bg-blue-50">
              <h4 className="font-medium mb-2 text-blue-900">Next Delivery</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {liveNavigation.nextCustomer.consumerId.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {liveNavigation.nextCustomer.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600 font-medium">
                      {formatDistance(liveNavigation.distanceToNext)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {formatETA(liveNavigation.timeToNext)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

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
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {order.consumerId?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.menuId?.name}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                              {formatStatus(order.status)}
                            </Badge>
                            {order.estimatedDeliveryTime && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(new Date(order.estimatedDeliveryTime), "HH:mm")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            ₹{order.totalAmount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.timeSlot}
                          </div>
                          {navigationStarted && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ETA: {getCustomerETA(order._id)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.address.city}, {order.address.region}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openOrderFromSidebar(order)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
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
                          <Navigation className="w-3 h-3 mr-1" />
                          Navigate
                        </Button>
                        {order.consumerId.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${order.consumerId.phone}`)}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        )}
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
          </div></> : <div className="h-40 flex justify-center items-center">No orders for this timeSlot</div>}
      </aside>

      <main className="absolute inset-0">
        <Button
          size="icon"
          className="absolute top-4 left-4 z-30 shadow-lg"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>

        {/* Uber-style floating action buttons */}
        <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
          {navigationStarted && driverMarkerRef.current && (
            <Button
              size="icon"
              className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
              onClick={() => {
                if (driverMarkerRef.current && mapRef.current) {
                  const p = driverMarkerRef.current.getPosition();
                  if (p) {
                    mapRef.current.panTo({ lat: p.lat(), lng: p.lng() });
                    mapRef.current.setZoom(17);
                  }
                }
              }}
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}

          <Button
            size="icon"
            className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
            onClick={() => {
              if (mapRef.current && pathCoords.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                pathCoords.forEach(coord => bounds.extend(coord));
                mapRef.current.fitBounds(bounds, 50);
              }
            }}
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        {/* Uber-style Navigation Bar - Slides up from bottom */}
        {navigationStarted && liveNavigation.nextCustomer && (
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <div className="bg-white shadow-2xl border-t border-gray-200">
              {/* Top handle bar */}
              <div className="flex justify-center py-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Main content */}
              <div className="px-4 pb-4">
                {/* Time and distance row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-black">
                      {formatETA(liveNavigation.timeToNext)}
                    </div>
                    <div className="text-lg text-gray-600">
                      {formatDistance(liveNavigation.distanceToNext)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Customer info row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-semibold text-black text-lg">
                        {liveNavigation.nextCustomer.consumerId.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {liveNavigation.nextCustomer.address.address_line_1}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        if (liveNavigation.nextCustomer?.consumerId.phone) {
                          window.open(`tel:${liveNavigation.nextCustomer.consumerId.phone}`);
                        }
                      }}
                      disabled={!liveNavigation.nextCustomer?.consumerId.phone}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                      onClick={() => {
                        const pos = toLatLng(
                          liveNavigation.nextCustomer!.address.latitude,
                          liveNavigation.nextCustomer!.address.longitude
                        );
                        if (pos && mapRef.current) {
                          mapRef.current.panTo(pos);
                          mapRef.current.setZoom(18);
                        }
                      }}
                    >
                      Navigate
                    </Button>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(10, 100 - (liveNavigation.distanceToNext / 1000) * 10)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {orders.findIndex(o => o._id === liveNavigation.nextCustomer?._id) + 1} of {orders.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={pathCoords[0] || { lat: 0, lng: 0 }}
          zoom={17}
          onLoad={handleMapLoad}
          options={{
            styles: uberMapStyle,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            zoomControl: false,
            gestureHandling: "greedy",
            tilt: 45, // Uber-style slight tilt
            heading: 0,
            disableDefaultUI: true,
          }}
        >

          {/* If we have at least 2 points, request directions */}
          {navigationStarted &&
            driverLocation &&
            routingPoints.length >= 1 &&
            !directionsCalculatedRef.current && (
              <DirectionsService
                options={{
                  origin: driverLocation, // ✅ DRIVER START
                  destination: routingPoints[routingPoints.length - 1],
                  waypoints: routingPoints.slice(0, -1).map((p) => ({
                    location: p,
                    stopover: true,
                  })),
                  travelMode: google.maps.TravelMode.DRIVING,
                  optimizeWaypoints: false,
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
            <div className="space-y-4 px-4 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                  {formatStatus(selectedOrder.status)}
                </Badge>
                {selectedOrder.estimatedDeliveryTime && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    ETA: {format(new Date(selectedOrder.estimatedDeliveryTime), "HH:mm")}
                  </div>
                )}
              </div>

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
                <p className="text-xs text-muted-foreground">Delivery Address</p>
                <p className="font-medium">
                  {selectedOrder.address.address_line_1}
                </p>
                {selectedOrder.address.address_line_2 && (
                  <p className="text-sm">
                    {selectedOrder.address.address_line_2}
                  </p>
                )}
                <p className="text-sm">
                  {selectedOrder.address.city}, {selectedOrder.address.region} -{" "}
                  {selectedOrder.address.postal_code}
                </p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Special Instructions</p>
                  <p className="text-sm bg-yellow-50 p-2 rounded border">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Order Time</p>
                  <p className="text-sm">
                    {format(new Date(selectedOrder.createdAt), "PPpp")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Time Slot</p>
                  <p className="text-sm font-medium capitalize">
                    {selectedOrder.timeSlot}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const pos = toLatLng(
                        selectedOrder.address.latitude,
                        selectedOrder.address.longitude,
                      );
                      if (pos && mapRef.current) {
                        mapRef.current.panTo(pos);
                        mapRef.current.setZoom(17);
                        setShowDialog(false);
                      }
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate Here
                  </Button>
                  {selectedOrder.consumerId.phone && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`tel:${selectedOrder.consumerId.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>

                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <div className="space-y-2">
                    {selectedOrder.status === "out_for_delivery" && isDriverNearCustomer && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, "delivered")
                        }
                      >
                        Mark as Delivered
                      </Button>
                    )}

                    {!isDriverNearCustomer && selectedOrder.status === "out_for_delivery" && (
                      <p className="text-xs text-muted-foreground text-center">
                        Move within 50 meters of customer to enable delivery confirmation
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
