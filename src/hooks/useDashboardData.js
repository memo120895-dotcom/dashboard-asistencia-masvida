import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Returns most recent Wednesday and Sunday dates <= today
function getRecentSessionDates() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = today.getDay() // 0=Sun, 1=Mon, ..., 3=Wed, 6=Sat

  const recentWed = new Date(today)
  const daysToWed = (day + 7 - 3) % 7 // days since last Wednesday
  recentWed.setDate(today.getDate() - daysToWed)

  const recentSun = new Date(today)
  const daysToSun = day // days since last Sunday
  recentSun.setDate(today.getDate() - daysToSun)

  const fmt = d => d.toISOString().split('T')[0]
  return { recentWed: fmt(recentWed), recentSun: fmt(recentSun) }
}

function toDateStr(d) {
  return new Date(d).toISOString().split('T')[0]
}

function computeMissingAlerts(attendanceRows, classCircleIds) {
  const { recentWed, recentSun } = getRecentSessionDates()
  const datesWithAttendance = new Set(
    attendanceRows
      .filter(r => classCircleIds.has(r.circle_id))
      .map(r => toDateStr(r.session_date))
  )
  const alerts = []
  if (!datesWithAttendance.has(recentWed)) {
    alerts.push({ day: 'miércoles', date: recentWed })
  }
  if (!datesWithAttendance.has(recentSun)) {
    alerts.push({ day: 'domingo', date: recentSun })
  }
  return alerts
}

function computeAtRisk(attendanceRows, students, classCircleIds) {
  // Get the last 2 distinct session dates for this class
  const classDates = [...new Set(
    attendanceRows
      .filter(r => classCircleIds.has(r.circle_id))
      .map(r => toDateStr(r.session_date))
  )].sort((a, b) => b.localeCompare(a)) // desc

  const lastTwoDates = classDates.slice(0, 2)
  if (lastTwoDates.length === 0) return []

  // Students who appeared at least once before the last 2 sessions
  const hasPriorHistory = new Set(
    attendanceRows
      .filter(r => classCircleIds.has(r.circle_id) && !lastTwoDates.includes(toDateStr(r.session_date)))
      .map(r => r.student_id)
  )

  // Students who attended in the last 2 sessions
  const attendedRecently = new Set(
    attendanceRows
      .filter(r => classCircleIds.has(r.circle_id) && lastTwoDates.includes(toDateStr(r.session_date)))
      .map(r => r.student_id)
  )

  return students
    .filter(s => classCircleIds.has(s.circle_id) && hasPriorHistory.has(s.id) && !attendedRecently.has(s.id))
    .map(s => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      circle_id: s.circle_id,
    }))
}

function computeRosterByCircle(attendanceRows, circles, students, classCircleIds) {
  return circles
    .filter(c => classCircleIds.includes(c.id))
    .map(c => {
      const circleStudents = students.filter(s => s.circle_id === c.id)

      const circleDates = [...new Set(
        attendanceRows
          .filter(r => r.circle_id === c.id)
          .map(r => toDateStr(r.session_date))
      )].sort((a, b) => b.localeCompare(a))

      const lastDate = circleDates[0] || null
      const presentRows = lastDate
        ? attendanceRows.filter(r => r.circle_id === c.id && toDateStr(r.session_date) === lastDate)
        : []

      const presentIds = new Set(presentRows.map(r => r.student_id))
      const takenBy = presentRows[0]?.taken_by || null

      return {
        id: c.id,
        circle: c.name,
        leader: c.leader_name,
        enrolled: circleStudents.length,
        lastDate,
        takenBy,
        present: circleStudents.filter(s => presentIds.has(s.id)),
        absent: circleStudents.filter(s => !presentIds.has(s.id)),
      }
    })
}

function aggregateForScope(attendanceRows, circles, students, circleIds) {
  const circleSet = new Set(circleIds)
  const scopeAttendance = attendanceRows.filter(r => circleSet.has(r.circle_id))
  const scopeStudents = students.filter(s => circleSet.has(s.circle_id))

  // Unique session dates
  const sessionDates = [...new Set(scopeAttendance.map(r => toDateStr(r.session_date)))]
  const totalSessions = sessionDates.length

  // Total enrolled students
  const totalStudents = scopeStudents.length

  // Trend by date
  const trendMap = {}
  scopeAttendance.forEach(r => {
    const d = toDateStr(r.session_date)
    trendMap[d] = (trendMap[d] || 0) + 1
  })
  const trendByDate = Object.entries(trendMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Per circle stats
  const byCircle = circles
    .filter(c => circleSet.has(c.id))
    .map(c => {
      const circleStudents = students.filter(s => s.circle_id === c.id)
      const enrolled = circleStudents.length
      const possibleAttendances = enrolled * totalSessions
      const actualAttendances = scopeAttendance.filter(r => r.circle_id === c.id).length
      const pct = possibleAttendances > 0 ? Math.round((actualAttendances / possibleAttendances) * 100) : 0
      return {
        id: c.id,
        circle: c.name,
        leader: c.leader_name,
        leader_phone: c.leader_phone,
        class_id: c.class_id,
        enrolled,
        pct,
      }
    })
    .sort((a, b) => b.pct - a.pct)

  // Global donut
  const totalPresent = scopeAttendance.length
  const totalPossible = totalStudents * totalSessions
  const totalAbsent = Math.max(0, totalPossible - totalPresent)

  // Average attendance %
  const avgPct = byCircle.length > 0
    ? Math.round(byCircle.reduce((sum, c) => sum + c.pct, 0) / byCircle.length)
    : 0

  return {
    kpis: {
      totalStudents,
      totalCircles: circleIds.length,
      totalSessions,
      avgPct,
    },
    trendByDate,
    byCircle,
    donut: { present: totalPresent, absent: totalAbsent },
  }
}

export function useDashboardData() {
  const [seasons, setSeasons] = useState([])
  const [selectedSeasonId, setSelectedSeasonId] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load seasons on mount
  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .order('year', { ascending: false })
      .then(({ data: rows, error: err }) => {
        if (err) { setError(err.message); return }
        setSeasons(rows || [])
        const active = rows?.find(s => s.active)
        setSelectedSeasonId(active?.id || rows?.[0]?.id || null)
      })
  }, [])

  // Load dashboard data when season changes
  useEffect(() => {
    if (!selectedSeasonId) return

    setLoading(true)
    setError(null)

    async function fetchAll() {
      // Circles for this season
      const { data: circles, error: circErr } = await supabase
        .from('circles')
        .select('*')
        .eq('season_id', selectedSeasonId)

      if (circErr) { setError(circErr.message); setLoading(false); return }
      if (!circles || circles.length === 0) {
        setData({ kpis: {}, podium: [], trendByDate: [], byCircle: [], donut: {}, byClass: {}, seasons })
        setLoading(false)
        return
      }

      const circleIds = circles.map(c => c.id)

      // Students for these circles
      const { data: students, error: studErr } = await supabase
        .from('students')
        .select('*')
        .in('circle_id', circleIds)

      if (studErr) { setError(studErr.message); setLoading(false); return }

      // Attendance for this season
      const { data: attendance, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('season_id', selectedSeasonId)

      if (attErr) { setError(attErr.message); setLoading(false); return }

      // ── Global aggregation ──
      const globalAgg = aggregateForScope(attendance, circles, students, circleIds)

      // ── Podium: top 3 leaders by % ──
      const podium = globalAgg.byCircle.slice(0, 3).map((c, i) => ({ ...c, rank: i + 1 }))

      // ── Per-class aggregation ──
      const classIds = [...new Set(circles.map(c => c.class_id))]
      const byClass = {}

      classIds.forEach(classId => {
        const classCircles = circles.filter(c => c.class_id === classId)
        const classCircleIds = classCircles.map(c => c.id)
        const classCircleSet = new Set(classCircleIds)

        const classAgg = aggregateForScope(attendance, circles, students, classCircleIds)
        const missingAlerts = computeMissingAlerts(attendance, classCircleSet)
        const atRisk = computeAtRisk(attendance, students, classCircleSet)

        // Enrich atRisk with class and leader info
        const atRiskEnriched = atRisk.map(s => {
          const circle = circles.find(c => c.id === s.circle_id)
          return { ...s, class_id: classId, leader: circle?.leader_name || '' }
        })

        byClass[classId] = {
          ...classAgg,
          missingAlerts,
          atRisk: atRiskEnriched,
          leadersTable: classAgg.byCircle,
          rosterByCircle: computeRosterByCircle(attendance, circles, students, classCircleIds),
        }
      })

      // ── Global KPIs with per-class breakdown ──
      const avgPctByClass = {}
      classIds.forEach(cid => {
        avgPctByClass[cid] = byClass[cid].kpis.avgPct
      })

      const studentsByClass = {}
      classIds.forEach(cid => {
        studentsByClass[cid] = byClass[cid].kpis.totalStudents
      })

      setData({
        kpis: {
          ...globalAgg.kpis,
          avgPctByClass,
          studentsByClass,
          classIds,
        },
        podium,
        trendByDate: globalAgg.trendByDate,
        byCircle: globalAgg.byCircle,
        donut: globalAgg.donut,
        byClass,
        classIds,
      })
      setLoading(false)
    }

    fetchAll()
  }, [selectedSeasonId])

  return { data, loading, error, seasons, selectedSeasonId, setSelectedSeasonId }
}
