import { useState } from 'react'
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
  const [authStep, setAuthStep] = useState('login') // 'login', 'otp', 'authenticated'
  const [activePage, setActivePage] = useState('dashboard')
  const [pendingToken, setPendingToken] = useState(null)

  // Returns an error message string on failure, null on success
  const handleLogin = async (email, password, role) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
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

  const handleOtpVerify = (token) => {
    localStorage.setItem('token', token);
    setPendingToken(null);
    setAuthStep('authenticated');
  };

  // To bypass OTP in testing — swap onVerify={handleOtpVerify} to this
  const handleOtpBypass = () => {
    setAuthStep('authenticated');
  }

  const handleOtpBack = () => {
    setPendingToken(null);
    setAuthStep('login');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      setAuthStep('login');
    }
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