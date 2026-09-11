import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F5] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A29] shadow-sm hover:shadow-md",
        gradient:
          "bg-[#C85A17] text-[#FAF9F5] hover:bg-[#B24E12] shadow-sm shadow-[#C85A17]/20",
        terracotta:
          "bg-[#C85A17] text-[#FAF9F5] hover:bg-[#B24E12] shadow-sm shadow-[#C85A17]/20",
        forest:
          "bg-[#1C3F35] text-[#FAF9F5] hover:bg-[#153129] shadow-sm shadow-[#1C3F35]/20",
        emerald:
          "bg-[#1C3F35] text-[#FAF9F5] hover:bg-[#153129] shadow-sm shadow-[#1C3F35]/20",
        honey:
          "bg-[#B87333] text-[#FAF9F5] hover:bg-[#9E6129] shadow-sm shadow-[#B87333]/20",
        destructive:
          "bg-[#8A2B2B] text-[#FAF9F5] hover:bg-[#722323] shadow-sm",
        outline:
          "border border-[#E3DACC] bg-white text-[#181716] hover:bg-[#F0EEE6] hover:border-[#C85A17]/40 shadow-xs",
        secondary:
          "bg-[#F0EEE6] text-[#181716] hover:bg-[#E8E6DC]",
        ghost:
          "text-[#4A4744] hover:bg-[#F0EEE6] hover:text-[#181716]",
        glass:
          "bg-white/80 border border-[#E3DACC] text-[#181716] hover:bg-[#F0EEE6]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs font-semibold",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const Button = React.forwardRef(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
