import { useState, useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import LoginPage from './pages/LoginPage'
import OtpPage from './pages/OtpPage'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Drivers from './pages/Drivers'
import Applications from './pages/Applications'
import Messages from './pages/Messages'
import Reports from './pages/Reports'
import FareManagement from './pages/FareManagement'
import AuditLog from './pages/AuditLog'
import Settings from './pages/Settings'

const PAGE_MAP = {
  dashboard: Dashboard,
  analytics: Analytics,
  drivers: Drivers,
  applications: Applications,
  messages: Messages,
  reports: Reports,
  fare: FareManagement,
  audit: AuditLog,
  settings: Settings,
}

export default function App() {
  const { loading, accessToken, setAccessToken, setUser } = useContext(AuthContext)
  const [authStep, setAuthStep] = useState('login') // 'login', 'otp'
  const [activePage, setActivePage] = useState('dashboard')
  const [pendingToken, setPendingToken] = useState(null)

  // Returns an error message string on failure, null on success
  const handleLogin = async (email, password, role, rememberMe) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.message || "Something went wrong. Please try again.";
      }

      setPendingToken(data.pendingToken);
      setAuthStep('otp');
      return null;

    } catch (err) {
      console.error(err);
      return "Unable to reach the server. Please check your connection.";
    }
  }

  const handleOtpVerify = (newAccessToken, refreshToken, userDetails) => {
    setAccessToken(newAccessToken);
    setUser(userDetails);
    setPendingToken(null);
    setAuthStep('login');
  };

  // To bypass OTP in testing — swap onVerify={handleOtpVerify} to this
  const handleOtpBypass = () => {
    setAuthStep('authenticated');
  }

  const handleOtpBack = () => {
    setPendingToken(null);
    setAuthStep('login');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await fetch("http://localhost:3000/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout failed", err);
      }
      setAccessToken(null);
      setUser(null);
      setAuthStep('login');
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  }

  if (accessToken) {
    return (
      <div className="app">
        <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
        <div className="main">
          <Topbar activePage={activePage} />
          <div className="content">
            {Object.entries(PAGE_MAP).map(([key, PageComponent]) => (
              <div key={key} className={`page${activePage === key ? ' active' : ''}`}>
                <PageComponent />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (authStep === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  if (authStep === 'otp') {
    return <OtpPage
      pendingToken={pendingToken}
      onVerify={handleOtpVerify}
      onBack={handleOtpBack}
    />
  }

  return null;
}