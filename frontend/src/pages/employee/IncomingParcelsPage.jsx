import React, { useState, useEffect } from "react"
import { PortalLayout } from "../../components/PortalLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatusBadge } from "../../components/StatusBadge"
import { EmptyState } from "../../components/EmptyState"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Skeleton } from "../../components/ui/Skeleton"
import { api } from "../../lib/api"
import { useAuth } from "../../context/AuthContext"
import { formatCurrency } from "../../lib/utils"
import { toast } from "sonner"
import { 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  RefreshCw, 
  Coins 
} from "lucide-react"

export function IncomingParcelsPage() {
  const { user } = useAuth()
  const [incoming, setIncoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)

  useEffect(() => {
    loadIncoming()
  }, [])

  const loadIncoming = async () => {
    try {
      setLoading(true)
      const res = await api.getEmployeeIncoming()
      if (res && res.success) {
        setIncoming(res.data || [])
      }
    } catch (err) {
      toast.error("Failed to load incoming parcels: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (courierId, trackingNumber) => {
    setClaimingId(courierId)
    try {
      const res = await api.claimDelivery(courierId)
      if (res && res.success) {
        toast.success(`Claimed ${trackingNumber}! Marked OUT FOR DELIVERY.`)
        loadIncoming()
      } else {
        toast.error(res?.message || "Failed to claim parcel for delivery.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to claim parcel.")
    } finally {
      setClaimingId(null)
    }
  }

  const zone = user?.assignedZone || "Your Zone"

  return (
    <PortalLayout>
      <PageHeader
        title={`Incoming Hub Parcels (${zone})`}
        description={`Parcels arriving from other hubs heading to destinations in ${zone}. Claim for last-mile delivery.`}
        badge={`${incoming.length} Arrived`}
        actions={
          <Button variant="outline" size="sm" onClick={loadIncoming} className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <RefreshCw className="h-4 w-4 text-[#7D7972]" />
            <span>Refresh Hub Queue</span>
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : incoming.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No incoming shipments waiting"
          description={`There are currently no parcels in transit destined for the ${zone} hub.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incoming.map((courier) => (
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

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[#7D7972] shrink-0" />
                    <span className="font-semibold text-[#181716]">
                      {courier.receiverName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#7D7972] shrink-0" />
                    <span className="text-[#4A4744]">{courier.receiverPhone}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#7D7972] shrink-0 mt-0.5" />
                    <p className="text-[#4A4744] leading-snug">
                      {courier.deliveryAddress?.streetAddress}, {courier.deliveryAddress?.city}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E3DACC] flex items-center justify-between text-[#7D7972] text-[11px]">
                    <span>Route: <strong className="text-[#181716]">{courier.pickupAddress?.zone} → {zone}</strong></span>
                    {courier.collectAmount > 0 ? (
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        COD: {formatCurrency(courier.collectAmount)}
                      </span>
                    ) : (
                      <span className="text-[#7D7972]">Prepaid / No COD</span>
                    )}
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
                  <span>Claim for Delivery</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  )
}
