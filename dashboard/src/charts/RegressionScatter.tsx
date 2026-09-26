import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { ChartTooltip } from '../components/ChartTooltip'
import { REGRESSION } from '../data'
import { AXIS_TICK, COLORS } from '../theme'
import type { Fit } from '../types'

interface Props {
  title: string
  fit: Fit
  yKey: 'calories_total' | 'duration'
  yLabel: string
  yUnit: string
  color: string
  /** plain-language reading of the slope, e.g. "≈ 100 kcal per km" */
  takeaway: string
}

function Dot({ cx = 0, cy = 0, color }: { cx?: number; cy?: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="transparent" />
      <circle cx={cx} cy={cy} r={4} fill={color} fillOpacity={0.8} stroke={COLORS.card} strokeWidth={1.5} />
    </g>
  )
}

/** Static scatter + least squares line over all walks (fit computed by the export script) */
export function RegressionScatter({ title, fit, yKey, yLabel, yUnit, color, takeaway }: Props) {
  const points = REGRESSION.points
  const xs = points.map((p) => p.distance_km)
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const xMax = Math.ceil(x1 / 3) * 3
  const xTicks = Array.from({ length: xMax / 3 + 1 }, (_, i) => i * 3)
  const line = (x: number) => fit.slope * x + fit.intercept
  const sign = fit.intercept < 0 ? '−' : '+'

  return (
    <ChartCard
      title={title}
      subtitle={`y = ${fit.slope.toFixed(1)}x ${sign} ${Math.abs(fit.intercept).toFixed(1)} · ${takeaway}`}
      action={
        <div className="text-right">
          <div className="text-2xl font-bold text-ink tabular-nums">{fit.r2.toFixed(2)}</div>
          <div className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">R²</div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={COLORS.grid} />
          <XAxis
            dataKey="distance_km"
            type="number"
            domain={[0, xMax]}
            ticks={xTicks}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: COLORS.grid }}
            unit=" km"
          />
          <YAxis
            dataKey={yKey}
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            unit={` ${yUnit}`}
            width={80}
          />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof points)[number] | undefined
              if (!active || !p) return null
              return (
                <ChartTooltip
                  title={`${p.distance_km.toFixed(2)} km walk`}
                  rows={[
                    { label: yLabel, value: `${Math.round(p[yKey])} ${yUnit}`, color },
                    { label: 'predicted', value: `${Math.round(line(p.distance_km))} ${yUnit}` },
                  ]}
                />
              )
            }}
          />
          <Scatter data={points} shape={<Dot color={color} />} isAnimationActive={false} />
          <ReferenceLine
            segment={[
              { x: x0, y: line(x0) },
              { x: x1, y: line(x1) },
            ]}
            stroke={COLORS.ink}
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CaloriesVsDistance({ className }: { className?: string }) {
  return (
    <div className={className}>
      <RegressionScatter
        title="Calories burned vs distance"
        fit={REGRESSION.calories}
        yKey="calories_total"
        yLabel="total calories"
        yUnit="kcal"
        color={COLORS.move}
        takeaway={`≈ ${Math.round(REGRESSION.calories.slope)} kcal per km`}
      />
    </div>
  )
}

export function DurationVsDistance({ className }: { className?: string }) {
  return (
    <div className={className}>
      <RegressionScatter
        title="Duration vs distance"
        fit={REGRESSION.duration}
        yKey="duration"
        yLabel="duration"
        yUnit="min"
        color={COLORS.exercise}
        takeaway={`≈ ${REGRESSION.duration.slope.toFixed(1)} min per km`}
      />
    </div>
  )
}
