import AlertBanner from '../components/AlertBanner'
import KpiCard from '../components/KpiCard'
import TrendChart from '../components/TrendChart'
import CircleBarChart from '../components/CircleBarChart'
import AttendanceDonut from '../components/AttendanceDonut'
import LeadersTable from '../components/LeadersTable'
import AtRiskList from '../components/AtRiskList'
import CircleRoster from '../components/CircleRoster'

export default function ClassTab({ classData, circles }) {
  if (!classData) return (
    <p style={{ color: 'var(--text-light)', padding: 40, textAlign: 'center' }}>
      Sin datos para esta clase.
    </p>
  )

  const { kpis, trendByDate, byCircle, donut, missingAlerts, atRisk, leadersTable, rosterByCircle } = classData

  return (
    <div>
      <AlertBanner alerts={missingAlerts} />

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <KpiCard label="Alumnos" value={kpis.totalStudents} />
        <KpiCard label="Asist. promedio" value={`${kpis.avgPct ?? 0}%`} />
        <KpiCard label="Círculos" value={kpis.totalCircles} />
        <KpiCard label="Sesiones" value={kpis.totalSessions} />
      </div>

      {/* Trend chart */}
      <TrendChart data={trendByDate} />

      {/* Bar + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <CircleBarChart data={byCircle} />
        <AttendanceDonut present={donut.present} absent={donut.absent} />
      </div>

      {/* Leaders table */}
      <LeadersTable leaders={leadersTable} />

      {/* At-risk students */}
      <AtRiskList students={atRisk} circles={circles} />

      {/* Attendance roster by circle */}
      <CircleRoster roster={rosterByCircle} />
    </div>
  )
}
