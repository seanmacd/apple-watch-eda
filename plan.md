# Walking Dashboard Plan

A React dashboard that takes the walking EDA (`notebooks/eda.ipynb`) further. This file collects every design decision before the build starts.

**Decisions so far:** Recharts · TypeScript · Python → JSON data export · runs locally (`npm run dev`) · dark theme only · Activity Rings as the hero · filters for Year, Season, Day of week and Time of day.

---

## 1. Goal
A one-page, dark "insights" dashboard of my Apple Watch walks (106 walks, March 2024 to September 2026). It reads top to bottom: **headline KPIs → trends → habits → detail → data validation**.

## 2. Tech stack

| Piece | Choice | Why |
|---|---|---|
| Build | Vite + React + TypeScript | Fast dev server; a typed `Walk` record catches column typos |
| Charts | Recharts | Built for React, easy to theme with ring colours; covers bar, line, area and scatter |
| Heatmaps & rings | Custom SVG / CSS grid components | Recharts has no heatmap; the rings are 3 SVG arcs |
| Styling | Tailwind CSS | Fast dark layouts, design tokens in one place |
| State | React Context + `useReducer` | 4 filters don't need a store library (switch to Zustand only if it grows) |
| Data | `scripts/export_dashboard_data.py` → `walks.json` + `regression.json` | Reuses the pandas pipeline; regression stats match the notebook |

**Alternatives considered**
- **Nivo**: built-in heatmaps and nice themes, but heavier and less flexible
- **Apache ECharts**: the most powerful option, but a large bundle and a config-object style rather than React components
- **visx / D3**: full control, but far more code per chart

## 3. Colour scheme: Activity Rings on true black

| Role | Colour | Used for |
|---|---|---|
| Move red | `#FA114F` | Active calories |
| Exercise green | `#A6FF00` | Walk time |
| Stand blue | `#00D8FF` | Distance |
| Background | `#000000` | Page |
| Card | `#1C1C1E` | Chart and KPI cards |
| Border | `#2C2C2E` | Card borders, gridlines |
| Text / muted | `#FFFFFF` / `#8E8E93` | Labels and axes |

- Each metric keeps its ring colour in every chart
- Heatmaps: black → blue ramp for distance, black → green for walk counts

## 4. Layout (eye flow: top-left → right → down)

```
┌ Header: "Walking Dashboard" ─────────────────── Filter bar (sticky) ┐
├ [ Activity Rings ] [ Total km ][ Active kcal ][ Walk time ][ Walks ] ┤  row 1: headline
├ [ Cumulative distance over time (wide)       ][ Walks by day ]     ┤  row 2: story
├ [ Day × hour heatmap         ][ Year × month distance heatmap ]    ┤  row 3: habits
├ [ Distribution (toggle km/min/speed/HR)      ][ Speed by length ]  ┤  row 4: detail
├ ── Data validation (static, all walks) ─────────────────────────── ┤
│ [ Calories vs distance + fit, R² ]   [ Duration vs distance + fit, R² ] │  row 5
└───────────────────────────────────────────────────────────────────── ┘
```

- **Eight charts plus the rings**
- Rows 1–4 react to the filters
- Row 5 is fixed and labelled "Static · all 106 walks"; it shows the data behaves as expected

## 5. Activity Rings
- The rings **show data, not goals**
- Each ring shows the **filtered slice's share of the all-time total**: red = active kcal, green = walk time, blue = distance
- With no filters, all three rings are closed (100%); filtering to e.g. "Summer weekends" shows that slice's share
- The centre shows the walk count; hovering shows the actual values

## 6. Filters
- **Year**: 2024 / 2025 / 2026 (multi-select chips)
- **Season**: Spring / Summer / Fall / Winter
- **Day of week**: Mon to Sun, plus *Weekdays* and *Weekends* quick picks
- **Time of day**: Morning / Midday / Afternoon / Evening
- Logic: AND across groups, OR within a group
- Reset button and an active filter count
- An empty result shows a friendly "No walks match these filters" state in each card

## 7. Charts

| # | Chart | EDA source | Filtered? |
|---|---|---|---|
| 1 | Cumulative distance (area, blue) | §5 Trends | Yes (recomputed within the filter) |
| 2 | Walks by day of week (bars, weekend highlighted) | §4 Habits ⭐ | Yes |
| 3 | Day × hour heatmap | §4 Habits ⭐ | Yes |
| 4 | Year × month distance heatmap | §4 Habits ⭐ | Yes |
| 5 | Distribution histogram with metric toggle and median line | §3 Distributions ⭐ | Yes |
| 6 | Speed by walk length (median bars and points) | §8 Speed by length | Yes |
| 7 | Calories vs distance: scatter, fit line, equation, R² 0.92 | §6 Regression ⭐ | Static |
| 8 | Duration vs distance: scatter, fit line, equation, R² 0.83 | §6 Regression ⭐ | Static |

## 8. Data export
`scripts/export_dashboard_data.py` reads `data/processed/clean_walks.csv` and converts dates to `America/Halifax`, exactly as `eda.ipynb` does. It writes to `dashboard/src/data/`:

- **`walks.json`**: one record per walk with only the fields the app uses: `startDate` (local ISO), `distance_km`, `duration`, `calories_active`, `speed`, `heart_rate_average`, `distance_band`, `year`, `season`, `month`, `day_name`, `is_weekend`, `hour`, `time_of_day`
- **`regression.json`**: slope, intercept and R² for charts 7 and 8, using the same `regression_stats` logic as the notebook (`np.polyfit` + R²) so the numbers match

## 9. Project structure
```
scripts/
  export_dashboard_data.py
dashboard/
  src/data/{walks.json, regression.json}
  src/types.ts                 # Walk, Filters
  src/theme.ts                 # ring colours + tokens
  src/state/FiltersContext.tsx
  src/lib/{filter.ts, aggregate.ts}
  src/components/{FilterBar, ActivityRings, KpiTile, ChartCard, Heatmap}.tsx
  src/charts/*.tsx             # one file per chart
```

## 10. Build phases
1. Scaffold Vite + TypeScript + Tailwind; write the export script; load the typed data
2. Theme, layout grid, KPI tiles, Activity Rings
3. Filter bar and context; wire up the KPIs and rings
4. Filtered charts 1–6
5. Static validation panel (charts 7–8)
6. Polish: tooltips, empty states, responsive stacking, README section

## 11. Open questions
Built with these defaults; change any of them if you disagree.
- [ ] Ring meaning: **built as share of the all-time total**
- [ ] 4th KPI tile: **built as walk count** (average pace is the alternative)
- [ ] Heart rate vs speed chart: **left out** (R² 0.11, a weak relationship)

## 12. Build notes
- **Vite 5**, not Vite 8: Vite 8 needs Node 20.19+ or 22.12+, and this machine has Node 21.7. Upgrade Node to 22 LTS to move to Vite 8.
- **`npm run lint` fails on Node 21** for the same reason (oxlint has the same Node requirement). It will work after upgrading to Node 22; `npm run build` still type-checks everything in strict mode.
- **Filters are stored in the URL** (e.g. `?year=2026&season=Summer&day=Sat,Sun`), so views can be bookmarked and shared.
- **Ring colours** fail the palette validator's "lightness band" check: the neon green and cyan are much brighter than the red. They're kept on purpose to match the Watch, and they pass the colour-blind separation and contrast checks. Every metric is also labelled in text, so colour never carries meaning on its own.
