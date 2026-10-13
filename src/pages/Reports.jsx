import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Reports({ isActive }) {
  const { accessToken, user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({ totalTrips: 0, completedTrips: 0, completedRate: 0, cancelledTrips: 0, registeredPassengers: 0, registeredDrivers: 0, activeDrivers: 0, inactiveDrivers: 0 });
  
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonthName);
  const [year, setYear] = useState(currentYear.toString());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const [error, setError] = useState(null);

  const fetchReports = async (showLoading = true) => {
    if (!accessToken || !isActive) return;
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }
      const res = await fetch(`${API_URL}/admin/reports?month=${month}&year=${year}&page=${page}&limit=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages || 1);
      } else if (showLoading) {
        setError(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      if (showLoading) setError('Network error or server unavailable');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken || !isActive) return;
    fetchReports(true);
    const interval = setInterval(() => {
      fetchReports(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [month, year, page, accessToken, isActive]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const formatId = (id) => {
    if (!id) return '';
    return `#${id.slice(-6)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header - Center aligned as per template
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FINDER", 105, 24, { align: "center" });
    
    doc.setFontSize(11);
    doc.text("SYSTEM SUMMARY REPORT", 105, 32, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("MV Gallego TODA", 105, 39, { align: "center" });

    // Meta Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Report Period:", 20, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`${month} 1, ${year}`, 48, 56);
    // Draw underline for Report Period start
    const startPeriodWidth = doc.getTextWidth(`${month} 1, ${year}`);
    doc.line(48, 57, 48 + Math.max(startPeriodWidth, 30), 57);

    const toX = 48 + Math.max(startPeriodWidth, 30) + 4;
    doc.setFont("helvetica", "bold");
    doc.text("to", toX, 56);

    // End date calculation
    const monthNamesList = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const mIdx = monthNamesList.indexOf(month);
    const lastDay = mIdx !== -1 ? new Date(parseInt(year), mIdx + 1, 0).getDate() : 30;
    const endPeriodText = `${month} ${lastDay}, ${year}`;
    
    doc.setFont("helvetica", "normal");
    const endPeriodX = toX + 9;
    doc.text(endPeriodText, endPeriodX, 56);
    const endPeriodWidth = doc.getTextWidth(endPeriodText);
    doc.line(endPeriodX, 57, endPeriodX + Math.max(endPeriodWidth, 30), 57);

    doc.setFont("helvetica", "bold");
    doc.text("Generated Date:", 20, 64);
    doc.setFont("helvetica", "normal");
    const generatedDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    doc.text(generatedDateStr, 52, 64);
    const genDateWidth = doc.getTextWidth(generatedDateStr);
    doc.line(52, 65, 52 + Math.max(genDateWidth, 30), 65);

    // Table Data matching exact template
    const tableData = [
      ["1.", "Total Bookings", stats.totalTrips !== undefined ? stats.totalTrips : 0],
      ["2.", "Completed Trips", stats.completedTrips !== undefined ? stats.completedTrips : 0],
      ["3.", "Cancelled Trips", stats.cancelledTrips !== undefined ? stats.cancelledTrips : 0],
      ["4.", "Registered Passengers", stats.registeredPassengers !== undefined ? stats.registeredPassengers : 0],
      ["5.", "Registered Driver", stats.registeredDrivers !== undefined ? stats.registeredDrivers : 0],
      ["6.", "Active Driver", stats.activeDrivers !== undefined ? stats.activeDrivers : 0],
      ["7.", "Inactive Driver", stats.inactiveDrivers !== undefined ? stats.inactiveDrivers : 0]
    ];

    autoTable(doc, {
      startY: 74,
      margin: { left: 20, right: 20 },
      head: [["No.", "Category", "Total"]],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.2
      },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'left' },
        1: { halign: 'left' },
        2: { cellWidth: 45, halign: 'left' }
      },
      tableLineColor: [180, 180, 180],
      tableLineWidth: 0.2
    });

    // Footer - Generated by with underline
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 140;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Generated by:", 20, finalY + 24);
    
    doc.setFont("helvetica", "normal");
    const adminName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
    doc.text(adminName, 49, finalY + 24);
    const textWidth = doc.getTextWidth(adminName);
    doc.line(49, finalY + 25, 49 + Math.max(textWidth, 45), finalY + 25);

    doc.save(`System_Summary_Report_${month}_${year}.pdf`);
  };

  const exportCSV = () => {
    const csvRows = [
      ["FINDER"],
      ["SYSTEM SUMMARY REPORT"],
      ["MV Gallego TODA"],
      [],
      ["Report Period", `${month} ${year}`],
      ["Generated Date", new Date().toLocaleDateString('en-US')],
      ["Generated by", user ? `${user.firstName} ${user.lastName}` : 'Admin'],
      [],
      ["No.", "Category", "Total"],
      ["1", "Total Bookings", stats.totalTrips || 0],
      ["2", "Completed Trips", stats.completedTrips || 0],
      ["3", "Cancelled Trips", stats.cancelledTrips || 0],
      ["4", "Registered Passengers", stats.registeredPassengers || 0],
      ["5", "Registered Driver", stats.registeredDrivers || 0],
      ["6", "Active Driver", stats.activeDrivers || 0],
      ["7", "Inactive Driver", stats.inactiveDrivers || 0]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(val => `"${val !== undefined ? val : ''}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `System_Summary_Report_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="report-filters" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <select className="filter-select" style={{ minWidth:140 }} value={month} onChange={handleMonthChange}>
          {monthNames.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select className="filter-select" style={{ minWidth:100 }} value={year} onChange={handleYearChange}>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="export-btns" style={{ marginLeft:'auto', display:'flex', gap:12 }}>
          <button className="btn btn-outline" onClick={exportPDF} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', fontWeight:600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
          <button className="btn btn-primary" onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', fontWeight:600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom:24 }}>
        {[
          { label:'TOTAL TRIPS', val: stats.totalTrips?.toLocaleString() || '0', valStyle:{ color:'var(--brand)' }, trend:<span style={{ color:'var(--green)' }}>Filtered</span> },
          { label:'COMPLETED', val: stats.completedTrips?.toLocaleString() || '0', valStyle:{ color:'var(--green)' }, trend:<span style={{ color:'var(--green)' }}>{stats.completedRate || 0}% rate</span> },
          { label:'AVG DAILY TRIPS', val: stats.averageDailyTrips?.toLocaleString() || '0', valStyle:{ color:'var(--text)' }, trend:<span style={{ color:'var(--text-light)' }}>Per day</span> },
          { label:'MESSAGES', val: stats.totalMessages?.toLocaleString() || '0', valStyle:{ color:'var(--text)' }, trend:<span style={{ color:'var(--text-light)' }}>Chat & Support</span> },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={s.valStyle}>{s.val}</div>
            <div className="stat-trend">{s.trend}</div>
            <div className="overview-icon-bg"></div>
          </div>
        ))}
      </div>

      <div className="table-wrap" style={{ border:'1.5px solid var(--border-l)', borderRadius:'var(--radius)' }}>
        <table style={{ borderCollapse:'separate', borderSpacing:0, width:'100%' }}>
          <thead style={{ position:'sticky', top:0, zIndex:5, background:'var(--bg)' }}>
            <tr>
              {['TRIP ID','DATE','DRIVER','PASSENGER','DISTANCE','FARE','STATUS'].map(h => (
                <th key={h} style={{ padding:16, borderBottom:'1.5px solid var(--border-l)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr><td colSpan="7" style={{ padding:16, textAlign:'center', color:'red' }}>{error}</td></tr>
            ) : loading ? (
              <tr><td colSpan="7" style={{ padding:16, textAlign:'center' }}>Loading...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan="7" style={{ padding:16, textAlign:'center' }}>No trips found for this period.</td></tr>
            ) : trips.map(t => (
              <tr key={t._id}>
                <td style={{ padding:16 }}>{formatId(t._id)}</td>
                <td style={{ padding:16 }}>{formatDate(t.createdAt)}</td>
                <td style={{ padding:16 }}>{t.driverId ? `${t.driverId.firstName} ${t.driverId.lastName}` : '—'}</td>
                <td style={{ padding:16 }}>{t.passengerId ? `${t.passengerId.firstName} ${t.passengerId.lastName}` : '—'}</td>
                <td style={{ padding:16 }}>{t.distanceKm ? `${t.distanceKm} km` : '—'}</td>
                <td style={{ padding:16 }}>{t.fare ? `₱${t.fare.toFixed(2)}` : '—'}</td>
                <td style={{ padding:16 }}>
                  <span className={`badge ${t.status === 'completed' ? 'green' : 'red'}`} style={{ background: t.status === 'completed' ? 'var(--green-l)' : 'var(--red-l)', color: t.status === 'completed' ? 'var(--green)' : 'var(--red)', border:'none', textTransform: 'capitalize' }}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:16, borderTop:'1.5px solid var(--border-l)' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding:'6px 12px', fontSize:'0.9rem', opacity: page === 1 ? 0.5 : 1, pointerEvents: page === 1 ? 'none' : 'auto' }}
            onClick={handlePrevPage}
          >
            Previous
          </button>
          <span style={{ fontSize:'0.9rem', color:'var(--text-light)' }}>
            Page {page} of {totalPages === 0 ? 1 : totalPages}
          </span>
          <button 
            className="btn btn-outline" 
            style={{ padding:'6px 12px', fontSize:'0.9rem', opacity: page >= totalPages ? 0.5 : 1, pointerEvents: page >= totalPages ? 'none' : 'auto' }}
            onClick={handleNextPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}