import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { cumulativeSeries } from '../lib/aggregate'
import { fmt1, fmtDate, fmtMonthYear } from '../lib/format'
import { useFilters } from '../state/FiltersContext'
import { AXIS_TICK, COLORS } from '../theme'

/** First-of-month ticks, every `step` months, across [start, end] */
function monthTicks(start: number, end: number): number[] {
  const months = (new Date(end).getFullYear() - new Date(start).getFullYear()) * 12 +
    new Date(end).getMonth() - new Date(start).getMonth()
  const step = months > 24 ? 6 : months > 8 ? 3 : 1
  const d = new Date(start)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  d.setMonth(Math.ceil(d.getMonth() / step) * step)
  const ticks: number[] = []
  while (d.getTime() <= end) {
    if (d.getTime() >= start) ticks.push(d.getTime())
    d.setMonth(d.getMonth() + step)
  }
  return ticks
}

export function CumulativeDistance({ className }: { className?: string }) {
  const { walks } = useFilters()
  const data = useMemo(() => cumulativeSeries(walks), [walks])
  const total = data.at(-1)?.cumulative ?? 0
  const ticks = data.length ? monthTicks(data[0].time, data.at(-1)!.time) : []

  return (
    <ChartCard
      title="Cumulative distance"
      subtitle={`${fmt1(total)} km across ${data.length} walks`}
      empty={data.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.stand} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLORS.stand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={fmtMonthYear}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
          />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} unit=" km" width={64} />
          <Tooltip
            cursor={{ stroke: COLORS.ink3, strokeWidth: 1 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof data)[number] | undefined
              if (!active || !p) return null
              return (
                <ChartTooltip
                  title={fmtDate(p.time)}
                  rows={[
                    { label: 'total so far', value: `${fmt1(p.cumulative)} km`, color: COLORS.stand },
                    { label: 'this walk', value: `${fmt1(p.km)} km` },
                  ]}
                />
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={COLORS.stand}
            strokeWidth={2}
            fill="url(#cumulativeFill)"
            activeDot={{ r: 5, fill: COLORS.stand, stroke: COLORS.card, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
