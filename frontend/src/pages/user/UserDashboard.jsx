import React, { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserLayout } from "../../components/UserLayout"
import { StatCard } from "../../components/StatCard"
import { StatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Skeleton } from "../../components/ui/Skeleton"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../components/ui/InputGroup"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../components/ui/Collapsible"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from "../../components/ui/Empty"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "../../components/ui/Pagination"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/Chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { api } from "../../lib/api"
import { formatCurrency, formatDate, STATUS_CONFIG } from "../../lib/utils"
import { useAuth } from "../../context/AuthContext"
import { 
  Package, 
  PlusCircle, 
  Search, 
  History, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  ExternalLink,
  ChevronDown,
  User,
  MapPin,
  Clock,
  Send,
  Download,
  ShieldCheck,
  TrendingUp
} from "lucide-react"

export function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [allCouriers, setAllCouriers] = useState([])
  const [trackingInput, setTrackingInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTrackingDetailsOpen, setActiveTrackingDetailsOpen] = useState(false)

  const pageSize = 5

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [dashRes, couriersRes] = await Promise.all([
        api.getUserDashboard(),
        api.getUserCouriers()
      ])
      if (dashRes && dashRes.success) {
        setData(dashRes.data)
      }
      if (couriersRes && couriersRes.success && Array.isArray(couriersRes.data)) {
        setAllCouriers(couriersRes.data)
      } else if (dashRes && dashRes.success && Array.isArray(dashRes.data?.recentCouriers)) {
        setAllCouriers(dashRes.data.recentCouriers)
      }
    } catch (err) {
      console.error("Failed to load user dashboard", err)
    } finally {
      setLoading(false)
    }
  }

  const recentCouriers = data?.recentCouriers || []

  // Identify active shipments (not DELIVERED or CANCELLED)
  const activeShipments = useMemo(() => {
    return recentCouriers.filter(
      (c) => c.status !== "DELIVERED" && c.status !== "CANCELLED"
    )
  }, [recentCouriers])

  // Most recent active shipment for the Live Tracker card
  const primaryActiveShipment = activeShipments.length > 0 ? activeShipments[0] : null

  // Chart data: Monthly shipping spend and volume from real DB records
  const spendChartData = useMemo(() => {
    if (!allCouriers || allCouriers.length === 0) {
      return []
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    const months = []

    // Build last 6 calendar months chronologically up to current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        label: monthNames[d.getMonth()]
      })
    }

    return months.map(({ year, monthIndex, label }) => {
      const monthCouriers = allCouriers.filter((c) => {
        if (!c.createdAt) return false
        let cDate
        if (Array.isArray(c.createdAt)) {
          cDate = new Date(c.createdAt[0], c.createdAt[1] - 1, c.createdAt[2] || 1)
        } else {
          cDate = new Date(c.createdAt)
        }
        if (isNaN(cDate.getTime())) return false
        return cDate.getFullYear() === year && cDate.getMonth() === monthIndex
      })

      const monthSpend = monthCouriers.reduce((sum, c) => sum + (Number(c.totalFee) || 0), 0)
      const parcels = monthCouriers.length

      return {
        month: label,
        spend: Math.round(monthSpend * 100) / 100,
        parcels
      }
    })
  }, [allCouriers])

  const chartConfig = {
    spend: { label: "Spent (৳)", color: "#C85A17" },
    parcels: { label: "Parcels", color: "#1C3F35" }
  }

  // Handle Quick Track input
  const handleQuickTrack = (e) => {
    e.preventDefault()
    if (!trackingInput.trim()) return
    navigate(`/track?trackingNumber=${encodeURIComponent(trackingInput.trim())}`)
  }

  // Pagination for user couriers table
  const totalPages = Math.max(1, Math.ceil(recentCouriers.length / pageSize))
  const paginatedCouriers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return recentCouriers.slice(start, start + pageSize)
  }, [recentCouriers, currentPage, pageSize])

  // Step stages for tracking card
  const steps = [
    { key: "PENDING", label: "Booked" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ]

  const getStepIndex = (status) => {
    if (status === "CANCELLED") return -1
    const idx = steps.findIndex((s) => s.key === status)
    return idx >= 0 ? idx : 0
  }

  return (
    <UserLayout>
      {/* Customer Hero Banner with Quick Tracker InputGroup */}
      <div className="mb-8 rounded-3xl bg-white border border-[#E3DACC] p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-xs">
        {/* Subtle oat tint */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-[#E3DACC]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EEE6] border border-[#E3DACC] text-[#181716] text-xs font-semibold mb-3">
            <User className="h-3.5 w-3.5 text-[#7D7972]" />
            <span>Welcome back, {user?.fullName || "Valued Customer"}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#181716] tracking-tight">
            Send, track, and manage your shipments with ease.
          </h1>
          <p className="text-xs md:text-sm text-[#7D7972] mt-2 leading-relaxed">
            Dropify express nationwide courier dispatch across all 64 districts in Bangladesh with real-time GPS hub milestones.
          </p>

          {/* Quick-Track InputGroup Bar */}
          <form onSubmit={handleQuickTrack} className="mt-6 flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1">
              <InputGroup className="bg-[#FAF9F5] border-[#E3DACC]">
                <InputGroupAddon>
                  <Search className="h-4 w-4 text-[#7D7972]" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Paste tracking number (e.g. TRK-ABC123XYZ)..."
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                />
                <InputGroupButton
                  variant="primary"
                  onClick={handleQuickTrack}
                  className="px-4 py-2 font-semibold bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28]"
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  <span>Track</span>
                </InputGroupButton>
              </InputGroup>
            </div>

            <Link to="/user/book" className="shrink-0">
              <Button variant="default" className="h-11 w-full sm:w-auto px-5 font-semibold gap-2 bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28] shadow-xs">
                <PlusCircle className="h-4 w-4" />
                <span>Book New Parcel</span>
              </Button>
            </Link>
          </form>
        </div>
      </div>

      {/* Customer 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Bookings"
              value={data?.totalBookings ?? 0}
              icon={Package}
              color="indigo"
              description="Lifetime dispatched parcels"
            />
            <StatCard
              title="Active In-Transit"
              value={data?.activeCount ?? 0}
              icon={Truck}
              color="cyan"
              description="Moving across regional hubs"
            />
            <StatCard
              title="Successfully Received"
              value={data?.deliveredCount ?? 0}
              icon={CheckCircle2}
              color="emerald"
              description="Confirmed doorstep deliveries"
            />
            <StatCard
              title="Delivery Spend"
              value={formatCurrency(data?.totalSpent ?? 0)}
              icon={FileText}
              color="violet"
              description="Total courier shipping fees paid"
            />
          </>
        )}
      </div>

      {/* Active Shipment Progress Journey & Customer Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Journey Tracker Card with Collapsible Details */}
        <Card className="lg:col-span-2 border-[#E3DACC] bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-[#E3DACC] flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-[#181716]">Live Package Tracker</CardTitle>
                <CardDescription className="text-xs text-[#7D7972]">
                  {primaryActiveShipment 
                    ? `Milestone journey for parcel ${primaryActiveShipment.trackingNumber}`
                    : "No packages currently in transit"}
                </CardDescription>
              </div>
            </div>

            {primaryActiveShipment && (
              <StatusBadge status={primaryActiveShipment.status} />
            )}
          </CardHeader>

          <CardContent className="pt-6">
            {!primaryActiveShipment ? (
              <div className="py-8">
                <Empty className="border-none py-4">
                  <EmptyIcon icon={CheckCircle2} />
                  <EmptyTitle>All your shipments have arrived!</EmptyTitle>
                  <EmptyDescription>
                    You have no active orders in transit. Ready to send something new?
                  </EmptyDescription>
                  <EmptyActions>
                    <Link to="/user/book">
                      <Button variant="default" size="sm" className="bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28]">
                        Book a Parcel Now
                      </Button>
                    </Link>
                  </EmptyActions>
                </Empty>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 5-Step Visual Pipeline */}
                <div className="relative">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {steps.map((step, idx) => {
                      const currentIdx = getStepIndex(primaryActiveShipment.status)
                      const isComplete = idx <= currentIdx
                      const isCurrent = idx === currentIdx

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                              isCurrent
                                ? "bg-[#C85A17] text-[#FAF9F5] ring-4 ring-[#FAF0E8] scale-110 shadow-sm"
                                : isComplete
                                ? "bg-[#1C3F35] text-[#FAF9F5]"
                                : "bg-[#F0EEE6] text-[#7D7972] border border-[#E3DACC]"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span
                            className={`text-[11px] mt-2 font-medium truncate max-w-full ${
                              isCurrent ? "text-[#C85A17] font-bold" : isComplete ? "text-[#181716] font-semibold" : "text-[#7D7972]"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Collapsible Details Panel */}
                <Collapsible
                  open={activeTrackingDetailsOpen}
                  onOpenChange={setActiveTrackingDetailsOpen}
                  className="rounded-2xl border border-[#E3DACC] bg-[#FAF9F5] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#4A4744]">
                      <MapPin className="h-3.5 w-3.5 text-[#7D7972]" />
                      <span>
                        Route: <strong className="text-[#181716]">{primaryActiveShipment.pickupAddress?.zone}</strong> ➔ <strong className="text-[#181716]">{primaryActiveShipment.deliveryAddress?.zone}</strong>
                      </span>
                    </div>

                    <CollapsibleTrigger className="text-xs text-[#D96B27] hover:underline font-medium flex items-center gap-1">
                      <span>{activeTrackingDetailsOpen ? "Hide Details" : "View Details"}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeTrackingDetailsOpen ? "rotate-180" : ""}`} />
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="pt-3 mt-3 border-t border-[#E3DACC] space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-3 text-[#7D7972]">
                      <div>
                        Recipient: <span className="text-[#181716] font-semibold">{primaryActiveShipment.receiverName}</span>
                      </div>
                      <div>
                        Phone: <span className="text-[#181716] font-semibold">{primaryActiveShipment.receiverPhone}</span>
                      </div>
                      <div>
                        Weight: <span className="text-[#181716] font-semibold">{primaryActiveShipment.weightKg} kg</span>
                      </div>
                      <div>
                        Delivery Fee: <span className="text-[#181716] font-bold">{formatCurrency(primaryActiveShipment.totalFee)}</span>
                      </div>
                      {primaryActiveShipment.collectAmount > 0 && (
                        <div>
                          Doorstep COD: <span className="text-emerald-800 font-bold">{formatCurrency(primaryActiveShipment.collectAmount)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link to={`/track?trackingNumber=${primaryActiveShipment.trackingNumber}`}>
                        <Button variant="outline" size="sm" className="text-xs gap-1 border-[#E3DACC] bg-white text-[#181716] hover:bg-[#F0EEE6]">
                          <span>Full Live Timeline</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Activity / Spend Chart */}
        <Card className="border-[#E3DACC] bg-white p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <CardTitle className="text-sm font-bold text-[#181716] flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-[#7D7972]" />
                <span>Shipping Activity</span>
              </CardTitle>
              <span className="text-[10px] font-mono-code text-[#7D7972]">Recent Months</span>
            </div>
            <CardDescription className="text-xs text-[#7D7972] mb-4">
              Monthly courier spending from database
            </CardDescription>

            {allCouriers.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#E3DACC] rounded-2xl bg-[#FAF9F5]">
                <Package className="h-7 w-7 text-[#7D7972] mb-2" />
                <p className="text-xs font-bold text-[#181716]">No Shipping Activity Recorded</p>
                <p className="text-[11px] text-[#7D7972] mt-0.5 max-w-[220px]">
                  Real-time monthly spending and parcel volume will appear here once you dispatch parcels.
                </p>
                <Link to="/user/book" className="mt-3">
                  <Button variant="outline" size="sm" className="h-7 text-xs border-[#E3DACC] bg-white hover:bg-[#F0EEE6] text-[#181716]">
                    Book Your First Parcel
                  </Button>
                </Link>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-44 w-full">
                <AreaChart data={spendChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C85A17" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#C85A17" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DACC" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#7D7972", fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7D7972", fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area type="monotone" dataKey="spend" stroke="#C85A17" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGradient)" />
                </AreaChart>
              </ChartContainer>
            )}
          </div>

          <div className="pt-3 border-t border-[#E3DACC] flex items-center justify-between text-xs">
            <span className="text-[#7D7972]">Lifetime Spent:</span>
            <span className="font-bold text-[#181716] font-mono-code">{formatCurrency(data?.totalSpent || 0)}</span>
          </div>
        </Card>
      </div>

      {/* Customer Shipments Table with Invoice Links & Pagination */}
      <Card className="border-[#E3DACC] bg-white shadow-xs">
        <CardHeader className="p-5 border-b border-[#E3DACC] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#181716] flex items-center gap-2">
              <History className="h-4 w-4 text-[#7D7972]" />
              <span>Recent Parcels & Invoices</span>
            </CardTitle>
            <CardDescription className="text-xs text-[#7D7972]">
              Review your dispatched shipments and download tax invoices
            </CardDescription>
          </div>
          <Link to="/user/history">
            <Button variant="ghost" size="sm" className="text-xs text-[#D96B27] hover:underline gap-1">
              <span>View All History</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedCouriers.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyIcon icon={Package} />
                <EmptyTitle>No shipments booked yet</EmptyTitle>
                <EmptyDescription>
                  Send your first package anywhere in Bangladesh with doorstep pickup.
                </EmptyDescription>
                <EmptyActions>
                  <Link to="/user/book">
                    <Button variant="default" size="sm" className="bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28]">
                      Send a Parcel
                    </Button>
                  </Link>
                </EmptyActions>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E3DACC] bg-[#F0EEE6] text-xs font-semibold text-[#4A4744]">
                    <th className="p-4">Tracking Code</th>
                    <th className="p-4">Recipient & Hub</th>
                    <th className="p-4">Weight</th>
                    <th className="p-4">Delivery Fee</th>
                    <th className="p-4">COD</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
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
                          <span className="font-semibold text-[#181716]">{courier.receiverName}</span>
                          <span className="text-[10px] text-[#7D7972]">
                            {courier.deliveryAddress?.zone} Hub ({courier.deliveryAddress?.city})
                          </span>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/track?trackingNumber=${courier.trackingNumber}`}>
                            <Button variant="ghost" size="icon" title="Track Live" className="text-[#7D7972] hover:text-[#181716]">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link to={`/user/invoice/${courier.id}`}>
                            <Button variant="ghost" size="icon" title="View Invoice" className="text-[#7D7972] hover:text-[#181716]">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
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
                <span className="font-bold text-[#181716]">{Math.min(currentPage * pageSize, recentCouriers.length)}</span> of{" "}
                <span className="font-bold text-[#181716]">{recentCouriers.length}</span> shipments
              </span>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === currentPage}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
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
    </UserLayout>
  )
}
