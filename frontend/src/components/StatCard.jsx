import React from "react"
import { Card, CardContent } from "./ui/Card"
import { cn } from "../lib/utils"

export function StatCard({ title, value, icon: Icon, description, trend, color = "indigo", className }) {
  const colorMap = {
    indigo: {
      bg: "bg-[#F0EEE6]",
      border: "border-[#E3DACC]",
      text: "text-[#181716]",
    },
    charcoal: {
      bg: "bg-[#F0EEE6]",
      border: "border-[#E3DACC]",
      text: "text-[#181716]",
    },
    emerald: {
      bg: "bg-[#EDF4F0]",
      border: "border-[#C6DDD0]",
      text: "text-[#1C3F35]",
    },
    forest: {
      bg: "bg-[#EDF4F0]",
      border: "border-[#C6DDD0]",
      text: "text-[#1C3F35]",
    },
    cyan: {
      bg: "bg-[#FAF9F5]",
      border: "border-[#E3DACC]",
      text: "text-[#181716]",
    },
    terracotta: {
      bg: "bg-[#FAF0E8]",
      border: "border-[#F2D3BC]",
      text: "text-[#C85A17]",
    },
    violet: {
      bg: "bg-[#FAF0E8]",
      border: "border-[#F2D3BC]",
      text: "text-[#C85A17]",
    },
    amber: {
      bg: "bg-[#FCF6EE]",
      border: "border-[#F1DCBE]",
      text: "text-[#B87333]",
    },
    honey: {
      bg: "bg-[#FCF6EE]",
      border: "border-[#F1DCBE]",
      text: "text-[#B87333]",
    },
    rose: {
      bg: "bg-[#FDF0F0]",
      border: "border-[#F5C8C8]",
      text: "text-[#8A2B2B]",
    },
  }

  const selectedColor = colorMap[color] || colorMap.indigo

  return (
    <Card
      className={cn(
        "relative overflow-hidden group border border-[#E3DACC] bg-white shadow-sm hover:border-[#D8CEBC] hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7D7972]">
            {title}
          </p>
          <div
            className={cn(
              "rounded-xl p-2.5 border transition-transform duration-300 group-hover:scale-110",
              selectedColor.bg,
              selectedColor.border,
              selectedColor.text
            )}
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <h4 className="text-2xl sm:text-3xl font-black text-[#181716] tracking-tight">
            {value}
          </h4>
          {trend && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
              {trend}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-xs text-[#7D7972]">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
