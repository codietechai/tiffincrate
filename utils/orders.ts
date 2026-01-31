import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DeliveryOrder from "@/models/deliveryOrders";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export const createDeliveryOrders = async (
  orderId: string,
  deliveryInfo: any
) => {
  const deliveryOrders: any[] = [];
  const tz = "Asia/Kolkata";

  if (deliveryInfo?.type === "month") {
    const startDate = deliveryInfo.startDate
      ? dayjs.tz(deliveryInfo.startDate, tz).startOf("day")
      : dayjs().tz(tz).startOf("day"); // Start from today instead of start of month

    const endDate = startDate.add(1, "month"); // Cover next month from start date
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate)) {
      const localDate = new Date(
        current.format("YYYY-MM-DD") + "T00:00:00+05:30"
      );
      deliveryOrders.push({
        orderId,
        deliveryStatus: "pending",
        deliveryDate: localDate,
      });
      current = current.add(1, "day");
    }
  } else if (deliveryInfo?.type === "specific_days") {
    const { days } = deliveryInfo;
    const tz = "Asia/Kolkata";

    const now = dayjs().tz(tz).startOf("day");
    const start = now; // start from today
    const end = now.add(2, "months").endOf("month"); // Extended to cover next 2 months

    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const targetDays = (days || []).map((d: string) => dayMap[d.toLowerCase()]);
    let current = start;

    while (current.isBefore(end) || current.isSame(end)) {
      if (targetDays.includes(current.day())) {
        const localDate = new Date(
          current.format("YYYY-MM-DD") + "T00:00:00+05:30"
        );
        deliveryOrders.push({
          orderId,
          deliveryStatus: "pending",
          deliveryDate: localDate,
        });
      }
      current = current.add(1, "day");
    }
  } else if (
    deliveryInfo?.type === "custom_dates" &&
    Array.isArray(deliveryInfo.dates)
  ) {
    for (const dateStr of deliveryInfo.dates) {
      const localDate = new Date(`${dateStr}`);
      deliveryOrders.push({
        orderId,
        deliveryStatus: "pending",
        deliveryDate: localDate,
      });
    }
  }

  if (deliveryOrders.length > 0) {
    await DeliveryOrder.insertMany(deliveryOrders);
    console.log(
      `✅ Created ${deliveryOrders.length} delivery orders for order ${orderId}`
    );
  } else {
    console.log("⚠️ No delivery orders generated for:", deliveryInfo);
  }

  return deliveryOrders;
};

export function getOrderTypeSummary(deliveryInfo: {
  type: "month" | "specific_days" | "custom_dates";
  startDate?: string;
  days?: string[];
  dates?: string[];
}) {
  switch (deliveryInfo.type) {
    case "month":
      return `Monthly from ${deliveryInfo.startDate || "start date unknown"}`;
    case "specific_days":
      return `Specific days: ${deliveryInfo.days?.join(", ")}`;
    case "custom_dates":
      return `Custom dates: ${deliveryInfo.dates?.join(", ")}`;
    default:
      return "Unknown";
  }
}