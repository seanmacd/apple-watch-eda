import { useState } from 'react'
import { WALKS, YEARS } from '../data'
import { activeFilterCount } from '../lib/filter'
import { useFilters } from '../state/FiltersContext'
import { DAYS, SEASONS, TIMES, WEEKDAYS, WEEKENDS, type Day, type Filters } from '../types'
import { Checkbox, ControlGroup, ControlRow, Radio } from './FormControls'

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

  const checkboxes = <G extends keyof Filters>(group: G, values: readonly Filters[G][number][]) => (
    <ControlRow>
      {values.map((value) => (
        <Checkbox
          key={String(value)}
          label={String(value)}
          checked={(filters[group] as unknown[]).includes(value)}
          onChange={() => dispatch({ type: 'toggle', group, value })}
        />
      ))}
    </ControlRow>
  )

  const chooseDayMode = (mode: DayMode) => {
    setCustom(mode === 'custom')
    if (mode === 'all') dispatch({ type: 'set', group: 'days', values: [] })
    if (mode === 'weekdays') dispatch({ type: 'set', group: 'days', values: WEEKDAYS })
    if (mode === 'weekends') dispatch({ type: 'set', group: 'days', values: WEEKENDS })
  }

  return (
    <div className="flex flex-wrap gap-x-12 gap-y-5">
      <ControlGroup label="Year">{checkboxes('years', YEARS)}</ControlGroup>
      <ControlGroup label="Season">{checkboxes('seasons', SEASONS)}</ControlGroup>
      <ControlGroup label="Time of day">{checkboxes('times', TIMES)}</ControlGroup>
      <ControlGroup label="Day of week">
        <ControlRow>
          {DAY_MODES.map(({ mode, label }) => (
            <Radio
              key={mode}
              name="day-mode"
              label={label}
              checked={dayMode === mode}
              onChange={() => chooseDayMode(mode)}
            />
          ))}
        </ControlRow>
        {dayMode === 'custom' && (
          <div className="border-l border-line pl-4">{checkboxes('days', DAYS)}</div>
        )}
      </ControlGroup>

      <div className="ml-auto flex items-end gap-4 self-end text-[13px] text-ink-3">
        <span className="tabular-nums">
          Showing <span className="font-semibold text-ink">{walks.length}</span> of {WALKS.length} walks
        </span>
        <button
          type="button"
          onClick={reset}
          disabled={active === 0 && !custom}
          className="h-8 rounded-md border border-line px-3 font-medium text-ink-2 transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-ink-2"
        >
          Reset{active > 0 && ` (${active})`}
        </button>
      </div>
    </div>
  )
}
