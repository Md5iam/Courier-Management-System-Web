import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { AdminLayout } from "../../components/AdminLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatCard } from "../../components/StatCard"
import { StatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Skeleton } from "../../components/ui/Skeleton"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../components/ui/InputGroup"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../components/ui/Collapsible"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../../components/ui/Empty"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "../../components/ui/Pagination"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/Chart"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { api } from "../../lib/api"
import { formatCurrency, formatDate, STATUS_CONFIG } from "../../lib/utils"
import { 
  DollarSign, 
  Coins, 
  Package, 
  CheckCircle2, 
  Users, 
  Truck, 
  UserCheck, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  TrendingUp,
  Search,
  Filter,
  ChevronDown,
  Layers,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
  X
} from "lucide-react"

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedHub, setSelectedHub] = useState("ALL")

  const pageSize = 8

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.getAdminDashboard()
      if (res && res.success) {
        setData(res.data)
      }
    } catch (err) {
      console.error("Failed to load admin dashboard", err)
    } finally {
      setLoading(false)
    }
  }

  const totalCouriers = data?.totalCouriers || 0
  const statusDist = data?.statusDistribution || {}
  const pendingStaff = data?.pendingEmployeesCount || 0
  const recentCouriers = data?.recentCouriers || []

  // Chart configuration & data preparation
  const chartData = useMemo(() => {
    return [
      { status: "Pending", count: statusDist["PENDING"] || 0, fill: "#f59e0b" },
      { status: "Picked Up", count: statusDist["PICKED_UP"] || 0, fill: "#3b82f6" },
      { status: "In Transit", count: statusDist["IN_TRANSIT"] || 0, fill: "#06b6d4" },
      { status: "Out for Del.", count: statusDist["OUT_FOR_DELIVERY"] || 0, fill: "#8b5cf6" },
      { status: "Delivered", count: statusDist["DELIVERED"] || 0, fill: "#10b981" },
      { status: "Cancelled", count: statusDist["CANCELLED"] || 0, fill: "#f43f5e" },
    ]
  }, [statusDist])

  const chartConfig = {
    count: { label: "Shipments", color: "#8b5cf6" },
  }

  // Filtered couriers for Data Table
  const filteredCouriers = useMemo(() => {
    return recentCouriers.filter((courier) => {
      // Search
      const search = searchTerm.toLowerCase()
      const matchesSearch = 
        !searchTerm ||
        courier.trackingNumber?.toLowerCase().includes(search) ||
        courier.receiverName?.toLowerCase().includes(search) ||
        courier.senderName?.toLowerCase().includes(search) ||
        courier.deliveryAddress?.zone?.toLowerCase().includes(search)

      // Status
      const matchesStatus = statusFilter === "ALL" || courier.status === statusFilter

      // Hub/Zone
      const matchesHub = selectedHub === "ALL" || 
        courier.pickupAddress?.zone === selectedHub || 
        courier.deliveryAddress?.zone === selectedHub

      return matchesSearch && matchesStatus && matchesHub
    })
  }, [recentCouriers, searchTerm, statusFilter, selectedHub])

  // Sorted couriers
  const sortedCouriers = useMemo(() => {
    if (!sortField) return filteredCouriers

    return [...filteredCouriers].sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]

      if (valA === valB) return 0
      if (valA == null) return 1
      if (valB == null) return -1

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [filteredCouriers, sortField, sortAsc])

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(sortedCouriers.length / pageSize))
  const paginatedCouriers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedCouriers.slice(start, start + pageSize)
  }, [sortedCouriers, currentPage, pageSize])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Admin Operations Command"
        description="Real-time nationwide overview of revenue, operations, hub logistics, and personnel."
        badge="Mission Control"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#7D7972]" />
              <span>Refresh Telemetry</span>
            </Button>
            <Link to="/admin/staff-approval">
              <Button variant="outline" size="sm" className="gap-2 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100">
                <UserCheck className="h-4 w-4 text-amber-700" />
                <span>Approvals {pendingStaff > 0 && `(${pendingStaff})`}</span>
              </Button>
            </Link>
            <Link to="/admin/transactions">
              <Button variant="default" size="sm" className="gap-2 bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28]">
                <DollarSign className="h-4 w-4" />
                <span>Ledger</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Pending Approvals Notice Banner */}
      {pendingStaff > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-800" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <span>Action Required: {pendingStaff} Staff Registrations Pending</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-800 text-white">URGENT</span>
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                New delivery drivers and dispatch agents applied. Verify operational zones and authorize hub credentials.
              </p>
            </div>
          </div>
          <Link to="/admin/staff-approval">
            <Button variant="default" size="sm" className="bg-amber-800 hover:bg-amber-900 text-white shadow-xs shrink-0">
              Authorize Personnel
            </Button>
          </Link>
        </div>
      )}

      {/* 6 High-Density Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Gross Shipping Revenue"
              value={formatCurrency(data?.totalRevenue ?? 0)}
              icon={DollarSign}
              color="violet"
              description="Direct delivery fee earnings collected"
            />
            <StatCard
              title="COD Volume Cleared"
              value={formatCurrency(data?.totalCOD ?? 0)}
              icon={Coins}
              color="emerald"
              description="Doorstep cash collected across Bangladesh"
            />
            <StatCard
              title="Total System Parcels"
              value={data?.totalCouriers ?? 0}
              icon={Package}
              color="indigo"
              description="Lifetime dispatched courier orders"
            />
            <StatCard
              title="Successfully Delivered"
              value={data?.deliveredCouriers ?? 0}
              icon={CheckCircle2}
              color="cyan"
              description={`${totalCouriers > 0 ? ((data.deliveredCouriers / totalCouriers) * 100).toFixed(1) : 0}% delivery success rate`}
            />
            <StatCard
              title="Customer Accounts"
              value={data?.totalCustomers ?? 0}
              icon={Users}
              color="indigo"
              description="Registered consumers and corporate senders"
            />
            <StatCard
              title="Active Fleet & Hub Staff"
              value={data?.totalEmployees ?? 0}
              icon={Truck}
              color="emerald"
              description="Field couriers & regional station handlers"
            />
          </>
        )}
      </div>

      {/* Interactive Shadcn Chart: Delivery Pipeline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-[#E3DACC] bg-white shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-[#E3DACC]">
            <div>
              <CardTitle className="text-base font-bold text-[#181716] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#7D7972]" />
                <span>Parcel Status Pipeline Breakdown</span>
              </CardTitle>
              <CardDescription className="text-xs text-[#7D7972]">
                Active volume segmented by current operational milestone
              </CardDescription>
            </div>
            <span className="text-xs font-mono-code font-semibold px-2.5 py-1 rounded-lg bg-[#F0EEE6] text-[#181716] border border-[#E3DACC]">
              {totalCouriers} Total Parcels
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DACC" />
                <XAxis 
                  dataKey="status" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#7D7972", fontSize: 11 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  tick={{ fill: "#7D7972", fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]} 
                  fill="#C85A17"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Metrics Legend Cards */}
        <Card className="border-[#E3DACC] bg-white p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#181716] mb-1">Status Proportions</h3>
            <p className="text-xs text-[#7D7972] mb-4">Milestone percentage across hubs</p>
            <div className="space-y-2.5">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = statusDist[key] || 0
                const pct = totalCouriers > 0 ? ((count / totalCouriers) * 100).toFixed(1) : 0
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E3DACC] text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                      <span className="text-[#181716] font-medium">{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono-code">
                      <span className="font-bold text-[#181716]">{count}</span>
                      <span className="text-[#7D7972] text-[10px]">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="pt-3 border-t border-[#E3DACC] text-[11px] text-[#7D7972] text-center">
            Updated continuously via nationwide transit hub network
          </div>
        </Card>
      </div>

      {/* Collapsible Operational Controls & Hub Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="mb-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E3DACC] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#181716]">Operations & Hub Filter Console</h4>
              <p className="text-[11px] text-[#7D7972]">
                {selectedHub === "ALL" ? "Showing all 9 division hubs" : `Filtered to ${selectedHub} Division Hub`} • Status: {statusFilter}
              </p>
            </div>
          </div>

          <CollapsibleTrigger className="px-3 py-1.5 rounded-xl bg-[#F0EEE6] hover:bg-[#E8E6DC] text-xs font-medium text-[#181716] border border-[#E3DACC] gap-2">
            <span>{filtersOpen ? "Hide Advanced Filters" : "Show Advanced Filters"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="pt-3">
          <Card className="border-[#E3DACC] bg-white p-5 space-y-4 shadow-xs">
            <div>
              <label className="text-xs font-semibold text-[#7D7972] mb-2 block">
                Filter by Regional Transit Hub:
              </label>
              <div className="flex flex-wrap gap-2">
                {["ALL", "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"].map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => {
                      setSelectedHub(hub)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedHub === hub
                        ? "bg-[#181716] text-[#FAF9F5] font-bold shadow-xs"
                        : "bg-[#FAF9F5] text-[#4A4744] hover:text-[#181716] hover:bg-[#E8E6DC] border border-[#E3DACC]"
                    }`}
                  >
                    {hub === "ALL" ? "All Nationwide Hubs" : `${hub} Hub`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DACC] flex items-center justify-between text-xs">
              <span className="text-[#7D7972]">
                Showing matching records in the Data Table below
              </span>
              {(selectedHub !== "ALL" || statusFilter !== "ALL" || searchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHub("ALL")
                    setStatusFilter("ALL")
                    setSearchTerm("")
                    setCurrentPage(1)
                  }}
                  className="text-[#D96B27] hover:underline font-semibold"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Nationwide Parcels Data Table with InputGroup & Pagination */}
      <Card className="border-[#E3DACC] bg-white shadow-xs">
        <CardHeader className="p-5 border-b border-[#E3DACC]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-[#181716] flex items-center gap-2">
                <Package className="h-4 w-4 text-[#7D7972]" />
                <span>Nationwide Shipments Data Grid</span>
              </CardTitle>
              <CardDescription className="text-xs text-[#7D7972]">
                Real-time operational parcel ledger across all regional dispatch points
              </CardDescription>
            </div>

            {/* InputGroup Search */}
            <div className="w-full md:w-80">
              <InputGroup>
                <InputGroupAddon>
                  <Search className="h-4 w-4 text-[#7D7972]" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search tracking, sender, receiver..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
                {searchTerm && (
                  <InputGroupButton onClick={() => setSearchTerm("")}>
                    <X className="h-3.5 w-3.5 text-[#7D7972]" />
                  </InputGroupButton>
                )}
              </InputGroup>
            </div>
          </div>

          {/* Status Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="text-xs text-[#7D7972] mr-1 font-medium">Status:</span>
            {["ALL", "PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st)
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  statusFilter === st
                    ? "bg-[#181716] text-[#FAF9F5] font-bold shadow-xs"
                    : "bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#E8E6DC] border border-[#E3DACC]"
                }`}
              >
                {st === "ALL" ? "All Statuses" : STATUS_CONFIG[st]?.label || st}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedCouriers.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyIcon icon={Layers} />
                <EmptyTitle>No shipments match your criteria</EmptyTitle>
                <EmptyDescription>
                  Try clearing the tracking code search query or selecting "All Nationwide Hubs".
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E3DACC] bg-[#F0EEE6]">
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">
                      <button
                        type="button"
                        onClick={() => handleSort("trackingNumber")}
                        className="flex items-center gap-1 hover:text-[#181716]"
                      >
                        <span>Tracking Code</span>
                        <ArrowUpDown className="h-3 w-3 text-[#7D7972]" />
                      </button>
                    </th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">Sender & Origin</th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">Receiver & Hub</th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">
                      <button
                        type="button"
                        onClick={() => handleSort("weightKg")}
                        className="flex items-center gap-1 hover:text-[#181716]"
                      >
                        <span>Weight</span>
                        <ArrowUpDown className="h-3 w-3 text-[#7D7972]" />
                      </button>
                    </th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">
                      <button
                        type="button"
                        onClick={() => handleSort("totalFee")}
                        className="flex items-center gap-1 hover:text-[#181716]"
                      >
                        <span>Delivery Fee</span>
                        <ArrowUpDown className="h-3 w-3 text-[#7D7972]" />
                      </button>
                    </th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">
                      <button
                        type="button"
                        onClick={() => handleSort("collectAmount")}
                        className="flex items-center gap-1 hover:text-[#181716]"
                      >
                        <span>COD</span>
                        <ArrowUpDown className="h-3 w-3 text-[#7D7972]" />
                      </button>
                    </th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744]">Status</th>
                    <th className="p-4 text-xs font-semibold text-[#4A4744] text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DACC] text-xs">
                  {paginatedCouriers.map((courier) => (
                    <tr key={courier.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="p-4 font-mono-code font-bold text-[#181716]">
                        {courier.trackingNumber}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#181716]">{courier.senderName || "Sender"}</span>
                          <span className="text-[10px] text-[#7D7972]">{courier.pickupAddress?.zone} Hub</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#181716]">{courier.receiverName}</span>
                          <span className="text-[10px] text-[#7D7972]">{courier.deliveryAddress?.zone} Hub</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#4A4744] font-mono-code">
                        {courier.weightKg} kg
                      </td>
                      <td className="p-4 font-semibold text-[#181716]">
                        {formatCurrency(courier.totalFee)}
                      </td>
                      <td className="p-4 font-semibold text-emerald-800">
                        {courier.collectAmount > 0 ? formatCurrency(courier.collectAmount) : "—"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={courier.status} />
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/track?trackingNumber=${courier.trackingNumber}`} target="_blank">
                          <Button variant="ghost" size="icon" title="View Milestone Log" className="text-[#7D7972] hover:text-[#181716]">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Shadcn Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E3DACC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7D7972]">
                Showing <span className="font-bold text-[#181716]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-[#181716]">{Math.min(currentPage * pageSize, sortedCouriers.length)}</span> of{" "}
                <span className="font-bold text-[#181716]">{sortedCouriers.length}</span> shipments
              </span>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => {
                      const prev = arr[i - 1]
                      return (
                        <React.Fragment key={p}>
                          {prev && p - prev > 1 && (
                            <PaginationItem>
                              <span className="px-2 text-[#7D7972]">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              isActive={p === currentPage}
                              onClick={() => setCurrentPage(p)}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      )
                    })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
