import React from "react"
import { cn } from "../../lib/utils"

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-[#E3DACC] bg-white px-4 py-2 pr-10 text-sm text-[#181716] transition-all duration-200 focus-visible:outline-none focus-visible:border-[#C85A17] focus-visible:ring-2 focus-visible:ring-[#C85A17]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7D7972]">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  )
})
Select.displayName = "Select"
