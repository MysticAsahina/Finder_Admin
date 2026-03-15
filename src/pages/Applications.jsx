import { useState } from 'react'

const INITIAL_APPS = [
  {
    id: 1,
    initials: 'CR',
    name: 'Carlos Reyes',
    meta: 'Applied: March 8, 2026 \u00a0•\u00a0 09-5678-1234',
    license: 'N03-12-345678',
    brand: 'Honda',
    plate: 'ABD-5566',
    color: 'Blue / Silver',
    avatarStyle: {},
    status: 'pending',
  },
  {
    id: 2,
    initials: 'AT',
    avatarStyle: { background:'#eff6ff', color:'#3b82f6' },
    name: 'Antonio Torres',
    meta: 'Applied: March 7, 2026 \u00a0•\u00a0 09-6789-2345',
    license: 'N03-11-223344',
    brand: 'Yamaha',
    plate: 'ZXY-4433',
    color: 'Red / White',
    status: 'pending',
  },
]

export default function Applications() {
  const [apps, setApps] = useState(INITIAL_APPS)

  const approve = (id) => {
    if (window.confirm('Approve this driver application?')) {
      setApps(prev => prev.map(a => a.id === id ? { ...a, status:'approved' } : a))
    }
  }

  const reject = (id) => {
    if (window.confirm('Reject this application?')) {
      setApps(prev => prev.filter(a => a.id !== id))
    }
  }

  return (
    <div>
      <div className="toolbar" style={{ marginBottom:18 }}>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search applicants…"/>
        </div>
        <span className="badge yellow" style={{ padding:'7px 14px', fontSize:'.78rem' }}>{apps.filter(a => a.status === 'pending').length} Pending Review</span>
      </div>

      {apps.map(app => (
        <div key={app.id} className="app-card" style={app.status === 'approved' ? { opacity:0.5, pointerEvents:'none' } : {}}>
          <div className="app-card-head">
            <div className="app-big-avatar" style={app.avatarStyle}>{app.initials}</div>
            <div style={{ flex:1 }}>
              <div className="app-name">{app.name}</div>
              <div className="app-meta">{app.meta}</div>
            </div>
            <span className="badge yellow"><span className="badge-dot"></span>{app.status === 'approved' ? 'Approved' : 'Pending'}</span>
          </div>
          <div className="app-card-body">
            {[['License No.', app.license], ['Vehicle Brand', app.brand], ['Plate Number', app.plate], ['Vehicle Color', app.color]].map(([lbl, val]) => (
              <div key={lbl} className="app-field">
                <div className="app-field-lbl">{lbl}</div>
                <div className="app-field-val">{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            {[["Driver's License", <svg key="l" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="5" width="22" height="14" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>],
              ['Tricycle Photo', <svg key="p" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>]
            ].map(([label, icon]) => (
              <div key={label} style={{ flex:1, background:'var(--bg2)', borderRadius:10, height:90, display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--muted)', fontSize:'.8rem', cursor:'pointer' }}>
                {icon}{label}
              </div>
            ))}
          </div>
          <div className="app-actions">
            <button className={`btn ${app.status === 'approved' ? 'btn-ghost' : 'btn-primary'}`} onClick={() => approve(app.id)}>
              {app.status === 'approved' ? 'Approved ✓' : '✓ Approve Application'}
            </button>
            <button className="btn btn-outline" onClick={() => reject(app.id)}>✗ Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}
