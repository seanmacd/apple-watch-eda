export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const WEEKDAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
export const WEEKENDS: Day[] = ['Sat', 'Sun']
export const TIMES = ['Morning', 'Midday', 'Afternoon', 'Evening'] as const
export const BANDS = ['Short <2km', 'Medium 2-4km', 'Long 4km+'] as const
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type Season = (typeof SEASONS)[number]
export type Day = (typeof DAYS)[number]
export type TimeOfDay = (typeof TIMES)[number]
export type DistanceBand = (typeof BANDS)[number]

/** One walk, as written by scripts/export_dashboard_data.py */
export interface Walk {
  startDate: string
  distance_km: number
  duration: number
  calories_active: number
  speed: number
  heart_rate_average: number
  distance_band: DistanceBand
  year: number
  season: Season
  month: number
  day_name: Day
  is_weekend: boolean
  hour: number
  time_of_day: TimeOfDay
  /** startDate as epoch milliseconds, added on load */
  time: number
}

/** Empty list = no filter on that group */
export interface Filters {
  years: number[]
  seasons: Season[]
  days: Day[]
  times: TimeOfDay[]
}

export interface Fit {
  x: string
  y: string
  slope: number
  intercept: number
  r2: number
}
