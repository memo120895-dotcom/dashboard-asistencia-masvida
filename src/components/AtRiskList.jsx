const CLASS_LABELS = {
  'sanidad-emocional': 'Sanidad Emocional',
  'sanidad-relaciones': 'Sanidad en Relaciones',
}

function classLabel(id) {
  return CLASS_LABELS[id] || id
}

export default function AtRiskList({ students, circles }) {
  if (!students || students.length === 0) {
    return (
      <div className="card">
        <p className="section-title">Alumnos dejando de asistir</p>
        <p style={{ fontSize: 13, color: 'var(--text-light)', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
          Sin alumnos en riesgo — ¡excelente!
        </p>
      </div>
    )
  }

  const enriched = students.map(s => {
    const circle = circles?.find(c => c.id === s.circle_id)
    return { ...s, leaderName: s.leader || circle?.leader_name || '—', circleId: s.circle_id }
  })

  return (
    <div className="card">
      <p className="section-title" style={{ color: 'var(--alert)' }}>
        ⚠️ Alumnos dejando de asistir · {students.length}
      </p>
      <table className="dash-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Clase</th>
            <th>Líder</th>
          </tr>
        </thead>
        <tbody>
          {enriched.map((s, i) => (
            <tr key={s.id || i}>
              <td style={{ fontWeight: 700 }}>{s.name}</td>
              <td>
                {s.phone
                  ? <a href={`tel:${s.phone}`} style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {s.phone}
                    </a>
                  : <span style={{ color: 'var(--text-light)' }}>—</span>
                }
              </td>
              <td style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: 'var(--text-light)', fontSize: 12 }}>
                {classLabel(s.class_id)}
              </td>
              <td style={{ color: 'var(--text-light)' }}>{s.leaderName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
