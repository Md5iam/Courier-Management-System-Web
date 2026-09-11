import React, { createContext, useContext, useState, useEffect } from "react"
import { api } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await api.getMe()
      if (res && res.success && res.data) {
        setUser(res.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await api.login(email, password)
    if (res && res.success && res.data) {
      setUser(res.data)
      return res.data
    }
    throw new Error((res && res.message) || "Login failed")
  }

  async function logout() {
    try {
      await api.logout()
    } finally {
      setUser(null)
    }
  }

  function getPrimaryRole() {
    if (!user || !user.roles) return null
    if (user.roles.includes("ROLE_ADMIN")) return "ADMIN"
    if (user.roles.includes("ROLE_EMPLOYEE")) return "EMPLOYEE"
    if (user.roles.includes("ROLE_USER")) return "USER"
    return null
  }

  function hasRole(roleName) {
    if (!user || !user.roles) return false
    return user.roles.includes(roleName) || user.roles.includes(`ROLE_${roleName}`)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: getPrimaryRole(),
        loading,
        login,
        logout,
        hasRole,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
