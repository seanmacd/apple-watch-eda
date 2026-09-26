import { useMemo } from 'react'
import { ChartCard } from '../components/ChartCard'
import { Heatmap } from '../components/Heatmap'
import { WALKS } from '../data'
import { dayHourMatrix } from '../lib/aggregate'
import { useFilters } from '../state/FiltersContext'
import { COLORS } from '../theme'
import { DAYS } from '../types'

// Hour columns cover every walk ever recorded, so the grid doesn't reshape when filters change
const minHour = Math.min(...WALKS.map((w) => w.hour))
const maxHour = Math.max(...WALKS.map((w) => w.hour))
const HOURS = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i)

export function DayHourHeatmap({ className }: { className?: string }) {
  const { walks } = useFilters()
  const values = useMemo(() => dayHourMatrix(walks, HOURS), [walks])

  return (
    <ChartCard
      title="Walking routine"
      subtitle="Walks by day of week and start hour"
      empty={walks.length === 0}
      className={className}
    >
      <Heatmap
        rows={[...DAYS]}
        cols={HOURS.map(String)}
        values={values}
        color={COLORS.exercise}
        cellLabel={(v) => String(v)}
        tooltip={(day, hour, v) => ({
          title: `${day} · ${hour.padStart(2, '0')}:00`,
          value: String(v ?? 0),
          label: v === 1 ? 'walk' : 'walks',
        })}
        colAxisLabel="Start hour"
        legendLabel={(max) => `${max} walks`}
      />
    </ChartCard>
  )
}
