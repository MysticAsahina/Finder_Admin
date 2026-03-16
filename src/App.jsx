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

  const handleLogin = async (email, password, role) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message)
        return;
      }

      // For OTP bypass, remove/comment out otherwise
      const token = data.token;

      // Store the pending token so OtpPage can use it
      // setPendingToken(data.pendingToken);
      localStorage.setItem('token', token);
      setAuthStep('otp');

    } catch (err) {
      console.error(err);
    }
  }

  const handleOtpVerify = (token) => {
    // Swap the pending token for the real access token
    localStorage.setItem('token', token);
    setPendingToken(null);
    setAuthStep('authenticated');
  };

  // To bypass OTP in testing
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

  const ActivePage = PAGE_MAP[activePage]

  if (authStep === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  if (authStep === 'otp') {
    return <OtpPage
      pendingToken={pendingToken}
      onVerify={handleOtpBypass} // To bypass OTP, change to handleOtpVerify otherwise
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