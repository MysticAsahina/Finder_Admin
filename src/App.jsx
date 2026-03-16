import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import LoginPage from './pages/LoginPage'
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const handleLogin = async (email, password, role) => {
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data)
        // Uncomment the code below to ignore login for now, comment to NOT ignore
        setIsLoggedIn(true);
        return;
      }

      setIsLoggedIn(true);

    } catch (err) {
      console.error(err);
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setIsLoggedIn(false)
    }
  }

  const ActivePage = PAGE_MAP[activePage] || Dashboard

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
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
