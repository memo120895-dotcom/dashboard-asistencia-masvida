import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CircleBarChart({ data }) {
  if (!data || data.length === 0) return null

  const chartData = data.map(d => ({ name: d.circle, pct: d.pct, leader: d.leader }))

  return (
    <div className="card">
      <p className="section-title">Asistencia por círculo</p>
      <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 44)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'var(--text-light)' }}
            tickFormatter={v => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12, fontFamily: 'Instrument Serif', fontStyle: 'italic', fill: 'var(--text)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
            }}
            formatter={(v, name, props) => [`${v}%`, props.payload.leader]}
            labelStyle={{ display: 'none' }}
          />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? 'var(--gold)' : `rgba(138, 111, 60, ${0.35 + (chartData.length - i) / chartData.length * 0.45})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
