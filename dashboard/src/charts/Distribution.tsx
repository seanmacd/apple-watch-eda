import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { WALKS } from '../data'
import { histogram, median } from '../lib/aggregate'
import { useFilters } from '../state/FiltersContext'
import { AXIS_TICK, COLORS } from '../theme'
import type { Walk } from '../types'

interface Metric {
  key: keyof Walk & ('distance_km' | 'duration' | 'speed' | 'heart_rate_average')
  label: string
  unit: string
  color: string
  binWidth: number
  digits: number
}

const METRICS: Metric[] = [
  { key: 'distance_km', label: 'Distance', unit: 'km', color: COLORS.stand, binWidth: 0.5, digits: 1 },
  { key: 'duration', label: 'Duration', unit: 'min', color: COLORS.exercise, binWidth: 5, digits: 0 },
  { key: 'speed', label: 'Speed', unit: 'km/h', color: COLORS.stand, binWidth: 0.25, digits: 2 },
  { key: 'heart_rate_average', label: 'Heart rate', unit: 'bpm', color: COLORS.move, binWidth: 3, digits: 0 },
]

function MetricToggle({ value, onChange }: { value: Metric; onChange: (m: Metric) => void }) {
  return (
    <div role="radiogroup" aria-label="Metric" className="flex rounded-full bg-raised p-0.5 text-[12px] font-medium">
      {METRICS.map((m) => (
        <button
          key={m.key}
          type="button"
          role="radio"
          aria-checked={m.key === value.key}
          onClick={() => onChange(m)}
          className={`h-7 rounded-full px-3 transition-colors ${
            m.key === value.key ? 'bg-ink text-page' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

export function Distribution({ className }: { className?: string }) {
  const { walks } = useFilters()
  const [metric, setMetric] = useState(METRICS[0])

  // Bin edges come from all walks so the x axis stays fixed while filtering
  const { bins, med } = useMemo(() => {
    const all = WALKS.map((w) => w[metric.key])
    const values = walks.map((w) => w[metric.key])
    return {
      bins: histogram(values, metric.binWidth, Math.min(...all), Math.max(...all)),
      med: median(values),
    }
  }, [walks, metric])

  const fmt = (v: number) => v.toFixed(metric.digits)

  return (
    <ChartCard
      title="What does a typical walk look like?"
      subtitle={walks.length ? `Median ${fmt(med)} ${metric.unit}` : undefined}
      action={<MetricToggle value={metric} onChange={setMetric} />}
      empty={walks.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={bins} margin={{ top: 20, right: 12, bottom: 0, left: -24 }} barCategoryGap={2}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="mid"
            type="number"
            domain={[bins[0]?.x0 ?? 0, bins.at(-1)?.x1 ?? 1]}
            tickFormatter={(v: number) => fmt(v)}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
            unit={` ${metric.unit}`}
          />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: COLORS.raised, opacity: 0.5 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof bins)[number] | undefined
              if (!active || !p) return null
              return (
                <ChartTooltip
                  title={`${fmt(p.x0)}–${fmt(p.x1)} ${metric.unit}`}
                  rows={[{ label: p.count === 1 ? 'walk' : 'walks', value: String(p.count), color: metric.color }]}
                />
              )
            }}
          />
          <Bar dataKey="count" fill={metric.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          {Number.isFinite(med) && (
            <ReferenceLine
              x={med}
              stroke={COLORS.ink}
              strokeDasharray="4 4"
              label={{ value: `Median ${fmt(med)}`, position: 'top', fill: COLORS.ink2, fontSize: 12 }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
