interface Props {
  label: string
  value: string
  unit?: string
  sub: string
  /** ring colour for the accent bar; omitted for neutral metrics */
  color?: string
}

export function KpiTile({ label, value, unit, sub, color }: Props) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: color ?? 'var(--color-ink-3)' }} />
        <span className="text-[13px] font-medium text-ink-2">{label}</span>
      </div>
      <div className="mt-4">
        <span className="text-4xl font-bold tracking-tight text-ink tabular-nums">{value}</span>
        {unit && <span className="ml-1.5 text-lg font-medium text-ink-3">{unit}</span>}
      </div>
      <div className="mt-1 text-[13px] text-ink-3 tabular-nums">{sub}</div>
    </div>
  )
}
