export default function KpiCard({ label, value, sub, wide }) {
  return (
    <div className="card" style={{ flex: wide ? '2 1 240px' : '1 1 160px', minWidth: 140 }}>
      <p className="section-title" style={{ marginBottom: 8 }}>{label}</p>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        fontSize: 32,
        color: 'var(--gold)',
        lineHeight: 1,
        marginBottom: sub ? 8 : 0,
      }}>{value}</p>
      {sub && (
        <div style={{ marginTop: 6 }}>
          {Object.entries(sub).map(([k, v]) => (
            <p key={k} style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 2 }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>{k}</span>
              {' · '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold)' }}>{v}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
