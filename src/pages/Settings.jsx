export default function Settings() {
  const toggleRow = (name, desc, defaultChecked) => (
    <div className="toggle-row" style={{ padding:'12px 0' }}>
      <div>
        <div className="toggle-name">{name}</div>
        <div className="toggle-desc">{desc}</div>
      </div>
      <label className="toggle">
        <input type="checkbox" defaultChecked={defaultChecked}/>
        <span className="toggle-slider"></span>
      </label>
    </div>
  )

  return (
    <div>
      {/* Admin Account */}
      <div className="settings-card">
        <div className="settings-title">Admin Account</div>
        <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24, padding:24, background:'var(--brand-ll)', borderRadius:14 }}>
          <div style={{ width:64, height:64, background:'var(--brand)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.5rem', color:'white' }}>JD</div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--text)', marginBottom:2 }}>Juan Dela Cruz</div>
            <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>admin@finder-toda.ph &nbsp;•&nbsp; System Administrator</div>
          </div>
        </div>

        <div className="form-row" style={{ marginBottom:20 }}>
          <div className="form-field">
            <label className="form-label">FIRST NAME</label>
            <input className="form-input" defaultValue="Juan" style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
          <div className="form-field">
            <label className="form-label">LAST NAME</label>
            <input className="form-input" defaultValue="Dela Cruz" style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
        </div>
        <div className="form-row" style={{ marginBottom:24 }}>
          <div className="form-field">
            <label className="form-label">EMAIL</label>
            <input className="form-input" defaultValue="admin@finder-toda.ph" style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
          <div className="form-field">
            <label className="form-label">PHONE</label>
            <input className="form-input" defaultValue="09171234567" style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding:'10px 24px', borderRadius:10 }}>Edit Profile</button>
      </div>

      {/* Security */}
      <div className="settings-card">
        <div className="settings-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security Configuration
        </div>
        {toggleRow('Two-Factor Authentication', 'Require MPIN on every admin login', true)}
        <div style={{ borderTop:'1px solid var(--border-l)' }}>
          {toggleRow('Session Timeout', 'Auto-logout after 30 minutes of inactivity', false)}
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="settings-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          Notification Settings
        </div>
        {toggleRow('New Driver Applications', 'Alert when a new driver submits an application', true)}
        <div style={{ borderTop:'1px solid var(--border-l)' }}>
          {toggleRow('Passenger Messages', 'Notify on new passenger inquiries or complaints', true)}
        </div>
        <div style={{ borderTop:'1px solid var(--border-l)' }}>
          {toggleRow('System Reports', 'Weekly summary reports via email', true)}
        </div>
      </div>
    </div>
  )
}
