import React, { createContext, useContext, useState } from "react"
import { cn } from "../../lib/utils"

const TabsContext = createContext(null)

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [internalVal, setInternalVal] = useState(defaultValue)
  const currentVal = value !== undefined ? value : internalVal

  const handleSelect = (val) => {
    if (onValueChange) onValueChange(val)
    else setInternalVal(val)
  }

  return (
    <TabsContext.Provider value={{ value: currentVal, onValueChange: handleSelect }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-xl bg-[#E8E6DC] p-1.5 text-[#7D7972] border border-[#E3DACC]",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, children, ...props }) {
  const context = useContext(TabsContext)
  const isActive = context?.value === value

  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-[#181716] shadow-sm"
          : "text-[#4A4744] hover:text-[#181716] hover:bg-[#FAF9F5]/70",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }) {
  const context = useContext(TabsContext)
  if (context?.value !== value) return null

  return (
    <div
      className={cn("mt-2 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}
