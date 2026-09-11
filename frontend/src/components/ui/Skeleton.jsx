import React from "react"
import { cn } from "../../lib/utils"

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#F0EEE6] border border-[#E3DACC]", className)}
      {...props}
    />
  )
}
