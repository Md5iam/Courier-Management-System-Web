import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { UserLayout } from "../../components/UserLayout"
import { PageHeader } from "../../components/PageHeader"
import { StatusBadge } from "../../components/StatusBadge"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from "../../components/ui/Empty"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../../components/ui/InputGroup"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "../../components/ui/Pagination"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table"
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
  Search, 
  FileText, 
  ExternalLink, 
  XCircle, 
  PlusCircle, 
  Package,
  X 
} from "lucide-react"

export function ShipmentHistoryPage() {
  const [couriers, setCouriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 8
  
  // Cancel dialog state
  const [selectedCourier, setSelectedCourier] = useState(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadCouriers()
  }, [])

  const loadCouriers = async () => {
    try {
      setLoading(true)
      const res = await api.getUserCouriers()
      if (res && res.success) {
        setCouriers(res.data || [])
      }
    } catch (err) {
      toast.error("Failed to load shipment history: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = (courier) => {
    setSelectedCourier(courier)
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedCourier) return
    setCancelling(true)

    try {
      const res = await api.cancelCourier(selectedCourier.id)
      if (res && res.success) {
        toast.success("Shipment booking cancelled successfully.")
        setCancelModalOpen(false)
        loadCouriers()
      } else {
        toast.error(res?.message || "Could not cancel booking.")
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking.")
    } finally {
      setCancelling(false)
    }
  }

  // Filtered couriers
  const filteredCouriers = useMemo(() => {
    return couriers.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.deliveryAddress?.zone?.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === "ALL") return true
      if (statusFilter === "ACTIVE") {
        return ["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(c.status)
      }
      if (statusFilter === "DELIVERED") return c.status === "DELIVERED"
      if (statusFilter === "CANCELLED") return c.status === "CANCELLED"
      return true
    })
  }, [couriers, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredCouriers.length / pageSize))
  const paginatedCouriers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCouriers.slice(start, start + pageSize)
  }, [filteredCouriers, currentPage, pageSize])

  return (
    <UserLayout>
      <PageHeader
        title="Shipment History"
        description="Comprehensive directory of all your booked parcels and delivery receipts."
        badge="Shipments Ledger"
        actions={
          <Link to="/user/book">
            <Button variant="default" className="gap-2 bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28] shadow-xs">
              <PlusCircle className="h-4 w-4" />
              <span>Book Parcel</span>
            </Button>
          </Link>
        }
      />

      {/* Filter Chips & InputGroup Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "ACTIVE", "DELIVERED", "CANCELLED"].map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                statusFilter === filter
                  ? "bg-[#181716] border-[#181716] text-[#FAF9F5] shadow-xs"
                  : "bg-white border-[#E3DACC] text-[#4A4744] hover:text-[#181716] hover:bg-[#E8E6DC]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="w-full md:w-80">
          <InputGroup>
            <InputGroupAddon>
              <Search className="h-4 w-4 text-[#7D7972]" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by code, receiver, zone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            {searchTerm && (
              <InputGroupButton onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>
                <X className="h-3.5 w-3.5 text-[#7D7972]" />
              </InputGroupButton>
            )}
          </InputGroup>
        </div>
      </div>

      {/* Shipments Table */}
      <Card className="border-[#E3DACC] bg-white shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : paginatedCouriers.length === 0 ? (
            <div className="p-8">
              <Empty>
                <EmptyIcon icon={Package} />
                <EmptyTitle>No shipments found</EmptyTitle>
                <EmptyDescription>
                  {searchTerm || statusFilter !== "ALL"
                    ? "Try adjusting your search criteria or status filter."
                    : "You haven't booked any shipments yet."}
                </EmptyDescription>
                <EmptyActions>
                  <Link to="/user/book">
                    <Button variant="default" size="sm" className="gap-2 bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28]">
                      <PlusCircle className="h-4 w-4" />
                      <span>Book Shipment Now</span>
                    </Button>
                  </Link>
                </EmptyActions>
              </Empty>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E3DACC]">
                    <TableHead>Tracking Code</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Route (Pickup → Delivery)</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Delivery Fee</TableHead>
                    <TableHead>COD Collect</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCouriers.map((courier) => (
                    <TableRow key={courier.id} className="border-b border-[#E3DACC] hover:bg-[#FAF9F5]">
                      <TableCell className="font-mono-code font-bold text-[#181716]">
                        <Link
                          to={`/track?trackingNumber=${courier.trackingNumber}`}
                          className="hover:underline"
                        >
                          {courier.trackingNumber}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#181716]">{courier.receiverName}</span>
                          <span className="text-[10px] text-[#7D7972]">{courier.receiverPhone}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[#4A4744] font-medium">{courier.pickupAddress?.zone}</span>
                          <span className="text-[#7D7972]">→</span>
                          <span className="text-[#4A4744] font-medium">{courier.deliveryAddress?.zone}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-[#4A4744]">
                        {courier.weightKg} kg
                      </TableCell>

                      <TableCell className="font-semibold text-[#181716] text-xs">
                        {formatCurrency(courier.totalFee)}
                      </TableCell>

                      <TableCell className="font-semibold text-emerald-800 text-xs">
                        {courier.collectAmount > 0 ? formatCurrency(courier.collectAmount) : "—"}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={courier.status} />
                      </TableCell>

                      <TableCell className="text-xs text-[#7D7972]">
                        {formatDate(courier.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/user/invoice/${courier.id}`}>
                            <Button variant="ghost" size="icon" title="View & Print Invoice" className="text-[#7D7972] hover:text-[#181716]">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Link to={`/track?trackingNumber=${courier.trackingNumber}`}>
                            <Button variant="ghost" size="icon" title="Track Live" className="text-[#7D7972] hover:text-[#181716]">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>

                          {courier.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelClick(courier)}
                              title="Cancel Booking"
                              className="text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E3DACC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#7D7972]">
                Showing <span className="font-bold text-[#181716]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-[#181716]">{Math.min(currentPage * pageSize, filteredCouriers.length)}</span> of{" "}
                <span className="font-bold text-[#181716]">{filteredCouriers.length}</span> shipments
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

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogHeader>
          <DialogTitle>Cancel Shipment Booking?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel courier <span className="font-mono-code text-white font-bold">{selectedCourier?.trackingNumber}</span>? 
            This booking has not yet been picked up and can be voided without charges.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
            Keep Shipment
          </Button>
          <Button variant="destructive" onClick={handleConfirmCancel} loading={cancelling}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </Dialog>
    </UserLayout>
  )
}
