import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function ReviewsChart({
  data,
}: {
  data: Array<{ date: string; count: number }>
}) {
  const hasAny = data.some((d) => d.count > 0)
  return (
    <div className="h-[120px] w-full">
      {hasAny ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="date"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={24}
              allowDecimals={false}
              tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in oklch, var(--accent) 40%, transparent)' }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: 11,
                padding: '4px 8px',
              }}
              labelFormatter={(d) => d}
              formatter={(v) => [String(v), 'reviews']}
            />
            <Bar
              dataKey="count"
              fill="var(--primary)"
              radius={[2, 2, 0, 0]}
              minPointSize={1}
              isAnimationActive={false}
              background={{ fill: 'color-mix(in oklch, var(--foreground) 8%, transparent)', radius: [2, 2, 0, 0] }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
          No reviews in the last 30 days
        </div>
      )}
    </div>
  )
}
