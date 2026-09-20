import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const { accessToken, user } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState(''); // debounced search
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [dateFilter, setDateFilter] = useState('All Time');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const [exportMonth, setExportMonth] = useState(currentMonthName);
  const [exportYear, setExportYear] = useState(currentYear.toString());
  const [exporting, setExporting] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

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

  const generatePDF = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/admin/audit-logs?month=${exportMonth}&year=${exportYear}&limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      const data = await res.json();
      const exportLogs = data.logs || [];

      const doc = new jsPDF();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("FINDER", 105, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.text("SYSTEM ACTIVITY / AUDIT REPORT", 105, 30, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text("MV Gallego TODA", 105, 38, { align: "center" });

      // Meta Info
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Report Period:", 14, 55);
      doc.setFont("helvetica", "normal");
      doc.text(`${exportMonth} ${exportYear}`, 42, 55);

      doc.setFont("helvetica", "bold");
      doc.text("Generated Date:", 14, 62);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString('en-US'), 45, 62);

      // Table Data
      const tableData = exportLogs.map(log => {
        const dateObj = new Date(log.createdAt);
        return [
          dateObj.toLocaleDateString('en-US'),
          dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          log.adminName || 'Admin',
          "Admin", // Role
          getActionInfo(log.action).label
        ];
      });

      doc.autoTable({
        startY: 70,
        head: [["Date", "Time", "User", "Role", "Action"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      // Calculate summaries
      const totalActivities = exportLogs.length;
      const driverProcessed = exportLogs.filter(l => l.action === 'DRIVER_APPROVED' || l.action === 'DRIVER_REJECTED').length;
      const systemChanges = exportLogs.filter(l => l.action === 'CONFIG_UPDATED' || l.action === 'UPDATE_FARE_SETTINGS').length;

      // Summary Section
      let finalY = doc.lastAutoTable.finalY || 70;
      doc.setFont("helvetica", "bold");
      doc.text("SUMMARY", 14, finalY + 15);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      doc.text(`Total Activities: ${totalActivities}`, 14, finalY + 23);
      doc.text(`Driver Application Processed: ${driverProcessed}`, 70, finalY + 23);
      doc.text(`System Changes: ${systemChanges}`, 150, finalY + 23);

      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Generated by:", 14, finalY + 45);
      doc.setFont("helvetica", "normal");
      const adminName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
      doc.text(adminName, 42, finalY + 45);
      
      const textWidth = doc.getTextWidth(adminName);
      doc.line(42, finalY + 46, 42 + Math.max(textWidth, 40), finalY + 46);

      doc.save(`Audit_Report_${exportMonth}_${exportYear}.pdf`);
      setIsModalOpen(false);
    } catch(err) {
      console.error(err);
      alert("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="toolbar" style={{ marginBottom:18, display:'flex', flexWrap:'wrap', gap:12 }}>
        <div className="search-box" style={{ flexGrow: 1 }}>
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
        <button className="btn btn-outline" onClick={() => setIsModalOpen(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', fontWeight:600 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export PDF
        </button>
      </div>

      {/* Modal for PDF Export */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: '8px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Export Audit Report</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '16px' }}>Select the month to generate the report for.</p>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <select className="filter-select" style={{ flex: 1 }} value={exportMonth} onChange={e => setExportMonth(e.target.value)}>
                {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="filter-select" style={{ flex: 1 }} value={exportYear} onChange={e => setExportYear(e.target.value)}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={generatePDF} disabled={exporting}>
                {exporting ? 'Exporting...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

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
