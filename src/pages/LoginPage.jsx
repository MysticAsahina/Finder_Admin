import { useState } from 'react'
import ResetModal from '../components/ResetModal'
import { Turnstile } from '@marsidev/react-turnstile'

// Must match backend validation rules in auth.js
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

function validateEmail(email) {
  if (!email) return "Email is required.";
  if (email.length > MAX_EMAIL_LENGTH) return `Email must be ${MAX_EMAIL_LENGTH} characters or fewer.`;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address.";
  return null;
}

function validatePassword(password) {
  if (!password) return "Password is required.";
  if (password.length > MAX_PASSWORD_LENGTH) return `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  return null;
}

export default function LoginPage({ onLogin }) {

  const [resetOpen, setResetOpen]   = useState(false)
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation first — avoids a round trip for obvious errors
    const emailError = validateEmail(email.trim());
    const passwordError = validatePassword(password.trim());

    if (emailError) return setError(emailError);
    if (passwordError) return setError(passwordError);

    if (!captchaToken) {
      return setError("Please complete the CAPTCHA.");
    }

    setLoading(true);

    const serverError = await onLogin(email.trim(), password.trim(), "admin", rememberMe, captchaToken);

    if (serverError) {
      setError(serverError);
    }

    setLoading(false);
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
          <div className="logo-text" style={{ fontSize: '2.2rem', marginBottom: 40, display: 'block', textAlign: 'center' }}>
            FOUND<span>ER</span>
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={MAX_EMAIL_LENGTH}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input with-action"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  maxLength={MAX_PASSWORD_LENGTH}
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error">{error}</p>
            )}

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember Me
              </label>
              <button type="button" className="forgot-pass" onClick={() => setResetOpen(true)}>
                Forgot password?
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Turnstile 
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setError('CAPTCHA failed to load. Please refresh.')}
                options={{
                  theme: 'light',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading || !captchaToken}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <ResetModal isOpen={resetOpen} onClose={() => setResetOpen(false)} />
    </>
  )
}