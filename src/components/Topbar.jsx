import { useEffect, useState } from 'react'

const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Overview'],
  analytics: ['Analytics', 'Real-time Insights'],
  drivers: ['Users', 'User Management'],
  applications: ['Applications', 'Pending Reviews'],
  discountApplications: ['Applications', 'Special Discount'],
  passengerMessages: ['Messages', 'Passenger Inquiries'],
  driverMessages: ['Messages', 'Driver Inquiries'],
  userAppeals: ['Users Appeal', 'Suspension Review & Decisions'],
  reports: ['Reports', 'Operational Data'],
  fare: ['Fare Management', 'Price Configuration'],
  audit: ['Audit Log', 'System Activity'],
  settings: ['Settings', 'Admin Preferences'],
}

export default function Topbar({ activePage }) {
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const d = new Date()
    setDateStr(d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])

  const [title, sub] = PAGE_TITLES[activePage] || ['Dashboard', 'Overview']

  return (
    <div className="topbar">
      <div>
        <span className="topbar-title">{title}</span>
        <span className="topbar-sub">— {sub}</span>
      </div>
      <div className="topbar-right">
        <div className="date-badge">{dateStr}</div>

        {/* No longer used.
        <button className="topbar-btn" title="Search">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button className="topbar-btn" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span className="notif-dot"></span>
        </button>
        */}
      </div>
    </div>
  )
}
