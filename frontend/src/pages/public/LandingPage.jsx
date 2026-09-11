import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Navbar } from "../../components/Navbar"
import { Footer } from "../../components/Footer"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card } from "../../components/ui/Card"
import { BANGLADESH_ZONES, formatCurrency } from "../../lib/utils"
import { api } from "../../lib/api"
import { 
  Search, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Calculator, 
  Coins
} from "lucide-react"

export function LandingPage() {
  const navigate = useNavigate()
  const [trackingInput, setTrackingInput] = useState("")

  // Rate calculator state
  const [calcWeight, setCalcWeight] = useState("1.5")
  const [calcPickupZone, setCalcPickupZone] = useState("Dhaka North")
  const [calcDeliveryZone, setCalcDeliveryZone] = useState("Chattogram")
  const [calcResult, setCalcResult] = useState({ baseFee: 60, ratePerKg: 25, totalFee: 97.5 })
  const [calculating, setCalculating] = useState(false)

  const handleTrack = (e) => {
    e.preventDefault()
    if (!trackingInput.trim()) return
    navigate(`/track?trackingNumber=${encodeURIComponent(trackingInput.trim())}`)
  }

  const handleCalculateRate = async () => {
    setCalculating(true)
    try {
      const weight = parseFloat(calcWeight) || 1.0
      const res = await api.calculateRate(weight)
      if (res && res.data) {
        setCalcResult(res.data)
      }
    } catch {
      const weight = parseFloat(calcWeight) || 1.0
      setCalcResult({ baseFee: 60, ratePerKg: 25, totalFee: 60 + weight * 25 })
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col selection:bg-[#E3DACC] selection:text-[#181716]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-[#E3DACC]">
        {/* Ambient Warm Lights */}
        <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#E3DACC]/30 blur-[140px]" />
        <div className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-[#F0EEE6] blur-[120px]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E3DACC] bg-[#F0EEE6] text-[#181716] text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="h-2 w-2 rounded-full bg-[#C85A17] animate-ping" />
            Nationwide Smart Parcel Logistics
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#181716] max-w-4xl mx-auto leading-[1.1]">
            Next-Gen Express Courier &{" "}
            <span className="text-[#C85A17]">
              Live Transit Network
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#4A4744] max-w-2xl mx-auto font-normal leading-relaxed">
            Fast, secure doorstep delivery across all divisions in Bangladesh. Real-time status tracking, automated hub routing, and instant Cash on Delivery settlement.
          </p>

          {/* Quick Tracking Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleTrack} className="p-2 rounded-2xl bg-white border border-[#E3DACC] shadow-lg flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7D7972]" />
                <Input
                  type="text"
                  placeholder="Enter Tracking Number (e.g. TRK-ABC12345)..."
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-0 text-[#181716] placeholder:text-[#7D7972] focus-visible:ring-0 focus-visible:border-0 shadow-none font-mono"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 gap-2 bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F5] font-bold">
                <span>Track Parcel</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Quick Action Links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#7D7972]">
            <Link to="/register" className="text-[#181716] hover:text-[#C85A17] font-semibold flex items-center gap-1 transition-colors">
              Create Customer Account <ArrowRight className="h-3 w-3" />
            </Link>
            <span>•</span>
            <Link to="/employee/register" className="text-[#181716] hover:text-[#C85A17] font-semibold flex items-center gap-1 transition-colors">
              Join as Hub Delivery Agent <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-b border-[#E3DACC] bg-[#F0EEE6] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#181716]">50,000+</p>
              <p className="text-xs uppercase font-semibold text-[#7D7972] tracking-wider mt-1">Parcels Delivered</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#181716]">9 Zones</p>
              <p className="text-xs uppercase font-semibold text-[#7D7972] tracking-wider mt-1">Division Coverage</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#181716]">99.4%</p>
              <p className="text-xs uppercase font-semibold text-[#7D7972] tracking-wider mt-1">On-Time Arrival</p>
            </div>
            <div className="p-4">
              <p className="text-3xl sm:text-4xl font-black text-[#181716]">24/7</p>
              <p className="text-xs uppercase font-semibold text-[#7D7972] tracking-wider mt-1">Live Tracking & Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Rate Calculator & Features */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Key Features */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C85A17]">
                Built for High Reliability
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#181716] mt-2 tracking-tight">
                Modern Logistics Designed for You
              </h2>
              <p className="text-[#4A4744] text-sm mt-3 leading-relaxed">
                Whether sending an urgent document or managing regular e-commerce shipments, Dropify ensures speed, real-time visibility, and transparent pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 bg-white border border-[#E3DACC] hover:border-[#D96B27]/40 shadow-sm transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716] mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-[#181716] text-sm">Rapid Doorstep Pickup</h4>
                <p className="text-xs text-[#4A4744] mt-1">Local agents dispatched swiftly to collect directly from your location.</p>
              </Card>

              <Card className="p-4 bg-white border border-[#E3DACC] hover:border-[#D96B27]/40 shadow-sm transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716] mb-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-[#181716] text-sm">Real-time Hub Tracking</h4>
                <p className="text-xs text-[#4A4744] mt-1">Full 5-step lifecycle transparency from pickup to final recipient sign-off.</p>
              </Card>

              <Card className="p-4 bg-white border border-[#E3DACC] hover:border-[#D96B27]/40 shadow-sm transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716] mb-3">
                  <Coins className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-[#181716] text-sm">Cash on Delivery (COD)</h4>
                <p className="text-xs text-[#4A4744] mt-1">Safe money collection at doorstep with digital ledger recording.</p>
              </Card>

              <Card className="p-4 bg-white border border-[#E3DACC] hover:border-[#D96B27]/40 shadow-sm transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#F0EEE6] border border-[#E3DACC] flex items-center justify-center text-[#181716] mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-[#181716] text-sm">Secure Handling</h4>
                <p className="text-xs text-[#4A4744] mt-1">Verified delivery agents and automated digital receipt verification.</p>
              </Card>
            </div>
          </div>

          {/* Right Column: Interactive Rate Calculator */}
          <div className="lg:col-span-6">
            <Card className="border border-[#E3DACC] bg-white p-6 sm:p-8 shadow-lg relative">
              <div className="flex items-center justify-between pb-6 border-b border-[#E3DACC] mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#181716] flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#C85A17]" />
                    Instant Rate Calculator
                  </h3>
                  <p className="text-xs text-[#7D7972] mt-1">Check transparent shipping rates immediately</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F0EEE6] text-[#181716] border border-[#E3DACC]">
                  Standard Rate
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4A4744] uppercase tracking-wider mb-1 block">
                      Pickup Zone
                    </label>
                    <select
                      value={calcPickupZone}
                      onChange={(e) => setCalcPickupZone(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#FAF9F5] border border-[#E3DACC] px-3 text-sm text-[#181716] focus:outline-none focus:border-[#181716]"
                    >
                      {BANGLADESH_ZONES.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4A4744] uppercase tracking-wider mb-1 block">
                      Delivery Zone
                    </label>
                    <select
                      value={calcDeliveryZone}
                      onChange={(e) => setCalcDeliveryZone(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#FAF9F5] border border-[#E3DACC] px-3 text-sm text-[#181716] focus:outline-none focus:border-[#181716]"
                    >
                      {BANGLADESH_ZONES.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#4A4744] uppercase tracking-wider">
                      Package Weight (kg)
                    </label>
                    <span className="text-xs font-bold text-[#181716]">{calcWeight} kg</span>
                  </div>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="font-semibold text-[#181716] bg-[#FAF9F5] border-[#E3DACC]"
                  />
                </div>

                <Button
                  onClick={handleCalculateRate}
                  loading={calculating}
                  variant="outline"
                  className="w-full border-[#E3DACC] bg-white text-[#181716] hover:bg-[#F0EEE6]"
                >
                  Recalculate Estimate
                </Button>

                {/* Estimate Result Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#F0EEE6] border border-[#E3DACC] space-y-2">
                  <div className="flex justify-between text-xs text-[#4A4744]">
                    <span>Base Fare:</span>
                    <span className="font-semibold text-[#181716]">{formatCurrency(calcResult.baseFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#4A4744]">
                    <span>Weight Fee ({calcWeight} kg × ৳25):</span>
                    <span className="font-semibold text-[#181716]">{formatCurrency(calcWeight * 25)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E3DACC] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#181716]">Estimated Total:</span>
                    <span className="text-2xl font-black text-[#181716]">
                      {formatCurrency(calcResult.totalFee)}
                    </span>
                  </div>
                </div>

                <Link to="/user/book" className="block w-full pt-2">
                  <Button className="w-full gap-2 bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F5] font-bold">
                    <span>Book Shipment Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 border-t border-[#E3DACC] bg-[#F0EEE6]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C85A17]">
            Seamless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#181716] mt-2 tracking-tight">
            How Dropify Delivers in 3 Simple Steps
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <Card className="p-6 text-left border-[#E3DACC] bg-white shadow-sm">
              <div className="text-4xl font-black text-[#E3DACC] mb-4">01</div>
              <h4 className="text-lg font-bold text-[#181716] mb-2">Book Online in Seconds</h4>
              <p className="text-sm text-[#4A4744] leading-relaxed">
                Enter sender and receiver addresses, specify weight, and choose Cash-on-Delivery amount. Receive a unique tracking ID instantly.
              </p>
            </Card>

            <Card className="p-6 text-left border-[#E3DACC] bg-white shadow-sm">
              <div className="text-4xl font-black text-[#E3DACC] mb-4">02</div>
              <h4 className="text-lg font-bold text-[#181716] mb-2">Agent Pickup & Hub Dispatch</h4>
              <p className="text-sm text-[#4A4744] leading-relaxed">
                A verified courier agent in your zone collects the package and dispatches it through the transit hub directly to the destination zone.
              </p>
            </Card>

            <Card className="p-6 text-left border-[#E3DACC] bg-white shadow-sm">
              <div className="text-4xl font-black text-[#E3DACC] mb-4">03</div>
              <h4 className="text-lg font-bold text-[#181716] mb-2">Doorstep Delivery & Payment</h4>
              <p className="text-sm text-[#4A4744] leading-relaxed">
                The parcel is delivered to the recipient with SMS notification. Cash on Delivery is collected and reconciled to your account automatically.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl border border-[#E3DACC] bg-[#F0EEE6] p-10 sm:p-16 relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-[#181716] tracking-tight">
              Ready to Send Your First Parcel?
            </h2>
            <p className="mt-4 text-[#4A4744] text-sm sm:text-base leading-relaxed">
              Join thousands of customers and businesses shipping with confidence across Bangladesh today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto px-8 font-bold bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F5]">
                  Open Free Account
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 font-bold border-[#E3DACC] bg-white text-[#181716] hover:bg-[#FAF9F5]">
                  Track Existing Parcel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
