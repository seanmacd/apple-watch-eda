import { useState } from 'react'
import { WALKS, YEARS } from '../data'
import { activeFilterCount } from '../lib/filter'
import { useFilters } from '../state/FiltersContext'
import { DAYS, SEASONS, TIMES, WEEKDAYS, WEEKENDS, type Day, type Filters } from '../types'
import { Dropdown } from './Dropdown'
import { Checkbox, ControlList, Radio } from './FormControls'

type DayMode = 'all' | 'weekdays' | 'weekends' | 'custom'

const DAY_MODES: { mode: DayMode; label: string }[] = [
  { mode: 'all', label: 'All days' },
  { mode: 'weekdays', label: 'Weekdays' },
  { mode: 'weekends', label: 'Weekends' },
  { mode: 'custom', label: 'Custom' },
]

const sameSet = (a: Day[], b: Day[]) => a.length === b.length && a.every((d) => b.includes(d))

function presetMode(days: Day[]): DayMode | null {
  if (days.length === 0) return 'all'
  if (sameSet(days, WEEKDAYS)) return 'weekdays'
  if (sameSet(days, WEEKENDS)) return 'weekends'
  return null
}

/** "All", a short list, or "3 selected", in the category's own order */
function summary(selected: readonly unknown[], order: readonly unknown[]): string {
  if (selected.length === 0) return 'All'
  const sorted = order.filter((v) => selected.includes(v))
  return sorted.length <= 2 ? sorted.join(', ') : `${sorted.length} selected`
}

export function FilterBar() {
  const { filters, dispatch, walks } = useFilters()
  const active = activeFilterCount(filters)
  // "Custom" is a UI mode, not a filter value: it stays open even while its days match a preset
  const [custom, setCustom] = useState(() => presetMode(filters.days) === null)
  const dayMode: DayMode = custom ? 'custom' : (presetMode(filters.days) ?? 'custom')

  const reset = () => {
    setCustom(false)
    dispatch({ type: 'reset' })
  }

  const chooseDayMode = (mode: DayMode) => {
    setCustom(mode === 'custom')
    if (mode === 'all') dispatch({ type: 'set', group: 'days', values: [] })
    if (mode === 'weekdays') dispatch({ type: 'set', group: 'days', values: WEEKDAYS })
    if (mode === 'weekends') dispatch({ type: 'set', group: 'days', values: WEEKENDS })
  }

  const checkboxes = <G extends keyof Filters>(group: G, values: readonly Filters[G][number][]) => (
    <ControlList>
      {values.map((value) => (
        <Checkbox
          key={String(value)}
          label={String(value)}
          checked={(filters[group] as unknown[]).includes(value)}
          onChange={() => dispatch({ type: 'toggle', group, value })}
        />
      ))}
    </ControlList>
  )

  const category = <G extends keyof Filters>(label: string, group: G, values: readonly Filters[G][number][]) => (
    <Dropdown
      label={label}
      value={summary(filters[group], values)}
      active={filters[group].length > 0}
      onClear={() => dispatch({ type: 'set', group, values: [] })}
    >
      {checkboxes(group, values)}
    </Dropdown>
  )

  const dayValue =
    dayMode === 'custom' ? summary(filters.days, DAYS) : DAY_MODES.find((m) => m.mode === dayMode)!.label

  return (
    <div className="flex flex-wrap items-center gap-2">
      {category('Year', 'years', YEARS)}
      {category('Season', 'seasons', SEASONS)}
      <Dropdown
        label="Day of week"
        value={dayValue}
        active={filters.days.length > 0}
        onClear={() => chooseDayMode('all')}
      >
        <ControlList>
          {DAY_MODES.map(({ mode, label }) => (
            <Radio
              key={mode}
              name="day-mode"
              label={label}
              checked={dayMode === mode}
              onChange={() => chooseDayMode(mode)}
            />
          ))}
        </ControlList>
        {dayMode === 'custom' && (
          <div className="mt-3 border-t border-line pt-3">{checkboxes('days', DAYS)}</div>
        )}
      </Dropdown>
      {category('Time of day', 'times', TIMES)}

      <div className="ml-auto flex items-center gap-4 text-[13px] text-ink-3">
        <span className="tabular-nums">
          Showing <span className="font-semibold text-ink">{walks.length}</span> of {WALKS.length} walks
        </span>
        <button
          type="button"
          onClick={reset}
          disabled={active === 0 && !custom}
          className="h-9 rounded-lg border border-line px-3 font-medium text-ink-2 transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-ink-2"
        >
          Reset{active > 0 && ` (${active})`}
        </button>
      </div>
    </div>
  )
}
