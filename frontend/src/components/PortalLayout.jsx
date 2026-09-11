import React from "react"
import { Navbar } from "./Navbar"
import { Sidebar } from "./Sidebar"
import { Toaster } from "sonner"

export function PortalLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col selection:bg-[#E3DACC] selection:text-[#181716]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden relative">
          {/* Subtle warm ambient background glow */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#E3DACC]/30 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#F0EEE6]/60 blur-[120px]" />
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" theme="light" />
    </div>
  )
}
