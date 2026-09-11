import React from "react"
import { cn } from "../../lib/utils"

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#E3DACC] bg-white px-4 py-2 text-sm text-[#181716] placeholder:text-[#9E9A91] shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:border-[#C85A17] focus-visible:ring-2 focus-visible:ring-[#C85A17]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"
