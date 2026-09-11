import React from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Toaster } from "sonner"
import { cn } from "../lib/utils"
import { BrandLogo } from "./BrandLogo"
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Package, 
  Search, 
  LogOut, 
  HelpCircle,
  Truck,
  ArrowRight
} from "lucide-react"

export function UserLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const navLinks = [
    { to: "/user/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/user/book", label: "Book a Courier", icon: PlusCircle },
    { to: "/user/history", label: "Shipment History", icon: History },
  ]

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col selection:bg-[#E3DACC] selection:text-[#181716] font-sans">
      {/* Customer Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#E3DACC] bg-[#FAF9F5]/90 backdrop-blur-xl px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/user/dashboard" className="flex items-center gap-2.5 group">
            <BrandLogo size="md" showSubtitle={false} />
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F0EEE6] text-[#4A4744] border border-[#E3DACC]">
              CUSTOMER
            </span>
          </Link>
        </div>

        {/* Customer Header Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/track"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#4A4744] hover:text-[#181716] bg-white hover:bg-[#F0EEE6] border border-[#E3DACC] transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-[#7D7972]" />
            <span>Track Parcel</span>
          </Link>

          <Link to="/user/book">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F5] shadow-sm transition-all"
            >
              <PlusCircle className="h-4 w-4 text-[#FAF9F5]" />
              <span>Book Parcel</span>
            </button>
          </Link>

          <div className="h-5 w-[1px] bg-[#E3DACC] hidden sm:block" />

          {/* User Profile Info */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#E8E6DC] border border-[#E3DACC] flex items-center justify-center font-bold text-[#181716] text-xs shadow-xs">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-[#181716] truncate max-w-[120px]">
              {user?.fullName}
            </span>
          </div>
        </div>
      </header>

      {/* Customer Body */}
      <div className="flex flex-1">
        {/* Customer Navigation Sidebar */}
        <aside className="w-60 shrink-0 border-r border-[#E3DACC] bg-[#F0EEE6] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
          <div className="space-y-6">
            <div className="px-3 py-2 rounded-xl bg-white border border-[#E3DACC] shadow-xs">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#7D7972]">Account Type</p>
              <p className="text-xs font-bold text-[#181716] mt-0.5">Customer / Sender</p>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to.endsWith("dashboard")}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200",
                        isActive
                          ? "bg-[#181716] text-[#FAF9F5] shadow-sm font-semibold"
                          : "text-[#4A4744] hover:text-[#181716] hover:bg-[#E8E6DC]"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Help & Sign Out */}
          <div className="pt-4 border-t border-[#E3DACC] space-y-3">
            <div className="p-3 rounded-xl bg-white border border-[#E3DACC] shadow-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#181716] text-xs font-bold">
                <Truck className="h-3.5 w-3.5 text-[#D96B27]" />
                <span>Doorstep Pickup</span>
              </div>
              <p className="text-[11px] text-[#7D7972] leading-relaxed">
                Need urgent courier pickup? Our delivery fleet is ready.
              </p>
              <Link
                to="/user/book"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D96B27] hover:underline pt-1"
              >
                <span>Calculate & Book</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 hover:text-rose-800 transition-colors border border-rose-200 shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Customer Main Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden relative">
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#E3DACC]/30 blur-[140px]" />
          <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#F0EEE6]/60 blur-[140px]" />

          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      <Toaster richColors position="top-right" theme="light" />
    </div>
  )
}
