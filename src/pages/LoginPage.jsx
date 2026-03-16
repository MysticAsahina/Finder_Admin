import { useState } from 'react'
import ResetModal from '../components/ResetModal'

export default function LoginPage({ onLogin }) {
  const defaultEmail = "admin@finder-toda.ph";
  const defaultPassword = "chromakey";

  const [resetOpen, setResetOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);

  const handleSubmit = (e) => {
    e.preventDefault()
    const role = "admin";
    onLogin(email, password, role)
  }

  return (
    <>
      <div className="login-screen">
        <div className="login-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="login-card">
          <div className="logo-text" style={{ fontSize:'2.2rem', marginBottom:40, display:'block', textAlign:'center' }}>
            FIND<span>ER</span>
          </div>

          <div className="login-welcome">
            <h1>Welcome back</h1>
            <p>Sign in to continue your journey</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" className="login-input" onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" defaultValue={defaultEmail} required/>
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input type="password" className="login-input" onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" defaultValue={defaultPassword} required/>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" defaultChecked/>
                Remember Me
              </label>
              <button type="button" className="forgot-pass" onClick={() => setResetOpen(true)}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-login">Sign In</button>
          </form>
        </div>
      </div>

      <ResetModal isOpen={resetOpen} onClose={() => setResetOpen(false)} />
    </>
  )
}
