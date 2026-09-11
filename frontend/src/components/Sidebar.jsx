import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { cn } from "../lib/utils"
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Truck, 
  MapPin, 
  PackageCheck, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  UserCheck, 
  LogOut,
  ArrowRight
} from "lucide-react"

export function Sidebar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getLinks = () => {
    if (role === "ADMIN") {
      return [
        { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/staff-approval", label: "Staff Approval", icon: UserCheck },
        { to: "/admin/users", label: "User Directory", icon: Users },
        { to: "/admin/transactions", label: "Financial Ledger", icon: CreditCard },
      ]
    }
    if (role === "EMPLOYEE") {
      return [
        { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/employee/pickups", label: "Pending Pickups", icon: MapPin },
        { to: "/employee/incoming", label: "Incoming Parcels", icon: Truck },
        { to: "/employee/deliveries", label: "My Tasks & Deliveries", icon: PackageCheck },
      ]
    }
    // Default: Customer (USER)
    return [
      { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/user/book", label: "Book a Parcel", icon: PlusCircle },
      { to: "/user/history", label: "Shipment History", icon: History },
    ]
  }

  const links = getLinks()

  const getRoleTheme = () => {
    if (role === "ADMIN") return { badge: "Admin Portal", color: "text-[#181716] bg-white border-[#E3DACC]" }
    if (role === "EMPLOYEE") return { badge: "Employee Hub", color: "text-emerald-800 bg-emerald-50 border-emerald-300" }
    return { badge: "Customer Portal", color: "text-[#181716] bg-white border-[#E3DACC]" }
  }

  const roleTheme = getRoleTheme()

  return (
    <aside className="w-64 shrink-0 border-r border-[#E3DACC] bg-[#F0EEE6] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Portal Tag */}
        <div className="px-3 py-2 rounded-xl bg-white border border-[#E3DACC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border", roleTheme.color)}>
              {roleTheme.badge}
            </span>
          </div>
          {role === "EMPLOYEE" && user?.assignedZone && (
            <p className="text-[11px] text-[#7D7972] mt-2 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-600" />
              Zone: <span className="text-[#181716] font-medium">{user.assignedZone}</span>
            </p>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to.endsWith("dashboard")}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
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

      {/* User Card & Logout */}
      <div className="pt-4 border-t border-[#E3DACC] space-y-3">
        <div className="p-3 rounded-xl bg-white border border-[#E3DACC] shadow-xs flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#E8E6DC] border border-[#E3DACC] flex items-center justify-center font-bold text-[#181716] text-xs shrink-0">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#181716] truncate">{user?.fullName}</p>
            <p className="text-[10px] text-[#7D7972] truncate">{user?.email}</p>
          </div>
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
  )
}
