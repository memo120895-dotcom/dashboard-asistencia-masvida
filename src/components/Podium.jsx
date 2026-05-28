const MEDALS = ['🥇', '🥈', '🥉']
const HEIGHTS = [140, 100, 80] // podium column heights in px
const ORDER = [1, 0, 2] // display order: 2nd, 1st, 3rd

export default function Podium({ leaders }) {
  if (!leaders || leaders.length === 0) return null

  const top3 = leaders.slice(0, 3)
  // Reorder for podium display: second place left, first place center, third place right
  const displayed = ORDER.map(i => top3[i]).filter(Boolean)

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p className="section-title">Top líderes · Asistencia</p>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 16,
        paddingTop: 16,
      }}>
        {displayed.map((leader, displayIdx) => {
          const originalRank = ORDER[displayIdx]
          const isFirst = originalRank === 0
          return (
            <div key={leader.id || displayIdx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              flex: isFirst ? '0 0 200px' : '0 0 160px',
            }}>
              {/* Info above podium block */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: isFirst ? 28 : 22 }}>{MEDALS[originalRank]}</p>
                <p style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 800,
                  fontSize: isFirst ? 15 : 13,
                  color: 'var(--text)',
                  marginTop: 4,
                  marginBottom: 2,
                }}>{leader.leader}</p>
                <p style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: 'var(--text-light)',
                  marginBottom: 4,
                }}>{leader.circle}</p>
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  fontSize: isFirst ? 22 : 18,
                  color: 'var(--gold)',
                }}>{leader.pct}%</p>
                <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
                  {leader.enrolled} inscritos
                </p>
              </div>
              {/* Podium block */}
              <div style={{
                width: '100%',
                height: HEIGHTS[originalRank],
                background: isFirst
                  ? 'linear-gradient(180deg, var(--gold-light), var(--gold))'
                  : 'var(--border)',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  fontSize: 20,
                  color: isFirst ? 'white' : 'var(--text-light)',
                }}>
                  #{originalRank + 1}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
