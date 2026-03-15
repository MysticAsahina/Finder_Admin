export default function FareManagement() {
  return (
    <div>
      <div className="fare-grid">
        <div className="fare-card">
          <div className="fare-card-title">Base Fare</div>
          <div className="fare-card-sub">Minimum charge for any ride regardless of distance</div>
          <div className="fare-input-wrap">
            <span className="fare-prefix">₱</span>
            <input className="fare-input" type="number" defaultValue="25.00" step="0.50"/>
          </div>
          <div className="fare-note">Current: ₱25.00 — Last updated Mar 1, 2026</div>
        </div>
        <div className="fare-card">
          <div className="fare-card-title">Additional Fare per Kilometer</div>
          <div className="fare-card-sub">Extra charge added per km beyond base distance</div>
          <div className="fare-input-wrap">
            <span className="fare-prefix">₱</span>
            <input className="fare-input" type="number" defaultValue="8.50" step="0.50"/>
          </div>
          <div className="fare-note">Current: ₱8.50/km — Last updated Mar 1, 2026</div>
        </div>
      </div>

      <div className="ordinance-card">
        <div style={{ fontWeight:700, fontSize:'.92rem', marginBottom:4 }}>City Ordinance Reference</div>
        <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:14 }}>Fare rates must comply with local transportation regulations</div>
        <div className="ordinance-img">
          <div style={{ textAlign:'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="36" height="36" stroke="var(--subtle)" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div style={{ fontSize:'.78rem', color:'var(--subtle)', marginTop:8 }}>Ordinance Document Preview</div>
            <div style={{ fontSize:'.72rem', color:'var(--border)', marginTop:2 }}>City Ordinance No. 2024-012</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost btn-sm" style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            View Document
          </button>
          <button className="btn btn-ghost btn-sm">Upload New</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
        <button className="btn btn-outline">Discard Changes</button>
        <button className="btn btn-primary">Save Fare Settings</button>
      </div>
    </div>
  )
}
