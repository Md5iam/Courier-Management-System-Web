import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Alert, AlertDescription } from "../../components/ui/Alert"
import { BrandLogo } from "../../components/BrandLogo"
import { Lock, Mail, AlertCircle, ShieldCheck } from "lucide-react"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("admin@courier.com")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await login(email, password)
      // Redirect based on role
      const roles = user.roles || []
      if (roles.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard")
      } else if (roles.includes("ROLE_EMPLOYEE")) {
        navigate("/employee/dashboard")
      } else {
        navigate("/user/dashboard")
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please check and try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError("")
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#181716] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#E3DACC] selection:text-[#181716]">
      {/* Ambient warm background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#E3DACC]/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#F0EEE6] blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Link to="/" className="inline-flex items-center group">
            <BrandLogo size="lg" showSubtitle={false} />
          </Link>
          <p className="text-xs uppercase font-bold tracking-widest text-[#7D7972] mt-2">
            Secure Portal Access
          </p>
        </div>

        <Card className="border-[#E3DACC] bg-white shadow-xl p-2 sm:p-4">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-black text-[#181716]">Sign in to your account</CardTitle>
            <CardDescription className="text-[#4A4744]">
              Enter your registered credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#181716]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-[#FAF9F5] border-[#E3DACC] text-[#181716]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#181716]">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7972]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                Sign In
              </Button>
            </form>

            {/* Quick Demo Pre-fill Chips */}
            <div className="pt-4 border-t border-[#E3DACC]">
              <span className="text-[11px] font-semibold text-[#7D7972] uppercase tracking-wider block mb-2 text-center">
                Quick Fill Demo Account:
              </span>
              <button
                type="button"
                onClick={() => fillCredentials("admin@courier.com", "admin123")}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#F0EEE6] border border-[#E3DACC] text-[#181716] text-xs font-semibold hover:bg-[#E3DACC] transition-colors shadow-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#181716]" />
                <span>Admin (admin@courier.com)</span>
              </button>
            </div>

            {/* Registration links */}
            <div className="pt-2 text-center space-y-2 text-xs text-[#7D7972]">
              <div>
                Don't have a customer account?{" "}
                <Link to="/register" className="text-[#181716] font-semibold hover:text-[#D96B27] underline">
                  Sign up here
                </Link>
              </div>
              <div>
                Looking for courier delivery staff jobs?{" "}
                <Link to="/employee/register" className="text-[#181716] font-semibold hover:text-[#D96B27] underline">
                  Register as Agent
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
