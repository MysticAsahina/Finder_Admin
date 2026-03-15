import { useState } from 'react'
import DriverModal from '../components/DriverModal'

const DRIVERS = [
  { name:'Marco Santos', id:'DR-0012', status:'Online', trips:'48', rate:'96%', vehicle:'Toyota Tricycle • ABC-1234', contact:'09171234567', initials:'MS', avatarStyle:{} },
  { name:'Pedro Cruz', id:'DR-0009', status:'Online', trips:'43', rate:'91%', vehicle:'Honda Tricycle • XYZ-5678', contact:'09182345678', initials:'PC', avatarStyle:{ background:'#fff0f0', color:'#ef4444' } },
  { name:'Jose Rivera', id:'DR-0007', status:'Offline', trips:'37', rate:'89%', vehicle:'Yamaha Tricycle • LMN-9012', contact:'09193456789', initials:'JR', avatarStyle:{ background:'#eff6ff', color:'#3b82f6' }, badgeClass:'gray' },
  { name:'Luis Gomez', id:'DR-0015', status:'Online', trips:'34', rate:'94%', vehicle:'Suzuki Tricycle • PQR-3456', contact:'09204567890', initials:'LG', avatarStyle:{ background:'#f0fdf4', color:'#22c55e' } },
  { name:'Ramon Flores', id:'DR-0011', status:'Inactive', trips:'29', rate:'83%', vehicle:'Honda Tricycle • STU-7890', contact:'09215678901', initials:'RF', avatarStyle:{ background:'#fffbeb', color:'#f59e0b' }, badgeClass:'yellow' },
  { name:'Ben Morales', id:'DR-0018', status:'Offline', trips:'22', rate:'90%', vehicle:'Toyota Tricycle • VWX-1122', contact:'09226789012', initials:'BM', avatarStyle:{}, badgeClass:'gray' },
]

export default function Drivers() {
  const [modalDriver, setModalDriver] = useState(null)

  return (
    <>
      <div className="toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search drivers…"/>
        </div>
        <select className="filter-select"><option>All Status</option><option>Online</option><option>Offline</option><option>Inactive</option></select>
        <select className="filter-select"><option>Sort by: Name</option><option>Sort by: Trips</option><option>Sort by: Date</option></select>
      </div>

      <div className="driver-grid">
        {DRIVERS.map(d => {
          const badgeClass = d.badgeClass || 'green'
          return (
            <div key={d.id} className="driver-card" onClick={() => setModalDriver(d)}>
              <div className="driver-head">
                <div className="driver-avatar" style={d.avatarStyle}>{d.initials}</div>
                <div>
                  <div className="driver-name">{d.name}</div>
                  <div className="driver-id">{d.id}</div>
                </div>
                <div style={{ marginLeft:'auto' }}>
                  <span className={`badge ${badgeClass}`}><span className="badge-dot"></span>{d.status}</span>
                </div>
              </div>
              <div className="driver-stats">
                <div className="driver-stat"><div className="driver-stat-val">{d.trips}</div><div className="driver-stat-lbl">Trips</div></div>
                <div className="driver-stat"><div className="driver-stat-val">{d.rate}</div><div className="driver-stat-lbl">Rate</div></div>
                <div className="driver-stat"><div className="driver-stat-val">4.9</div><div className="driver-stat-lbl">Rating</div></div>
              </div>
              <div className="driver-foot">
                <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>{d.vehicle.split('•')[1]?.trim()} • {d.vehicle.split(' ')[0]}</span>
                <button className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>History</button>
              </div>
            </div>
          )
        })}
      </div>

      <DriverModal isOpen={!!modalDriver} onClose={() => setModalDriver(null)} driver={modalDriver} />
    </>
  )
}
