import React from "react"
import { cn } from "../../lib/utils"
import { PackageOpen } from "lucide-react"

export function Empty({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#E3DACC] bg-[#FAF9F5] p-8 text-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function EmptyIcon({ className, icon: Icon = PackageOpen, ...props }) {
  return (
    <div
      className={cn(
        "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EEE6] border border-[#E3DACC] text-[#C85A17] shadow-sm",
        className
      )}
      {...props}
    >
      <Icon className="h-7 w-7" />
    </div>
  )
}

export function EmptyTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("text-base font-bold text-[#181716] tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function EmptyDescription({ className, children, ...props }) {
  return (
    <p
      className={cn("mt-1.5 max-w-sm text-xs leading-relaxed text-[#7D7972]", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function EmptyActions({ className, children, ...props }) {
  return (
    <div
      className={cn("mt-5 flex items-center justify-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}
