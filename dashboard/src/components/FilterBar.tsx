import { WALKS, YEARS } from '../data'
import { activeFilterCount } from '../lib/filter'
import { useFilters } from '../state/FiltersContext'
import { DAYS, SEASONS, TIMES, WEEKDAYS, WEEKENDS, type Day, type Filters } from '../types'

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-8 rounded-full px-3 text-[13px] font-medium transition-colors ${
        selected ? 'bg-ink text-page' : 'bg-raised text-ink-2 hover:bg-[#3a3a3c] hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">{label}</span>
      {children}
    </div>
  )
}

const sameSet = (a: Day[], b: Day[]) => a.length === b.length && a.every((d) => b.includes(d))

export function FilterBar() {
  const { filters, dispatch, walks } = useFilters()
  const active = activeFilterCount(filters)

  const chips = <G extends keyof Filters>(group: G, values: readonly Filters[G][number][]) =>
    values.map((value) => (
      <Chip
        key={String(value)}
        label={String(value)}
        selected={(filters[group] as unknown[]).includes(value)}
        onClick={() => dispatch({ type: 'toggle', group, value })}
      />
    ))

  const quickDays = (label: string, days: Day[]) => (
    <Chip
      label={label}
      selected={sameSet(filters.days, days)}
      onClick={() => dispatch({ type: 'set', group: 'days', values: sameSet(filters.days, days) ? [] : days })}
    />
  )

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Group label="Year">{chips('years', YEARS)}</Group>
      <Group label="Season">{chips('seasons', SEASONS)}</Group>
      <Group label="Day">
        {quickDays('Weekdays', WEEKDAYS)}
        {quickDays('Weekends', WEEKENDS)}
        <span className="mx-1 h-5 w-px bg-line" />
        {chips('days', DAYS)}
      </Group>
      <Group label="Time">{chips('times', TIMES)}</Group>
      <div className="ml-auto flex items-center gap-3 text-[13px] text-ink-3">
        <span className="tabular-nums">
          Showing <span className="font-semibold text-ink">{walks.length}</span> of {WALKS.length} walks
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: 'reset' })}
          disabled={active === 0}
          className="h-8 rounded-full border border-line px-3 font-medium text-ink-2 transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-ink-2"
        >
          Reset{active > 0 && ` (${active})`}
        </button>
      </div>
    </div>
  )
}
