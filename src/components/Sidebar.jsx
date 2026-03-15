const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Overview'],
  analytics: ['Analytics', 'Real-time Insights'],
  drivers: ['Users', 'Driver Directory'],
  applications: ['Applications', 'Pending Reviews'],
  messages: ['Messages', 'Passenger Inquiries'],
  reports: ['Reports', 'Operational Data'],
  fare: ['Fare Management', 'Price Configuration'],
  audit: ['Audit Log', 'System Activity'],
  settings: ['Settings', 'Admin Preferences'],
}

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const navItems = [
    {
      section: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <svg viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
        },
      ],
    },
    {
      section: 'Management',
      items: [
        {
          id: 'drivers',
          label: 'Users (Drivers)',
          icon: <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
        },
        {
          id: 'applications',
          label: 'Driver Applications',
          badge: 5,
          icon: <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
        },
        {
          id: 'messages',
          label: 'Passenger Messages',
          badge: 3,
          icon: <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
        },
      ],
    },
    {
      section: 'Operations',
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: <svg viewBox="0 0 24 24" fill="none"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
        },
        {
          id: 'fare',
          label: 'Fare Management',
          icon: <svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
        },
        {
          id: 'audit',
          label: 'Audit Log',
          icon: <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
        },
      ],
    },
    {
      section: 'System',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
        },
      ],
    },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <span className="logo-text">FIND<span>ER</span></span>
      </div>

      {navItems.map(({ section, items }) => (
        <div key={section}>
          <div className="sidebar-section">{section}</div>
          {items.map(({ id, label, icon, badge }) => (
            <button
              key={id}
              className={`nav-item${activePage === id ? ' active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              {icon}
              {label}
              {badge && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </div>
      ))}

      <button className="logout-btn" onClick={onLogout}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        Log Out
      </button>

      <div className="sidebar-bottom">
        <div className="admin-pill">
          <div className="admin-avatar">JD</div>
          <div className="admin-info">
            <div className="admin-name">Juan Dela Cruz</div>
            <div className="admin-role">System Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
