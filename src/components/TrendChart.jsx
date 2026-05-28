import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS_ES[parseInt(m) - 1]}`
}

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ marginBottom: 24, textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>
        <p className="font-serif" style={{ fontSize: 15 }}>Sin datos de asistencia aún</p>
      </div>
    )
  }

  const chartData = data.map(d => ({ ...d, label: fmtDate(d.date) }))

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p className="section-title">Tendencia de asistencia</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'var(--text-light)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'var(--text-light)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--text-light)' }}
            itemStyle={{ color: 'var(--gold)' }}
            formatter={(v) => [v, 'Presentes']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--gold)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--gold)', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'var(--gold)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
