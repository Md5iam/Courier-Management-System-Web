import React from "react"
import { STATUS_CONFIG, cn } from "../lib/utils"

export function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    dotColor: "bg-slate-400",
  }

  const isPulse = status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border tracking-wide",
        config.color,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {isPulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.dotColor
            )}
          />
        )}
        <span
          className={cn("relative inline-flex rounded-full h-2 w-2", config.dotColor)}
        />
      </span>
      {config.label}
    </span>
  )
}
