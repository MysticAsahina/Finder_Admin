import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const DEFAULT_SUMMARY = {
  totalPassengerFloat: 0,
  totalDriverFloat: 0,
  totalFeesCollected: 0,
  totalCashInVolume: 0,
  totalCashOutVolume: 0,
};

const DEFAULT_TRANSACTIONS = [];

export default function WalletTransactions({ isActive }) {
  const { accessToken } = useContext(AuthContext);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Receipt modal state
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!accessToken) return;
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      const [sumRes, txRes] = await Promise.all([
        fetch(`${API_URL}/admin/wallet/summary`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/admin/wallet/transactions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        if (sumData) setSummary(sumData);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        if (Array.isArray(txData.transactions)) {
          setTransactions(txData.transactions);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin wallet data', err);
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  // Live auto-updating via useEffect with 3.5s interval
  useEffect(() => {
    if (!isActive) return;
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [isActive, fetchData]);

  const formatCurrency = (val) =>
    (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Filtered & Search Results
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filterType !== 'ALL' && tx.type !== filterType) {
        return false;
      }
      // Role filter
      if (filterRole !== 'ALL' && tx.userRole !== filterRole) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'ALL' && tx.status !== filterStatus) {
        return false;
      }
      // Date filter
      if (filterDate !== 'ALL') {
        const txDate = new Date(tx.createdAt);
        const now = new Date();
        if (filterDate === 'TODAY') {
          if (txDate.toDateString() !== now.toDateString()) return false;
        } else if (filterDate === 'WEEK') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (txDate < weekAgo) return false;
        } else if (filterDate === 'MONTH') {
          if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const refMatch = (tx.referenceNumber || '').toLowerCase().includes(q);
        const nameMatch = tx.userId ? `${tx.userId.firstName || ''} ${tx.userId.lastName || ''}`.toLowerCase().includes(q) : false;
        const phoneMatch = tx.userId?.mobileNumber ? tx.userId.mobileNumber.toLowerCase().includes(q) : false;
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        if (!refMatch && !nameMatch && !phoneMatch && !descMatch) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterRole, filterStatus, filterDate, searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterRole, filterStatus, filterDate, searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Active filters count
  const hasActiveFilters = filterType !== 'ALL' || filterRole !== 'ALL' || filterStatus !== 'ALL' || filterDate !== 'ALL' || searchTerm.trim().length > 0;

  const handleClearFilters = () => {
    setFilterType('ALL');
    setFilterRole('ALL');
    setFilterStatus('ALL');
    setFilterDate('ALL');
    setSearchTerm('');
  };

  // Copy Reference code to clipboard
  const handleCopyRef = (refNo) => {
    navigator.clipboard?.writeText(refNo);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Copied ${refNo}`,
      showConfirmButton: false,
      timer: 1600,
      background: 'var(--white)',
      color: 'var(--text)'
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      Swal.fire('No Data', 'No transactions to export for the current filters.', 'info');
      return;
    }

    const headers = ['Reference Number', 'Name', 'Phone', 'Role', 'Type', 'Amount (PHP)', 'Fee (PHP)', 'Status', 'Date', 'Description'];
    const rows = filteredTransactions.map(tx => [
      tx.referenceNumber,
      tx.userId ? `"${tx.userId.firstName} ${tx.userId.lastName}"` : '"System User"',
      tx.userId?.mobileNumber || '',
      tx.userRole,
      tx.type,
      tx.amount,
      tx.fee || 0,
      tx.status,
      new Date(tx.createdAt).toISOString(),
      `"${(tx.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finder_Wallet_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wallet-page">
      {/* ── Page Header ── */}
      <div className="wallet-header">
        <div className="wallet-header-title">
          <h1>Financial & Wallet Overview</h1>
          <p>Real-time digital float tracking, platform revenue, and transaction ledger across all users.</p>
        </div>

        <div className="wallet-header-actions">
          <div className="wallet-live-pill" title="Live background updates every 3.5s">
            <span className="wallet-live-dot"></span>
            <span>Live Sync Active</span>
          </div>

          <button
            className="btn btn-outline"
            onClick={handleExportCSV}
            title="Download current ledger as CSV"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          <button
            className="btn btn-primary"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                marginRight: 6,
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.5s ease'
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── 4 Key Metric Cards ── */}
      <div className="wallet-stat-grid">
        {/* Card 1: Passenger Float */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-top">
            <span className="wallet-stat-label">Passenger Float</span>
            <div className="wallet-stat-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="12" x2="10" y2="12" />
                <circle cx="16" cy="12" r="2" />
              </svg>
            </div>
          </div>
          <div className="wallet-stat-val">₱ {formatCurrency(summary.totalPassengerFloat)}</div>
          <div className="wallet-stat-sub">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Prepaid passenger wallet balances</span>
          </div>
        </div>

        {/* Card 2: Driver Float */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-top">
            <span className="wallet-stat-label">Driver Float</span>
            <div className="wallet-stat-icon-wrap blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="2" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>
          <div className="wallet-stat-val" style={{ color: '#2563eb' }}>₱ {formatCurrency(summary.totalDriverFloat)}</div>
          <div className="wallet-stat-sub">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Pending driver earnings & payouts</span>
          </div>
        </div>

        {/* Card 3: Platform Fees Collected */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-top">
            <span className="wallet-stat-label">Platform Fees</span>
            <div className="wallet-stat-icon-wrap green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="wallet-stat-val" style={{ color: '#16a34a' }}>₱ {formatCurrency(summary.totalFeesCollected)}</div>
          <div className="wallet-stat-sub">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <span>₱5 + 2% processing revenue</span>
          </div>
        </div>

        {/* Card 4: Total Cash-Out Disbursements */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-top">
            <span className="wallet-stat-label">Disbursements</span>
            <div className="wallet-stat-icon-wrap purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 11 12 6 7 11" />
                <line x1="12" y1="18" x2="12" y2="6" />
              </svg>
            </div>
          </div>
          <div className="wallet-stat-val" style={{ color: '#7c3aed' }}>₱ {formatCurrency(summary.totalCashOutVolume)}</div>
          <div className="wallet-stat-sub">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Total driver payouts processed</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Toolbar & Filter Controls ── */}
      <div className="wallet-toolbar-card">
        <div className="wallet-toolbar-row">
          {/* Search Box */}
          <div className="wallet-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="wallet-search-input"
              placeholder="Search reference #, name, phone, or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Group */}
          <div className="wallet-filters-group">
            {/* Type Filter */}
            <select
              className="wallet-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="cash_in">Cash In (Top-up)</option>
              <option value="cash_out">Cash Out (Disbursement)</option>
              <option value="fare_deduction">Fare Deduction (Passenger)</option>
              <option value="fare_earning">Fare Earning (Driver)</option>
            </select>

            {/* Role Filter */}
            <select
              className="wallet-select"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="passenger">Passengers</option>
              <option value="driver">Drivers</option>
            </select>

            {/* Status Filter */}
            <select
              className="wallet-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range Filter */}
            <select
              className="wallet-select"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="wallet-chip-bar">
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600 }}>Active Filters:</span>
            {searchTerm.trim() && (
              <span className="wallet-chip">
                Search: "{searchTerm}"
                <button className="wallet-chip-btn" onClick={() => setSearchTerm('')}>✕</button>
              </span>
            )}
            {filterType !== 'ALL' && (
              <span className="wallet-chip">
                Type: {filterType.replace('_', ' ')}
                <button className="wallet-chip-btn" onClick={() => setFilterType('ALL')}>✕</button>
              </span>
            )}
            {filterRole !== 'ALL' && (
              <span className="wallet-chip">
                Role: {filterRole}
                <button className="wallet-chip-btn" onClick={() => setFilterRole('ALL')}>✕</button>
              </span>
            )}
            {filterStatus !== 'ALL' && (
              <span className="wallet-chip">
                Status: {filterStatus}
                <button className="wallet-chip-btn" onClick={() => setFilterStatus('ALL')}>✕</button>
              </span>
            )}
            {filterDate !== 'ALL' && (
              <span className="wallet-chip">
                Date: {filterDate}
                <button className="wallet-chip-btn" onClick={() => setFilterDate('ALL')}>✕</button>
              </span>
            )}
            <button className="wallet-clear-link" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Transaction Ledger Table ── */}
      <div className="wallet-table-card">
        <div className="wallet-table-header">
          <div className="wallet-table-title">
            <span>Transaction Ledger</span>
            <span className="wallet-count-tag">{filteredTransactions.length} records</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Rows:</span>
            <select
              className="wallet-select"
              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <div className="wallet-table-container wallet-table-scroll">
          <table className="wallet-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>User Account</th>
                <th>Role</th>
                <th>Type & Description</th>
                <th>Net Amount</th>
                <th>Platform Fee</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                    Loading financial transactions...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="wallet-empty-state">
                      <div className="wallet-empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <div className="wallet-empty-title">No transactions found</div>
                      <div className="wallet-empty-sub">
                        No transactions match your current search or filter parameters.
                      </div>
                      {hasActiveFilters && (
                        <button className="btn btn-outline btn-sm" onClick={handleClearFilters}>
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isCredit = tx.type === 'cash_in' || tx.type === 'fare_earning';
                  const userFullName = tx.userId ? `${tx.userId.firstName || ''} ${tx.userId.lastName || ''}`.trim() : 'System User';
                  const initials = userFullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TX';

                  return (
                    <tr key={tx._id}>
                      {/* Ref code */}
                      <td>
                        <span
                          className="wallet-ref-code"
                          onClick={() => handleCopyRef(tx.referenceNumber)}
                          title="Click to copy reference"
                        >
                          {tx.referenceNumber}
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </span>
                      </td>

                      {/* User Account */}
                      <td>
                        <div className="wallet-user-cell">
                          <div className={`wallet-user-avatar ${tx.userRole === 'driver' ? 'blue' : 'purple'}`}>
                            {initials}
                          </div>
                          <div className="wallet-user-info">
                            <span className="wallet-user-name">{userFullName}</span>
                            <span className="wallet-user-phone">{tx.userId?.mobileNumber || '—'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span className={`badge ${tx.userRole === 'driver' ? 'brand' : 'blue'}`}>
                          {tx.userRole === 'driver' ? 'Driver' : 'Passenger'}
                        </span>
                      </td>

                      {/* Type & Description */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className={`wallet-type-pill ${tx.type}`}>
                            {tx.type === 'cash_in' && '+ Top-up (Cash In)'}
                            {tx.type === 'cash_out' && '↑ Payout (Cash Out)'}
                            {tx.type === 'fare_deduction' && '🚕 Fare Deduction'}
                            {tx.type === 'fare_earning' && '🚕 Fare Settlement'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.description}
                          </span>
                        </div>
                      </td>

                      {/* Net Amount */}
                      <td>
                        <span className={`wallet-amount-val ${isCredit ? 'credit' : 'debit'}`}>
                          {isCredit ? '+₱ ' : '-₱ '}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Platform Fee */}
                      <td>
                        <span className="wallet-fee-cell">
                          {tx.fee > 0 ? `₱ ${formatCurrency(tx.fee)}` : '₱ 0.00'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span className={`badge ${tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'}`}>
                          <span className="badge-dot"></span>
                          <span style={{ textTransform: 'capitalize' }}>{tx.status}</span>
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {new Date(tx.createdAt).toLocaleDateString('en-PH', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                            {new Date(tx.createdAt).toLocaleTimeString('en-PH', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedTx(tx)}
                          title="View Digital Receipt"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 4 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Bar ── */}
        {filteredTransactions.length > 0 && (
          <div className="wallet-pagination-bar">
            <span className="wallet-page-info">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredTransactions.length)} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} entries
            </span>

            <div className="wallet-page-controls">
              <button
                className="wallet-page-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, arr) => {
                  const prev = arr[index - 1];
                  return (
                    <span key={page} style={{ display: 'flex', alignItems: 'center' }}>
                      {prev && page - prev > 1 && <span style={{ padding: '0 4px', color: 'var(--subtle)' }}>...</span>}
                      <button
                        className={`wallet-page-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}

              <button
                className="wallet-page-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Transaction Receipt Modal ── */}
      {selectedTx && (
        <div className="wallet-modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="wallet-receipt-card" onClick={e => e.stopPropagation()}>
            <button className="wallet-receipt-close" onClick={() => setSelectedTx(null)}>
              ✕
            </button>

            <div className="wallet-receipt-head">
              <div className="wallet-receipt-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <circle cx="16" cy="12" r="2" />
                  <line x1="6" y1="12" x2="10" y2="12" />
                </svg>
              </div>
              <div className="wallet-receipt-title">Transaction Receipt</div>
              <div className="wallet-receipt-sub">Finder Digital E-Wallet Network</div>
            </div>

            <div className="wallet-receipt-amount-box">
              <div className="wallet-receipt-amount-label">Settlement Amount</div>
              <div
                className="wallet-receipt-amount-num"
                style={{
                  color: selectedTx.type === 'cash_in' || selectedTx.type === 'fare_earning' ? '#16a34a' : '#ea580c'
                }}
              >
                {selectedTx.type === 'cash_in' || selectedTx.type === 'fare_earning' ? '+₱ ' : '-₱ '}
                {formatCurrency(selectedTx.amount)}
              </div>
              <span className={`badge ${selectedTx.status === 'completed' ? 'green' : selectedTx.status === 'pending' ? 'yellow' : 'red'}`} style={{ marginTop: 6 }}>
                <span className="badge-dot"></span>
                <span style={{ textTransform: 'capitalize' }}>{selectedTx.status}</span>
              </span>
            </div>

            <div className="wallet-receipt-grid">
              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Reference Number</span>
                <span
                  className="wallet-receipt-row-val wallet-ref-code"
                  onClick={() => handleCopyRef(selectedTx.referenceNumber)}
                >
                  {selectedTx.referenceNumber}
                </span>
              </div>

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Transaction Type</span>
                <span className="wallet-receipt-row-val" style={{ textTransform: 'capitalize' }}>
                  {selectedTx.type.replace('_', ' ')}
                </span>
              </div>

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Account Holder</span>
                <span className="wallet-receipt-row-val">
                  {selectedTx.userId ? `${selectedTx.userId.firstName} ${selectedTx.userId.lastName}` : 'System User'}
                </span>
              </div>

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Account Role</span>
                <span className="wallet-receipt-row-val" style={{ textTransform: 'capitalize' }}>
                  {selectedTx.userRole}
                </span>
              </div>

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Mobile Number</span>
                <span className="wallet-receipt-row-val">
                  {selectedTx.userId?.mobileNumber || '—'}
                </span>
              </div>

              <div className="wallet-receipt-divider" />

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Base Amount</span>
                <span className="wallet-receipt-row-val">₱ {formatCurrency(selectedTx.amount)}</span>
              </div>

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Platform Fee</span>
                <span className="wallet-receipt-row-val">
                  {selectedTx.fee > 0 ? `₱ ${formatCurrency(selectedTx.fee)}` : '₱ 0.00'}
                </span>
              </div>

              <div className="wallet-receipt-row">
                <span className="wallet-receipt-row-label">Date & Timestamp</span>
                <span className="wallet-receipt-row-val">
                  {new Date(selectedTx.createdAt).toLocaleString('en-PH', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>

              {selectedTx.description && (
                <div className="wallet-receipt-row">
                  <span className="wallet-receipt-row-label">Description</span>
                  <span className="wallet-receipt-row-val" style={{ maxWidth: 200, wordBreak: 'break-word' }}>
                    {selectedTx.description}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => handleCopyRef(selectedTx.referenceNumber)}
              >
                Copy Ref #
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setSelectedTx(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
