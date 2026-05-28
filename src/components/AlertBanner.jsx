const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS_ES[parseInt(m) - 1]}`
}

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: 'var(--alert-bg)',
          border: '1px solid var(--alert)',
          borderRadius: 12,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p style={{ fontSize: 13, color: 'var(--alert)', fontWeight: 700 }}>
            No se registró asistencia del{' '}
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
              {a.day} {fmtDate(a.date)}
            </span>
          </p>
        </div>
      ))}
    </div>
  )
}
