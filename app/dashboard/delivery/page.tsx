"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RouteMap from "@/components/screens/map/map";
import { LoadingPage } from "@/components/ui/loading";

export default function DeliveryDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.data.role !== "provider") {
          router.push("/");
          return;
        }
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="h-screen w-full">
      <RouteMap />
    </div>
  );
}
