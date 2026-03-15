const TRIPS = [
  { id:'#1042', date:'Mar 8, 2026', driver:'Marco Santos', passenger:'Ana Lim', dist:'2.4 km', fare:'₱45.00', status:'Completed' },
  { id:'#1041', date:'Mar 8, 2026', driver:'Pedro Cruz', passenger:'Roberto Tan', dist:'—', fare:'—', status:'Cancelled' },
  { id:'#1040', date:'Mar 8, 2026', driver:'Luis Gomez', passenger:'Maria Garcia', dist:'1.8 km', fare:'₱38.00', status:'Completed' },
  { id:'#1039', date:'Mar 8, 2026', driver:'Pedro Cruz', passenger:'John Bautista', dist:'3.1 km', fare:'₱58.00', status:'Completed' },
  { id:'#1038', date:'Mar 7, 2026', driver:'Jose Rivera', passenger:'Lisa Santos', dist:'2.0 km', fare:'₱42.00', status:'Completed' },
  { id:'#1037', date:'Mar 7, 2026', driver:'Ramon Flores', passenger:'Ben Cruz', dist:'—', fare:'—', status:'Cancelled' },
  { id:'#1036', date:'Mar 7, 2026', driver:'Marco Santos', passenger:'Clara Reyes', dist:'4.2 km', fare:'₱72.00', status:'Completed' },
  { id:'#1035', date:'Mar 7, 2026', driver:'Luis Gomez', passenger:'Danny Tan', dist:'1.5 km', fare:'₱34.00', status:'Completed' },
  { id:'#1034', date:'Mar 6, 2026', driver:'Pedro Cruz', passenger:'Juan Dela Cruz', dist:'2.2 km', fare:'₱41.00', status:'Completed' },
  { id:'#1033', date:'Mar 6, 2026', driver:'Marco Santos', passenger:'Elena Reyes', dist:'3.5 km', fare:'₱62.00', status:'Completed' },
  { id:'#1032', date:'Mar 6, 2026', driver:'Jose Rivera', passenger:'Mario Tan', dist:'1.2 km', fare:'₱30.00', status:'Completed' },
  { id:'#1031', date:'Mar 5, 2026', driver:'Luis Gomez', passenger:'Ariel Gomez', dist:'—', fare:'—', status:'Cancelled' },
  { id:'#1030', date:'Mar 5, 2026', driver:'Pedro Cruz', passenger:'Angel Lim', dist:'2.8 km', fare:'₱52.00', status:'Completed' },
  { id:'#1029', date:'Mar 5, 2026', driver:'Marco Santos', passenger:'Gloria Santos', dist:'1.6 km', fare:'₱36.00', status:'Completed' },
]

export default function Reports() {
  return (
    <div>
      <div className="report-filters" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <select className="filter-select" style={{ minWidth:140 }}><option>February</option><option>January</option></select>
        <div className="export-btns" style={{ marginLeft:'auto', display:'flex', gap:12 }}>
          <button className="btn btn-outline" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', fontWeight:600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', fontWeight:600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom:24 }}>
        {[
          { label:'TOTAL TRIPS', val:'3,247', valStyle:{ color:'var(--brand)' }, trend:<span style={{ color:'var(--green)' }}>This month</span> },
          { label:'COMPLETED', val:'2,891', valStyle:{ color:'var(--green)' }, trend:<span style={{ color:'var(--green)' }}>89 % rate</span> },
          { label:'AVG DAILY TRIP', val:'356', valStyle:{ color:'var(--red)' }, trend:<span style={{ color:'var(--red)' }}>11 % rate</span> },
          { label:'Messages', val:'12', valStyle:{ color:'var(--brand)' }, trend:<span style={{ color:'var(--brand)' }}>Logged</span> },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={s.valStyle}>{s.val}</div>
            <div className="stat-trend">{s.trend}</div>
            <div className="overview-icon-bg"></div>
          </div>
        ))}
      </div>

      <div className="table-wrap" style={{ maxHeight:500, overflowY:'auto', border:'1.5px solid var(--border-l)', borderRadius:'var(--radius)' }}>
        <table style={{ borderCollapse:'separate', borderSpacing:0, width:'100%' }}>
          <thead style={{ position:'sticky', top:0, zIndex:5, background:'var(--bg)' }}>
            <tr>
              {['TRIP ID','DATE','DRIVER','PASSENGER','DISTANCE','FARE','STATUS'].map(h => (
                <th key={h} style={{ padding:16, borderBottom:'1.5px solid var(--border-l)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRIPS.map(t => (
              <tr key={t.id}>
                <td style={{ padding:16 }}>{t.id}</td>
                <td style={{ padding:16 }}>{t.date}</td>
                <td style={{ padding:16 }}>{t.driver}</td>
                <td style={{ padding:16 }}>{t.passenger}</td>
                <td style={{ padding:16 }}>{t.dist}</td>
                <td style={{ padding:16 }}>{t.fare}</td>
                <td style={{ padding:16 }}>
                  <span className={`badge ${t.status === 'Completed' ? 'green' : 'red'}`} style={{ background: t.status === 'Completed' ? 'var(--green-l)' : 'var(--red-l)', color: t.status === 'Completed' ? 'var(--green)' : 'var(--red)', border:'none' }}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
