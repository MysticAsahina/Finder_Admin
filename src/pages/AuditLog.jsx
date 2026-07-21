import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getActionInfo(action) {
  switch(action) {
    case 'DRIVER_APPROVED':
      return {
        label: 'Driver Application Approved',
        style: { background:'var(--green-l)', color:'var(--green)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      };
    case 'DRIVER_REJECTED':
      return {
        label: 'Driver Application Rejected',
        style: { background:'var(--red-l)', color:'var(--red)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      };
    case 'LOGIN_SUCCESS':
      return {
        label: 'Admin Login',
        style: { background:'var(--brand-l)', color:'var(--brand)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
      };
    case 'LOGIN_FAILED':
      return {
        label: 'Failed Admin Login',
        style: { background:'var(--red-l)', color:'var(--red)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
      };
    case 'LOGOUT':
      return {
        label: 'Admin Logout',
        style: { background:'var(--brand-l)', color:'var(--brand)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      };
    case 'TICKET_RESOLVED':
      return {
        label: 'Support Ticket Resolved',
        style: { background:'var(--blue-l)', color:'var(--blue)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      };
    case 'PROFILE_EDITED':
      return {
        label: 'Profile Edited',
        style: { background:'var(--yellow-l)', color:'var(--yellow)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33"/></svg>
      };
    case 'UPDATE_FARE_SETTINGS':
      return {
        label: 'Fare Settings Updated',
        style: { background:'var(--brand-l)', color:'var(--brand)' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><path d="M12 18V6"/></svg>
      };
    default:
      return {
        label: action,
        style: { background:'var(--muted)', color:'#fff' },
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      };
  }
}

export default function AuditLog() {
  const { accessToken } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState(''); // debounced search
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [dateFilter, setDateFilter] = useState('All Time');

  const socketRef = useRef(null);

  // Setup realtime socket
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(API_URL, {
      auth: { token: accessToken },
    });

    socket.on('new_audit_log', (newLog) => {
      setLogs(prev => {
        // Prevent duplicates
        if (prev.some(l => l._id === newLog._id)) return prev;
        
        // If a filter is applied, only prepend if it matches the filter conceptually
        // To keep it simple and responsive, we just fetch again if filters are active, 
        // or just blindly prepend. Blind prepend is fine for an admin watching the log.
        return [newLog, ...prev];
      });
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [accessToken]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (actionFilter !== 'All Actions') params.set('action', actionFilter);
    if (dateFilter !== 'All Time') params.set('date', dateFilter);
    
    fetch(`${API_URL}/admin/audit-logs?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    .then(r => r.json())
    .then(data => {
      if (cancelled) return;
      if (data.logs) {
        setLogs(data.logs);
      } else {
        setError(data.message || 'Failed to fetch logs');
      }
    })
    .catch(err => {
      if (!cancelled) setError('Network error');
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [query, actionFilter, dateFilter, accessToken]);

  return (
    <div>
      <div className="toolbar" style={{ marginBottom:18 }}>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="Search logs…" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option>All Actions</option>
          <option>Login/Logout</option>
          <option>Driver Approvals</option>
          <option>Config Changes</option>
        </select>
        <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option>All Time</option>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>}
      
      {!loading && error && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--red)' }}>{error}</div>}

      {!loading && !error && logs.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>No logs found.</div>
      )}

      {!loading && !error && logs.map((log) => {
        const info = getActionInfo(log.action);
        const date = new Date(log.createdAt);
        const time1 = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const time2 = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        let detailText = log.details;
        if (log.ipAddress) {
          detailText = <>{detailText} <br/><small style={{color:'var(--muted)'}}>IP: {log.ipAddress}</small></>;
        }

        return (
          <div key={log._id} className="audit-item">
            <div className="audit-icon" style={info.style}>{info.icon}</div>
            <div className="audit-info">
              <div className="audit-action">{info.label}</div>
              <div className="audit-detail">
                <strong>{log.adminName}</strong>: {detailText}
              </div>
            </div>
            <div className="audit-time">{time1}<br/>{time2}</div>
          </div>
        );
      })}
    </div>
  )
}
