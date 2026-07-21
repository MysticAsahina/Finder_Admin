import { useState, useEffect, useContext } from 'react'
import DriverModal from '../components/DriverModal'
import { AuthContext } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// A small utility to generate a consistent pastel color for avatars based on driver ID or name
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return { background: `hsl(${hue}, 80%, 95%)`, color: `hsl(${hue}, 70%, 40%)` };
}

export default function Drivers() {
  const { accessToken } = useContext(AuthContext);
  const [modalDriver, setModalDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortMethod, setSortMethod] = useState('Sort by: Name');

  useEffect(() => {
    if (!accessToken) return;
    
    let cancelled = false;
    setLoading(true);
    
    fetch(`${API_URL}/admin/drivers`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.drivers) {
          // Pre-compute avatar styles
          const driversWithAvatars = data.drivers.map(d => ({
            ...d,
            avatarStyle: stringToColor(d._id),
            badgeClass: d.status === 'Online' ? 'green' : d.status === 'Offline' ? 'gray' : 'yellow'
          }));
          setDrivers(driversWithAvatars);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [accessToken]);

  // Filtering and Sorting
  let filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  if (statusFilter !== 'All Status') {
    filtered = filtered.filter(d => d.status === statusFilter);
  }

  filtered.sort((a, b) => {
    if (sortMethod === 'Sort by: Trips') return b.trips - a.trips;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <div className="toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Search drivers…" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>Online</option>
          <option>Offline</option>
          <option>Inactive</option>
        </select>
        <select className="filter-select" value={sortMethod} onChange={e => setSortMethod(e.target.value)}>
          <option>Sort by: Name</option>
          <option>Sort by: Trips</option>
        </select>
      </div>

      {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading drivers...</div>}

      {!loading && (
        <div className="driver-grid">
          {filtered.map(d => {
            return (
              <div key={d.id} className="driver-card" onClick={() => setModalDriver(d)}>
                <div className="driver-head">
                  <div className="driver-avatar" style={d.avatarStyle}>{d.initials}</div>
                  <div>
                    <div className="driver-name">{d.name}</div>
                    <div className="driver-id">{d.id}</div>
                  </div>
                  <div style={{ marginLeft:'auto' }}>
                    <span className={`badge ${d.badgeClass}`}><span className="badge-dot"></span>{d.status}</span>
                  </div>
                </div>
                <div className="driver-stats">
                  <div className="driver-stat"><div className="driver-stat-val">{d.trips}</div><div className="driver-stat-lbl">Trips</div></div>
                  <div className="driver-stat"><div className="driver-stat-val">{d.rate}</div><div className="driver-stat-lbl">Rate</div></div>
                  <div className="driver-stat"><div className="driver-stat-val">{d.rating}</div><div className="driver-stat-lbl">Rating</div></div>
                </div>
                <div className="driver-foot">
                  <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>
                    {d.motorcycleBrand || 'Unknown'} • {d.plateNumber || 'N/A'}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()} style={{ opacity: 0.5, cursor: 'not-allowed' }}>History</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
         <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>No drivers found.</div>
      )}

      <DriverModal isOpen={!!modalDriver} onClose={() => setModalDriver(null)} driver={modalDriver} />
    </>
  )
}
