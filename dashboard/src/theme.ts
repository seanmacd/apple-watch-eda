// Activity Rings colours. Each metric keeps its ring colour in every chart:
// red = active calories (Move), green = walk time and walk counts (Exercise), blue = distance (Stand).
export const COLORS = {
  move: '#FA114F',
  exercise: '#A6FF00',
  stand: '#00D8FF',
  page: '#000000',
  card: '#1C1C1E',
  raised: '#2C2C2E',
  grid: '#2C2C2E',
  ink: '#FFFFFF',
  ink2: '#AEAEB2',
  ink3: '#8E8E93',
} as const

export const AXIS_TICK = { fill: COLORS.ink3, fontSize: 12 }
