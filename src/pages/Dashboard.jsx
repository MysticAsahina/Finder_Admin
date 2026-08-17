import { useEffect, useState, useContext } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { AuthContext } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** "X mins ago" / "X hrs ago" / "X days ago" from ISO string */
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000) // seconds
  if (diff < 60)   return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

/** Map audit action → dot color + icon */
function activityMeta(action) {
  switch (action) {
    case 'DRIVER_APPROVED':
      return {
        color: 'green',
        icon: <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      }
    case 'DRIVER_REJECTED':
      return {
        color: 'red',
        icon: <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      }
    case 'LOGIN_SUCCESS':
    case 'LOGOUT':
      return {
        color: 'brand',
        icon: <svg viewBox="0 0 24 24" fill="none"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>,
      }
    case 'LOGIN_FAILED':
      return {
        color: 'red',
        icon: <svg viewBox="0 0 24 24" fill="none"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>,
      }
    case 'TICKET_RESOLVED':
      return {
        color: 'blue',
        icon: <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
      }
    case 'PROFILE_EDITED':
      return {
        color: 'brand',
        icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33"/></svg>,
      }
    case 'UPDATE_FARE_SETTINGS':
      return {
        color: 'brand',
        icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><path d="M12 18V6"/></svg>,
      }
    default:
      return {
        color: 'brand',
        icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
      }
  }
}

// ─── chart options ────────────────────────────────────────────────────────────

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 20, font: { weight: 600, size: 12 } },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f5ede8', drawBorder: false },
      ticks: { stepSize: 20, font: { weight: 500 } },
    },
    x: { grid: { display: false }, ticks: { font: { weight: 600 } } },
  },
}

export default function Dashboard({ isActive }) {
  const { accessToken } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!accessToken || !isActive) return
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/admin/dashboard`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.message || 'Failed to load dashboard.')
        setData(json)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [accessToken, isActive])

  // ── derived bar chart data ─────────────────────────────────────────────────
  const barData = data
    ? {
        labels: data.last7Days.map(d => d.label),
        datasets: [
          {
            label: 'Completed',
            data: data.last7Days.map(d => d.completed),
            backgroundColor: '#fa7528',
            borderRadius: 6,
            barThickness: 32,
          },
          {
            label: 'Cancelled',
            data: data.last7Days.map(d => d.cancelled),
            backgroundColor: '#fca5a5',
            borderRadius: 6,
            barThickness: 32,
          },
        ],
      }
    : { labels: [], datasets: [] }

  // ── cancelled trend text ───────────────────────────────────────────────────
  function cancelledTrend(delta) {
    if (delta === null || delta === undefined) return 'vs yesterday'
    if (delta > 0) return `↑ ${delta} more than yesterday`
    if (delta < 0) return `↓ ${Math.abs(delta)} fewer than yesterday`
    return 'Same as yesterday'
  }

  function cancelledTrendClass(delta) {
    if (!delta) return 'neutral'
    return delta > 0 ? 'down' : 'up' // more cancellations = bad
  }

  // ── loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
        Loading dashboard…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>
        Failed to load dashboard: {error}
      </div>
    )
  }

  const { stats } = data

  return (
    <div>
      {/* ── Stat cards ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Registered Drivers</div>
          <div className="stat-val">{stats.totalDrivers}</div>
          <div className="stat-trend up">↑ {stats.newDriversThisWeek} this week</div>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Applications</div>
          <div className="stat-val">{stats.pendingApplications}</div>
          <div className="stat-trend neutral">Awaiting review</div>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Trips</div>
          <div className="stat-val green">{stats.completedTripsToday}</div>
          <div className="stat-trend up">{stats.completionRateToday}% completion rate</div>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled Trips</div>
          <div className="stat-val red">{stats.cancelledTripsToday}</div>
          <div className={`stat-trend ${cancelledTrendClass(stats.cancelledVsYesterday)}`}>
            {cancelledTrend(stats.cancelledVsYesterday)}
          </div>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className="chart-section" style={{ marginBottom: 32 }}>
        <div className="sec-header">
          <span className="sec-title">Trip Activity (Last 7 Days)</span>
        </div>
        <div className="chart-card" style={{ height: 420 }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="dash-bottom-grid">

        {/* Recent Activity — driven by recentActivity from dashboard response */}
        <div className="recent-activity-section">
          <div className="sec-header">
            <span className="sec-title">Recent Activity</span>
          </div>
          <div className="activity-list">
            {data.recentActivity.map((a, i) => {
              const { color, icon } = activityMeta(a.action)
              return (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${color}`}>{icon}</div>
                  <div className="activity-text">
                    <div className="activity-main">{a.details}</div>
                    <div className="activity-time">{timeAgo(a.time)}</div>
                  </div>
                </div>
              )
            })}
            {data.recentActivity.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '.85rem', padding: '12px 0' }}>
                No recent activity.
              </div>
            )}
          </div>
        </div>

        {/* Activity Overview */}
        <div className="activity-overview-section">
          <div className="sec-header">
            <span className="sec-title">Activity Overview</span>
          </div>
          <div className="overview-card">
            <div className="stat-label">TOTAL TRIPS TODAY</div>
            <div className="stat-val">{stats.completedTripsToday + stats.cancelledTripsToday}</div>
            <div className="stat-trend">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              {stats.completionRateToday}% completion rate
            </div>
            <div className="overview-icon-bg"></div>
          </div>
          <div className="overview-card">
            <div className="stat-label">ONLINE DRIVERS</div>
            <div className="stat-val">{stats.onlineDrivers}</div>
            <div className="stat-trend">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              of {stats.totalDrivers} registered
            </div>
            <div className="overview-icon-bg"></div>
          </div>
        </div>

      </div>
    </div>
  )
}
