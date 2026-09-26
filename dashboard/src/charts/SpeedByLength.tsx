import { useMemo } from 'react'
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { speedByBand } from '../lib/aggregate'
import { fmtDate } from '../lib/format'
import { useFilters } from '../state/FiltersContext'
import { AXIS_TICK, COLORS } from '../theme'
import { BANDS } from '../types'

/** Visible 8px dot inside a 24px transparent hit area */
function Dot(props: { cx?: number; cy?: number }) {
  const { cx = 0, cy = 0 } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="transparent" />
      <circle cx={cx} cy={cy} r={4} fill={COLORS.stand} fillOpacity={0.75} stroke={COLORS.card} strokeWidth={1.5} />
    </g>
  )
}

export function SpeedByLength({ className }: { className?: string }) {
  const { walks } = useFilters()
  const { points, medians } = useMemo(() => speedByBand(walks), [walks])
  const [fastest] = medians.filter((m) => m.count).sort((a, b) => b.median - a.median)

  return (
    <ChartCard
      title="Do longer walks mean slower walks?"
      subtitle={fastest ? `Fastest: ${fastest.band.toLowerCase()} walks, median ${fastest.median.toFixed(1)} km/h` : undefined}
      empty={walks.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 20, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[-0.5, 2.5]}
            ticks={[0, 1, 2]}
            tickFormatter={(i: number) => BANDS[i] ?? ''}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            dataKey="speed"
            type="number"
            domain={[2, 7]}
            ticks={[2, 3, 4, 5, 6, 7]}
            allowDataOverflow
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            unit=" km/h"
            width={72}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof points)[number] | undefined
              if (!active || !p) return null
              return (
                <ChartTooltip
                  title={`${fmtDate(p.time)} · ${p.band}`}
                  rows={[{ label: 'speed', value: `${p.speed.toFixed(2)} km/h`, color: COLORS.stand }]}
                />
              )
            }}
          />
          <Scatter data={points} shape={<Dot />} isAnimationActive={false} />
          {medians
            .filter((m) => m.count)
            .map((m) => (
              <ReferenceLine
                key={m.band}
                segment={[
                  { x: m.x - 0.32, y: m.median },
                  { x: m.x + 0.32, y: m.median },
                ]}
                stroke={COLORS.ink}
                strokeWidth={3}
                strokeLinecap="round"
                label={{ value: `${m.median.toFixed(1)}`, position: 'right', fill: COLORS.ink, fontSize: 12, fontWeight: 600 }}
              />
            ))}
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[12px] text-ink-3">White bar = median speed for each walk length</p>
    </ChartCard>
  )
}
