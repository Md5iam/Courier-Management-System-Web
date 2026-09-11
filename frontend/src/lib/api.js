const API_BASE = "/api"

async function request(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // essential for Spring Security session cookie
  }

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config)
    
    // Handle 401 Unauthorized quietly for auth check
    if (res.status === 401 && endpoint === "/auth/me") {
      return null
    }

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      const errorMessage = (json && json.message) || (json && json.error) || `Request failed with status ${res.status}`
      throw new Error(errorMessage)
    }

    return json
  } catch (err) {
    if (endpoint === "/auth/me" && err.message.includes("401")) {
      return null
    }
    throw err
  }
}

export const api = {
  // Public
  track: (trackingNumber) => request(`/track/${encodeURIComponent(trackingNumber)}`),
  calculateRate: (weightKg) => request(`/rates/calculate?weightKg=${weightKg}`),

  // Auth
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  registerEmployee: (data) => request("/auth/employee-register", { method: "POST", body: data }),
  getMe: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  // User / Customer
  getUserDashboard: () => request("/user/dashboard"),
  getUserCouriers: () => request("/user/couriers"),
  bookCourier: (data) => request("/user/book", { method: "POST", body: data }),
  getInvoice: (id) => request(`/user/invoice/${id}`),
  cancelCourier: (id) => request(`/user/cancel/${id}`, { method: "POST" }),

  // Employee
  getEmployeeDashboard: () => request("/employee/dashboard"),
  getEmployeePickups: () => request("/employee/pickups"),
  claimPickup: (courierId) => request("/employee/claim-pickup", { method: "POST", body: { courierId } }),
  sendToTransit: (courierId) => request("/employee/send-transit", { method: "POST", body: { courierId } }),
  getEmployeeIncoming: () => request("/employee/incoming"),
  claimDelivery: (courierId) => request("/employee/claim-delivery", { method: "POST", body: { courierId } }),
  markDelivered: (courierId) => request("/employee/mark-delivered", { method: "POST", body: { courierId } }),
  getEmployeeDeliveries: () => request("/employee/deliveries"),

  // Admin
  getAdminDashboard: () => request("/admin/dashboard"),
  getPendingStaff: () => request("/admin/staff-approval"),
  approveStaff: (id) => request(`/admin/approve-staff/${id}`, { method: "POST" }),
  getUsersDirectory: () => request("/admin/users"),
  toggleUserStatus: (id) => request(`/admin/toggle-user-status/${id}`, { method: "POST" }),
  getTransactions: () => request("/admin/transactions"),
}
