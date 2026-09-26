import { useMemo } from 'react'
import { ChartCard } from '../components/ChartCard'
import { Heatmap } from '../components/Heatmap'
import { YEARS } from '../data'
import { yearMonthMatrix } from '../lib/aggregate'
import { fmt1 } from '../lib/format'
import { useFilters } from '../state/FiltersContext'
import { COLORS } from '../theme'
import { MONTHS } from '../types'

export function YearMonthHeatmap({ className }: { className?: string }) {
  const { walks, filters } = useFilters()
  const years = filters.years.length ? YEARS.filter((y) => filters.years.includes(y)) : YEARS
  const values = useMemo(() => yearMonthMatrix(walks, years), [walks, years])

  return (
    <ChartCard
      title="Distance by month"
      subtitle="Total km walked in each month"
      empty={walks.length === 0}
      className={className}
    >
      <Heatmap
        rows={years.map(String)}
        cols={MONTHS}
        values={values}
        color={COLORS.stand}
        cellLabel={(v) => String(Math.round(v))}
        tooltip={(year, month, v) => ({
          title: `${month} ${year}`,
          value: v == null ? 'No walks' : `${fmt1(v)} km`,
          label: v == null ? '' : 'walked',
        })}
        colAxisLabel="Month"
        legendLabel={(max) => `${Math.round(max)} km`}
      />
    </ChartCard>
  )
}
