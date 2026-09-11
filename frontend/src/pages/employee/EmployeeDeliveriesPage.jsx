import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { PortalLayout } from "../../components/PortalLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatusBadge } from "../../components/StatusBadge"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "../../components/ui/Empty"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../components/ui/InputGroup"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "../../components/ui/Pagination"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs"
import { Skeleton } from "../../components/ui/Skeleton"
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "../../components/ui/Dialog"
import { api } from "../../lib/api"
import { formatCurrency, formatDate } from "../../lib/utils"
import { toast } from "sonner"
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Send, 
  MapPin, 
  User, 
  Phone, 
  Coins, 
  RefreshCw,
  History,
  ExternalLink,
  Search,
  X,
  Award,
  Calendar
} from "lucide-react"

export function EmployeeDeliveriesPage() {
  const [data, setData] = useState({ pickupTasks: [], deliveryTasks: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("deliveries")

  // History search and pagination
  const [historySearch, setHistorySearch] = useState("")
  const [historyPage, setHistoryPage] = useState(1)
  const historyPageSize = 6

  // Action states
  const [processingId, setProcessingId] = useState(null)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [selectedCourier, setSelectedCourier] = useState(null)

  useEffect(() => {
    loadDeliveries()
  }, [])

  const loadDeliveries = async () => {
    try {
      setLoading(true)
      const res = await api.getEmployeeDeliveries()
      if (res && res.success) {
        setData(res.data || { pickupTasks: [], deliveryTasks: [] })
      }
    } catch (err) {
      toast.error("Failed to load delivery tasks: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Action 1: Send to Transit
  const handleSendTransit = async (courierId, trackingNumber) => {
    setProcessingId(courierId)
    try {
      const res = await api.sendToTransit(courierId)
      if (res && res.success) {
        toast.success(`Dispatched ${trackingNumber} to Hub Transit!`)
        loadDeliveries()
      } else {
        toast.error(res?.message || "Failed to dispatch parcel.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to dispatch parcel.")
    } finally {
      setProcessingId(null)
    }
  }

  // Action 2: Open Mark Delivered Modal
  const handleOpenDeliveredModal = (courier) => {
    setSelectedCourier(courier)
    setDeliveryModalOpen(true)
  }

  // Action 3: Confirm Mark Delivered
  const handleConfirmDelivered = async () => {
    if (!selectedCourier) return
    setProcessingId(selectedCourier.id)
    try {
      const res = await api.markDelivered(selectedCourier.id)
      if (res && res.success) {
        toast.success(`Delivered ${selectedCourier.trackingNumber}! Recorded in your delivery history.`)
        setDeliveryModalOpen(false)
        loadDeliveries()
      } else {
        toast.error(res?.message || "Failed to mark delivered.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to mark delivered.")
    } finally {
      setProcessingId(null)
    }
  }

  // Task filtering
  const activePickups = data.pickupTasks.filter((c) => c.status === "PICKED_UP")
  const activeDeliveries = data.deliveryTasks.filter((c) => c.status === "OUT_FOR_DELIVERY")
  const deliveredHistory = data.deliveryTasks.filter((c) => c.status === "DELIVERED")

  // History stats
  const totalCODCollected = useMemo(() => {
    return deliveredHistory.reduce((sum, c) => sum + (c.collectAmount || 0), 0)
  }, [deliveredHistory])

  // Filtered delivered history
  const filteredHistory = useMemo(() => {
    const term = historySearch.toLowerCase()
    return deliveredHistory.filter((c) => {
      return (
        !historySearch ||
        c.trackingNumber?.toLowerCase().includes(term) ||
        c.receiverName?.toLowerCase().includes(term) ||
        c.receiverPhone?.toLowerCase().includes(term) ||
        c.deliveryAddress?.city?.toLowerCase().includes(term) ||
        c.deliveryAddress?.zone?.toLowerCase().includes(term)
      )
    })
  }, [deliveredHistory, historySearch])

  // Paginated delivered history
  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize))
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize
    return filteredHistory.slice(start, start + historyPageSize)
  }, [filteredHistory, historyPage, historyPageSize])

  return (
    <PortalLayout>
      <PageHeader
        title="My Tasks & Delivery History"
        description="Manage active pickups, last-mile doorstep deliveries, and view your complete delivery track record."
        badge={`${activePickups.length + activeDeliveries.length} Active • ${deliveredHistory.length} Delivered`}
        actions={
          <Button variant="outline" size="sm" onClick={loadDeliveries} className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <RefreshCw className="h-4 w-4 text-[#7D7972]" />
            <span>Refresh Tasks</span>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-xl bg-[#F0EEE6] border border-[#E3DACC]">
          <TabsTrigger value="deliveries" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Out for Delivery ({activeDeliveries.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pickups" className="gap-2">
            <Send className="h-4 w-4" />
            <span>Hub Dispatches ({activePickups.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span>Delivered History ({deliveredHistory.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Deliveries (OUT_FOR_DELIVERY) */}
        <TabsContent value="deliveries">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-60" />
              <Skeleton className="h-60" />
            </div>
          ) : activeDeliveries.length === 0 ? (
            <Empty>
              <EmptyIcon icon={CheckCircle2} />
              <EmptyTitle>No active deliveries in your queue</EmptyTitle>
              <EmptyDescription>
                Claim parcels from the Incoming Hub queue to start last-mile deliveries.
              </EmptyDescription>
              <div className="mt-4">
                <Link to="/employee/incoming">
                  <Button variant="emerald" size="sm">
                    View Incoming Parcels
                  </Button>
                </Link>
              </div>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDeliveries.map((courier) => (
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

                      {courier.collectAmount > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between mt-3">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Coins className="h-4 w-4" />
                            Collect from Recipient:
                          </span>
                          <span className="font-black text-sm">
                            {formatCurrency(courier.collectAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E3DACC]">
                    <Button
                      variant="emerald"
                      onClick={() => handleOpenDeliveredModal(courier)}
                      loading={processingId === courier.id}
                      className="w-full gap-2 font-bold shadow-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mark Delivered & Settle</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Pickups (PICKED_UP) */}
        <TabsContent value="pickups">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-60" />
              <Skeleton className="h-60" />
            </div>
          ) : activePickups.length === 0 ? (
            <Empty>
              <EmptyIcon icon={Send} />
              <EmptyTitle>No parcels awaiting hub dispatch</EmptyTitle>
              <EmptyDescription>
                Claim pending pickups from your zone queue when new orders arrive.
              </EmptyDescription>
              <div className="mt-4">
                <Link to="/employee/pickups">
                  <Button variant="emerald" size="sm">
                    View Pending Pickups
                  </Button>
                </Link>
              </div>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePickups.map((courier) => (
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
                          Sender: {courier.senderName || "Sender"}
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

                      <div className="mt-3 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E3DACC] flex items-center justify-between text-[11px]">
                        <span className="text-[#7D7972]">Destination Hub:</span>
                        <span className="font-bold text-[#181716]">{courier.deliveryAddress?.zone} Hub</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E3DACC]">
                    <Button
                      variant="default"
                      onClick={() => handleSendTransit(courier.id, courier.trackingNumber)}
                      loading={processingId === courier.id}
                      className="w-full gap-2 font-bold bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28] shadow-xs"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send to Hub Transit</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Delivered History (DELIVERED) */}
        <TabsContent value="history" className="space-y-6">
          {/* History KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="border-[#E3DACC] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#7D7972] uppercase tracking-wider">Parcels Delivered by You</p>
                  <h3 className="text-2xl font-black text-[#181716] mt-1 font-mono-code">{deliveredHistory.length}</h3>
                  <p className="text-[11px] text-[#7D7972] mt-1">Confirmed doorstep drop-offs</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                  <Award className="h-6 w-6 text-[#7D7972]" />
                </div>
              </div>
            </Card>

            <Card className="border-[#E3DACC] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#7D7972] uppercase tracking-wider">COD Collected & Handed Over</p>
                  <h3 className="text-2xl font-black text-[#181716] mt-1 font-mono-code">{formatCurrency(totalCODCollected)}</h3>
                  <p className="text-[11px] text-[#7D7972] mt-1">Recipient cash payments settled</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                  <Coins className="h-6 w-6 text-[#7D7972]" />
                </div>
              </div>
            </Card>

            <Card className="border-[#E3DACC] bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#7D7972] uppercase tracking-wider">Delivery Success Status</p>
                  <h3 className="text-2xl font-black text-emerald-800 mt-1">100% Verified</h3>
                  <p className="text-[11px] text-[#7D7972] mt-1">All deliveries locked to customer recipient</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-emerald-800">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search Bar for History */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <InputGroup>
                <InputGroupAddon>
                  <Search className="h-4 w-4 text-[#7D7972]" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search delivered tracking, receiver..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value)
                    setHistoryPage(1)
                  }}
                />
                {historySearch && (
                  <InputGroupButton onClick={() => { setHistorySearch(""); setHistoryPage(1); }}>
                    <X className="h-3.5 w-3.5 text-[#7D7972]" />
                  </InputGroupButton>
                )}
              </InputGroup>
            </div>
            <span className="text-xs text-[#7D7972] font-medium hidden sm:inline">
              Showing {filteredHistory.length} delivered records
            </span>
          </div>

          {/* History Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
            </div>
          ) : paginatedHistory.length === 0 ? (
            <Empty>
              <EmptyIcon icon={History} />
              <EmptyTitle>No delivered parcels found</EmptyTitle>
              <EmptyDescription>
                {historySearch 
                  ? "No delivered records match your search criteria."
                  : "When you mark packages as delivered, they will be archived here as your personal track record."}
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedHistory.map((courier) => (
                <Card
                  key={courier.id}
                  className="border-[#E3DACC] bg-white p-5 flex flex-col justify-between hover:border-[#181716] transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#E3DACC] mb-3">
                      <span className="font-mono-code font-bold text-[#181716] text-sm">
                        {courier.trackingNumber}
                      </span>
                      <StatusBadge status={courier.status} />
                    </div>

                    <div className="space-y-2 text-xs">
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
                          {courier.deliveryAddress?.streetAddress}, {courier.deliveryAddress?.city} ({courier.deliveryAddress?.zone} Hub)
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E3DACC] grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#7D7972] block">Weight:</span>
                          <span className="text-[#181716] font-semibold">{courier.weightKg} kg</span>
                        </div>
                        <div>
                          <span className="text-[#7D7972] block">Delivery Fee:</span>
                          <span className="text-[#181716] font-semibold">{formatCurrency(courier.totalFee)}</span>
                        </div>
                      </div>

                      {courier.collectAmount > 0 && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between mt-2 text-xs">
                          <span className="font-semibold flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5" />
                            COD Settled:
                          </span>
                          <span className="font-black">
                            {formatCurrency(courier.collectAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E3DACC] flex items-center justify-between text-xs">
                    <span className="text-[#7D7972] text-[11px] flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#7D7972]" />
                      {formatDate(courier.createdAt)}
                    </span>
                    <Link
                      to={`/track?trackingNumber=${courier.trackingNumber}`}
                      target="_blank"
                      className="text-[#D96B27] hover:underline font-medium flex items-center gap-1 text-[11px]"
                    >
                      <span>Milestone Record</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination for History */}
          {totalHistoryPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7D7972]">
                Showing <span className="font-bold text-[#181716]">{(historyPage - 1) * historyPageSize + 1}</span> to{" "}
                <span className="font-bold text-[#181716]">{Math.min(historyPage * historyPageSize, filteredHistory.length)}</span> of{" "}
                <span className="font-bold text-[#181716]">{filteredHistory.length}</span> delivered parcels
              </span>

              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === historyPage}
                        onClick={() => setHistoryPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                      disabled={historyPage === totalHistoryPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mark Delivered Confirmation Dialog */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogHeader>
          <DialogTitle>Confirm Doorstep Delivery</DialogTitle>
          <DialogDescription>
            Confirm that parcel <span className="font-mono-code text-white font-bold">{selectedCourier?.trackingNumber}</span> has been received by <strong className="text-white">{selectedCourier?.receiverName}</strong>.
            {selectedCourier?.collectAmount > 0 && (
              <span className="block mt-2 text-emerald-400 font-semibold">
                You must collect {formatCurrency(selectedCourier.collectAmount)} Cash on Delivery. Marking delivered will update the payment status to PAID and archive it to your Delivered History.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeliveryModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="emerald" onClick={handleConfirmDelivered} loading={processingId === selectedCourier?.id}>
            Confirm Delivery & Archive
          </Button>
        </DialogFooter>
      </Dialog>
    </PortalLayout>
  )
}
