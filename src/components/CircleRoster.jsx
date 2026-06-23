import { useState } from 'react'

function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${days[dt.getDay()]} ${d} ${months[m - 1]}`
}

function pctColor(pct) {
  if (pct >= 70) return { bg: '#edf7ef', fg: '#2e7d45' }
  if (pct >= 40) return { bg: '#fef9ec', fg: '#8a6f3c' }
  return { bg: '#fdf0ee', fg: '#b84040' }
}

function CircleTable({ circle, sessionDates }) {
  const [isOpen, setIsOpen] = useState(true)

  const totalSessions = sessionDates.length
  const studentsWithCount = circle.students.map(s => ({
    ...s,
    count: sessionDates.filter(d => s.sessions[d]).length,
  }))

  const totalPresent = studentsWithCount.reduce((sum, s) => sum + s.count, 0)
  const totalPossible = circle.students.length * totalSessions
  const pct = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0
  const badge = pctColor(pct)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          background: isOpen ? 'rgba(138,111,60,0.05)' : 'none',
          border: 'none',
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
            {circle.circle}
          </span>
          {circle.leader && (
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-light)', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
              {circle.leader}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: "'JetBrains Mono', monospace" }}>
            {circle.students.length} alumnos · {totalSessions} ses.
          </span>
          <span style={{
            background: badge.bg, color: badge.fg,
            borderRadius: 6, padding: '2px 8px',
            fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          }}>
            {pct}%
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-light)', width: 12, textAlign: 'center' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
          {totalSessions === 0 ? (
            <p style={{ padding: '16px', fontSize: 13, color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>
              Sin sesiones registradas.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{
                    padding: '8px 14px', textAlign: 'left',
                    fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                    position: 'sticky', left: 0, background: '#f5f5f5',
                    minWidth: 170, borderRight: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    Alumno
                  </th>
                  {sessionDates.map(d => (
                    <th key={d} style={{
                      padding: '8px 10px', textAlign: 'center',
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                      fontSize: 11, whiteSpace: 'nowrap', minWidth: 82,
                      borderRight: '1px solid var(--border)',
                    }}>
                      {fmtDate(d)}
                    </th>
                  ))}
                  <th style={{
                    padding: '8px 12px', textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                    fontSize: 11, minWidth: 60,
                  }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentsWithCount.map((s, i) => {
                  const rowBg = i % 2 === 0 ? '#fff' : '#fafafa'
                  const sPct = totalSessions > 0 ? Math.round((s.count / totalSessions) * 100) : 0
                  const sBadge = pctColor(sPct)
                  return (
                    <tr key={s.id} style={{ background: rowBg }}>
                      <td style={{
                        padding: '7px 14px',
                        fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 12,
                        position: 'sticky', left: 0, background: rowBg,
                        borderRight: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}>
                        {s.name}
                      </td>
                      {sessionDates.map(d => (
                        <td key={d} style={{
                          padding: '7px 10px', textAlign: 'center',
                          borderRight: '1px solid #f0f0f0',
                          color: s.sessions[d] ? '#2e7d45' : '#d0d0d0',
                          fontWeight: s.sessions[d] ? 700 : 400,
                          fontSize: 14,
                        }}>
                          {s.sessions[d] ? '✓' : '—'}
                        </td>
                      ))}
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                        <span style={{
                          background: sBadge.bg, color: sBadge.fg,
                          borderRadius: 5, padding: '2px 6px',
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11,
                        }}>
                          {s.count}/{totalSessions}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f5f5f5', borderTop: '2px solid var(--border)' }}>
                  <td style={{
                    padding: '7px 14px',
                    fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    position: 'sticky', left: 0, background: '#f5f5f5',
                    borderRight: '1px solid var(--border)',
                  }}>
                    Presentes
                  </td>
                  {sessionDates.map(d => {
                    const count = circle.students.filter(s => s.sessions[d]).length
                    const sesTotal = circle.students.length
                    const sesPct = sesTotal > 0 ? Math.round((count / sesTotal) * 100) : 0
                    const sesBadge = pctColor(sesPct)
                    return (
                      <td key={d} style={{
                        padding: '7px 10px', textAlign: 'center',
                        borderRight: '1px solid #f0f0f0',
                      }}>
                        <span style={{
                          background: sesBadge.bg, color: sesBadge.fg,
                          borderRadius: 5, padding: '2px 6px',
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11,
                        }}>
                          {count}/{sesTotal}
                        </span>
                      </td>
                    )
                  })}
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    <span style={{
                      background: badge.bg, color: badge.fg,
                      borderRadius: 5, padding: '2px 6px',
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11,
                    }}>
                      {pct}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default function CircleRoster({ roster }) {
  if (!roster || !roster.circles || roster.circles.length === 0) return null

  const { sessionDates, circles } = roster

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p className="section-title">Lista de asistencia por círculo</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {circles.map(circle => (
          <CircleTable key={circle.id} circle={circle} sessionDates={sessionDates} />
        ))}
      </div>
    </div>
  )
}
