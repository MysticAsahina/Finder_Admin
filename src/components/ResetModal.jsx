export default function ResetModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box reset-modal" style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} style={{ position:'absolute', top:16, right:16 }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </button>

        <div className="reset-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"/>
          </svg>
        </div>

        <h2 className="reset-title">Reset password</h2>
        <p className="reset-desc">No worries! Enter your email address and we'll send you a link to reset your password.</p>

        <div className="login-field" style={{ marginBottom:24 }}>
          <div className="login-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input type="email" className="login-input" placeholder="you@example.com"/>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width:'100%', padding:14, fontWeight:700 }} onClick={onClose}>
          Send Reset Link
        </button>
      </div>
    </div>
  )
}
