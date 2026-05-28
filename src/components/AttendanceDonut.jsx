import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function AttendanceDonut({ present, absent }) {
  const total = present + absent
  if (total === 0) return null

  const pct = Math.round((present / total) * 100)
  const data = [
    { name: 'Presentes', value: present },
    { name: 'Ausentes', value: absent },
  ]
  const COLORS = ['var(--gold)', 'var(--border)']

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p className="section-title">Presente vs Ausente</p>
      <div style={{ position: 'relative', width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            fontSize: 22,
            color: 'var(--gold)',
            lineHeight: 1,
          }}>{pct}%</p>
          <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 2 }}>asistencia</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{d.name}: </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text)' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
