import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAF9F5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#181716]" />
          <p className="text-xs uppercase tracking-widest text-[#7D7972] font-semibold">
            Authenticating...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && role !== requiredRole) {
    // If user has a different role, redirect them to their home portal
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />
    if (role === "EMPLOYEE") return <Navigate to="/employee/dashboard" replace />
    return <Navigate to="/user/dashboard" replace />
  }

  return children
}
