# Apple Watch Exploratory Data Analysis

Exploring data analysis with data from my Apple Watch walking workouts.

## Project layout
- `notebooks/extract.ipynb` → `clean.ipynb` → `eda.ipynb`: extract, clean and explore the Apple Health export
- `scripts/export_dashboard_data.py`: turns the cleaned CSV into JSON for the dashboard
- `dashboard/`: React dashboard (Vite, TypeScript, Recharts, Tailwind)
- `plan.md`: design decisions behind the dashboard

## Running the dashboard
Requires Node 18+ and Python 3 with pandas and numpy.

```bash
python3 scripts/export_dashboard_data.py   # re-run after cleaning new data
cd dashboard
npm install
npm run dev                                # http://localhost:5173
```
