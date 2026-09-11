import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { UserLayout } from "../../components/UserLayout"
import { Button } from "../../components/ui/Button"
import { BrandLogo } from "../../components/BrandLogo"
import { api } from "../../lib/api"
import { formatCurrency, formatDate } from "../../lib/utils"
import { 
  Printer, 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  ShieldCheck 
} from "lucide-react"

export function InvoicePage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      const res = await api.getInvoice(id)
      if (res && res.success) {
        setData(res.data)
      }
    } catch (err) {
      console.error("Failed to load invoice", err)
    } finally {
      setLoading(false)
    }
  }

  const courier = data?.courier
  const transaction = data?.transaction

  if (loading) {
    return (
      <UserLayout>
        <div className="py-20 text-center text-slate-400">Loading invoice data...</div>
      </UserLayout>
    )
  }

  if (!courier) {
    return (
      <PortalLayout>
        <div className="py-20 text-center space-y-4">
          <p className="text-white text-lg font-bold">Invoice not found</p>
          <Link to="/user/history">
            <Button variant="outline">Back to History</Button>
          </Link>
        </div>
      </PortalLayout>
    )
  }

  const weight = courier.weightKg || 1
  const baseFee = 60.0
  const weightCharge = courier.totalFee - baseFee

  return (
    <UserLayout>
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link to="/user/history">
          <Button variant="outline" size="sm" className="gap-2 border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shipments</span>
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Link to={`/track?trackingNumber=${courier.trackingNumber}`}>
            <Button variant="ghost" size="sm" className="text-[#D96B27] hover:underline">
              Track Live
            </Button>
          </Link>
          <Button variant="default" size="sm" onClick={() => window.print()} className="gap-2 font-semibold bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28] shadow-xs">
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </Button>
        </div>
      </div>

      {/* Invoice Document (Warm Card Container for print contrast) */}
      <div className="invoice-card max-w-4xl mx-auto bg-white text-[#181716] rounded-3xl p-8 sm:p-12 shadow-md border border-[#E3DACC]">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[#E3DACC]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo size="lg" showSubtitle={true} />
            </div>
            <p className="text-xs text-[#7D7972] mt-3">
              National Delivery Hub Operations<br />
              Dhaka, Bangladesh • support@dropify.com
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F0EEE6] text-[#181716] border border-[#E3DACC] mb-2">
              Official Waybill & Receipt
            </span>
            <h1 className="text-xl font-black font-mono-code text-[#181716]">
              #{courier.trackingNumber}
            </h1>
            <p className="text-xs text-[#7D7972] mt-1">
              Issue Date: {formatDate(courier.createdAt)}
            </p>
          </div>
        </div>

        {/* Sender & Receiver Address Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-[#E3DACC] text-sm">
          {/* Sender */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D7972]">
              Sender (Pickup Origin)
            </span>
            <h4 className="font-bold text-[#181716] text-base">{courier.senderName || "Sender"}</h4>
            <p className="text-[#4A4744] text-xs">
              {courier.pickupAddress?.streetAddress}<br />
              {courier.pickupAddress?.city} - {courier.pickupAddress?.postalCode}<br />
              <strong className="text-[#181716]">Hub Zone: {courier.pickupAddress?.zone}</strong>
            </p>
            <p className="text-xs text-[#7D7972]">Contact: {courier.senderPhone || "N/A"}</p>
          </div>

          {/* Receiver */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D7972]">
              Recipient (Destination)
            </span>
            <h4 className="font-bold text-[#181716] text-base">{courier.receiverName}</h4>
            <p className="text-[#4A4744] text-xs">
              {courier.deliveryAddress?.streetAddress}<br />
              {courier.deliveryAddress?.city} - {courier.deliveryAddress?.postalCode}<br />
              <strong className="text-[#181716]">Hub Zone: {courier.deliveryAddress?.zone}</strong>
            </p>
            <p className="text-xs text-[#7D7972]">Contact: {courier.receiverPhone}</p>
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div className="py-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E3DACC] text-[11px] uppercase font-bold tracking-wider text-[#7D7972]">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Weight / Rate</th>
                <th className="pb-3 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DACC]">
              <tr>
                <td className="py-4">
                  <p className="font-bold text-[#181716]">Standard Base Delivery Charge</p>
                  <p className="text-xs text-[#7D7972]">Includes transit handling and live tracking</p>
                </td>
                <td className="py-4 text-center text-[#4A4744]">Base Fare</td>
                <td className="py-4 text-right font-semibold text-[#181716]">
                  {formatCurrency(baseFee)}
                </td>
              </tr>
              <tr>
                <td className="py-4">
                  <p className="font-bold text-[#181716]">Weight Charge</p>
                  <p className="text-xs text-[#7D7972]">{weight} kg standard rate surcharge</p>
                </td>
                <td className="py-4 text-center text-[#4A4744]">{weight} kg × ৳25/kg</td>
                <td className="py-4 text-right font-semibold text-[#181716]">
                  {formatCurrency(weightCharge > 0 ? weightCharge : 0)}
                </td>
              </tr>
              {courier.collectAmount > 0 && (
                <tr className="bg-emerald-50/70">
                  <td className="py-4 px-2">
                    <p className="font-bold text-emerald-900">Cash on Delivery (COD) Amount</p>
                    <p className="text-xs text-emerald-800">To be collected from recipient upon delivery</p>
                  </td>
                  <td className="py-4 text-center text-emerald-800">COD Collection</td>
                  <td className="py-4 px-2 text-right font-bold text-emerald-800">
                    {formatCurrency(courier.collectAmount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals and Payment Status */}
        <div className="pt-6 border-t border-[#E3DACC] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D7972] block mb-1">
              Payment Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  transaction?.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {transaction?.paymentStatus === "PAID" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {transaction?.paymentStatus || "PENDING"}
              </span>
              <span className="text-xs text-[#7D7972]">Method: Cash on Delivery</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#7D7972] font-semibold uppercase tracking-wider">
              Total Delivery Fee
            </span>
            <h3 className="text-3xl font-black text-[#181716]">
              {formatCurrency(courier.totalFee)}
            </h3>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-6 border-t border-[#E3DACC] text-center text-[11px] text-[#7D7972]">
          <p>Thank you for choosing Dropify Express Logistics. For inquiries, visit dropify.com or call our 24/7 hotline.</p>
        </div>
      </div>
    </UserLayout>
  )
}
