const TZ = 'America/Halifax'

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-CA')
export const fmt1 = (n: number) => n.toLocaleString('en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
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
