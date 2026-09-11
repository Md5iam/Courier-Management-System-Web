import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/Button"
import { Badge } from "./ui/Badge"
import { BrandLogo } from "./BrandLogo"
import { 
  Package, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  User, 
  ShieldCheck, 
  Truck
} from "lucide-react"

export function Navbar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getDashboardPath = () => {
    if (role === "ADMIN") return "/admin/dashboard"
    if (role === "EMPLOYEE") return "/employee/dashboard"
    return "/user/dashboard"
  }

  const getRoleIcon = () => {
    if (role === "ADMIN") return <ShieldCheck className="h-3.5 w-3.5" />
    if (role === "EMPLOYEE") return <Truck className="h-3.5 w-3.5" />
    return <User className="h-3.5 w-3.5" />
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#E3DACC] bg-[#FAF9F5]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-[#4A4744] hover:text-[#181716] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/track"
              className="text-sm font-medium text-[#4A4744] hover:text-[#181716] transition-colors flex items-center gap-1.5"
            >
              <Search className="h-4 w-4 text-[#7D7972]" />
              Track Parcel
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardPath()}>
                  <Button variant="outline" size="sm" className="gap-2 border-[#E3DACC] bg-[#F0EEE6] text-[#181716] hover:bg-[#E8E6DC]">
                    <LayoutDashboard className="h-4 w-4 text-[#7D7972]" />
                    Portal
                  </Button>
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-[#E3DACC]">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-[#181716] leading-tight">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-[#7D7972] flex items-center justify-end gap-1">
                      {getRoleIcon()}
                      {role}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-[#7D7972] hover:text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-[#4A4744] hover:bg-[#F0EEE6] hover:text-[#181716]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3DACC] bg-[#F0EEE6] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-[#181716] hover:bg-[#E8E6DC]"
          >
            Home
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-[#181716] hover:bg-[#E8E6DC] flex items-center gap-2"
          >
            <Search className="h-4 w-4 text-[#7D7972]" />
            Track Parcel
          </Link>

          {user ? (
            <div className="pt-4 border-t border-[#E3DACC] space-y-2">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-[#181716]">{user.fullName}</p>
                <p className="text-xs text-[#7D7972]">{user.email} ({role})</p>
              </div>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full"
              >
                <Button variant="outline" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to {role} Portal
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-[#E3DACC] grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
