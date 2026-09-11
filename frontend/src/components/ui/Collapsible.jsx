import React, { createContext, useContext, useState } from "react"
import { cn } from "../../lib/utils"

const CollapsibleContext = createContext({
  open: false,
  toggle: () => {},
})

export function Collapsible({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  className,
  children,
  ...props
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const toggle = () => {
    const next = !isOpen
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, toggle }}>
      <div
        data-state={isOpen ? "open" : "closed"}
        className={cn("w-full transition-all", className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

export function CollapsibleTrigger({ className, children, asChild, ...props }) {
  const { open, toggle } = useContext(CollapsibleContext)

  return (
    <button
      type="button"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={toggle}
      className={cn("flex items-center justify-between transition-all", className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function CollapsibleContent({ className, children, ...props }) {
  const { open } = useContext(CollapsibleContext)

  if (!open) return null

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "overflow-hidden animate-in fade-in-0 duration-200 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
