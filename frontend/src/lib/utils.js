import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const BANGLADESH_ZONES = [
  "Dhaka North",
  "Dhaka South",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh"
]

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "৳0.00"
  const val = Number(amount)
  return `৳${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateVal) {
  if (!dateVal) return "N/A"
  try {
    let d
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0] = dateVal
      d = new Date(year, month - 1, day, hour, minute)
    } else {
      d = new Date(dateVal)
    }
    if (isNaN(d.getTime())) return String(dateVal)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return String(dateVal)
  }
}

export const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Pickup",
    color: "text-[#9E6129] bg-[#FCF6EE] border-[#F1DCBE]",
    dotColor: "bg-[#B87333]",
    stepIndex: 0,
    description: "Order booked. Awaiting pickup by local agent.",
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "text-[#7A4B1A] bg-[#F9F1E6] border-[#EAD5BD]",
    dotColor: "bg-[#9A5F22]",
    stepIndex: 1,
    description: "Package received by pickup courier agent.",
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "text-[#B24E12] bg-[#FAF0E8] border-[#F2D3BC]",
    dotColor: "bg-[#C85A17]",
    stepIndex: 2,
    description: "Dispatched from pickup hub to destination zone hub.",
  },
  OUT_FOR_DELIVERY: {
    label: "Out For Delivery",
    color: "text-[#181716] bg-[#F0EEE6] border-[#D8CEBC]",
    dotColor: "bg-[#181716]",
    stepIndex: 3,
    description: "Assigned to delivery agent and heading to recipient.",
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-[#1C3F35] bg-[#EDF4F0] border-[#C6DDD0]",
    dotColor: "bg-[#1C3F35]",
    stepIndex: 4,
    description: "Delivered to recipient. Payment processed.",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-[#8A2B2B] bg-[#FDF0F0] border-[#F5C8C8]",
    dotColor: "bg-[#8A2B2B]",
    stepIndex: -1,
    description: "Parcel order was cancelled by sender.",
  },
}
