import React, { useState, useEffect } from "react"
import { PortalLayout } from "../../components/PortalLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatusBadge } from "../../components/StatusBadge"
import { EmptyState } from "../../components/EmptyState"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Skeleton } from "../../components/ui/Skeleton"
import { api } from "../../lib/api"
import { useAuth } from "../../context/AuthContext"
import { formatDate } from "../../lib/utils"
import { toast } from "sonner"
import { 
  MapPin, 
  Phone, 
  User, 
  ArrowRight, 
  Package, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react"

export function PendingPickupsPage() {
  const { user } = useAuth()
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)

  useEffect(() => {
    loadPickups()
  }, [])

  const loadPickups = async () => {
    try {
      setLoading(true)
      const res = await api.getEmployeePickups()
      if (res && res.success) {
        setPickups(res.data || [])
      }
    } catch (err) {
      toast.error("Failed to load pickups: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (courierId, trackingNumber) => {
    setClaimingId(courierId)
    try {
      const res = await api.claimPickup(courierId)
      if (res && res.success) {
        toast.success(`Claimed pickup for ${trackingNumber}!`)
        loadPickups()
      } else {
        toast.error(res?.message || "Failed to claim pickup.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to claim pickup.")
    } finally {
      setClaimingId(null)
    }
  }

  const zone = user?.assignedZone || "Your Zone"

  return (
    <PortalLayout>
      <PageHeader
        title={`Pending Pickups (${zone})`}
        description={`New customer shipments awaiting agent pickup in ${zone}. Claim orders to initiate transit.`}
        badge={`${pickups.length} Available`}
        actions={
          <Button variant="outline" size="sm" onClick={loadPickups} className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <RefreshCw className="h-4 w-4 text-[#7D7972]" />
            <span>Refresh Queue</span>
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : pickups.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No pending pickups right now"
          description={`All booked parcels in ${zone} have already been claimed or there are no new orders.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pickups.map((courier) => (
            <Card
              key={courier.id}
              className="border-[#E3DACC] bg-white p-5 flex flex-col justify-between hover:border-[#181716] transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DACC] mb-4">
                  <span className="font-mono-code font-bold text-[#181716] text-sm">
                    {courier.trackingNumber}
                  </span>
                  <StatusBadge status={courier.status} />
                </div>

                {/* Sender Details */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[#7D7972] shrink-0" />
                    <span className="font-semibold text-[#181716]">
                      {courier.senderName || "Valued Sender"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#7D7972] shrink-0" />
                    <span className="text-[#4A4744]">{courier.senderPhone || "N/A"}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#7D7972] shrink-0 mt-0.5" />
                    <p className="text-[#4A4744] leading-snug">
                      {courier.pickupAddress?.streetAddress}, {courier.pickupAddress?.city}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E3DACC] flex items-center justify-between text-[#7D7972] text-[11px]">
                    <span>Weight: <strong className="text-[#181716]">{courier.weightKg} kg</strong></span>
                    <span>Dest: <strong className="text-[#181716]">{courier.deliveryAddress?.zone}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E3DACC]">
                <Button
                  variant="default"
                  onClick={() => handleClaim(courier.id, courier.trackingNumber)}
                  loading={claimingId === courier.id}
                  className="w-full gap-2 bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28] shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Claim for Pickup</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  )
}
