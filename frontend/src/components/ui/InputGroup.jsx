import React from "react"
import { cn } from "../../lib/utils"

export function InputGroup({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center rounded-xl border border-[#E3DACC] bg-white shadow-sm transition-all duration-200 focus-within:border-[#C85A17] focus-within:ring-2 focus-within:ring-[#C85A17]/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function InputGroupAddon({ className, children, position = "left", ...props }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center text-[#7D7972] select-none",
        position === "left" ? "pl-3.5 pr-1.5" : "pr-3.5 pl-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function InputGroupInput({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full bg-transparent px-3 py-2 text-sm text-[#181716] placeholder:text-[#9E9A91] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export function InputGroupButton({ className, variant = "ghost", children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none mr-1.5",
        variant === "ghost" && "text-[#7D7972] hover:text-[#181716] hover:bg-[#E8E6DC]",
        variant === "primary" && "bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A29] shadow-sm",
        variant === "outline" && "border border-[#E3DACC] text-[#181716] hover:bg-[#E8E6DC]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
