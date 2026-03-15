const AUDIT_ENTRIES = [
  {
    iconStyle: { background:'var(--green-l)', color:'var(--green)' },
    icon: <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    action: 'Driver Application Approved',
    detail: <span>Admin <strong>Juan Dela Cruz</strong> approved application from <strong>Jose Rivera</strong> (DR-0007)</span>,
    time: 'Mar 8, 2026',
    time2: '10:45 AM',
  },
  {
    iconStyle: { background:'var(--brand-l)', color:'var(--brand)' },
    icon: <svg viewBox="0 0 24 24" fill="none"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>,
    action: 'Admin Login',
    detail: <span><strong>Juan Dela Cruz</strong> logged in from 192.168.1.104</span>,
    time: 'Mar 8, 2026',
    time2: '8:02 AM',
  },
  {
    iconStyle: { background:'var(--yellow-l)', color:'var(--yellow)' },
    icon: <svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    action: 'Fare Settings Updated',
    detail: <span>Base fare changed from <strong>₱22.00</strong> to <strong>₱25.00</strong> by <strong>Juan Dela Cruz</strong></span>,
    time: 'Mar 1, 2026',
    time2: '2:30 PM',
  },
  {
    iconStyle: { background:'var(--red-l)', color:'var(--red)' },
    icon: <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    action: 'Driver Application Rejected',
    detail: <span>Admin <strong>Juan Dela Cruz</strong> rejected application from <strong>Mark Villanueva</strong> — Incomplete license details</span>,
    time: 'Feb 28, 2026',
    time2: '11:14 AM',
  },
  {
    iconStyle: { background:'var(--blue-l)', color:'var(--blue)' },
    icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33"/></svg>,
    action: 'System Configuration Changed',
    detail: <span>Notification settings updated — driver push alerts enabled</span>,
    time: 'Feb 27, 2026',
    time2: '9:58 AM',
  },
  {
    iconStyle: { background:'var(--brand-l)', color:'var(--brand)' },
    icon: <svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    action: 'Admin Logout',
    detail: <span><strong>Juan Dela Cruz</strong> logged out</span>,
    time: 'Feb 26, 2026',
    time2: '6:01 PM',
  },
]

export default function AuditLog() {
  return (
    <div>
      <div className="toolbar" style={{ marginBottom:18 }}>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search logs…"/>
        </div>
        <select className="filter-select"><option>All Actions</option><option>Login/Logout</option><option>Driver Approvals</option><option>Fare Changes</option><option>Config Changes</option></select>
        <select className="filter-select"><option>Today</option><option>This Week</option><option>This Month</option></select>
      </div>

      {AUDIT_ENTRIES.map((e, i) => (
        <div key={i} className="audit-item">
          <div className="audit-icon" style={e.iconStyle}>{e.icon}</div>
          <div className="audit-info">
            <div className="audit-action">{e.action}</div>
            <div className="audit-detail">{e.detail}</div>
          </div>
          <div className="audit-time">{e.time}<br/>{e.time2}</div>
        </div>
      ))}
    </div>
  )
}
