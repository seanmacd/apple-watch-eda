import { useMemo, type ReactNode } from 'react'
import { CumulativeDistance } from './charts/CumulativeDistance'
import { DayHourHeatmap } from './charts/DayHourHeatmap'
import { Distribution } from './charts/Distribution'
import { CaloriesVsDistance, DurationVsDistance } from './charts/RegressionScatter'
import { SpeedByLength } from './charts/SpeedByLength'
import { WalksByDay } from './charts/WalksByDay'
import { YearMonthHeatmap } from './charts/YearMonthHeatmap'
import { ActivityRings } from './components/ActivityRings'
import { FilterBar } from './components/FilterBar'
import { KpiTile } from './components/KpiTile'
import { WALKS } from './data'
import { totals } from './lib/aggregate'
import { fmt1, fmtDate, fmtDuration, fmtInt } from './lib/format'
import { FiltersProvider, useFilters } from './state/FiltersContext'
import { COLORS } from './theme'

const ALL_TIME = totals(WALKS)
const FIRST = WALKS[0].time
const LAST = WALKS[WALKS.length - 1].time

function Section({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-3 px-1 text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">
        {label}
        {note && <span className="font-normal tracking-normal normal-case">{note}</span>}
      </h2>
      {children}
    </section>
  )
}

function Headline() {
  const { walks } = useFilters()
  const t = useMemo(() => totals(walks), [walks])
  const share = (v: number, all: number) => (all ? v / all : 0)
  // Per-walk averages are meaningless with no walks
  const perWalk = (v: number, fmt: (n: number) => string, unit: string) =>
    t.count ? `${fmt(v / t.count)} ${unit} per walk` : 'No walks selected'

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="rounded-2xl border border-line bg-card p-5 lg:col-span-5">
        <h3 className="mb-4 text-[15px] font-semibold text-ink">
          Activity rings <span className="font-normal text-ink-3">· share of all-time totals</span>
        </h3>
        <ActivityRings
          count={t.count}
          rings={[
            { name: 'Move', metric: 'Active calories', color: COLORS.move, share: share(t.kcal, ALL_TIME.kcal), value: `${fmtInt(t.kcal)} kcal` },
            { name: 'Exercise', metric: 'Walk time', color: COLORS.exercise, share: share(t.minutes, ALL_TIME.minutes), value: fmtDuration(t.minutes) },
            { name: 'Distance', metric: 'Kilometres', color: COLORS.stand, share: share(t.km, ALL_TIME.km), value: `${fmt1(t.km)} km` },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
        <KpiTile label="Total distance" value={fmt1(t.km)} unit="km" sub={perWalk(t.km, fmt1, 'km')} color={COLORS.stand} />
        <KpiTile label="Active calories" value={fmtInt(t.kcal)} unit="kcal" sub={perWalk(t.kcal, fmtInt, 'kcal')} color={COLORS.move} />
        <KpiTile label="Walk time" value={fmt1(t.minutes / 60)} unit="h" sub={perWalk(t.minutes, fmtInt, 'min')} color={COLORS.exercise} />
        <KpiTile label="Walks" value={String(t.count)} sub={`${Math.round(share(t.count, ALL_TIME.count) * 100)}% of all ${ALL_TIME.count} walks`} />
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Walking Dashboard</h1>
            <p className="text-[13px] text-ink-3">
              Apple Watch walking workouts · {fmtDate(FIRST)} – {fmtDate(LAST)}
            </p>
          </div>
          <FilterBar />
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <Section label="Overview">
          <Headline />
        </Section>

        <Section label="Trends">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <CumulativeDistance className="lg:col-span-8" />
            <WalksByDay className="lg:col-span-4" />
          </div>
        </Section>

        <Section label="Habits">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <DayHourHeatmap />
            <YearMonthHeatmap />
          </div>
        </Section>

        <Section label="Detail">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Distribution className="lg:col-span-7" />
            <SpeedByLength className="lg:col-span-5" />
          </div>
        </Section>

        <Section label="Data validation" note={`Static · all ${WALKS.length} walks, not affected by filters`}>
          <p className="max-w-3xl px-1 text-[13px] text-ink-2">
            Calories and duration should both rise in a straight line with distance. They do, almost perfectly,
            which shows the watch data behaves as expected.
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CaloriesVsDistance />
            <DurationVsDistance />
          </div>
        </Section>

        <footer className="px-1 pb-4 text-[12px] text-ink-3">
          Data: Apple Health export, cleaned in <code>notebooks/clean.ipynb</code>. Explored in{' '}
          <code>notebooks/eda.ipynb</code>.
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <FiltersProvider>
      <Dashboard />
    </FiltersProvider>
  )
}
