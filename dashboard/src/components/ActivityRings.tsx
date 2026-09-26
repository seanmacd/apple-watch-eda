import { COLORS } from '../theme'
import { fmtPct } from '../lib/format'

export interface Ring {
  name: string
  metric: string
  color: string
  /** 0..1 share of the all-time total */
  share: number
  value: string
}

const SIZE = 200
const STROKE = 20
const GAP = 3

/** Three concentric Apple Watch style rings, outermost first */
export function ActivityRings({ rings, count }: { rings: Ring[]; count: number }) {
  const c = SIZE / 2
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-44 shrink-0 sm:w-48"
        role="img"
        aria-label={rings.map((r) => `${r.metric} ${fmtPct(r.share)} of all time`).join(', ')}
      >
        {rings.map((ring, i) => {
          const r = c - STROKE / 2 - i * (STROKE + GAP)
          const circumference = 2 * Math.PI * r
          return (
            <g key={ring.name} transform={`rotate(-90 ${c} ${c})`}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={ring.color} strokeOpacity={0.2} strokeWidth={STROKE} />
              {ring.share > 0 && (
                <circle
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - Math.min(ring.share, 1))}
                  className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
                />
              )}
            </g>
          )
        })}
        <text x={c} y={c + 2} textAnchor="middle" fill={COLORS.ink} fontSize={30} fontWeight={700}>
          {count}
        </text>
        <text x={c} y={c + 20} textAnchor="middle" fill={COLORS.ink3} fontSize={12}>
          walks
        </text>
      </svg>

      <ul className="flex w-full flex-col gap-3">
        {rings.map((ring) => (
          <li key={ring.name} className="flex items-center gap-3">
            <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: ring.color }} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
                {ring.name} · {ring.metric}
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-semibold text-ink tabular-nums">{ring.value}</span>
                <span className="text-[13px] text-ink-2 tabular-nums">{fmtPct(ring.share)} of all time</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
