import { useEffect, useState } from 'react'

const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Overview'],
  analytics: ['Analytics', 'Real-time Insights'],
  drivers: ['Users', 'Driver Directory'],
  applications: ['Applications', 'Pending Reviews'],
  passengerMessages: ['Messages', 'Passenger Inquiries'],
  driverMessages: ['Messages', 'Driver Inquiries'],
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
      </div>
    </div>
  )
}
