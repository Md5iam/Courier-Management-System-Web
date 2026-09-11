import React from "react"
import { Badge } from "./ui/Badge"

export function PageHeader({ title, description, badge, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3DACC] mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#181716]">
            {title}
          </h1>
          {badge && <Badge variant="default">{badge}</Badge>}
        </div>
        {description && (
          <p className="text-sm text-[#4A4744] mt-1">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}
