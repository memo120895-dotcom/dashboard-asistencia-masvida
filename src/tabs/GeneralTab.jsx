import Podium from '../components/Podium'
import KpiCard from '../components/KpiCard'
import TrendChart from '../components/TrendChart'
import CircleBarChart from '../components/CircleBarChart'
import AttendanceDonut from '../components/AttendanceDonut'

const CLASS_LABELS = {
  'sanidad-emocional': 'Sanidad Emocional',
  'sanidad-relaciones': 'Sanidad en Relaciones',
}

function label(id) { return CLASS_LABELS[id] || id }

export default function GeneralTab({ data }) {
  const { kpis, podium, trendByDate, byCircle, donut } = data

  const studentsSub = kpis.studentsByClass
    ? Object.fromEntries(
        Object.entries(kpis.studentsByClass).map(([k, v]) => [label(k), v])
      )
    : null

  const avgSub = kpis.avgPctByClass
    ? Object.fromEntries(
        Object.entries(kpis.avgPctByClass).map(([k, v]) => [label(k), `${v}%`])
      )
    : null

  return (
    <div>
      <Podium leaders={podium} />

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <KpiCard label="Total alumnos" value={kpis.totalStudents} sub={studentsSub} wide />
        <KpiCard label="Asist. promedio" value={`${kpis.avgPct ?? 0}%`} sub={avgSub} wide />
        <KpiCard label="Círculos" value={kpis.totalCircles} />
        <KpiCard label="Sesiones" value={kpis.totalSessions} />
      </div>

      {/* Trend chart — full width */}
      <TrendChart data={trendByDate} />

      {/* Bar + Donut side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <CircleBarChart data={byCircle} />
        <AttendanceDonut present={donut.present} absent={donut.absent} />
      </div>
    </div>
  )
}
