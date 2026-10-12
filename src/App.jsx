import { useState, useEffect, useContext, useCallback } from 'react'
import { io } from 'socket.io-client'
import Swal from 'sweetalert2'
import { AuthContext } from './context/AuthContext'
import useIdleTimer from './hooks/useIdleTimer'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import LoginPage from './pages/LoginPage'
import OtpPage from './pages/OtpPage'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Drivers from './pages/Drivers'
import Applications from './pages/Applications'
import DiscountApplications from './pages/DiscountApplications'
import PassengerMessages from './pages/Messages'
import DriverMessages from './pages/DriverMessages'
import UserAppeals from './pages/UserAppeals'
import Reports from './pages/Reports'
import FareManagement from './pages/FareManagement'
import AuditLog from './pages/AuditLog'
import WalletTransactions from './pages/WalletTransactions'
import Settings from './pages/Settings'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const PAGE_MAP = {
  dashboard: Dashboard,
  analytics: Analytics,
  drivers: Drivers,
  applications: Applications,
  discountApplications: DiscountApplications,
  passengerMessages: PassengerMessages,
  driverMessages: DriverMessages,
  userAppeals: UserAppeals,
  reports: Reports,
  fare: FareManagement,
  wallet: WalletTransactions,
  audit: AuditLog,
  settings: Settings,
}

export default function App() {
  const { loading, accessToken, setAccessToken, setUser } = useContext(AuthContext)
  const [authStep, setAuthStep] = useState('login') // 'login', 'otp'
  const [activePage, setActivePage] = useState('dashboard')
  const [pendingToken, setPendingToken] = useState(null)
  
  // --- Badge State ---
  const [badges, setBadges] = useState({
    pendingApplications: 0,
    pendingDiscountApplications: 0,
    unreadPassengerTickets: 0,
    unreadDriverTickets: 0,
    pendingAppeals: 0
  });

  const fetchBadges = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_URL}/admin/badges`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setBadges({
          pendingApplications: data.pendingApplications,
          pendingDiscountApplications: data.pendingDiscountApplications,
          unreadPassengerTickets: data.unreadPassengerTickets,
          unreadDriverTickets: data.unreadDriverTickets,
          pendingAppeals: data.pendingAppeals !== undefined ? data.pendingAppeals : 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch badges', err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // --- Session Timeout (idle timer) ---
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('setting_sessionTimeout') === 'true'
      : false;
  });

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSessionTimeoutEnabled(localStorage.getItem('setting_sessionTimeout') === 'true');
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  const silentLogout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed', err);
    }
    setAccessToken(null);
    setUser(null);
    setAuthStep('login');
  }, [setAccessToken, setUser]);

  // Set to auto-logout after 30 minutes (30 * 60 * 1000)
  useIdleTimer(silentLogout, 30 * 60 * 1000, sessionTimeoutEnabled && !!accessToken);

  // --- Socket.io notifications ---
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(API_URL, { auth: { token: accessToken } });

    socket.on('new_driver_application', (data) => {
      fetchBadges();
      const enabled = localStorage.getItem('setting_notifDriverApps') !== 'false';
      if (!enabled) return;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `New driver application from ${data?.name || 'a driver'}`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: 'var(--white)',
        color: 'var(--text)',
      });
    });

    socket.on('new_ticket', (ticket) => {
      fetchBadges();
      const enabled = localStorage.getItem('setting_notifPassengerMsgs') !== 'false';
      if (!enabled) return;
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `New support ticket: ${ticket?.subject || 'Inquiry'}`,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: 'var(--white)',
        color: 'var(--text)',
      });
    });

    socket.on('ticket_updated', (data) => {
      fetchBadges();
    });

    socket.on('application_resolved', () => {
      fetchBadges();
    });

    socket.on('new_appeal', (data) => {
      fetchBadges();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: `New suspension appeal: ${data?.ticketNumber || 'Case'}`,
        text: `From ${data?.userName || 'a user'} (${data?.userRole || ''})`,
        showConfirmButton: false,
        timer: 4500,
        timerProgressBar: true,
        background: 'var(--white)',
        color: 'var(--text)',
      });
    });

    socket.on('appeal_updated', () => {
      fetchBadges();
    });

    socket.on('appeal_resolved', () => {
      fetchBadges();
    });

    return () => socket.disconnect();
  }, [accessToken, fetchBadges]);

  // --- Badge Navigation Listeners ---
  useEffect(() => {
    const handleTicketRead = () => {
      fetchBadges();
    };
    window.addEventListener('ticket_read', handleTicketRead);
    return () => window.removeEventListener('ticket_read', handleTicketRead);
  }, [fetchBadges]);

  // Returns an error message string on failure, null on success
  const handleLogin = async (email, password, role, rememberMe, captchaToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, rememberMe, captchaToken }),
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

  const handleOtpBack = () => {
    setPendingToken(null);
    setAuthStep('login');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
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
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onLogout={handleLogout} 
          unreadApps={badges.pendingApplications}
          unreadDiscountApps={badges.pendingDiscountApplications}
          unreadPassengerTickets={badges.unreadPassengerTickets}
          unreadDriverTickets={badges.unreadDriverTickets}
          unreadAppeals={badges.pendingAppeals || 0}
        />
        <div className="main">
          <Topbar activePage={activePage} />
          <div className={`content${activePage === 'userAppeals' ? ' appeals-view no-scroll' : ''}`}>
            {Object.entries(PAGE_MAP).map(([key, PageComponent]) => {
              // Only render userAppeals DOM when on the Users Appeal tab
              if (key === 'userAppeals' && activePage !== 'userAppeals') return null;
              return (
                <div key={key} className={`page${activePage === key ? ' active' : ''}${key === 'userAppeals' ? ' appeals-page-container' : ''}`}>
                  <PageComponent isActive={activePage === key} />
                </div>
              );
            })}
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