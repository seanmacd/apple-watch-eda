import type { Filters, Walk } from '../types'

export const EMPTY_FILTERS: Filters = { years: [], seasons: [], days: [], times: [] }

const matches = <T,>(selected: T[], value: T) => selected.length === 0 || selected.includes(value)

/** AND across filter groups, OR within a group */
export function applyFilters(walks: Walk[], f: Filters): Walk[] {
  return walks.filter(
    (w) =>
      matches(f.years, w.year) &&
      matches(f.seasons, w.season) &&
      matches(f.days, w.day_name) &&
      matches(f.times, w.time_of_day),
  )
}

export const activeFilterCount = (f: Filters) =>
  f.years.length + f.seasons.length + f.days.length + f.times.length
