import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const OTP_LENGTH = 6;

export default function OtpPage({ pendingToken, onVerify, onBack }) {
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        if (digit && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${pendingToken}`,
                },
                credentials: "include",
                body: JSON.stringify({ code: otp.join('') }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Verification failed.');
                setOtp(Array(OTP_LENGTH).fill(''));
                inputs.current[0]?.focus();
                return;
            }

            // Pass the real token up to App
            onVerify(data.accessToken, data.refreshToken, data.user);

        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setOtp(Array(OTP_LENGTH).fill(''));
        setError(null);
        inputs.current[0]?.focus();

        try {
            const res = await fetch(`${API_URL}/auth/resend-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${pendingToken}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Failed to resend OTP.');
            }
        } catch (err) {
            setError('Failed to resend OTP.');
            console.error(err);
        }
    };

    const isFilled = otp.every(d => d !== '');

    return (
        <div className="login-screen">
            <div className="login-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="otp-card">
                <button type="button" onClick={onBack} className="otp-back">
                    <svg viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 9H2" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 2L2 9l7 7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className="otp-content">
                    <h2 className="otp-title">OTP Verification</h2>
                    <p className="otp-subtitle">Please enter the code</p>
                    <p className="otp-hint">We sent a code to your registered mobile number</p>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div className="otp-row">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={ref => inputs.current[i] = ref}
                                    className={`otp-box ${digit ? 'filled' : ''}`}
                                    value={digit}
                                    onChange={e => handleChange(e.target.value, i)}
                                    onKeyDown={e => handleKeyDown(e, i)}
                                    maxLength={1}
                                    type="text"
                                    inputMode="numeric"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="otp-error">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="otp-submit-btn"
                            disabled={!isFilled || loading}
                        >
                            {loading ? 'VERIFYING...' : 'SUBMIT'}
                        </button>

                        <div className="otp-resend-row">
                            <span>Didn't get OTP?</span>
                            <button type="button" onClick={handleResend} className="otp-resend-link" disabled={loading}>
                                Resend OTP
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}