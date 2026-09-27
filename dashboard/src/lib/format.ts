const TZ = 'America/Halifax'

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-CA')
export const fmt1 = (n: number) => n.toLocaleString('en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function fmtDuration(minutes: number): string {
  // Round first so 59.6 min becomes "1 h 0 m", not "0 h 60 m"
  const total = Math.round(minutes)
  const h = Math.floor(total / 60)
  const m = total % 60
  return h ? `${h} h ${m} m` : `${m} min`
}

export const fmtDate = (time: number) =>
  new Date(time).toLocaleDateString('en-CA', { timeZone: TZ, year: 'numeric', month: 'short', day: 'numeric' })

/** "Jul '26": the apostrophe keeps it from reading as a day of the month */
export function fmtMonthYear(time: number): string {
  const d = new Date(time)
  const month = d.toLocaleDateString('en-CA', { timeZone: TZ, month: 'short' })
  const year = d.toLocaleDateString('en-CA', { timeZone: TZ, year: '2-digit' })
  return `${month} '${year}`
}

export const fmtPct = (share: number) => `${Math.round(share * 100)}%`
