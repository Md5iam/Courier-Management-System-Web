import React from "react"
import { Package } from "lucide-react"

export function BrandLogo({ size = "md", showSubtitle = true, className = "" }) {
  const iconSizes = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-xl"
  }
  const iconDimension = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }
  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl"
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${iconSizes[size] || iconSizes.md} bg-[#181716] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 relative`}>
        <Package className={`${iconDimension[size] || iconDimension.md} text-[#FAF9F5]`} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C85A17] ring-2 ring-[#FAF9F5]" />
      </div>
      <div className="flex flex-col">
        <span className={`${textSizes[size] || textSizes.md} font-black tracking-tight text-[#181716] flex items-baseline leading-none`}>
          Drop<span className="text-[#C85A17]">ify</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C85A17] ml-0.5" />
        </span>
        {showSubtitle && (
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#7D7972] mt-0.5">
            Express Logistics
          </span>
        )}
      </div>
    </div>
  )
}
