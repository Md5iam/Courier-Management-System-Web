import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none border",
  {
    variants: {
      variant: {
        default:
          "border-[#E3DACC] bg-[#F0EEE6] text-[#181716]",
        secondary:
          "border-[#E3DACC] bg-[#FAF9F5] text-[#4A4744]",
        destructive:
          "border-[#F5C8C8] bg-[#FDF0F0] text-[#8A2B2B]",
        outline:
          "text-[#4A4744] border-[#E3DACC] bg-white",
        success:
          "border-[#C6DDD0] bg-[#EDF4F0] text-[#1C3F35]",
        forest:
          "border-[#C6DDD0] bg-[#EDF4F0] text-[#1C3F35]",
        warning:
          "border-[#F1DCBE] bg-[#FCF6EE] text-[#9E6129]",
        honey:
          "border-[#F1DCBE] bg-[#FCF6EE] text-[#9E6129]",
        terracotta:
          "border-[#F2D3BC] bg-[#FAF0E8] text-[#B24E12]",
        charcoal:
          "border-[#181716] bg-[#181716] text-[#FAF9F5]",
        info:
          "border-[#F2D3BC] bg-[#FAF0E8] text-[#B24E12]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
