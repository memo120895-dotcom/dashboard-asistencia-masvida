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
  const classCircleSet = new Set(classCircleIds)

  const sessionDates = [...new Set(
    attendanceRows
      .filter(r => classCircleSet.has(r.circle_id))
      .map(r => toDateStr(r.session_date))
  )].sort((a, b) => a.localeCompare(b))

  const circleList = circles
    .filter(c => classCircleIds.includes(c.id))
    .map(c => {
      const circleStudents = students.filter(s => s.circle_id === c.id)
      const circleAttRows = attendanceRows.filter(r => r.circle_id === c.id)

      return {
        id: c.id,
        circle: c.name,
        leader: c.leader_name,
        students: circleStudents.map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          sessions: Object.fromEntries(
            sessionDates.map(d => [d, circleAttRows.some(r => r.student_id === s.id && toDateStr(r.session_date) === d)])
          ),
        })),
      }
    })

  return { sessionDates, circles: circleList }
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
  const [allSeasons, setAllSeasons] = useState([])
  const [periods, setPeriods] = useState([])       // [{key, year, month, active, seasons:[]}]
  const [selectedPeriod, setSelectedPeriod] = useState(null)  // e.g. "2026-4"
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load seasons on mount, group into periods (month+year)
  useEffect(() => {
    supabase
      .from('seasons')
      .select('*')
      .order('year', { ascending: false })
      .then(({ data: rows, error: err }) => {
        if (err) { setError(err.message); return }
        const seasons = rows || []
        setAllSeasons(seasons)

        // Group seasons by month+year
        const periodMap = {}
        seasons.forEach(s => {
          const key = `${s.year}-${s.month}`
          if (!periodMap[key]) periodMap[key] = { key, year: s.year, month: s.month, seasons: [], active: false }
          periodMap[key].seasons.push(s)
          if (s.active) periodMap[key].active = true
        })
        const periodList = Object.values(periodMap)
          .sort((a, b) => b.year - a.year || b.month - a.month)
        setPeriods(periodList)

        const activePeriod = periodList.find(p => p.active) || periodList[0]
        setSelectedPeriod(activePeriod?.key || null)
      })
  }, [])

  // Load dashboard data when selected period or seasons change
  useEffect(() => {
    if (!selectedPeriod || allSeasons.length === 0) return

    const periodSeasons = allSeasons.filter(s => `${s.year}-${s.month}` === selectedPeriod)
    const seasonIds = periodSeasons.map(s => s.id)
    if (seasonIds.length === 0) return

    setLoading(true)
    setError(null)

    async function fetchAll(silent = false) {
      if (!silent) setLoading(true)

      // Circles for ALL seasons in this period
      const { data: circles, error: circErr } = await supabase
        .from('circles')
        .select('*')
        .in('season_id', seasonIds)

      if (circErr) { setError(circErr.message); setLoading(false); return }
      if (!circles || circles.length === 0) {
        setData({ kpis: {}, podium: [], trendByDate: [], byCircle: [], donut: {}, byClass: {}, classIds: [] })
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

      // Attendance for ALL seasons in this period
      const { data: attendance, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .in('season_id', seasonIds)

      if (attErr) { setError(attErr.message); setLoading(false); return }

      // ── Global aggregation ──
      const globalAgg = aggregateForScope(attendance, circles, students, circleIds)
      const podium = globalAgg.byCircle.slice(0, 3).map((c, i) => ({ ...c, rank: i + 1 }))

      // ── Per-class aggregation ──
      const classIds = [...new Set(circles.map(c => c.class_id).filter(Boolean))]
      const byClass = {}

      classIds.forEach(classId => {
        const classCircles = circles.filter(c => c.class_id === classId)
        const classCircleIds = classCircles.map(c => c.id)
        const classCircleSet = new Set(classCircleIds)

        const classAgg = aggregateForScope(attendance, circles, students, classCircleIds)
        const missingAlerts = computeMissingAlerts(attendance, classCircleSet)
        const atRisk = computeAtRisk(attendance, students, classCircleSet)

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

      const avgPctByClass = {}
      classIds.forEach(cid => { avgPctByClass[cid] = byClass[cid].kpis.avgPct })

      const studentsByClass = {}
      classIds.forEach(cid => { studentsByClass[cid] = byClass[cid].kpis.totalStudents })

      setData({
        kpis: { ...globalAgg.kpis, avgPctByClass, studentsByClass, classIds },
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

    const interval = setInterval(() => fetchAll(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedPeriod, allSeasons])

  return { data, loading, error, periods, selectedPeriod, setSelectedPeriod }
}
