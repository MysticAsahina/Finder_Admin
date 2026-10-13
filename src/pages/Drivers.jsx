import { useState, useEffect, useContext } from 'react'
import Swal from 'sweetalert2'
import DriverModal from '../components/DriverModal'
import { AuthContext } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Sample drivers matching Screenshot 1 for fallback / preview
const SAMPLE_DRIVERS = [
  { id: 'DR-0012', name: 'Marco Santos', initials: 'MS', trips: 48, rate: '96%', rating: '4.9', status: 'Online', motorcycleBrand: 'Honda', plateNumber: 'TMX' },
  { id: 'DR-0009', name: 'Pedro Cruz', initials: 'PC', trips: 43, rate: '91%', rating: '4.7', status: 'Online', motorcycleBrand: 'Kawasaki', plateNumber: 'Bajaj' },
  { id: 'DR-0007', name: 'Jose Rivera', initials: 'JR', trips: 37, rate: '89%', rating: '4.8', status: 'Online', motorcycleBrand: 'Honda', plateNumber: 'TMX' },
  { id: 'DR-0015', name: 'Luis Gomez', initials: 'LG', trips: 34, rate: '94%', rating: '5.0', status: 'Offline', motorcycleBrand: 'Honda', plateNumber: 'TMX' },
  { id: 'DR-0011', name: 'Ramon Flores', initials: 'RF', trips: 29, rate: '83%', rating: '4.4', status: 'Online', motorcycleBrand: 'Kawasaki', plateNumber: 'Bajaj' },
  { id: 'DR-0018', name: 'Marcelino Zafra', initials: 'MF', trips: 32, rate: '98%', rating: '4.9', status: 'Online', motorcycleBrand: 'Kawasaki', plateNumber: 'Bajaj' },
  { id: 'DR-0123', name: 'Justine Castro', initials: 'JC', trips: 18, rate: '94%', rating: '4.7', status: 'Offline', motorcycleBrand: 'Kawasaki', plateNumber: 'Bajaj' },
  { id: 'DR-0124', name: 'Michael Reyes', initials: 'MR', trips: 23, rate: '94%', rating: '4.7', status: 'Online', motorcycleBrand: 'Rusi', plateNumber: '125' },
];

// Sample flagged accounts matching Screenshot 2 & action menu
const INITIAL_FLAGGED_ACCOUNTS = [
  {
    id: 'flg-1',
    name: 'Juan Dela Cruz',
    role: 'Passenger',
    reason: 'Frequent Cancellation',
    date: '02/24/2026',
    status: 'Flagged'
  },
  {
    id: 'flg-2',
    name: 'John Mark Liwag',
    role: 'Passenger',
    reason: 'No-show Pattern',
    date: '02/16/2026',
    status: 'Flagged'
  },
  {
    id: 'flg-3',
    name: 'Maria Sumulong',
    role: 'Passenger',
    reason: 'Unresponsive',
    date: '01/24/2026',
    status: 'Flagged'
  },
  {
    id: 'flg-4',
    name: 'Antonio Santos',
    role: 'Driver',
    reason: 'Under Review',
    date: '01/08/2026',
    status: 'Under Review'
  },
];

// Consistent pastel color for avatars based on driver ID or name
function stringToColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return { background: `hsl(${hue}, 80%, 95%)`, color: `hsl(${hue}, 70%, 40%)` };
}

export default function Drivers({ isActive }) {
  const { accessToken } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('drivers'); // 'drivers' | 'flagged'
  const [modalDriver, setModalDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortMethod, setSortMethod] = useState('Sort by: Trips');

  // Flagged accounts state & active action popover menu
  const [flaggedAccounts, setFlaggedAccounts] = useState([]);
  const [flaggedRoleFilter, setFlaggedRoleFilter] = useState('All');
  const [flaggedReasonFilter, setFlaggedReasonFilter] = useState('All');
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  // Suspended accounts state
  const [suspendedAccounts, setSuspendedAccounts] = useState([]);
  const [suspendedRoleFilter, setSuspendedRoleFilter] = useState('All');

  const [error, setError] = useState(null);

  // Close action popup when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveActionMenu(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Lock outer main content container scroll when viewing flagged accounts
  useEffect(() => {
    const contentEl = document.querySelector('.content');
    if (!contentEl) return;
    if (viewMode === 'flagged') {
      contentEl.style.overflow = 'hidden';
    } else {
      contentEl.style.overflow = '';
    }
    return () => {
      contentEl.style.overflow = '';
    };
  }, [viewMode]);

  useEffect(() => {
    if (!isActive) return;

    if (!accessToken) {
      // Use sample drivers if not authenticated
      setDrivers(SAMPLE_DRIVERS.map(d => ({
        ...d,
        avatarStyle: stringToColor(d.id),
        badgeClass: d.status === 'Online' ? 'green' : 'gray'
      })));
      setLoading(false);
      return;
    }
    
    let cancelled = false;

    const loadDriverData = (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
      
      fetch(`${API_URL}/admin/drivers`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (!cancelled) {
            if (data.drivers && data.drivers.length > 0) {
              const driversWithAvatars = data.drivers.map(d => ({
                ...d,
                avatarStyle: stringToColor(d._id || d.id),
                badgeClass: d.status === 'Online' ? 'green' : d.status === 'Offline' ? 'gray' : 'yellow'
              }));
              setDrivers(driversWithAvatars);
            } else {
              // Fallback to sample drivers if backend returns empty
              setDrivers(SAMPLE_DRIVERS.map(d => ({
                ...d,
                avatarStyle: stringToColor(d.id),
                badgeClass: d.status === 'Online' ? 'green' : 'gray'
              })));
            }
          }
        })
        .catch(err => {
          if (!cancelled && isInitial) {
            // If offline or network error, fallback gracefully to sample drivers
            setDrivers(SAMPLE_DRIVERS.map(d => ({
              ...d,
              avatarStyle: stringToColor(d.id),
              badgeClass: d.status === 'Online' ? 'green' : 'gray'
            })));
          }
          console.error(err);
        })
        .finally(() => {
          if (!cancelled && isInitial) setLoading(false);
        });

      fetch(`${API_URL}/admin/flagged-accounts`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(data => {
          if (!cancelled) {
            let list = Array.isArray(data) ? [...data] : [];
            try {
              const autoFlaggedRaw = localStorage.getItem('finder_auto_flagged_accounts_v1');
              if (autoFlaggedRaw) {
                const autoList = JSON.parse(autoFlaggedRaw);
                if (Array.isArray(autoList)) {
                  autoList.forEach(autoAcc => {
                    if (!list.some(item => item.id === autoAcc.id || item.userId === autoAcc.userId)) {
                      list.unshift(autoAcc);
                    }
                  });
                }
              }
            } catch (e) {}
            setFlaggedAccounts(list);
          }
        })
        .catch(err => {
          console.error(err);
          if (!cancelled) {
            let fallbackList = [];
            try {
              const autoFlaggedRaw = localStorage.getItem('finder_auto_flagged_accounts_v1');
              if (autoFlaggedRaw) {
                fallbackList = JSON.parse(autoFlaggedRaw) || [];
              }
            } catch (e) {}
            setFlaggedAccounts(fallbackList);
          }
        });

      fetch(`${API_URL}/admin/suspended-accounts`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(data => {
          if (!cancelled && Array.isArray(data)) setSuspendedAccounts(data);
        })
        .catch(err => console.error(err));
    };

    loadDriverData(true);
    const interval = setInterval(() => loadDriverData(false), 3500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [accessToken, isActive]);

  const handleSelectAction = async (account, actionType) => {
    setActiveActionMenu(null);
    let backendAction = '';
    let payload = {};
    
    if (actionType === 'Clear Flag') {
      backendAction = 'clear';
    } else if (actionType === 'Temporary Suspension') {
      const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Temporary Suspension',
        html: `
          <p style="margin-bottom: 10px; font-size: 14px; color: #555; text-align: left;">Enter suspension duration (min 3, max 30 days):</p>
          <input id="swal-input1" type="number" min="3" max="30" class="swal2-input" placeholder="Duration (days)" style="margin-bottom: 15px;">
          <p style="margin-bottom: 10px; font-size: 14px; color: #555; text-align: left;">Reason for suspension:</p>
          <textarea id="swal-input2" class="swal2-textarea" placeholder="Enter reason here..." rows="3"></textarea>
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          const days = document.getElementById('swal-input1').value;
          const reason = document.getElementById('swal-input2').value;
          if (!days || days < 3 || days > 30) {
            Swal.showValidationMessage('Please enter a valid number between 3 and 30');
            return false;
          }
          if (!reason.trim()) {
            Swal.showValidationMessage('Please enter a reason');
            return false;
          }
          return { days, reason: reason.trim() };
        }
      });
      if (!isConfirmed || !formValues) return;
      backendAction = 'temp_suspend';
      payload = { durationDays: parseInt(formValues.days), reason: formValues.reason };
    } else if (actionType === 'Suspend Until Resolved') {
      const { value: reason, isConfirmed } = await Swal.fire({
        title: 'Suspend Until Resolved',
        text: 'Enter reason for suspension:',
        input: 'textarea',
        inputPlaceholder: 'Enter reason here...',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return 'Please enter a reason';
          }
        }
      });
      if (!isConfirmed || !reason) return;
      backendAction = 'suspend_resolved';
      payload = { reason: reason.trim() };
    } else if (actionType === 'Permanent Suspension') {
      const { value: reason, isConfirmed } = await Swal.fire({
        title: 'Permanent Suspension',
        html: `
          <p style="margin-bottom: 15px; color: #555;">Are you sure you want to permanently suspend ${account.name}? This action is unappealable.</p>
          <textarea id="swal-input-reason" class="swal2-textarea" placeholder="Enter reason for permanent suspension..." rows="3"></textarea>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, permanently suspend',
        preConfirm: () => {
          const r = document.getElementById('swal-input-reason').value;
          if (!r.trim()) {
            Swal.showValidationMessage('Please enter a reason');
            return false;
          }
          return r.trim();
        }
      });
      if (!isConfirmed || !reason) return;
      backendAction = 'perm_suspend';
      payload = { reason: reason };
    }

    if (!backendAction) return;

    try {
      const res = await fetch(`${API_URL}/admin/flagged-accounts/${account.id}/action`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: backendAction, ...payload })
      });

      if (!res.ok) {
        throw new Error('Action failed');
      }

      try {
        const autoFlaggedRaw = localStorage.getItem('finder_auto_flagged_accounts_v1');
        if (autoFlaggedRaw) {
          const autoList = JSON.parse(autoFlaggedRaw);
          const filtered = autoList.filter(a => a.id !== account.id && a.userId !== account.userId);
          localStorage.setItem('finder_auto_flagged_accounts_v1', JSON.stringify(filtered));
        }
      } catch (e) {}

      if (actionType === 'Clear Flag') {
        setFlaggedAccounts(prev => prev.filter(a => a.id !== account.id));
        Swal.fire({ title: 'Flag Cleared', text: `Flag for ${account.name} has been removed.`, icon: 'success', timer: 1800, showConfirmButton: false });
      } else {
        setFlaggedAccounts(prev => prev.filter(a => a.id !== account.id));
        setSuspendedAccounts(prev => [{
          id: account.id,
          name: account.name,
          role: account.role,
          suspensionType: actionType,
          suspensionEndDate: actionType === 'Temporary Suspension' && payload.durationDays ? new Date(Date.now() + payload.durationDays * 86400000).toISOString() : null,
          reason: payload.reason || "N/A"
        }, ...prev]);

        if (actionType === 'Temporary Suspension') {
          Swal.fire({ title: 'Temporarily Suspended', text: `${account.name} has been suspended for ${payload.durationDays} days.`, icon: 'warning', timer: 2000, showConfirmButton: false });
        } else if (actionType === 'Suspend Until Resolved') {
          Swal.fire({ title: 'Suspended Until Resolved', text: `${account.name} has been suspended indefinitely until resolved.`, icon: 'warning', timer: 2000, showConfirmButton: false });
        } else if (actionType === 'Permanent Suspension') {
          Swal.fire({ title: 'Permanently Suspended', text: `${account.name} has been permanently banned.`, icon: 'error', timer: 2000, showConfirmButton: false });
        }
      }
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'Error', text: 'Failed to apply action.', icon: 'error' });
    }
  };

  const handleLiftSuspension = async (account) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Lift Suspension',
      text: `Are you sure you want to lift the suspension for ${account.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, lift it'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/admin/suspended-accounts/${account.id}/lift`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to lift suspension');
      
      setSuspendedAccounts(prev => prev.filter(a => a.id !== account.id));
      Swal.fire({ title: 'Suspension Lifted', text: `${account.name}'s account has been restored.`, icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'Error', text: 'Failed to lift suspension.', icon: 'error' });
    }
  };

  // Drivers Filtering and Sorting
  let filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    (d.id && d.id.toLowerCase().includes(search.toLowerCase()))
  );

  if (statusFilter !== 'All Status') {
    filteredDrivers = filteredDrivers.filter(d => d.status.toLowerCase() === statusFilter.toLowerCase());
  }

  filteredDrivers.sort((a, b) => {
    if (sortMethod === 'Sort by: Trips') return (b.trips || 0) - (a.trips || 0);
    return a.name.localeCompare(b.name);
  });

  // Flagged accounts filtering
  const filteredFlagged = flaggedAccounts.filter(acc => {
    const matchRole = flaggedRoleFilter === 'All' || acc.role.toLowerCase() === flaggedRoleFilter.toLowerCase();
    const matchReason = flaggedReasonFilter === 'All' || acc.reason.toLowerCase() === flaggedReasonFilter.toLowerCase();
    return matchRole && matchReason;
  });

  // Calculate empty rows to fill down to 15 lines like Screenshot 2
  const emptyRowCount = Math.max(0, 15 - filteredFlagged.length);

  // Suspended accounts filtering
  const filteredSuspended = suspendedAccounts.filter(acc => {
    const matchRole = suspendedRoleFilter === 'All' || acc.role.toLowerCase() === suspendedRoleFilter.toLowerCase();
    return matchRole;
  });
  const emptySuspendedRowCount = Math.max(0, 15 - filteredSuspended.length);

  return (
    <>
      {viewMode === 'flagged' ? (
        /* ── FLAGGED ACCOUNTS VIEW (SCREENSHOT 2) ── */
        <div className="flagged-container">
          <div className="flagged-top-bar">
            <button 
              type="button"
              className="flagged-back-btn" 
              onClick={() => {
                setActiveActionMenu(null);
                setViewMode('drivers');
              }}
              title="Back to Users"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <select 
              className="filter-select" 
              style={{ minWidth: 90 }}
              value={flaggedRoleFilter} 
              onChange={e => {
                setActiveActionMenu(null);
                setFlaggedRoleFilter(e.target.value);
              }}
            >
              <option value="All">All Roles</option>
              <option value="Passenger">Passenger</option>
              <option value="Driver">Driver</option>
            </select>
            <select 
              className="filter-select" 
              style={{ minWidth: 150 }}
              value={flaggedReasonFilter} 
              onChange={e => {
                setActiveActionMenu(null);
                setFlaggedReasonFilter(e.target.value);
              }}
            >
              <option value="All">All Reasons</option>
              <option value="Multiple User Reports (5 reports in 24h)">Multiple User Reports (5 reports in 24h)</option>
              <option value="Frequent Cancellation">Frequent Cancellation</option>
              <option value="Unresponsive Passenger">Unresponsive Passenger</option>
              <option value="Unresponsive Driver">Unresponsive Driver</option>
              <option value="Policy Violation (Outside Hailing)">Policy Violation (Outside Hailing)</option>
              <option value="Late Arrival">Late Arrival</option>
            </select>
          </div>

          <div className="flagged-title">Flagged Accounts</div>
          <div className="flagged-subtitle">Accounts that has been flagged for repeated policy violations or suspicious activity.</div>

          <div className="flagged-table-wrapper">
            <table className="flagged-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>NAME</th>
                  <th style={{ width: '18%' }}>ROLE</th>
                  <th style={{ width: '28%' }}>REASON</th>
                  <th style={{ width: '16%' }}>DATE</th>
                  <th className="th-action" style={{ width: '18%' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlagged.map(account => (
                  <tr key={account.id} style={{ position: 'relative', zIndex: activeActionMenu === account.id ? 99999 : 1 }}>
                    <td>{account.name}</td>
                    <td>{account.role}</td>
                    <td>{account.reason}</td>
                    <td>{account.date}</td>
                    <td 
                      className="td-action" 
                      style={{ 
                        position: 'relative', 
                        zIndex: activeActionMenu === account.id ? 99999 : 1 
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                        {account.actionBadge && (
                          <span className="flagged-status-badge">
                            {account.actionBadge}
                          </span>
                        )}
                        <button 
                          type="button"
                          className="flagged-action-pill" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMenu(activeActionMenu === account.id ? null : account.id);
                          }}
                        >
                          ACTION
                        </button>
                      </div>

                      {/* Popover Action Menu */}
                      {activeActionMenu === account.id && (
                        <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button" 
                            className="action-dropdown-item"
                            onClick={() => handleSelectAction(account, 'Temporary Suspension')}
                          >
                            Temporary Suspension
                          </button>
                          <button 
                            type="button" 
                            className="action-dropdown-item"
                            onClick={() => handleSelectAction(account, 'Suspend Until Resolved')}
                          >
                            Suspend Until Resolved
                          </button>
                          <button 
                            type="button" 
                            className="action-dropdown-item"
                            onClick={() => handleSelectAction(account, 'Permanent Suspension')}
                          >
                            Permanent Suspension
                          </button>
                          <button 
                            type="button" 
                            className="action-dropdown-item"
                            onClick={() => handleSelectAction(account, 'Clear Flag')}
                          >
                            Clear Flag
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Lined empty rows matching Screenshot 2 table sheet aesthetic */}
                {Array.from({ length: emptyRowCount }).map((_, idx) => (
                  <tr key={`empty-row-${idx}`} className="empty-row">
                    <td colSpan={5}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'suspended' ? (
        /* ── SUSPENDED ACCOUNTS VIEW ── */
        <div className="flagged-container">
          <div className="flagged-top-bar">
            <button 
              type="button"
              className="flagged-back-btn" 
              onClick={() => {
                setActiveActionMenu(null);
                setViewMode('drivers');
              }}
              title="Back to Users"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <select 
              className="filter-select" 
              style={{ minWidth: 90 }}
              value={suspendedRoleFilter} 
              onChange={e => {
                setSuspendedRoleFilter(e.target.value);
              }}
            >
              <option value="All">All Roles</option>
              <option value="Passenger">Passenger</option>
              <option value="Driver">Driver</option>
            </select>
          </div>

          <div className="flagged-title">Suspended Accounts</div>
          <div className="flagged-subtitle">Accounts that have been suspended from the platform.</div>

          <div className="flagged-table-wrapper">
            <table className="flagged-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>NAME</th>
                  <th style={{ width: '15%' }}>ROLE</th>
                  <th style={{ width: '20%' }}>SUSPENSION TYPE</th>
                  <th style={{ width: '25%' }}>REASON</th>
                  <th style={{ width: '20%', textAlign: 'right', paddingRight: '20px' }}>LIFT ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuspended.map(account => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.role}</td>
                    <td>
                      <span className="flagged-status-badge">
                        {account.suspensionType || 'Suspended'}
                      </span>
                    </td>
                    <td>{account.reason || 'N/A'}</td>
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      {account.suspensionType !== 'Permanent Suspension' && (
                        <button 
                          className="flagged-action-pill" 
                          onClick={() => handleLiftSuspension(account)}
                        >
                          LIFT SUSPENSION
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: emptySuspendedRowCount }).map((_, idx) => (
                  <tr key={`empty-suspended-row-${idx}`} className="empty-row">
                    <td colSpan={5}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── USERS / DRIVERS VIEW (SCREENSHOT 1) ── */
        <>
          <div className="toolbar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search drivers…" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              type="button"
              className="btn-flagged"
              onClick={() => setViewMode('flagged')}
            >
              Flagged Accounts
            </button>
            <button 
              type="button"
              className="btn-flagged"
              style={{ marginLeft: '8px' }}
              onClick={() => setViewMode('suspended')}
            >
              Suspended Accounts
            </button>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All Status</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Inactive</option>
            </select>
            <select className="filter-select" value={sortMethod} onChange={e => setSortMethod(e.target.value)}>
              <option>Sort by: Trips</option>
              <option>Sort by: Name</option>
            </select>
          </div>

          {error && <div style={{ padding: 20, textAlign: 'center', color: 'var(--red)' }}>{error}</div>}
          {loading && !error && <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Loading drivers...</div>}

          {!loading && (
            <div className="driver-grid">
              {filteredDrivers.map(d => {
                return (
                  <div key={d.id} className="driver-card" onClick={() => setModalDriver(d)}>
                    <div className="driver-head">
                      {d.profilePicture ? (
                        <img src={d.profilePicture} alt={d.name} className="driver-avatar" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="driver-avatar" style={d.avatarStyle}>{d.initials}</div>
                      )}
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

          {filteredDrivers.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>No drivers found.</div>
          )}

          <DriverModal isOpen={!!modalDriver} onClose={() => setModalDriver(null)} driver={modalDriver} />
        </>
      )}
    </>
  )
}