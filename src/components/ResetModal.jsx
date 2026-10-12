import { useState, useRef, useEffect } from 'react'
import Swal from 'sweetalert2'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const OTP_LENGTH = 6

export default function ResetModal({ isOpen, onClose }) {
  // Step: 'email' | 'otp' | 'reset' | 'success'
  const [step, setStep] = useState('email')

  // Form states
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Token states
  const [pendingToken, setPendingToken] = useState(null)
  const [resetToken, setResetToken] = useState(null)

  const otpInputs = useRef([])

  // Reset form when modal closes
  const handleClose = () => {
    setStep('email')
    setEmail('')
    setOtp(Array(OTP_LENGTH).fill(''))
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setError('')
    setLoading(false)
    setPendingToken(null)
    setResetToken(null)
    setResendCooldown(0)
    onClose()
  }

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  if (!isOpen) return null

  // Password validation policy rules (matches backend validatePasswordPolicy exactly)
  const policyChecks = {
    length: password.length >= 8 && password.length <= 128,
    lowercase: /(?=.*[a-z])/.test(password),
    uppercase: /(?=.*[A-Z])/.test(password),
    number: /(?=.*\d)/.test(password),
    special: /(?=.*[^A-Za-z0-9])/.test(password),
    match: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
  }

  const isPasswordValid =
    policyChecks.length &&
    policyChecks.lowercase &&
    policyChecks.uppercase &&
    policyChecks.number &&
    policyChecks.special

  // STEP 1: Submit Email
  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to process request.')
      }

      setPendingToken(data.token)
      setStep('otp')
      setResendCooldown(60)
      setTimeout(() => otpInputs.current[0]?.focus(), 150)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // STEP 2: Handle OTP Input
  const handleOtpChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)
    setError('')
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    otpInputs.current[nextIndex]?.focus()
  }

  // STEP 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault()
    const code = otp.join('')
    if (code.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits of the OTP code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to verify OTP.')
      }

      setResetToken(data.token)
      setStep('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return
    setLoading(true)
    setError('')
    setOtp(Array(OTP_LENGTH).fill(''))

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP.')
      }

      setPendingToken(data.token)
      setResendCooldown(60)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'New OTP sent to your email!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'var(--white)',
        color: 'var(--text)',
      })
      otpInputs.current[0]?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // STEP 3: Submit Reset Password
  const handleResetSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resetToken}`,
        },
        body: JSON.stringify({ password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.')
      }

      setStep('success')
      setTimeout(() => {
        handleClose()
      }, 3500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={handleClose}>
      <div
        className="modal-box reset-modal"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          padding: '32px 28px',
          textAlign: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={handleClose}
          style={{ position: 'absolute', top: 16, right: 16 }}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="#000"
            />
          </svg>
        </button>

        {/* ================= STEP 1: EMAIL ================= */}
        {step === 'email' && (
          <div>
            <div className="reset-icon-wrap" style={{ margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"/>
              </svg>
            </div>

            <h2 className="reset-title" style={{ textAlign: 'center' }}>Reset Password</h2>
            <p className="reset-desc" style={{ textAlign: 'center', marginBottom: 24 }}>
              Enter your admin email address. If associated with an admin account, we'll send a 6-digit OTP to your inbox.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <div className="login-field" style={{ marginBottom: 16 }}>
                <label className="login-label">Admin Email</label>
                <div className="login-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    className="login-input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{error}</p>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: 14, fontWeight: 700, borderRadius: 12 }}
                disabled={loading || !email.trim()}
              >
                {loading ? 'Checking Account & Sending OTP...' : 'Send Verification OTP'}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 2: OTP ================= */}
        {step === 'otp' && (
          <div>
            <div className="reset-icon-wrap" style={{ margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <h2 className="reset-title" style={{ textAlign: 'center' }}>Enter Verification Code</h2>
            <p className="reset-desc" style={{ textAlign: 'center', marginBottom: 16 }}>
              We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Wrong email? Change address
              </button>
            </div>

            <form onSubmit={handleOtpSubmit}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(ref) => (otpInputs.current[i] = ref)}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    style={{
                      width: '46px',
                      height: '50px',
                      fontSize: '20px',
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRadius: '12px',
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    onPaste={handleOtpPaste}
                    maxLength={1}
                    type="text"
                    inputMode="numeric"
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <p style={{ color: 'var(--red)', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: 14, fontWeight: 700, borderRadius: 12, marginBottom: 16 }}
                disabled={loading || otp.some((d) => !d)}
              >
                {loading ? 'Verifying Code...' : 'Verify Code'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                <span>Didn't receive the email? </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? 'var(--subtle)' : 'var(--brand)',
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 3: RESET PASSWORD ================= */}
        {step === 'reset' && (
          <div>
            <div className="reset-icon-wrap" style={{ margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <h2 className="reset-title" style={{ textAlign: 'center' }}>Set New Password</h2>
            <p className="reset-desc" style={{ textAlign: 'center', marginBottom: 20 }}>
              Create a new strong password for your admin account.
            </p>

            <form onSubmit={handleResetSubmit}>
              {/* New Password */}
              <div className="login-field" style={{ marginBottom: 16 }}>
                <label className="login-label">New Password</label>
                <div className="login-input-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: 'absolute', left: 14 }}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter new password"
                    maxLength={128}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="login-field" style={{ marginBottom: 16 }}>
                <label className="login-label">Confirm New Password</label>
                <div className="login-input-wrap">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: 'absolute', left: 14 }}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="login-input"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="Confirm new password"
                    maxLength={128}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div
                style={{
                  background: 'var(--bg)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: 16,
                  border: '1px solid var(--border-l)',
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  Password Requirements:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ color: policyChecks.length ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{policyChecks.length ? '✓' : '•'}</span> 8–128 characters
                  </div>
                  <div style={{ color: policyChecks.uppercase ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{policyChecks.uppercase ? '✓' : '•'}</span> One uppercase (A–Z)
                  </div>
                  <div style={{ color: policyChecks.lowercase ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{policyChecks.lowercase ? '✓' : '•'}</span> One lowercase (a–z)
                  </div>
                  <div style={{ color: policyChecks.number ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{policyChecks.number ? '✓' : '•'}</span> One number (0–9)
                  </div>
                  <div style={{ color: policyChecks.special ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{policyChecks.special ? '✓' : '•'}</span> One special character
                  </div>
                  <div style={{ color: policyChecks.match ? 'var(--green)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{policyChecks.match ? '✓' : '•'}</span> Passwords match
                  </div>
                </div>
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: 14, fontWeight: 700, borderRadius: 12 }}
                disabled={loading || !isPasswordValid || !policyChecks.match}
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 4: SUCCESS ================= */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--green-l)',
                color: 'var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="reset-title" style={{ color: 'var(--text)', marginBottom: 8 }}>
              Password Reset!
            </h2>
            <p className="reset-desc" style={{ marginBottom: 24 }}>
              Your password has been successfully updated. You can now log in using your new credentials.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: 14, fontWeight: 700, borderRadius: 12 }}
              onClick={handleClose}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
