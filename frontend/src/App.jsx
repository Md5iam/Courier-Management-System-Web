import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"

// Public Pages
import { LandingPage } from "./pages/public/LandingPage"
import { TrackingPage } from "./pages/public/TrackingPage"
import { LoginPage } from "./pages/public/LoginPage"
import { RegisterPage } from "./pages/public/RegisterPage"
import { EmployeeRegisterPage } from "./pages/public/EmployeeRegisterPage"

// Customer Pages
import { UserDashboard } from "./pages/user/UserDashboard"
import { BookCourierPage } from "./pages/user/BookCourierPage"
import { ShipmentHistoryPage } from "./pages/user/ShipmentHistoryPage"
import { InvoicePage } from "./pages/user/InvoicePage"

// Employee Pages
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard"
import { PendingPickupsPage } from "./pages/employee/PendingPickupsPage"
import { IncomingParcelsPage } from "./pages/employee/IncomingParcelsPage"
import { EmployeeDeliveriesPage } from "./pages/employee/EmployeeDeliveriesPage"

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { StaffApprovalPage } from "./pages/admin/StaffApprovalPage"
import { UsersDirectoryPage } from "./pages/admin/UsersDirectoryPage"
import { TransactionsPage } from "./pages/admin/TransactionsPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/employee/register" element={<EmployeeRegisterPage />} />

          {/* Customer (USER) Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/book"
            element={
              <ProtectedRoute requiredRole="USER">
                <BookCourierPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/history"
            element={
              <ProtectedRoute requiredRole="USER">
                <ShipmentHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/invoice/:id"
            element={
              <ProtectedRoute requiredRole="USER">
                <InvoicePage />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/pickups"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <PendingPickupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/incoming"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <IncomingParcelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/deliveries"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeDeliveriesPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff-approval"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <StaffApprovalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <UsersDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <TransactionsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
