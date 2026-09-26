export interface TooltipRow {
  label: string
  value: string
  /** series colour, drawn as a short line key */
  color?: string
}

/** Dark tooltip card: value is the strong element, the label follows */
export function ChartTooltip({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="pointer-events-none min-w-36 rounded-xl border border-line bg-raised/95 px-3 py-2 text-[13px] shadow-xl shadow-black/60 backdrop-blur">
      <div className="mb-1 text-ink-3">{title}</div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2">
          {row.color && <span className="h-0.5 w-3 rounded-full" style={{ background: row.color }} />}
          <span className="font-semibold text-ink tabular-nums">{row.value}</span>
          <span className="text-ink-2">{row.label}</span>
        </div>
      ))}
    </div>
  )
}
