import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { WALKS, YEARS } from '../data'
import { applyFilters, EMPTY_FILTERS } from '../lib/filter'
import { DAYS, SEASONS, TIMES, type Filters, type Walk } from '../types'

// Filters live in the URL (e.g. ?year=2026&season=Summer,Fall) so a view can be bookmarked or shared
const PARAMS = { years: 'year', seasons: 'season', days: 'day', times: 'time' } as const

function readUrl(): Filters {
  const params = new URLSearchParams(window.location.search)
  const list = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? []
  return {
    years: list(PARAMS.years).map(Number).filter((y) => YEARS.includes(y)),
    seasons: SEASONS.filter((s) => list(PARAMS.seasons).includes(s)),
    days: DAYS.filter((d) => list(PARAMS.days).includes(d)),
    times: TIMES.filter((t) => list(PARAMS.times).includes(t)),
  }
}

function writeUrl(filters: Filters) {
  const params = new URLSearchParams()
  for (const [group, key] of Object.entries(PARAMS) as [keyof Filters, string][]) {
    if (filters[group].length) params.set(key, filters[group].join(','))
  }
  const query = params.toString()
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
}

type Group = keyof Filters

export type FilterAction =
  | { type: 'toggle'; group: Group; value: Filters[Group][number] }
  | { type: 'set'; group: Group; values: Filters[Group] }
  | { type: 'reset' }

function reducer(state: Filters, action: FilterAction): Filters {
  switch (action.type) {
    case 'toggle': {
      const current = state[action.group] as unknown[]
      const next = current.includes(action.value)
        ? current.filter((v) => v !== action.value)
        : [...current, action.value]
      return { ...state, [action.group]: next }
    }
    case 'set':
      return { ...state, [action.group]: action.values }
    case 'reset':
      return EMPTY_FILTERS
  }
}

interface FiltersValue {
  filters: Filters
  dispatch: Dispatch<FilterAction>
  /** walks matching the current filters */
  walks: Walk[]
}

const FiltersContext = createContext<FiltersValue | null>(null)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, dispatch] = useReducer(reducer, undefined, readUrl)
  const walks = useMemo(() => applyFilters(WALKS, filters), [filters])
  useEffect(() => writeUrl(filters), [filters])
  return <FiltersContext.Provider value={{ filters, dispatch, walks }}>{children}</FiltersContext.Provider>
}

export function useFilters(): FiltersValue {
  const value = useContext(FiltersContext)
  if (!value) throw new Error('useFilters must be used inside <FiltersProvider>')
  return value
}
