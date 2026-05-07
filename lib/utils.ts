export function formatGhs(amount: number): string {
  return `GH₵${amount.toFixed(2)}`;
}

export function generateTrackingCode(): string {
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits = "23456789";
  let code = "3SK-";
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 4; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

// Statuses that the kitchen manager can manually set on the dashboard.
export const KITCHEN_STATUSES = [
  "RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

// All statuses that orders can be in (incl. payment-driven).
export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function statusLabel(status: string): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Awaiting payment";
    case "PAYMENT_FAILED":
      return "Payment failed";
    case "RECEIVED":
      return "Received";
    case "PREPARING":
      return "Preparing";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-800";
    case "PAYMENT_FAILED":
      return "bg-rose-100 text-rose-800";
    case "RECEIVED":
      return "bg-blue-100 text-blue-800";
    case "PREPARING":
      return "bg-amber-100 text-amber-800";
    case "OUT_FOR_DELIVERY":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
