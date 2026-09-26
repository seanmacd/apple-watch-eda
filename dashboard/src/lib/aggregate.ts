import { BANDS, DAYS, type Walk } from '../types'

export interface Totals {
  count: number
  km: number
  kcal: number
  minutes: number
}

export function totals(walks: Walk[]): Totals {
  return walks.reduce(
    (t, w) => ({
      count: t.count + 1,
      km: t.km + w.distance_km,
      kcal: t.kcal + w.calories_active,
      minutes: t.minutes + w.duration,
    }),
    { count: 0, km: 0, kcal: 0, minutes: 0 },
  )
}

export function median(values: number[]): number {
  if (values.length === 0) return NaN
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Running distance total within the filtered walks, oldest first */
export function cumulativeSeries(walks: Walk[]) {
  let running = 0
  return [...walks]
    .sort((a, b) => a.time - b.time)
    .map((w) => {
      running += w.distance_km
      return { time: w.time, km: w.distance_km, cumulative: running }
    })
}

export function countByDay(walks: Walk[]) {
  return DAYS.map((day) => ({
    day,
    count: walks.filter((w) => w.day_name === day).length,
    weekend: day === 'Sat' || day === 'Sun',
  }))
}

/** rows = days (Mon to Sun), cols = hours; value = number of walks */
export function dayHourMatrix(walks: Walk[], hours: number[]): number[][] {
  return DAYS.map((day) =>
    hours.map((hour) => walks.filter((w) => w.day_name === day && w.hour === hour).length),
  )
}

/** rows = years, cols = months 1..12; value = km walked, null when no walks */
export function yearMonthMatrix(walks: Walk[], years: number[]): (number | null)[][] {
  return years.map((year) =>
    Array.from({ length: 12 }, (_, i) => {
      const inMonth = walks.filter((w) => w.year === year && w.month === i + 1)
      return inMonth.length ? inMonth.reduce((s, w) => s + w.distance_km, 0) : null
    }),
  )
}

export interface Bin {
  x0: number
  x1: number
  mid: number
  count: number
}

/** Fixed-width bins over [min, max) so the x axis stays put while filters change */
export function histogram(values: number[], width: number, min: number, max: number): Bin[] {
  const start = Math.floor(min / width) * width
  const bins: Bin[] = []
  for (let x0 = start; x0 < max; x0 += width) {
    bins.push({ x0, x1: x0 + width, mid: x0 + width / 2, count: 0 })
  }
  for (const v of values) {
    const i = Math.min(Math.floor((v - start) / width), bins.length - 1)
    if (i >= 0) bins[i].count += 1
  }
  return bins
}

/** Deterministic horizontal jitter so points don't jump around when filters change */
const jitter = (seed: number) => ((Math.sin(seed * 12.9898) * 43758.5453) % 1) * 0.5

export function speedByBand(walks: Walk[]) {
  const points = walks.map((w) => ({
    x: BANDS.indexOf(w.distance_band) + jitter(w.time / 1000) * 0.55,
    speed: w.speed,
    band: w.distance_band,
    time: w.time,
  }))
  const medians = BANDS.map((band, i) => {
    const speeds = walks.filter((w) => w.distance_band === band).map((w) => w.speed)
    return { band, x: i, median: median(speeds), count: speeds.length }
  })
  return { points, medians }
}
