import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: ReactNode
  /** right side of the header, e.g. a toggle or badge */
  action?: ReactNode
  /** show the empty state instead of the chart */
  empty?: boolean
  className?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, action, empty, className = '', children }: Props) {
  return (
    <section className={`flex flex-col rounded-2xl border border-line bg-card p-5 ${className}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-3">{subtitle}</p>}
        </div>
        {action}
      </header>
      {empty ? (
        <div className="flex min-h-48 flex-1 items-center justify-center text-sm text-ink-3">
          No walks match these filters
        </div>
      ) : (
        <div className="min-w-0 flex-1">{children}</div>
      )}
    </section>
  )
}
