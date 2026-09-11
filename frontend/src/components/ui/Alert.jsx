import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-2xl border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-[#F0EEE6] border-[#E3DACC] text-[#181716] [&>svg]:text-[#181716]",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-800 [&>svg]:text-rose-600",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 [&>svg]:text-emerald-600",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600",
        info:
          "border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Alert({ className, variant, ...props }) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }) {
  return (
    <h5
      className={cn("mb-1 font-bold leading-none tracking-tight text-[#181716]", className)}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      className={cn("text-sm text-[#4A4744] [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}
