import React, { useState, useEffect } from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Toaster } from "sonner"
import { cn } from "../lib/utils"
import { BrandLogo } from "./BrandLogo"
import { api } from "../lib/api"
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Activity, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Package,
  Bell,
  Search
} from "lucide-react"

export function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Quick fetch for pending staff badge
    api.getPendingStaff().then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        setPendingCount(res.data.length)
      }
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const navSections = [
    {
      title: "OPERATIONS",
      links: [
        { to: "/admin/dashboard", label: "Central Command", icon: LayoutDashboard },
        { 
          to: "/admin/staff-approval", 
          label: "Staff Approvals", 
          icon: UserCheck, 
          badge: pendingCount > 0 ? pendingCount : null,
          badgeColor: "bg-amber-500 text-slate-950 font-bold"
        },
      ]
    },
    {
      title: "DIRECTORY & ACCESS",
      links: [
        { to: "/admin/users", label: "Accounts Directory", icon: Users },
      ]
    },
    {
      title: "FINANCE & AUDIT",
      links: [
        { to: "/admin/transactions", label: "Financial Ledger", icon: CreditCard },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col selection:bg-[#E3DACC] selection:text-[#181716] font-sans">
      {/* Executive Command Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#E3DACC] bg-[#FAF9F5]/90 backdrop-blur-xl px-6 flex items-center justify-between">
        {/* Left: Brand & Hub Status */}
        <div className="flex items-center gap-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <BrandLogo size="md" showSubtitle={false} />
            <span className="text-[10px] font-mono-code font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F0EEE6] text-[#4A4744] border border-[#E3DACC]">
              OPS COMMAND
            </span>
          </Link>

          {/* Real-time System Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E3DACC] text-xs shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#181716] font-medium text-[11px]">9 Hubs Active</span>
            <span className="text-[#E3DACC]">|</span>
            <span className="text-[#7D7972] text-[11px]">Grid Healthy</span>
          </div>
        </div>

        {/* Right: Quick Links & Profile */}
        <div className="flex items-center gap-3">
          <Link
            to="/track"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#4A4744] hover:text-[#181716] bg-white hover:bg-[#F0EEE6] border border-[#E3DACC] transition-colors"
          >
            <Package className="h-3.5 w-3.5 text-[#7D7972]" />
            <span>Public Tracker</span>
            <ExternalLink className="h-3 w-3 text-[#7D7972]" />
          </Link>

          {pendingCount > 0 && (
            <Link
              to="/admin/staff-approval"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors animate-pulse"
            >
              <Bell className="h-3.5 w-3.5 text-amber-700" />
              <span>{pendingCount} Pending Staff</span>
            </Link>
          )}

          <div className="h-5 w-[1px] bg-[#E3DACC] mx-1 hidden sm:block" />

          {/* Admin Identity */}
          <div className="flex items-center gap-3 pl-1">
            <div className="h-8 w-8 rounded-full bg-[#181716] flex items-center justify-center font-bold text-[#FAF9F5] text-xs border border-[#E3DACC] shadow-xs">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#181716] truncate">{user?.fullName || "Super Admin"}</span>
              <span className="text-[10px] text-[#7D7972] font-mono-code font-semibold">ROOT ADMIN</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Command Body with Operations Sidebar */}
      <div className="flex flex-1">
        {/* Executive Sidebar */}
        <aside className="w-64 shrink-0 border-r border-[#E3DACC] bg-[#F0EEE6] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
          <div className="space-y-6">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#7D7972] font-mono-code">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.links.map((link) => {
                    const Icon = link.icon
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to.endsWith("dashboard")}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group",
                            isActive
                              ? "bg-[#181716] text-[#FAF9F5] shadow-sm font-semibold"
                              : "text-[#4A4744] hover:text-[#181716] hover:bg-[#E8E6DC]"
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{link.label}</span>
                        </div>
                        {link.badge && (
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full shrink-0 border", link.badgeColor || "bg-amber-100 text-amber-800 border-amber-300")}>
                            {link.badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-[#E3DACC] space-y-3">
            <div className="p-3 rounded-xl bg-white border border-[#E3DACC] shadow-xs">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#7D7972]">Security Mode</span>
                <span className="text-emerald-700 font-mono-code font-bold">STRICT</span>
              </div>
              <p className="text-[10px] text-[#7D7972]">Encrypted JWT Sessions</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 hover:text-rose-800 transition-colors border border-rose-200 shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span>Exit Admin Console</span>
            </button>
          </div>
        </aside>

        {/* Main Command Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden relative">
          {/* Subtle warm ambient glows */}
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
