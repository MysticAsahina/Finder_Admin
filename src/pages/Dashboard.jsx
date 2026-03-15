import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const barData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Completed',
      data: [85, 102, 80, 98, 108, 120, 115],
      backgroundColor: '#fa7528',
      borderRadius: 6,
      barThickness: 32,
    },
    {
      label: 'Cancelled',
      data: [12, 15, 8, 12, 18, 10, 14],
      backgroundColor: '#fca5a5',
      borderRadius: 6,
      barThickness: 32,
    },
  ],
}

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
      beginAtZero: true, max: 140,
      grid: { color: '#f5ede8', drawBorder: false },
      ticks: { stepSize: 20, font: { weight: 500 } },
    },
    x: { grid: { display: false }, ticks: { font: { weight: 600 } } },
  },
}

export default function Dashboard() {
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Registered Drivers</div>
          <div className="stat-val">48</div>
          <div className="stat-trend up">↑ 3 this week</div>
          <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Application</div>
          <div className="stat-val">5</div>
          <div className="stat-trend neutral">Awaiting review</div>
          <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Trips</div>
          <div className="stat-val green">112</div>
          <div className="stat-trend up">88% completion rate</div>
          <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled Trips</div>
          <div className="stat-val red">15</div>
          <div className="stat-trend down">↑ 2 from yesterday</div>
          <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
        </div>
      </div>

      <div className="chart-section" style={{ marginBottom:32 }}>
        <div className="sec-header">
          <span className="sec-title">Trip Activity (Last 7 Days)</span>
        </div>
        <div className="chart-card" style={{ height:420 }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="dash-bottom-grid">
        <div className="recent-activity-section">
          <div className="sec-header">
            <span className="sec-title">Recent Activity</span>
          </div>
          <div className="activity-list">
            {[
              { color:'brand', icon:<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, text:'New driver application from Carlos Reyes', time:'5 minutes ago' },
              { color:'green', icon:<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg>, text:'Trip #1042 completed by Marco Santos', time:'12 minutes ago' },
              { color:'red', icon:<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, text:'Trip #1041 cancelled by passenger', time:'18 minutes ago' },
              { color:'blue', icon:<svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, text:'Message from passenger Ana Lim', time:'34 minutes ago' },
              { color:'brand', icon:<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, text:'Driver Jose Rivera approved by admin', time:'1 hour ago' },
              { color:'green', icon:<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"/></svg>, text:'Trip #1039 completed by Pedro Cruz', time:'1 hour ago' },
            ].map((a, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${a.color}`}>{a.icon}</div>
                <div className="activity-text">
                  <div className="activity-main">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-overview-section">
          <div className="sec-header">
            <span className="sec-title">Activity Overview</span>
          </div>
          <div className="overview-card">
            <div className="stat-label">TOTAL TRIPS TODAY</div>
            <div className="stat-val">127</div>
            <div className="stat-trend">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              12% vs yesterday
            </div>
            <div className="overview-icon-bg"></div>
          </div>
          <div className="overview-card">
            <div className="stat-label">PASSENGER REQUEST</div>
            <div className="stat-val">134</div>
            <div className="stat-trend">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              8 new today
            </div>
            <div className="overview-icon-bg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
