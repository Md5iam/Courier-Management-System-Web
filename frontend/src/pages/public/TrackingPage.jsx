import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Navbar } from "../../components/Navbar"
import { Footer } from "../../components/Footer"
import { StatusBadge } from "../../components/StatusBadge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardHeader, CardTitle } from "../../components/ui/Card"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/Alert"
import { api } from "../../lib/api"
import { formatCurrency, formatDate, STATUS_CONFIG } from "../../lib/utils"
import { 
  Search, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Copy, 
  Check
} from "lucide-react"

const TIMELINE_STEPS = [
  { status: "PENDING", title: "Order Booked", desc: "Order details received & registered" },
  { status: "PICKED_UP", title: "Picked Up", desc: "Agent collected parcel from pickup address" },
  { status: "IN_TRANSIT", title: "In Transit", desc: "Package sorted and moving between hubs" },
  { status: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Courier on route to destination" },
  { status: "DELIVERED", title: "Delivered", desc: "Package delivered & signed for" },
]

export function TrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTracking = searchParams.get("trackingNumber") || ""
  
  const [trackingNumber, setTrackingNumber] = useState(initialTracking)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [courierData, setCourierData] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialTracking) {
      handleSearch(initialTracking)
    }
  }, [initialTracking])

  const handleSearch = async (queryNumber) => {
    const num = (queryNumber || trackingNumber).trim()
    if (!num) return

    setLoading(true)
    setError(null)
    setCourierData(null)

    try {
      const res = await api.track(num)
      if (res && res.success && res.data) {
        setCourierData(res.data)
        setSearchParams({ trackingNumber: num })
      } else {
        setError(res?.message || "Courier parcel not found.")
      }
    } catch (err) {
      setError(err.message || "No parcel found matching this tracking code.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const courier = courierData?.courier
  const transaction = courierData?.transaction

  const currentStepIndex = courier ? (STATUS_CONFIG[courier.status]?.stepIndex ?? 0) : 0
  const isCancelled = courier?.status === "CANCELLED"

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col selection:bg-[#E3DACC] selection:text-[#181716]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Search header card */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#181716] tracking-tight">
            Track Your Shipment
          </h1>
          <p className="text-sm text-[#4A4744] mt-2">
            Real-time status updates, hub movements, and delivery milestones.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white border border-[#E3DACC] shadow-lg"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7D7972]" />
              <Input
                type="text"
                placeholder="Enter Tracking Number (e.g. TRK-ABC12345)..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="pl-12 h-12 bg-transparent border-0 text-[#181716] font-mono placeholder:text-[#7D7972] focus-visible:ring-0 focus-visible:border-0 shadow-none"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              loading={loading} 
              className="h-12 px-6 bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F5] font-bold"
            >
              Track Now
            </Button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Tracking Lookup Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tracking Details View */}
        {courier && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Overview Strip */}
            <Card className="p-6 border-[#E3DACC] bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-bold text-[#7D7972] tracking-wider">
                      Tracking Code
                    </span>
                    <StatusBadge status={courier.status} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#181716] font-mono tracking-wider mt-1">
                    {courier.trackingNumber}
                  </h2>
                  <p className="text-xs text-[#7D7972] mt-1">
                    Booked on {formatDate(courier.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 border-[#E3DACC] bg-white text-[#181716] hover:bg-[#F0EEE6]">
                    {copied ? <Check className="h-4 w-4 text-[#1C3F35]" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Link Copied!" : "Share Link"}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 border-[#E3DACC] bg-white text-[#181716] hover:bg-[#F0EEE6]">
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Timeline Stepper */}
            {!isCancelled ? (
              <Card className="p-6 sm:p-8 border-[#E3DACC] bg-white shadow-sm">
                <CardHeader className="p-0 pb-6 mb-6 border-b border-[#E3DACC]">
                  <CardTitle className="text-lg text-[#181716]">Shipment Progress</CardTitle>
                </CardHeader>

                {/* Stepper (Desktop Horizontal) */}
                <div className="hidden md:grid grid-cols-5 gap-4 relative">
                  {/* Connecting line */}
                  <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#E3DACC] -z-0" />
                  <div
                    className="absolute top-5 left-8 h-0.5 bg-[#C85A17] transition-all duration-500 -z-0"
                    style={{
                      width: `${(Math.min(currentStepIndex, 4) / 4) * 85}%`,
                    }}
                  />

                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex
                    const isCurrent = idx === currentStepIndex
                    const isUpcoming = idx > currentStepIndex

                    return (
                      <div key={step.status} className="relative z-10 flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isCompleted
                              ? "bg-[#1C3F35] border-[#1C3F35] text-[#FAF9F5] shadow-sm"
                              : isCurrent
                              ? "bg-white border-[#C85A17] text-[#C85A17] ring-4 ring-[#FAF0E8] shadow-sm"
                              : "bg-[#FAF9F5] border-[#E3DACC] text-[#7D7972]"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        <h4
                          className={`text-xs font-bold mt-3 ${
                            isCurrent ? "text-[#C85A17]" : isCompleted ? "text-[#181716]" : "text-[#7D7972]"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-[#7D7972] mt-1 leading-snug max-w-[120px]">
                          {step.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Mobile Stepper (Vertical) */}
                <div className="md:hidden space-y-6 relative pl-6 border-l-2 border-[#E3DACC]">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex
                    const isCurrent = idx === currentStepIndex

                    return (
                      <div key={step.status} className="relative">
                        <div
                          className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? "bg-[#1C3F35] border-[#1C3F35] text-[#FAF9F5]"
                              : isCurrent
                              ? "bg-white border-[#C85A17] text-[#C85A17] ring-2 ring-[#FAF0E8]"
                              : "bg-[#FAF9F5] border-[#E3DACC] text-[#7D7972]"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <h4 className={`text-sm font-bold ${isCurrent ? "text-[#C85A17]" : "text-[#7D7972]"}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-[#7D7972] mt-0.5">{step.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>This Shipment Has Been Cancelled</AlertTitle>
                <AlertDescription>
                  This parcel booking was cancelled and is no longer moving through the network.
                </AlertDescription>
              </Alert>
            )}

            {/* Sender, Receiver & Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Info Card */}
              <Card className="p-6 border-[#E3DACC] bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E3DACC]">
                  <MapPin className="h-5 w-5 text-[#181716]" />
                  <h3 className="text-base font-bold text-[#181716]">Pickup Details (Sender)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-[#7D7972] uppercase font-semibold">Sender Name</span>
                    <p className="font-semibold text-[#181716]">{courier.senderName || "Valued Sender"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#7D7972] uppercase font-semibold">Contact</span>
                    <p className="text-[#4A4744]">{courier.senderPhone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#7D7972] uppercase font-semibold">Pickup Address</span>
                    <p className="text-[#4A4744]">
                      {courier.pickupAddress?.streetAddress}, {courier.pickupAddress?.city}
                    </p>
                    <p className="text-xs text-[#D96B27] font-semibold mt-0.5">
                      Hub Zone: {courier.pickupAddress?.zone}
                    </p>
                  </div>
                  {courier.pickupEmployeeName && (
                    <div className="pt-2 border-t border-[#E3DACC]">
                      <span className="text-xs text-[#7D7972] uppercase font-semibold">Pickup Agent</span>
                      <p className="text-xs text-[#181716] font-medium">{courier.pickupEmployeeName}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Receiver Info Card */}
              <Card className="p-6 border-[#E3DACC] bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E3DACC]">
                  <Truck className="h-5 w-5 text-[#181716]" />
                  <h3 className="text-base font-bold text-[#181716]">Delivery Details (Recipient)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-[#7D7972] uppercase font-semibold">Receiver Name</span>
                    <p className="font-semibold text-[#181716]">{courier.receiverName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#7D7972] uppercase font-semibold">Contact</span>
                    <p className="text-[#4A4744]">{courier.receiverPhone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#7D7972] uppercase font-semibold">Delivery Address</span>
                    <p className="text-[#4A4744]">
                      {courier.deliveryAddress?.streetAddress}, {courier.deliveryAddress?.city}
                    </p>
                    <p className="text-xs text-[#D96B27] font-semibold mt-0.5">
                      Destination Zone: {courier.deliveryAddress?.zone}
                    </p>
                  </div>
                  {courier.deliveryEmployeeName && (
                    <div className="pt-2 border-t border-[#E3DACC]">
                      <span className="text-xs text-[#7D7972] uppercase font-semibold">Delivery Agent</span>
                      <p className="text-xs text-[#181716] font-medium">{courier.deliveryEmployeeName}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Package & Billing Summary Card */}
            <Card className="p-6 border-[#E3DACC] bg-white shadow-sm">
              <h3 className="text-base font-bold text-[#181716] mb-4 pb-3 border-b border-[#E3DACC]">
                Package & Ledger Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#E3DACC]">
                  <span className="text-xs text-[#7D7972]">Total Weight</span>
                  <p className="text-lg font-bold text-[#181716] mt-1">{courier.weightKg} kg</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#E3DACC]">
                  <span className="text-xs text-[#7D7972]">Delivery Fee</span>
                  <p className="text-lg font-bold text-[#181716] mt-1">{formatCurrency(courier.totalFee)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#E3DACC]">
                  <span className="text-xs text-[#7D7972]">COD Collect Amount</span>
                  <p className="text-lg font-bold text-[#181716] mt-1">{formatCurrency(courier.collectAmount)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#E3DACC]">
                  <span className="text-xs text-[#7D7972]">Payment Status</span>
                  <p className="text-sm font-bold text-[#181716] mt-1">
                    {transaction?.paymentStatus || "PENDING"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
