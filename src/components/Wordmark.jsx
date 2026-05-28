export function Wordmark({ size = 40 }) {
  return (
    <div style={{
      fontSize: size,
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      letterSpacing: size * -0.04,
      lineHeight: 1,
      color: 'var(--text)',
    }}>
      más<span style={{ color: 'var(--gold)' }}>vida</span>
    </div>
  )
}
