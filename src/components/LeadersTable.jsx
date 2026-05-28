export default function LeadersTable({ leaders }) {
  if (!leaders || leaders.length === 0) return null

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p className="section-title">Líderes de círculo</p>
      <table className="dash-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Líder</th>
            <th>Círculo</th>
            <th>Inscritos</th>
            <th>% Asistencia</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((l, i) => (
            <tr key={l.id || i}>
              <td style={{ color: 'var(--text-light)', width: 32 }}>{i + 1}</td>
              <td style={{ fontWeight: 700 }}>{l.leader}</td>
              <td style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: 'var(--text-light)' }}>
                {l.circle}
              </td>
              <td style={{ textAlign: 'center' }}>{l.enrolled}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: 'var(--border)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    maxWidth: 80,
                  }}>
                    <div style={{
                      width: `${l.pct}%`,
                      height: '100%',
                      background: 'var(--gold)',
                      borderRadius: 3,
                    }} />
                  </div>
                  <span className="pct-badge">{l.pct}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
