import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserLayout } from "../../components/UserLayout"
import { PageHeader } from "../../components/PageHeader"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Select } from "../../components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Alert, AlertDescription } from "../../components/ui/Alert"
import { BANGLADESH_ZONES, formatCurrency } from "../../lib/utils"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { 
  Package, 
  MapPin, 
  User, 
  Phone, 
  Coins, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock 
} from "lucide-react"

export function BookCourierPage() {
  const navigate = useNavigate()

  const defaultValues = {
    receiverName: "Rahim Chowdhury",
    receiverPhone: "01712345678",
    senderStreet: "House 18, Road 7, Block D, Dhanmondi",
    senderCity: "Dhaka",
    senderZone: "Dhaka",
    senderPostal: "1205",
    receiverStreet: "Plot 42, GEC Circle, Nasirabad",
    receiverCity: "Chittagong",
    receiverZone: "Chittagong",
    receiverPostal: "4000",
    weightKg: "2.5",
    collectAmount: "1200",
  }

  const [formData, setFormData] = useState(defaultValues)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Dynamic calculation based strictly on user input
  const parsedWeight = parseFloat(formData.weightKg)
  const hasWeight = !isNaN(parsedWeight) && parsedWeight > 0
  const weight = hasWeight ? parsedWeight : 0
  const baseFee = 60.0
  const weightRate = 25.0
  const calculatedFee = hasWeight ? baseFee + weight * weightRate : 0

  const parsedCod = parseFloat(formData.collectAmount)
  const codAmount = !isNaN(parsedCod) && parsedCod > 0 ? parsedCod : 0

  const hasZones = Boolean(formData.senderZone && formData.receiverZone)
  const isSameZone = hasZones && formData.senderZone === formData.receiverZone

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.senderZone || !formData.receiverZone) {
      setError("Please select both pickup and destination zones.")
      return
    }

    if (!formData.receiverName.trim() || !formData.receiverPhone.trim()) {
      setError("Please provide complete recipient details.")
      return
    }

    if (!formData.senderStreet.trim() || !formData.receiverStreet.trim()) {
      setError("Please provide complete street addresses.")
      return
    }

    if (!hasWeight) {
      setError("Please specify a valid package weight greater than zero.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...formData,
        weightKg: weight,
        collectAmount: codAmount,
      }

      const res = await api.bookCourier(payload)
      if (res && res.success && res.data) {
        toast.success(`Courier booked! Tracking code: ${res.data.trackingNumber}`)
        navigate(`/user/invoice/${res.data.id}`)
      } else {
        setError(res?.message || "Failed to book courier.")
      }
    } catch (err) {
      setError(err.message || "Failed to book courier.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <PageHeader
        title="Book a New Parcel"
        description="Fill in pickup and delivery details. Our local hub agent will be dispatched for collection."
        badge="Instant Booking"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(defaultValues)}
              className="text-xs border-[#E3DACC] bg-white text-[#4A4744] hover:text-[#181716] hover:bg-[#F0EEE6]"
            >
              Reset Default
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setFormData({
                  receiverName: "",
                  receiverPhone: "",
                  senderStreet: "",
                  senderCity: "",
                  senderZone: "",
                  senderPostal: "",
                  receiverStreet: "",
                  receiverCity: "",
                  receiverZone: "",
                  receiverPostal: "",
                  weightKg: "",
                  collectAmount: "",
                })
              }
              className="text-xs text-[#7D7972] hover:text-rose-700"
            >
              Clear
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Fields (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Sender / Pickup Address */}
            <Card className="border-[#E3DACC] bg-white shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                    <MapPin className="h-4 w-4 text-[#7D7972]" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-[#181716]">1. Pickup Address (Sender)</CardTitle>
                    <CardDescription className="text-[#7D7972]">Where our agent will collect the package</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="senderStreet">Street Address / House / Road</Label>
                  <Input
                    id="senderStreet"
                    name="senderStreet"
                    placeholder="e.g. House 42, Road 11, Block D, Banani"
                    value={formData.senderStreet}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="senderZone">Pickup Zone</Label>
                    <Select
                      id="senderZone"
                      name="senderZone"
                      value={formData.senderZone}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Pickup Zone...</option>
                      {BANGLADESH_ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="senderCity">City</Label>
                    <Input
                      id="senderCity"
                      name="senderCity"
                      placeholder="e.g. Dhaka"
                      value={formData.senderCity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="senderPostal">Postal Code</Label>
                    <Input
                      id="senderPostal"
                      name="senderPostal"
                      placeholder="e.g. 1212"
                      value={formData.senderPostal}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Recipient Details */}
            <Card className="border-[#E3DACC] bg-white shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                    <User className="h-4 w-4 text-[#7D7972]" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-[#181716]">2. Recipient Information & Address</CardTitle>
                    <CardDescription className="text-[#7D7972]">Who and where this parcel will be delivered</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiverName">Recipient Full Name</Label>
                    <Input
                      id="receiverName"
                      name="receiverName"
                      placeholder="e.g. Nusrat Jahan"
                      value={formData.receiverName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="receiverPhone">Recipient Phone Number</Label>
                    <Input
                      id="receiverPhone"
                      name="receiverPhone"
                      type="tel"
                      placeholder="+8801900000000"
                      value={formData.receiverPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="receiverStreet">Delivery Street Address</Label>
                  <Input
                    id="receiverStreet"
                    name="receiverStreet"
                    placeholder="e.g. 14 Nasirabad Housing Society, GEC"
                    value={formData.receiverStreet}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiverZone">Destination Zone</Label>
                    <Select
                      id="receiverZone"
                      name="receiverZone"
                      value={formData.receiverZone}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Destination Zone...</option>
                      {BANGLADESH_ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="receiverCity">City</Label>
                    <Input
                      id="receiverCity"
                      name="receiverCity"
                      placeholder="e.g. Chattogram"
                      value={formData.receiverCity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="receiverPostal">Postal Code</Label>
                    <Input
                      id="receiverPostal"
                      name="receiverPostal"
                      placeholder="e.g. 4000"
                      value={formData.receiverPostal}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Package Specifications & Cash-on-Delivery */}
            <Card className="border-[#E3DACC] bg-white shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716]">
                    <Package className="h-4 w-4 text-[#7D7972]" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-[#181716]">3. Package Specifications & Cash on Delivery</CardTitle>
                    <CardDescription className="text-[#7D7972]">Weight and optional COD collection amount</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <Label htmlFor="weightKg">Package Weight (KG)</Label>
                      <span className="text-xs text-[#7D7972] font-semibold">৳25 / kg rate</span>
                    </div>
                    <div className="relative">
                      <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                      <Input
                        id="weightKg"
                        name="weightKg"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        placeholder="Enter weight in kg (e.g. 1.5)"
                        value={formData.weightKg}
                        onChange={handleChange}
                        required
                        className="pl-10 text-[#181716] font-bold"
                      />
                    </div>
                    <p className="text-[11px] text-[#7D7972]">
                      Standard base fare includes first kg coverage.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <Label htmlFor="collectAmount">COD Amount to Collect (BDT)</Label>
                      <span className="text-xs text-emerald-800 font-semibold">0% COD fee</span>
                    </div>
                    <div className="relative">
                      <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                      <Input
                        id="collectAmount"
                        name="collectAmount"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0 for prepaid"
                        value={formData.collectAmount}
                        onChange={handleChange}
                        className="pl-10 text-emerald-800 font-bold"
                      />
                    </div>
                    <p className="text-[11px] text-[#7D7972]">
                      Enter 0 if the recipient has already paid online.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky Summary Card (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <Card className="border-[#E3DACC] bg-white shadow-xs p-6">
              <h3 className="text-lg font-bold text-[#181716] mb-4 pb-3 border-b border-[#E3DACC] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#7D7972]" />
                Shipping Cost Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#4A4744]">
                  <span>Base Courier Charge:</span>
                  <span className="font-semibold text-[#181716]">
                    {hasWeight ? formatCurrency(baseFee) : "—"}
                  </span>
                </div>

                <div className="flex justify-between text-[#4A4744]">
                  <span>Weight Surcharge {hasWeight ? `(${weight} kg × ৳25)` : ""}:</span>
                  <span className="font-semibold text-[#181716]">
                    {hasWeight ? formatCurrency(weight * weightRate) : "—"}
                  </span>
                </div>

                <div className="flex justify-between text-[#4A4744]">
                  <span>Transit Route:</span>
                  <span className="font-semibold text-[#181716]">
                    {hasZones ? `${formData.senderZone} → ${formData.receiverZone}` : "—"}
                  </span>
                </div>

                <div className="flex justify-between text-[#4A4744]">
                  <span>Transit Estimate:</span>
                  <span className="font-semibold text-[#181716] flex items-center gap-1">
                    {hasZones ? (
                      <>
                        <Clock className="h-3 w-3 text-[#7D7972]" />
                        {isSameZone ? "Same-Day / 24 Hours" : "24 - 48 Hours"}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>

                {codAmount > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex justify-between items-center text-emerald-800">
                    <span className="font-semibold">COD to Collect:</span>
                    <span className="font-bold text-sm">{formatCurrency(codAmount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#E3DACC] flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-[#181716]">Total Delivery Fee:</span>
                    <p className="text-[10px] text-[#7D7972]">
                      {hasWeight ? "Includes tracking & handling" : "Enter weight to calculate"}
                    </p>
                  </div>
                  <span className="text-2xl font-black text-[#181716]">
                    {hasWeight ? formatCurrency(calculatedFee) : "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  loading={loading}
                  className="w-full gap-2 font-bold bg-[#181716] text-[#FAF9F5] hover:bg-[#2C2A28] shadow-xs"
                >
                  <span>Confirm & Book Parcel</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-[11px] text-[#7D7972] text-center leading-relaxed">
                  By clicking book, you confirm the parcel weight and details are accurate.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </UserLayout>
  )
}
