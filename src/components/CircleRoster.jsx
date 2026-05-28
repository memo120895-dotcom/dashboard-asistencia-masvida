import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function CircleRow({ circle }) {
  const [isOpen, setIsOpen] = useState(false)
  const pct = circle.enrolled > 0 ? Math.round((circle.present.length / circle.enrolled) * 100) : 0

  const badgeColor = pct >= 70
    ? { bg: '#edf7ef', fg: '#2e7d45' }
    : pct >= 40
    ? { bg: '#fef9ec', fg: '#8a6f3c' }
    : { bg: '#fdf0ee', fg: '#b84040' }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
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
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: 'var(--text)',
          }}>
            {circle.circle}
          </span>
          {circle.leader && (
            <span style={{
              marginLeft: 8,
              fontSize: 12,
              color: 'var(--text-light)',
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
            }}>
              {circle.leader}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {circle.lastDate && (
            <span style={{
              fontSize: 11,
              color: 'var(--text-light)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {formatDate(circle.lastDate)}
            </span>
          )}
          <span style={{
            background: badgeColor.bg,
            color: badgeColor.fg,
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
          }}>
            {circle.present.length}/{circle.enrolled}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-light)', width: 12, textAlign: 'center' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
          {circle.takenBy && (
            <p style={{
              fontSize: 11,
              color: 'var(--text-light)',
              fontFamily: "'JetBrains Mono', monospace",
              margin: '10px 0 14px',
            }}>
              Registró asistencia: {circle.takenBy}
            </p>
          )}

          {!circle.lastDate && (
            <p style={{
              fontSize: 13,
              color: 'var(--text-light)',
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              marginTop: 10,
            }}>
              Sin asistencia registrada
            </p>
          )}

          {circle.lastDate && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: circle.takenBy ? 0 : 12 }}>
              <div>
                <p style={{
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: "'Manrope', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#2e7d45',
                  marginBottom: 6,
                }}>
                  ✓ Presentes · {circle.present.length}
                </p>
                {circle.present.length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic' }}>Nadie</p>
                  : circle.present.map(s => (
                    <div key={s.id} style={{ fontSize: 13, padding: '3px 0', color: 'var(--text)' }}>
                      {s.name}
                    </div>
                  ))
                }
              </div>

              <div>
                <p style={{
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: "'Manrope', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--alert)',
                  marginBottom: 6,
                }}>
                  ✗ Ausentes · {circle.absent.length}
                </p>
                {circle.absent.length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic' }}>Nadie</p>
                  : circle.absent.map(s => (
                    <div key={s.id} style={{ fontSize: 13, padding: '3px 0', color: 'var(--text-light)' }}>
                      {s.name}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CircleRoster({ roster }) {
  if (!roster || roster.length === 0) return null

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p className="section-title">Lista de asistencia por círculo</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {roster.map(circle => (
          <CircleRow key={circle.id} circle={circle} />
        ))}
      </div>
    </div>
  )
}
