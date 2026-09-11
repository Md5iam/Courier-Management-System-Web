import React from "react"
import { cn } from "../../lib/utils"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

export function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center py-4", className)}
      {...props}
    />
  )
}

export function PaginationContent({ className, ...props }) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1.5", className)}
      {...props}
    />
  )
}

export function PaginationItem({ className, ...props }) {
  return <li className={cn("", className)} {...props} />
}

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C85A17] disabled:pointer-events-none disabled:opacity-40",
        size === "icon" ? "h-9 w-9" : "h-9 px-3 py-2",
        isActive
          ? "bg-[#181716] text-[#FAF9F5] shadow-sm font-bold"
          : "border border-[#E3DACC] bg-white text-[#4A4744] hover:bg-[#E8E6DC] hover:text-[#181716]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function PaginationPrevious({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  )
}

export function PaginationNext({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center text-[#7D7972]", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}
