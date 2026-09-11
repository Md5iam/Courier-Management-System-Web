import React, { createContext, useContext, useId } from "react"
import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { cn } from "../../lib/utils"

const ChartContext = createContext(null)

export function useChart() {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

export function ChartContainer({
  id,
  className,
  children,
  config = {},
  ...props
}) {
  const uniqueId = useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[#7D7972] [&_.recharts-cartesian-grid_line]:stroke-[#E3DACC] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[#D96B27]/40 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[#E3DACC]/30",
          className
        )}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

export const ChartTooltip = RechartsTooltip

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  hideLabel = false,
  formatter,
  className,
}) {
  const { config } = useChart()

  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid min-w-[9rem] items-start gap-1.5 rounded-xl border border-[#E3DACC] bg-white p-3 text-xs shadow-xl",
        className
      )}
    >
      {!hideLabel && (
        <div className="font-bold text-[#181716] border-b border-[#E3DACC] pb-1 mb-1">
          {label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = item.dataKey || item.name
          const itemConfig = config[key] || {}
          const name = itemConfig.label || item.name || key
          const color = item.color || item.fill || item.stroke || "#D96B27"

          return (
            <div
              key={`${key}-${index}`}
              className="flex w-full items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5">
                {indicator === "dot" && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                {indicator === "line" && (
                  <span
                    className="h-1 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="text-[#4A4744] text-[11px]">{name}</span>
              </div>
              <span className="font-mono-code font-bold text-[#181716] text-[11px]">
                {formatter ? formatter(item.value, name, item) : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegend({ className, payload, config }) {
  if (!payload || !payload.length) return null

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 pt-3 text-xs", className)}>
      {payload.map((item, index) => {
        const key = item.dataKey || item.value
        const itemConfig = config?.[key] || {}
        const label = itemConfig.label || key
        const color = item.color || itemConfig.color || "#D96B27"

        return (
          <div key={index} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[#4A4744] font-medium text-xs">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
