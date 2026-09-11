import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../../lib/api"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Alert, AlertDescription } from "../../components/ui/Alert"
import { BrandLogo } from "../../components/BrandLogo"
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from "lucide-react"

export function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.register(formData)
      if (res && res.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        setError(res?.message || "Registration failed")
      }
    } catch (err) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#E3DACC] selection:text-[#181716]">
      {/* Ambient warm glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#E3DACC]/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#F0EEE6] blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <Link to="/" className="inline-flex items-center group">
            <BrandLogo size="lg" showSubtitle={false} />
          </Link>
          <p className="text-xs uppercase font-bold tracking-widest text-[#7D7972] mt-2">
            Create Customer Account
          </p>
        </div>

        <Card className="border-[#E3DACC] bg-white shadow-xl p-2 sm:p-4">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-black text-[#181716]">Join Dropify</CardTitle>
            <CardDescription className="text-[#4A4744]">
              Ship parcels across Bangladesh with real-time tracking & COD support
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#181716]">Account Created Successfully!</h3>
                <p className="text-xs text-[#4A4744]">Redirecting to sign in page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-[#181716]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11 bg-[#FAF9F5] border-[#E3DACC] text-[#181716]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#181716]">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tanvir@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11 bg-[#FAF9F5] border-[#E3DACC] text-[#181716]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[#181716]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+8801700000000"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11 bg-[#FAF9F5] border-[#E3DACC] text-[#181716]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[#181716]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 6 characters"
                      minLength={4}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11 bg-[#FAF9F5] border-[#E3DACC] text-[#181716]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full h-11 font-bold text-sm tracking-wide bg-[#181716] hover:bg-[#2C2A28] text-[#FAF9F5] shadow-sm"
                >
                  Create Account
                </Button>
              </form>
            )}

            <div className="pt-2 text-center text-xs text-[#7D7972]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#181716] font-semibold hover:text-[#D96B27] underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
