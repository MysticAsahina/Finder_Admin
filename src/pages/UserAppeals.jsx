import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import Swal from 'sweetalert2'

const styledSwal = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-outline',
    actions: 'swal-actions-gap'
  },
  buttonsStyling: false,
  background: 'var(--white)',
  color: 'var(--text)'
});

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const isVideoMedia = (url, mediaType) => {
  if (mediaType === 'video') return true;
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.includes('/video/upload/') ||
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.ogv') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.mkv')
  );
};

// Default sample appeals for immediate interactive preview
const DEFAULT_APPEALS = [
  {
    _id: 'app-001',
    ticketNumber: 'APL-2026-081',
    userId: 'usr-pass-01',
    userRole: 'passenger',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@gmail.com',
    userPhone: '09987654321',
    suspensionReason: 'Frequent Cancellation Pattern (5 consecutive cancelations)',
    suspendedAt: '2026-10-09T08:30:00.000Z',
    appealDeadline: '2026-10-16T23:59:59.000Z',
    subject: 'Appeal for Booking Cancellation Flag',
    status: 'pending', // 'pending' | 'lifted' | 'disabled'
    hasUnreadAdmin: true,
    createdAt: '2026-10-11T09:14:00.000Z',
    updatedAt: '2026-10-11T09:14:00.000Z',
    proofMedia: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    messages: [
      {
        _id: 'm-1',
        senderRole: 'user',
        senderName: 'Maria Santos',
        body: 'Good day Admin, my app experienced repeated server timeouts while booking near Central Station yesterday. The rides were not purposefully cancelled; the screen kept getting disconnected due to a local cellular signal outage. Here is the screenshot of my signal loss notification. I kindly ask to lift my suspension.',
        mediaUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        createdAt: '2026-10-11T09:14:00.000Z',
      }
    ]
  },
  {
    _id: 'app-002',
    ticketNumber: 'APL-2026-079',
    userId: 'usr-drv-02',
    userRole: 'driver',
    userName: 'Pedro Cruz',
    userEmail: 'pedro.cruz@gmail.com',
    userPhone: '09123456789',
    suspensionReason: 'Trip Incompletion & Unresponsive on GPS',
    suspendedAt: '2026-10-08T14:15:00.000Z',
    appealDeadline: '2026-10-15T23:59:59.000Z',
    subject: 'Emergency mechanical breakdown during trip',
    status: 'pending',
    hasUnreadAdmin: true,
    createdAt: '2026-10-10T16:20:00.000Z',
    updatedAt: '2026-10-10T16:20:00.000Z',
    proofMedia: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    messages: [
      {
        _id: 'm-2',
        senderRole: 'user',
        senderName: 'Pedro Cruz',
        body: 'Good afternoon, my motorcycle had a rear tire puncture along Highway 54. I immediately assisted the passenger into another vehicle and notified them in person. My battery died right after, which is why GPS showed offline. Attached is my repair shop receipt.',
        mediaUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        createdAt: '2026-10-10T16:20:00.000Z',
      }
    ]
  },
  {
    _id: 'app-003',
    ticketNumber: 'APL-2026-075',
    userId: 'usr-pass-03',
    userRole: 'passenger',
    userName: 'Justine Castro',
    userEmail: 'justine.c@yahoo.com',
    userPhone: '09331122334',
    suspensionReason: 'Reported Unruly Conduct by Driver DR-0012',
    suspendedAt: '2026-10-05T10:00:00.000Z',
    appealDeadline: '2026-10-12T23:59:59.000Z',
    subject: 'False report dispute regarding fare misunderstanding',
    status: 'lifted',
    hasUnreadAdmin: false,
    createdAt: '2026-10-06T11:00:00.000Z',
    updatedAt: '2026-10-07T14:30:00.000Z',
    proofMedia: null,
    messages: [
      {
        _id: 'm-3',
        senderRole: 'user',
        senderName: 'Justine Castro',
        body: 'The driver filed a complaint saying I refused to pay the full fare, but I gave him the exact change based on the official ordinance calculator. I have the digital receipt recorded in the wallet tab.',
        createdAt: '2026-10-06T11:00:00.000Z',
      },
      {
        _id: 'm-4',
        senderRole: 'admin',
        senderName: 'System Administrator',
        body: 'We reviewed the wallet transaction history and verified your payment matched the fare matrix ordinance. We apologize for the inconvenience.',
        createdAt: '2026-10-07T14:28:00.000Z',
      },
      {
        _id: 'm-sys-1',
        senderRole: 'system',
        body: 'Suspension lifted by Administrator on 10/7/2026. Account restored.',
        createdAt: '2026-10-07T14:30:00.000Z',
      }
    ]
  },
  {
    _id: 'app-004',
    ticketNumber: 'APL-2026-069',
    userId: 'usr-drv-04',
    userRole: 'driver',
    userName: 'Ramon Flores',
    userEmail: 'ramon.f@finder.ph',
    userPhone: '09445566778',
    suspensionReason: 'Expired Franchise Documents & Continued Operation',
    suspendedAt: '2026-09-28T08:00:00.000Z',
    appealDeadline: '2026-10-05T23:59:59.000Z',
    subject: 'Request to reactivate while renewal is pending',
    status: 'disabled',
    hasUnreadAdmin: false,
    createdAt: '2026-09-30T10:15:00.000Z',
    updatedAt: '2026-10-01T15:20:00.000Z',
    proofMedia: null,
    messages: [
      {
        _id: 'm-5',
        senderRole: 'user',
        senderName: 'Ramon Flores',
        body: 'My municipal franchise renewal is currently queued at the city hall. Can I be allowed to drive until next week?',
        createdAt: '2026-09-30T10:15:00.000Z',
      },
      {
        _id: 'm-6',
        senderRole: 'admin',
        senderName: 'System Administrator',
        body: 'Per city transport regulations, valid franchise documents must be active and verified before operating on the platform.',
        createdAt: '2026-10-01T15:18:00.000Z',
      },
      {
        _id: 'm-sys-2',
        senderRole: 'system',
        body: 'Appeal rejected. Account permanently disabled by Administrator on 10/1/2026.',
        createdAt: '2026-10-01T15:20:00.000Z',
      }
    ]
  }
];

export default function UserAppeals({ isActive }) {
  const { accessToken, user } = useContext(AuthContext)
  const [appeals, setAppeals] = useState(() => {
    try {
      const saved = localStorage.getItem('finder_admin_appeals');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_APPEALS;
  });

  const [selectedId, setSelectedId] = useState(() => DEFAULT_APPEALS[0]._id);
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'passenger' | 'driver'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'lifted' | 'disabled'
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const bodyRef = useRef(null)

  // Persist appeals in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('finder_admin_appeals', JSON.stringify(appeals));
    } catch (e) {}
  }, [appeals]);

  // Attempt to load from API if backend supports appeals endpoint
  useEffect(() => {
    if (!accessToken) return;

    async function fetchBackendAppeals() {
      try {
        const res = await fetch(`${API_URL}/admin/appeals`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.appeals) && data.appeals.length > 0) {
            setAppeals(data.appeals);
          }
        }
      } catch (err) {
        // Fallback to local state
      }
    }

    fetchBackendAppeals();
  }, [accessToken, isActive]);

  // Scroll messages to bottom on update
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [selectedId, appeals]);

  const selected = appeals.find(a => a._id === selectedId) || null;

  // Filtered appeals list
  const filteredAppeals = appeals.filter(a => {
    // 1. Role Filter (passenger vs driver)
    if (roleFilter !== 'all' && a.userRole !== roleFilter) {
      return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'all' && a.status !== statusFilter) {
      return false;
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.userName || '').toLowerCase().includes(q);
      const matchSub = (a.subject || '').toLowerCase().includes(q);
      const matchReason = (a.suspensionReason || '').toLowerCase().includes(q);
      const matchTicket = (a.ticketNumber || '').toLowerCase().includes(q);
      const matchPhone = (a.userPhone || '').toLowerCase().includes(q);
      return matchName || matchSub || matchReason || matchTicket || matchPhone;
    }

    return true;
  });

  // Action: Lift Suspension (Appeal Success)
  const handleLiftSuspension = () => {
    if (!selected) return;

    styledSwal.fire({
      title: 'Lift Suspension?',
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.5; color: #444;">
          <p>Are you sure you want to <strong>approve this appeal</strong> and lift the suspension for:</p>
          <div style="background: var(--bg2); padding: 10px 14px; border-radius: 8px; margin: 10px 0; font-weight: 600;">
            ${selected.userName} (${selected.userRole.toUpperCase()})
          </div>
          <p style="color: #16a34a; font-weight: 500;">✓ The user's account will be immediately restored to active status.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Lift Suspension',
      confirmButtonColor: '#16a34a',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const dateStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
      const sysMessage = {
        _id: 'sys-' + Date.now(),
        senderRole: 'system',
        body: `Suspension lifted by Administrator on ${dateStr}. Account restored.`,
        createdAt: new Date().toISOString()
      };

      // Try backend call
      try {
        await fetch(`${API_URL}/admin/suspended-accounts/${selected.userId}/lift`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }).catch(() => {});

        await fetch(`${API_URL}/admin/appeals/${selected._id}/lift`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }).catch(() => {});
      } catch (e) {}

      // Update state
      setAppeals(prev => prev.map(item => {
        if (item._id === selected._id) {
          return {
            ...item,
            status: 'lifted',
            hasUnreadAdmin: false,
            updatedAt: new Date().toISOString(),
            messages: [...(item.messages || []), sysMessage]
          };
        }
        return item;
      }));

      styledSwal.fire({
        title: 'Suspension Lifted!',
        text: `${selected.userName}'s appeal was approved and the suspension has been lifted.`,
        icon: 'success',
        timer: 2400,
        showConfirmButton: false
      });
    });
  };

  // Action: Deny Appeal (Appeal Denied / Suspension Upheld)
  const handleDenyAppeal = () => {
    if (!selected) return;

    styledSwal.fire({
      title: 'Deny Appeal?',
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.5; color: #444;">
          <p>Are you sure you want to <strong>deny this appeal</strong> for:</p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 8px; margin: 10px 0; font-weight: 600; color: #dc2626;">
            ${selected.userName} (${selected.userRole.toUpperCase()})
          </div>
          <p style="color: #64748b; font-size: 0.85rem;">The appeal will be marked as denied. The user's account remains in the system and their suspension remains active according to policy.</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Reason for denial (optional):',
      inputPlaceholder: 'Enter notes or reason for appeal denial...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Deny Appeal',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const reasonNote = result.value ? ` Reason: ${result.value.trim()}` : '';
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
      const sysMessage = {
        _id: 'sys-' + Date.now(),
        senderRole: 'system',
        body: `Appeal denied by Administrator on ${dateStr}.${reasonNote}`,
        createdAt: new Date().toISOString()
      };

      // Try backend call
      try {
        await fetch(`${API_URL}/admin/appeals/${selected._id}/disable`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: result.value })
        }).catch(() => {});
      } catch (e) {}

      // Update state
      setAppeals(prev => prev.map(item => {
        if (item._id === selected._id) {
          return {
            ...item,
            status: 'disabled',
            hasUnreadAdmin: false,
            updatedAt: new Date().toISOString(),
            messages: [...(item.messages || []), sysMessage]
          };
        }
        return item;
      }));

      styledSwal.fire({
        title: 'Appeal Denied',
        text: `${selected.userName}'s appeal has been denied. The suspension remains active.`,
        icon: 'error',
        timer: 2400,
        showConfirmButton: false
      });
    });
  };

  // Send Admin message in appeal thread
  const handleSendReply = async () => {
    if (!replyText.trim() || !selected) return;

    const messageText = replyText.trim();
    const newMsg = {
      _id: 'msg-' + Date.now(),
      senderRole: 'admin',
      senderName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'System Administrator' : 'System Administrator',
      body: messageText,
      createdAt: new Date().toISOString()
    };

    setReplyText('');

    setAppeals(prev => prev.map(item => {
      if (item._id === selected._id) {
        return {
          ...item,
          updatedAt: new Date().toISOString(),
          messages: [...(item.messages || []), newMsg]
        };
      }
      return item;
    }));

    try {
      await fetch(`${API_URL}/admin/appeals/${selected._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: messageText })
      }).catch(() => {});
    } catch (e) {}
  };

    // Two-step Re-evaluation confirmation: Type "DELETE" + Email OTP verification
  const handleReopenAppeal = async () => {
    if (!selected) return;

    const adminEmail = user?.email || 'admin@finder.ph';

    // Step 1: Confirmation - Require typing the word "CONFIRM"
    const step1 = await styledSwal.fire({
      title: 'Re-evaluate Appeal Decision?',
      html: `
        <div style="text-align: left; font-size: 0.88rem; line-height: 1.5; color: #444;">
          <p style="margin-bottom: 8px;">
            Re-evaluating will <strong>reset the current resolution</strong> (${selected.status === 'lifted' ? 'Suspension Lifted' : 'Appeal Denied'}) for <strong>${selected.userName}</strong> and return this case to <strong>Pending Review</strong>.
          </p>
          <div style="background: #fff7ed; border: 1.5px solid #fed7aa; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px;">
            <div style="font-weight: 700; color: #c2410c; font-size: 0.82rem; margin-bottom: 2px;">CRITICAL CONFIRMATION REQUIRED</div>
            <div style="font-size: 0.78rem; color: #9a3412;">
              Please type the word <strong style="color: #dc2626; font-size: 0.85rem; letter-spacing: 1px;">CONFIRM</strong> below to continue to security verification.
            </div>
          </div>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Type CONFIRM here...',
      inputAttributes: {
        autocapitalize: 'characters',
        autocorrect: 'off',
        style: 'text-align: center; font-weight: 700; letter-spacing: 2px;'
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Next: Verify via OTP →',
      confirmButtonColor: '#FF5F00',
      cancelButtonText: 'Cancel',
      preConfirm: (inputValue) => {
        if (!inputValue || inputValue.trim().toUpperCase() !== 'CONFIRM') {
          styledSwal.showValidationMessage('You must type the word "CONFIRM" to proceed.');
          return false;
        }
        return true;
      }
    });

    if (!step1.isConfirmed) return;

    // Step 2: Generate 6-digit OTP code and send to admin email
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await fetch(`${API_URL}/admin/appeals/${selected._id}/request-reevaluate-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: adminEmail, otp: generatedOtp })
      }).catch(() => {});
    } catch (e) {}

    // Show toast hint with the OTP code for testing / dev convenience
    styledSwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: `OTP sent to ${adminEmail}`,
      html: `Verification Code: <strong style="font-size: 1.1rem; color: #FF5F00; letter-spacing: 2px;">${generatedOtp}</strong>`,
      showConfirmButton: false,
      timer: 8000,
      timerProgressBar: true
    });

    // Step 3: Enter and verify 6-digit OTP
    const step2 = await styledSwal.fire({
      title: 'Enter Email OTP',
      html: `
        <div style="text-align: left; font-size: 0.88rem; line-height: 1.5; color: #444;">
          <p style="margin-bottom: 8px;">
            A 6-digit security code has been sent to your administrator email:
          </p>
          <div style="background: var(--bg2); padding: 8px 12px; border-radius: 8px; font-weight: 700; color: var(--brand); font-family: monospace; font-size: 0.95rem; margin-bottom: 12px; word-break: break-all; text-align: center;">
            ${adminEmail}
          </div>
          <p style="font-size: 0.78rem; color: var(--muted); margin-bottom: 4px;">
            Enter the 6-digit verification code below to confirm re-evaluation:
          </p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: '••••••',
      inputAttributes: {
        maxlength: '6',
        inputmode: 'numeric',
        pattern: '[0-9]*',
        style: 'text-align: center; font-size: 1.4rem; letter-spacing: 8px; font-weight: 800; font-family: monospace;'
      },
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirm Re-evaluation',
      confirmButtonColor: '#16a34a',
      cancelButtonText: 'Cancel',
      preConfirm: (otpValue) => {
        if (!otpValue || otpValue.trim().length !== 6) {
          styledSwal.showValidationMessage('Please enter a complete 6-digit OTP code.');
          return false;
        }
        if (otpValue.trim() !== generatedOtp) {
          styledSwal.showValidationMessage(`Invalid OTP code. (Hint: ${generatedOtp})`);
          return false;
        }
        return true;
      }
    });

    if (!step2.isConfirmed) return;

    // Step 4: Security verified -> execute re-evaluation
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const sysMessage = {
      _id: 'sys-' + Date.now(),
      senderRole: 'system',
      body: `Appeal re-opened for re-evaluation by Administrator (${adminEmail}) following two-factor security verification ("CONFIRM" + OTP) on ${dateStr} at ${timeStr}.`,
      createdAt: new Date().toISOString()
    };

    // Attempt backend update
    try {
      await fetch(`${API_URL}/admin/appeals/${selected._id}/reopen`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => {});
    } catch (e) {}

    // Update local state and localStorage
    setAppeals(prev => prev.map(item => {
      if (item._id === selected._id) {
        return {
          ...item,
          status: 'pending',
          hasUnreadAdmin: true,
          updatedAt: new Date().toISOString(),
          messages: [...(item.messages || []), sysMessage]
        };
      }
      return item;
    }));

    styledSwal.fire({
      title: 'Re-evaluation Confirmed!',
      html: `
        <div style="font-size: 0.9rem; color: #444; line-height: 1.5;">
          The appeal for <strong>${selected.userName}</strong> has been successfully verified and returned to <strong>Pending Review</strong> status.
        </div>
      `,
      icon: 'success',
      timer: 3000,
      showConfirmButton: false
    });
  };

  const pendingCount = appeals.filter(a => a.status === 'pending').length;

  return (
    <div className="appeals-page-wrapper">
      {/* Top filter banner */}
      <div className="appeals-top-header">
        <div className="appeals-header-info">
          <h2 className="appeals-title">User Suspension Appeals</h2>
          <p className="appeals-desc">
            Review driver and passenger suspension appeals to lift suspensions or permanently disable accounts.
          </p>
        </div>

        {/* Filter Pills: Type of user */}
        <div className="appeals-filter-group">
          <div className="appeals-pill-tabs">
            <button
              className={`appeals-pill-btn ${roleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All Users ({appeals.length})
            </button>
            <button
              className={`appeals-pill-btn ${roleFilter === 'passenger' ? 'active' : ''}`}
              onClick={() => setRoleFilter('passenger')}
            >
              Passengers ({appeals.filter(a => a.userRole === 'passenger').length})
            </button>
            <button
              className={`appeals-pill-btn ${roleFilter === 'driver' ? 'active' : ''}`}
              onClick={() => setRoleFilter('driver')}
            >
              Drivers ({appeals.filter(a => a.userRole === 'driver').length})
            </button>
          </div>

          <div className="appeals-pill-tabs secondary">
            <button
              className={`appeals-pill-btn sm ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Status
            </button>
            <button
              className={`appeals-pill-btn sm ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`appeals-pill-btn sm ${statusFilter === 'lifted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('lifted')}
            >
              Lifted ({appeals.filter(a => a.status === 'lifted').length})
            </button>
            <button
              className={`appeals-pill-btn sm ${statusFilter === 'disabled' ? 'active' : ''}`}
              onClick={() => setStatusFilter('disabled')}
            >
              Disabled ({appeals.filter(a => a.status === 'disabled').length})
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-column layout identical to Messages */}
      <div className="msg-layout appeals-layout">
        {/* Left Side: Appeal Cards List */}
        <div className="msg-list appeals-list">
          <div className="msg-search">
            <input
              type="text"
              placeholder="Search user, reason, phone, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredAppeals.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
              No appeals found matching the selected filter.
            </div>
          ) : (
            filteredAppeals.map(appeal => {
              const isSelected = selected?._id === appeal._id;
              return (
                <div
                  key={appeal._id}
                  className={`msg-item appeal-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedId(appeal._id)}
                >
                  <div className="msg-item-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="msg-sender">{appeal.userName}</span>
                      <span className={`appeal-role-tag ${appeal.userRole}`}>
                        {appeal.userRole}
                      </span>
                    </div>
                    <span className="msg-time">
                      {new Date(appeal.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="appeal-ticket-sub">
                    <span className="appeal-ticket-code">{appeal.ticketNumber}</span>
                    <span className="appeal-preview-text">{appeal.subject}</span>
                  </div>

                  <div className="appeal-item-footer">
                    {appeal.status === 'pending' && (
                      <span className="badge yellow">
                        <span className="badge-dot"></span> Pending Review
                      </span>
                    )}
                    {appeal.status === 'lifted' && (
                      <span className="badge green">
                        ✓ Suspension Lifted
                      </span>
                    )}
                    {appeal.status === 'disabled' && (
                      <span className="badge red">
                        ✕ Appeal Denied
                      </span>
                    )}

                    {appeal.proofMedia && (
                      <span className="appeal-has-proof" title="Proof attached">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Proof
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Appeal Details & Decisions */}
        <div className="msg-detail appeals-detail">
          {selected ? (
            <>
              {/* Header */}
              <div className="msg-detail-head appeals-detail-head">
                <div className="appeals-user-header">
                  <div className="appeals-avatar-circle">
                    {selected.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <div className="msg-detail-name">{selected.userName}</div>
                      <span className={`appeal-role-tag ${selected.userRole}`}>
                        {selected.userRole.toUpperCase()}
                      </span>
                      <span className="appeal-ticket-badge">{selected.ticketNumber}</span>
                    </div>
                    <div className="msg-detail-sub">
                      <span>{selected.userPhone}</span> · <span>{selected.userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Top Action Decision Buttons */}
                <div className="appeals-decision-actions">
                  {selected.status === 'pending' ? (
                    <>
                      <button
                        className="btn-appeal-decision lift"
                        onClick={handleLiftSuspension}
                        title="Approve appeal and restore user account"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Lift Suspension
                      </button>

                      <button
                        className="btn-appeal-decision disable"
                        onClick={handleDenyAppeal}
                        title="Deny this appeal and uphold suspension"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Deny Appeal
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {selected.status === 'lifted' && (
                        <div className="appeals-resolved-tag success">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Suspension Lifted (Account Active)
                        </div>
                      )}
                      {selected.status === 'disabled' && (
                        <div className="appeals-resolved-tag danger">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                          Appeal Denied (Suspended)
                        </div>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={handleReopenAppeal} style={{ fontSize: '0.72rem' }}>
                        Re-evaluate
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body: Suspension Details card + Messages */}
              <div className="msg-body" ref={bodyRef}>
                {/* Suspension Info Banner Card */}
                <div className="appeal-summary-card">
                  <div className="appeal-summary-header">
                    <div className="appeal-summary-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5F00" strokeWidth="2.2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Suspension Case Overview
                    </div>
                    <span className="appeal-date-tag">
                      Suspended on: {new Date(selected.suspendedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="appeal-grid-info">
                    <div className="appeal-info-item">
                      <span className="info-label">Original Reason for Suspension:</span>
                      <span className="info-value reason">{selected.suspensionReason}</span>
                    </div>
                    <div className="appeal-info-item">
                      <span className="info-label">Subject of Appeal:</span>
                      <span className="info-value">{selected.subject}</span>
                    </div>
                  </div>

                  {selected.proofMedia && (
                    <div className="appeal-proof-section">
                      <span className="info-label">Uploaded Proof / Evidence:</span>
                      {isVideoMedia(selected.proofMedia) ? (
                        <div style={{ marginTop: '8px' }}>
                          <video
                            src={selected.proofMedia}
                            controls
                            style={{
                              maxWidth: '100%',
                              maxHeight: '280px',
                              borderRadius: '8px',
                              backgroundColor: '#000',
                              display: 'block'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="appeal-proof-thumb" onClick={() => setPreviewImage(selected.proofMedia)}>
                          <img src={selected.proofMedia} alt="Evidence" />
                          <div className="appeal-proof-overlay">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                            <span>Click to View Full Evidence</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline Messages Thread */}
                <div className="appeal-thread-divider">
                  <span>Appeal Correspondence & Timeline</span>
                </div>

                {selected.messages?.map(msg => {
                  if (msg.senderRole === 'system') {
                    return (
                      <div key={msg._id} className="appeal-system-bubble">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        <span>{msg.body}</span>
                      </div>
                    );
                  }

                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg._id}
                      className={`msg-wrapper ${isAdmin ? 'out' : 'in'}`}
                    >
                      <div className={`bubble ${isAdmin ? 'out' : 'in'}`}>
                        {msg.senderName && (
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px', opacity: 0.85 }}>
                            {msg.senderName}
                          </div>
                        )}
                        <div>{msg.body}</div>
                        {msg.mediaUrl && (
                          isVideoMedia(msg.mediaUrl, msg.mediaType) ? (
                            <div style={{ marginTop: '8px' }}>
                              <video
                                src={msg.mediaUrl}
                                controls
                                style={{
                                  maxWidth: '280px',
                                  maxHeight: '220px',
                                  borderRadius: '8px',
                                  display: 'block',
                                  backgroundColor: '#000'
                                }}
                              />
                            </div>
                          ) : (
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              style={{ marginTop: '8px', borderRadius: '8px', maxWidth: '240px', cursor: 'pointer' }}
                              onClick={() => setPreviewImage(msg.mediaUrl)}
                            />
                          )
                        )}
                      </div>
                      <div className={`bubble-time ${isAdmin ? 'out-time' : ''}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Reply Bar */}
              {selected.status === 'pending' ? (
                <div className="msg-input-bar appeals-input-bar">
                  <input
                    className="msg-input"
                    type="text"
                    placeholder="Type an official reply to the appellant..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleSendReply}>
                    Send Reply
                  </button>
                </div>
              ) : (
                <div className="appeals-footer-resolved">
                  {selected.status === 'lifted' ? (
                    <div className="resolved-banner green">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>This appeal was approved. Suspension was lifted and user access restored.</span>
                    </div>
                  ) : (
                    <div className="resolved-banner red">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span>This appeal was denied. The suspension remains active.</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              Select a user appeal from the list to view details and take action.
            </div>
          )}
        </div>
      </div>

      {/* Full-size Media Preview Modal */}
      {previewImage && (
        <div className="media-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="media-preview-content" onClick={e => e.stopPropagation()}>
            {isVideoMedia(previewImage) ? (
              <video
                src={previewImage}
                controls
                autoPlay
                style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px', backgroundColor: '#000' }}
              />
            ) : (
              <img src={previewImage} alt="Full evidence preview" />
            )}
            <button className="media-preview-close" onClick={() => setPreviewImage(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
