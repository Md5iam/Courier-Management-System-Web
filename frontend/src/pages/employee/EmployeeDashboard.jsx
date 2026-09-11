import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { PortalLayout } from "../../components/PortalLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatCard } from "../../components/StatCard"
import { StatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Skeleton } from "../../components/ui/Skeleton"
import { api } from "../../lib/api"
import { useAuth } from "../../context/AuthContext"
import { formatCurrency, formatDate } from "../../lib/utils"
import { 
  MapPin, 
  Truck, 
  PackageCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  History,
  Award,
  Coins,
  ExternalLink 
} from "lucide-react"

export function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [deliveries, setDeliveries] = useState({ pickupTasks: [], deliveryTasks: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [dashRes, delivRes] = await Promise.all([
        api.getEmployeeDashboard(),
        api.getEmployeeDeliveries()
      ])

      if (dashRes && dashRes.success) {
        setData(dashRes.data)
      }
      if (delivRes && delivRes.success) {
        setDeliveries(delivRes.data || { pickupTasks: [], deliveryTasks: [] })
      }
    } catch (err) {
      console.error("Failed to load employee dashboard", err)
    } finally {
      setLoading(false)
    }
  }

  const zone = user?.assignedZone || "All Zones"

  // Delivered history calculations
  const deliveredList = deliveries.deliveryTasks?.filter((c) => c.status === "DELIVERED") || []
  const deliveredCount = deliveredList.length
  const totalCODCollected = deliveredList.reduce((sum, c) => sum + (c.collectAmount || 0), 0)

  return (
    <PortalLayout>
      <PageHeader
        title={`Operations Hub — ${user?.fullName || "Agent"}`}
        description={`Active delivery zone: ${zone}. Monitor local pickups, hub transfers, doorstep drops, and delivery history.`}
        badge={`${zone} Hub`}
        actions={
          <Link to="/employee/deliveries">
            <Button variant="emerald" size="sm" className="gap-2 shadow-emerald-600/20">
              <History className="h-4 w-4" />
              <span>Delivered History ({deliveredCount})</span>
            </Button>
          </Link>
        }
      />

      {/* Zone Alert / Highlight Banner */}
      <div className="p-4 rounded-2xl bg-[#F0EEE6] border border-[#E3DACC] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border border-[#E3DACC] flex items-center justify-center text-[#181716]">
            <MapPin className="h-5 w-5 text-[#7D7972]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#181716]">Assigned to {zone} Division</h4>
            <p className="text-xs text-[#7D7972]">Parcels originating from or arriving in this zone are routed to your personal queue.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/employee/pickups">
            <Button variant="emerald" size="sm">
              View Zone Pickups
            </Button>
          </Link>
          <Link to="/employee/incoming">
            <Button variant="outline" size="sm" className="border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#FAF9F5]">
              Incoming Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Pending Pickups"
              value={data?.pendingZoneCount ?? 0}
              icon={MapPin}
              color="amber"
              description="New orders in zone"
            />
            <StatCard
              title="My Picked-Up"
              value={data?.pickupTaskCount ?? 0}
              icon={PackageCheck}
              color="indigo"
              description="Ready to send to hub"
            />
            <StatCard
              title="Incoming Transit"
              value={data?.incomingCount ?? 0}
              icon={Truck}
              color="cyan"
              description="Arriving at your hub"
            />
            <StatCard
              title="Out for Delivery"
              value={data?.deliveryTaskCount ?? 0}
              icon={CheckCircle2}
              color="emerald"
              description="Active in your queue"
            />
            <StatCard
              title="Total Delivered"
              value={deliveredCount}
              icon={Award}
              color="emerald"
              description="Lifetime completed deliveries"
            />
          </>
        )}
      </div>

      {/* Quick Task Access Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pickup Operations */}
        <Card className="border-[#E3DACC] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E3DACC]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                <MapPin className="h-4 w-4 text-[#7D7972]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#181716]">Pickup Tasks Queue</h3>
                <p className="text-xs text-[#7D7972]">Collect parcels from local senders</p>
              </div>
            </div>
            <Link to="/employee/pickups">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#D96B27] hover:underline">
                <span>Open Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[#4A4744] mb-4 leading-relaxed">
            There are currently <strong className="text-[#181716]">{data?.pendingZoneCount ?? 0}</strong> pending pickup requests in {zone}. Claim them to begin collection.
          </p>
          <Link to="/employee/pickups">
            <Button variant="outline" className="w-full justify-between border-[#E3DACC] bg-white text-[#181716] hover:bg-[#F0EEE6]">
              <span>Go to Pending Pickups</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        {/* Delivery Operations & History Link */}
        <Card className="border-[#E3DACC] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E3DACC]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#181716]">Doorstep Deliveries & History</h3>
                <p className="text-xs text-[#7D7972]">Manage active drops and track completed orders</p>
              </div>
            </div>
            <Link to="/employee/deliveries">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#D96B27] hover:underline">
                <span>My Tasks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[#4A4744] mb-4 leading-relaxed">
            You currently have <strong className="text-[#181716]">{data?.deliveryTaskCount ?? 0}</strong> parcel(s) out for delivery and have completed <strong className="text-emerald-800">{deliveredCount}</strong> verified delivery drops.
          </p>
          <Link to="/employee/deliveries">
            <Button variant="emerald" className="w-full justify-between shadow-xs">
              <span>View My Deliveries & History ({deliveredCount})</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Delivered Parcels Track Record Section */}
      {deliveredList.length > 0 && (
        <Card className="border-[#E3DACC] bg-white shadow-xs">
          <CardHeader className="p-5 border-b border-[#E3DACC] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#181716] flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-800" />
                <span>My Delivered Parcels History</span>
              </CardTitle>
              <p className="text-xs text-[#7D7972] mt-0.5">
                Successfully delivered by you • Total COD collected: <strong className="text-emerald-800">{formatCurrency(totalCODCollected)}</strong>
              </p>
            </div>
            <Link to="/employee/deliveries">
              <Button variant="ghost" size="sm" className="text-xs text-[#D96B27] hover:underline gap-1">
                <span>View Full History ({deliveredCount})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3DACC] bg-[#F0EEE6] text-[#4A4744]">
                    <th className="p-4">Tracking Code</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Destination Hub</th>
                    <th className="p-4">Delivery Fee</th>
                    <th className="p-4">COD Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DACC]">
                  {deliveredList.slice(0, 5).map((c) => (
                    <tr key={c.id} className="border-b border-[#E3DACC] hover:bg-[#FAF9F5]">
                      <td className="p-4 font-mono-code font-bold text-[#181716]">
                        {c.trackingNumber}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-[#181716] block">{c.receiverName}</span>
                        <span className="text-[10px] text-[#7D7972]">{c.receiverPhone}</span>
                      </td>
                      <td className="p-4 text-[#4A4744]">
                        {c.deliveryAddress?.city} ({c.deliveryAddress?.zone} Hub)
                      </td>
                      <td className="p-4 font-semibold text-[#181716]">
                        {formatCurrency(c.totalFee)}
                      </td>
                      <td className="p-4 font-semibold text-emerald-800">
                        {c.collectAmount > 0 ? formatCurrency(c.collectAmount) : "—"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/track?trackingNumber=${c.trackingNumber}`} target="_blank">
                          <Button variant="ghost" size="icon" title="View Milestone" className="text-[#7D7972] hover:text-[#181716]">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </PortalLayout>
  )
}
