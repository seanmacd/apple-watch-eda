import { useRef, useState } from 'react'
import { COLORS } from '../theme'
import { ChartTooltip } from './ChartTooltip'

interface Props {
  rows: string[]
  cols: string[]
  values: (number | null)[][]
  color: string
  /** text drawn inside a cell (empty string hides it) */
  cellLabel: (v: number) => string
  tooltip: (row: string, col: string, v: number | null) => { title: string; value: string; label: string }
  colAxisLabel: string
  legendLabel: (max: number) => string
}

/** One-hue sequential heatmap: card surface → ring colour, scaled to the largest visible cell */
export function Heatmap({ rows, cols, values, color, cellLabel, tooltip, colAxisLabel, legendLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ r: number; c: number; x: number; y: number } | null>(null)
  const max = Math.max(1, ...values.flat().map((v) => v ?? 0))

  const fill = (v: number | null) => {
    if (!v) return { pct: 0, bg: COLORS.raised }
    // Start at 35% so a single walk still reads clearly against empty cells
    const pct = Math.round(35 + 65 * (v / max))
    return { pct, bg: `color-mix(in oklab, ${color} ${pct}%, ${COLORS.card})` }
  }

  const onEnter = (r: number, c: number, el: HTMLElement) => {
    const box = ref.current!.getBoundingClientRect()
    const cell = el.getBoundingClientRect()
    setHover({ r, c, x: cell.left - box.left + cell.width / 2, y: cell.top - box.top })
  }

  const tip = hover && tooltip(rows[hover.r], cols[hover.c], values[hover.r][hover.c])

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setHover(null)}>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `2.5rem repeat(${cols.length}, minmax(0, 1fr))` }}
        role="table"
      >
        <div />
        {cols.map((col) => (
          <div key={col} className="pb-1 text-center text-[11px] text-ink-3 tabular-nums">
            {col}
          </div>
        ))}
        {rows.map((row, r) => (
          <div key={row} role="row" className="contents">
            <div className="flex items-center text-[12px] text-ink-3">{row}</div>
            {cols.map((col, c) => {
              const v = values[r][c]
              const { pct, bg } = fill(v)
              const active = hover?.r === r && hover?.c === c
              return (
                <div
                  key={col}
                  role="cell"
                  aria-label={`${row} ${col}: ${v ?? 0}`}
                  onMouseEnter={(e) => onEnter(r, c, e.currentTarget)}
                  className={`flex h-8 items-center justify-center rounded-[4px] text-[11px] font-semibold tabular-nums transition-shadow ${
                    active ? 'ring-2 ring-ink' : ''
                  }`}
                  style={{ background: bg, color: pct > 55 ? COLORS.page : COLORS.ink }}
                >
                  {v ? cellLabel(v) : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-[11px] text-ink-3">
        <span>{colAxisLabel}</span>
        <div className="flex items-center gap-2">
          <span>0</span>
          <span
            className="h-2 w-24 rounded-full"
            style={{ background: `linear-gradient(90deg, ${fill(max * 0.001).bg}, ${color})` }}
          />
          <span className="tabular-nums">{legendLabel(max)}</span>
        </div>
      </div>

      {tip && hover && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full pb-2"
          style={{ left: hover.x, top: hover.y }}
        >
          <ChartTooltip title={tip.title} rows={[{ label: tip.label, value: tip.value, color }]} />
        </div>
      )}
    </div>
  )
}
