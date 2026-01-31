import { Calendar, CheckCircle2, Clock, Package, Truck, CheckCircle } from "lucide-react";

// ---------- Utility ----------
export const formatISTDate = (utcDate?: string) => {
  if (!utcDate) return "N/A";
  const parsed = new Date(utcDate);
  if (isNaN(parsed.getTime())) return "Invalid Date";
  return parsed.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatISTShort = (utcDate?: string) => {
  if (!utcDate) return "N/A";
  const parsed = new Date(utcDate);
  if (isNaN(parsed.getTime())) return "Invalid Date";
  return parsed.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
};

// Updated status steps to match actual order statuses
export const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "ready", label: "Ready", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];
