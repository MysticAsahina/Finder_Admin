import { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function FareManagement() {
  const { accessToken } = useContext(AuthContext)

  const [baseFare, setBaseFare] = useState('')
  const [perKmFare, setPerKmFare] = useState('')
  const [ordinanceUrl, setOrdinanceUrl] = useState(null)
  const [ordinancePublicId, setOrdinancePublicId] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Original values for discard
  const [origBaseFare, setOrigBaseFare] = useState('')
  const [origPerKmFare, setOrigPerKmFare] = useState('')
  const [origOrdinanceUrl, setOrigOrdinanceUrl] = useState(null)

  const fileInputRef = useRef(null)

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/admin/settings/fare`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.baseFare != null) {
          setBaseFare(data.baseFare.toString())
          setPerKmFare(data.perKmFare.toString())
          setOrdinanceUrl(data.ordinanceUrl)
          setOrigBaseFare(data.baseFare.toString())
          setOrigPerKmFare(data.perKmFare.toString())
          setOrigOrdinanceUrl(data.ordinanceUrl)
          if (data.updatedAt) setLastUpdated(new Date(data.updatedAt))
        } else {
          setError(data.message || 'Failed to load fare settings.')
        }
      })
      .catch(() => setError('Unable to reach the server.'))
      .finally(() => setLoading(false))
  }, [accessToken])

  const hasChanges = baseFare !== origBaseFare || perKmFare !== origPerKmFare || ordinanceUrl !== origOrdinanceUrl

  const handleSave = async () => {
    if (!baseFare || !perKmFare) {
      setError('Both Base Fare and Per Km Fare are required.')
      return
    }

    const bf = Number(baseFare)
    const pk = Number(perKmFare)

    if (isNaN(bf) || isNaN(pk)) {
      setError('Fares must be valid numbers.')
      return
    }
    if (bf < 0 || pk < 0) {
      setError('Fares cannot be negative.')
      return
    }
    if (bf > 10000 || pk > 10000) {
      setError('Fares exceed maximum allowed value (10,000).')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`${API_URL}/admin/settings/fare`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ baseFare: bf, perKmFare: pk, ordinanceUrl, ordinancePublicId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to save fare settings.')
        return
      }

      setBaseFare(data.baseFare.toString())
      setPerKmFare(data.perKmFare.toString())
      setOrdinanceUrl(data.ordinanceUrl)
      setOrigBaseFare(data.baseFare.toString())
      setOrigPerKmFare(data.perKmFare.toString())
      setOrigOrdinanceUrl(data.ordinanceUrl)
      if (data.updatedAt) setLastUpdated(new Date(data.updatedAt))
      setSuccess('Fare settings updated successfully.')

      setTimeout(() => setSuccess(null), 4000)
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setBaseFare(origBaseFare)
    setPerKmFare(origPerKmFare)
    setOrdinanceUrl(origOrdinanceUrl)
    setOrdinancePublicId(null)
    setError(null)
    setSuccess(null)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Only PDF documents are allowed.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Get Signature
      const sigRes = await fetch(`${API_URL}/admin/settings/cloudinary-signature`, {
        method: 'POST',
        headers: authHeaders()
      })
      const sigData = await sigRes.json()

      if (!sigRes.ok) throw new Error(sigData.message || 'Failed to get upload signature.')

      // 2. Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sigData.apiKey)
      formData.append('timestamp', sigData.timestamp)
      formData.append('signature', sigData.signature)
      formData.append('folder', sigData.folder)
      if (sigData.tags) formData.append('tags', sigData.tags)

      // Use "auto" resource type to support both images and PDFs
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Failed to upload document.')

      setOrdinanceUrl(uploadData.secure_url)
      setOrdinancePublicId(uploadData.public_id)
      setSuccess('Document uploaded successfully. Don\'t forget to save changes.')

      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error uploading document.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  // Live fare preview calculation
  const previewDistance = 4 // km
  const bf = parseFloat(baseFare) || 0
  const pk = parseFloat(perKmFare) || 0
  const baseDistance = 3
  const previewFare = (bf + Math.max(0, previewDistance - baseDistance) * pk).toFixed(2)

  if (loading) {
    return (
      <div style={{ padding: 32, color: 'var(--muted)' }}>Loading fare settings...</div>
    )
  }

  return (
    <div>
      {error && (
        <div className="fare-alert fare-alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
          <button className="fare-alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}
      {success && (
        <div className="fare-alert fare-alert-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}

      <div className="fare-grid">
        <div className="fare-card">
          <div className="fare-card-title">Base Fare</div>
          <div className="fare-card-sub">Minimum charge for any ride regardless of distance</div>
          <div className="fare-input-wrap">
            <span className="fare-prefix">₱</span>
            <input
              className="fare-input"
              type="number"
              value={baseFare}
              onChange={e => setBaseFare(e.target.value)}
              step="0.50"
              min="0"
            />
          </div>
          <div className="fare-note">Current: ₱{origBaseFare} — Last updated {formatDate(lastUpdated)}</div>
        </div>
        <div className="fare-card">
          <div className="fare-card-title">Additional Fare per Kilometer</div>
          <div className="fare-card-sub">Extra charge added per km beyond base distance ({baseDistance} km)</div>
          <div className="fare-input-wrap">
            <span className="fare-prefix">₱</span>
            <input
              className="fare-input"
              type="number"
              value={perKmFare}
              onChange={e => setPerKmFare(e.target.value)}
              step="0.50"
              min="0"
            />
          </div>
          <div className="fare-note">Current: ₱{origPerKmFare}/km — Last updated {formatDate(lastUpdated)}</div>
        </div>
      </div>

      {/* Fare preview */}
      <div className="fare-preview">
        <div className="fare-preview-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Fare Preview
        </div>
        <div className="fare-preview-text">
          A <strong>{previewDistance} km</strong> trip would cost <strong>₱{previewFare}</strong>
          <span className="fare-preview-breakdown">
            {' '}(₱{bf.toFixed(2)} base + {Math.max(0, previewDistance - baseDistance)} km × ₱{pk.toFixed(2)})
          </span>
        </div>
      </div>

      <div className="ordinance-card">
        <div style={{ fontWeight:700, fontSize:'.92rem', marginBottom:4 }}>City Ordinance Reference</div>
        <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:14 }}>Fare rates must comply with local transportation regulations</div>
        <div className="ordinance-img">
          {ordinanceUrl ? (
            <div style={{ textAlign:'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="var(--brand)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M9 15l2 2 4-4"/>
              </svg>
              <div style={{ fontSize:'.85rem', color:'var(--text)', marginTop:8, fontWeight: 500 }}>Document Uploaded</div>
              <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>Ready to view</div>
            </div>
          ) : (
            <div style={{ textAlign:'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="36" height="36" stroke="var(--subtle)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <div style={{ fontSize:'.78rem', color:'var(--subtle)', marginTop:8 }}>No Document Uploaded</div>
              <div style={{ fontSize:'.72rem', color:'var(--border)', marginTop:2 }}>Upload PDF or Image</div>
            </div>
          )}
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="application/pdf" 
          onChange={handleFileChange}
        />

        <div style={{ display:'flex', gap:10 }}>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ display:'flex', alignItems:'center', gap:6, opacity: ordinanceUrl ? 1 : 0.5, pointerEvents: ordinanceUrl ? 'auto' : 'none' }}
            onClick={() => ordinanceUrl && window.open(ordinanceUrl, '_blank')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            View Document
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : (ordinanceUrl ? 'Upload New' : 'Upload Document')}
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
        <button
          className="btn btn-outline"
          onClick={handleDiscard}
          disabled={!hasChanges || saving || uploading}
        >
          Discard Changes
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!hasChanges || saving || uploading}
        >
          {saving ? 'Saving...' : 'Save Fare Settings'}
        </button>
      </div>
    </div>
  )
}
