import React from "react"
import { PackageOpen } from "lucide-react"

export function EmptyState({ icon: Icon = PackageOpen, title = "No data found", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-[#E3DACC] bg-[#F0EEE6]">
      <div className="rounded-2xl bg-white p-4 text-[#181716] mb-4 border border-[#E3DACC] shadow-sm">
        <Icon className="h-8 w-8 text-[#181716]" />
      </div>
      <h3 className="text-base font-bold text-[#181716] mb-1">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#4A4744] max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
