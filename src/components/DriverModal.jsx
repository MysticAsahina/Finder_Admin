export default function DriverModal({ isOpen, onClose, driver }) {
  if (!isOpen || !driver) return null

  const { name, id, status, trips, rate, vehicle, contact } = driver
  const initials = name.split(' ').map(n => n[0]).join('')
  const statusClass = status.toLowerCase() === 'online' ? 'green' : 'gray'

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" style={{ width: 520, padding: 24 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head" style={{ marginBottom: 20 }}>
          <span className="modal-title" style={{ fontWeight: 700 }}>Driver's Info</span>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Profile */}
        <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:20, padding:24, background:'var(--bg)', borderRadius:18, position:'relative' }}>
          <div style={{ width:72, height:72, background:'var(--brand)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.6rem', color:'white', boxShadow:'0 4px 12px rgba(250,117,40,0.2)' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--text)', marginBottom:2 }}>{name}</div>
            <div style={{ fontSize:'0.85rem', color:'var(--subtle)', fontWeight:500 }}>{id}</div>
          </div>
          <div style={{ position:'absolute', top:24, right:24 }}>
            <span className={`badge ${statusClass}`} style={{ padding:'4px 12px', fontSize:'0.75rem' }}>{status}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          {[['Trips', trips], ['Rate', rate], ['Rating', '4.9']].map(([lbl, val]) => (
            <div key={lbl} style={{ background:'var(--bg)', padding:12, borderRadius:12, textAlign:'center' }}>
              <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text)' }}>{val}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--subtle)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700, marginTop:2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          <div className="app-field" style={{ background:'var(--bg)', padding:16, borderRadius:14, border:'none' }}>
            <div className="app-field-lbl" style={{ fontSize:'0.78rem', marginBottom:6, color:'var(--subtle)', fontWeight:600 }}>Vehicle</div>
            <div className="app-field-val" style={{ fontSize:'0.95rem', color:'var(--text)', fontWeight:500 }}>{vehicle}</div>
          </div>
          <div className="app-field" style={{ background:'var(--bg)', padding:16, borderRadius:14, border:'none' }}>
            <div className="app-field-lbl" style={{ fontSize:'0.78rem', marginBottom:6, color:'var(--subtle)', fontWeight:600 }}>Contact</div>
            <div className="app-field-val" style={{ fontSize:'0.95rem', color:'var(--text)', fontWeight:500 }}>{contact}</div>
          </div>
        </div>

        {/* Docs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          {[["Driver's License", <svg key="l" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="12" y2="15"/></svg>],
            ['Tricycle Photo', <svg key="p" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>]
          ].map(([label, icon]) => (
            <div key={label} style={{ background:'var(--bg)', padding:20, borderRadius:14, height:110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, cursor:'pointer', border:'1.5px dashed var(--border-l)' }}>
              {icon}
              <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
