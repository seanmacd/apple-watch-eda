import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { countByDay } from '../lib/aggregate'
import { useFilters } from '../state/FiltersContext'
import { AXIS_TICK, COLORS } from '../theme'

const WEEKDAY_OPACITY = 0.45

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[12px] text-ink-2">
      {[
        ['Weekday', WEEKDAY_OPACITY],
        ['Weekend', 1],
      ].map(([label, opacity]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: COLORS.exercise, opacity }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export function WalksByDay({ className }: { className?: string }) {
  const { walks } = useFilters()
  const data = countByDay(walks)
  const top = data.reduce((a, b) => (b.count > a.count ? b : a))

  return (
    <ChartCard
      title="Walks by day of week"
      subtitle={walks.length ? `${top.day} is the busiest day` : undefined}
      action={<Legend />}
      empty={walks.length === 0}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 0, bottom: 0, left: -24 }} barCategoryGap="22%">
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: COLORS.grid }} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: COLORS.raised, opacity: 0.5 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof data)[number] | undefined
              if (!active || !p) return null
              return (
                <ChartTooltip
                  title={p.day}
                  rows={[{ label: p.count === 1 ? 'walk' : 'walks', value: String(p.count), color: COLORS.exercise }]}
                />
              )
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.day} fill={COLORS.exercise} fillOpacity={d.weekend ? 1 : WEEKDAY_OPACITY} />
            ))}
            <LabelList dataKey="count" position="top" fill={COLORS.ink2} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
