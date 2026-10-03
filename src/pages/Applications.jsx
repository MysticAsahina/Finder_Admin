import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'



function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function DocumentImage({ label, url }) {
  if (!url) return (
    <div className="doc-img-placeholder">
      <span className="doc-img-label">{label}</span>
      <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>No image</span>
    </div>
  )
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="doc-img-wrap">
      <img src={url} alt={label} className="doc-img" />
      <span className="doc-img-label">{label}</span>
    </a>
  )
}

function AppCard({ app, onApprove, onReject }) {
  const [expanded, setExpanded]   = useState(false)
  const [loading,  setLoading]    = useState(null) // 'approve' | 'reject' | null
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const handleApprove = async () => {
    if (!window.confirm(`Approve ${app.firstName} ${app.lastName}'s application?`)) return
    setLoading('approve')
    await onApprove(app._id)
    setLoading(null)
  }

  const handleRejectConfirm = async () => {
    if (!window.confirm(`Reject ${app.firstName} ${app.lastName}'s application? This cannot be undone.`)) return
    setLoading('reject')
    await onReject(app._id, rejectReason)
    setLoading(null)
  }

  const appliedDate = formatDate(app.createdAt)
  const mobile      = app.mobileNumber

  return (
    <div className="app-card">
      {/* Header */}
      <div className="app-card-head">
        <div className="app-big-avatar">
          {app.firstName[0]}{app.lastName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="app-name">{app.firstName} {app.lastName}</div>
          <div className="app-meta">Applied: {appliedDate}&nbsp;•&nbsp;{mobile}</div>
        </div>
        <span className="badge yellow">
          <span className="badge-dot"></span>Pending
        </span>
      </div>

      {/* Key fields */}
      <div className="app-card-body">
        {[
          ['License No.',    app.licenseNumber],
          ['Expiry Date',    formatDate(app.licenseExpDate)],
          ['Vehicle Brand',  app.motorcycleBrand],
          ['Plate Number',   app.plateNumber],
        ].map(([lbl, val]) => (
          <div key={lbl} className="app-field">
            <div className="app-field-lbl">{lbl}</div>
            <div className="app-field-val">{val || '—'}</div>
          </div>
        ))}
      </div>

      {/* Default images: license front + tricycle front */}
      <div className='doc-preview-row'>
        <DocumentImage label="License (Front)"   url={app.licenseImgFront} />
        <DocumentImage label="Tricycle (Front)"  url={app.tricycleImgFront} />
      </div>

      {/* Expandable: all documents */}
      <button
        className="btn btn-ghost"
        style={{ width: '100%', marginBottom: 10, fontSize: '.82rem' }}
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? '▲ Hide documents' : '▼ View all documents'}
      </button>

      {expanded && (
        <div className="doc-grid">
          <DocumentImage label="License (Front)"   url={app.licenseImgFront} />
          <DocumentImage label="License (Back)"    url={app.licenseImgBack} />
          <DocumentImage label="Face selfie"       url={app.faceImg} />
          <DocumentImage label="Holding license"   url={app.idImg} />
          <DocumentImage label="Official receipt"  url={app.tricycleOR} />
          <DocumentImage label="Reg. certificate"  url={app.regCert} />
          <DocumentImage label="Tricycle (Front)"  url={app.tricycleImgFront} />
          <DocumentImage label="Tricycle (Back)"   url={app.tricycleImgBack} />
        </div>
      )}

      {/* Rejection reason input */}
      {showRejectInput && (
        <div style={{ marginBottom: 10 }}>
          <input
            className="login-input"
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => setShowRejectInput(false)}
              disabled={!!loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: '#e53935', borderColor: '#e53935' }}
              onClick={handleRejectConfirm}
              disabled={!!loading}
            >
              {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showRejectInput && (
        <div className="app-actions">
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={!!loading}
          >
            {loading === 'approve' ? 'Approving…' : '✓ Approve Application'}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShowRejectInput(true)}
            disabled={!!loading}
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default function Applications({ isActive }) {
  const { accessToken } = useContext(AuthContext)

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
  }
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [query,   setQuery]   = useState('')  // debounced search term

  // Fetch applications
  useEffect(() => {
    if (!isActive) return

    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ status: 'pending' })
    if (query) params.set('search', query)

    fetch(`${API_URL}/admin/applications?${params}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.applications) {
          setApps(data.applications)
        } else {
          setError(data.message || 'Failed to load applications.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Unable to reach the server.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [query, isActive])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleApprove = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/admin/applications/${id}/approve`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setApps(prev => prev.filter(a => a._id !== id))
      } else {
        alert(data.message || 'Approval failed.')
      }
    } catch (err) {
      alert('Network error or server unavailable.')
    }
  }

  const handleReject = async (id, reason) => {
    try {
      const res  = await fetch(`${API_URL}/admin/applications/${id}/reject`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (res.ok) {
        setApps(prev => prev.filter(a => a._id !== id))
      } else {
        alert(data.message || 'Rejection failed.')
      }
    } catch (err) {
      alert('Network error or server unavailable.')
    }
  }

  const pendingCount = apps.length

  return (
    <div>
      <div className="toolbar" style={{ marginBottom: 18 }}>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search applicants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="badge yellow" style={{ padding: '7px 14px', fontSize: '.78rem' }}>
          {pendingCount} Pending Review
        </span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          Loading applications…
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#e53935' }}>
          {error}
        </div>
      )}

      {!loading && !error && apps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          No pending applications.
        </div>
      )}

      {!loading && !error && apps.map(app => (
        <AppCard
          key={app._id}
          app={app}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  )
}