import React from "react"
import { Link } from "react-router-dom"
import { BrandLogo } from "./BrandLogo"
import { Shield, Truck, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#E3DACC] bg-[#F0EEE6] text-[#4A4744] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <BrandLogo size="md" />
            <p className="text-[#7D7972] text-xs leading-relaxed">
              Nationwide express parcel delivery, automated dispatch, and dependable Cash-on-Delivery infrastructure.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#181716] uppercase tracking-wider text-[11px] mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#181716] transition-colors">Home</Link></li>
              <li><Link to="/track" className="hover:text-[#181716] transition-colors">Track Parcel</Link></li>
              <li><Link to="/login" className="hover:text-[#181716] transition-colors">Customer Login</Link></li>
              <li><Link to="/register" className="hover:text-[#181716] transition-colors">Open Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#181716] uppercase tracking-wider text-[11px] mb-3">Staff & Careers</h4>
            <ul className="space-y-2">
              <li><Link to="/employee/register" className="hover:text-[#181716] transition-colors">Join as Delivery Agent</Link></li>
              <li><Link to="/login" className="hover:text-[#181716] transition-colors">Staff Portal Access</Link></li>
              <li><span className="text-[#7D7972]">Hub Coverage (9 Divisions)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#181716] uppercase tracking-wider text-[11px] mb-3">Support & Guarantees</h4>
            <div className="space-y-2 text-[#4A4744]">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[#7D7972]" />
                <span>24/7 Priority Helpline</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-700" />
                <span>100% Parcel Transit Insurance</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-[#7D7972]" />
                <span>Same-Day & Next-Day Hub Routing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E3DACC] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#7D7972]">
          <p>© {new Date().getFullYear()} Dropify Logistics Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#181716] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#181716] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#181716] cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
