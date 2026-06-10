import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

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

const API_URL = import.meta.env.VITE_API_URL

// Validators for editable fields (can be expanded as needed)

function validateMobile(mobileNumber) {
    if (!mobileNumber) return 'Mobile number is required.';
    // User types 09XXXXXXXXX (11 digits)
    if (!/^09\d{9}$/.test(mobileNumber)) return 'Please enter a valid 11-digit mobile number starting with 09.';
    return null;
}

function validatePassword(password) {
    if (!password) return 'Password is required.';
    if (password.length > MAX_PASSWORD_LENGTH) return 'Password is too long.';
    return null;
}

function validateEmail(email) {
    if (!email) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    return null;
}

function validateFirstName(firstName) {
    if (!firstName) return 'First name is required.';
    if (!/^[A-Za-z\s'-]+$/.test(firstName)) return 'First name can only contain letters, spaces, hyphens, and apostrophes.';
    return null;
}

function validateLastName(lastName) {
    if (!lastName) return 'Last name is required.';
    if (!/^[A-Za-z\s'-]+$/.test(lastName)) return 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
    return null;
}

export default function Settings() {
  const { user, setUser, accessToken } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(user?.firstName || 'N/A');
  const [lastName, setLastName] = useState(user?.lastName || 'N/A');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || 'N/A');
  const [email, setEmail] = useState(user?.email || 'N/A');
  const [saving, setSaving] = useState(false);

    const confirmSave = () => {
        // Client-side validation
        const firstNameError = validateFirstName(firstName);
        if (firstNameError) { styledSwal.fire('Validation Error', firstNameError, 'error'); return; }

        const lastNameError = validateLastName(lastName);
        if (lastNameError) { styledSwal.fire('Validation Error', lastNameError, 'error'); return; }

        const mobileError = validateMobile(mobileNumber);
        if (mobileError) { styledSwal.fire('Validation Error', mobileError, 'error'); return; }

        const emailError = validateEmail(email);
        if (emailError) { styledSwal.fire('Validation Error', emailError, 'error'); return; }

        styledSwal.fire({
            title: 'Save Changes',
            text: 'Are you sure you want to save the changes to your profile?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                saveProfile();
            }
        });
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/edit-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    mobileNumber,
                    email,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                styledSwal.fire('Error', data.message || 'Failed to update profile.', 'error');
                return;
            }

            setUser(data.user);
            styledSwal.fire('Success', 'Profile updated successfully.', 'success');
        } catch (err) {
            styledSwal.fire('Error', 'Unable to reach the server. Please check your connection.', 'error');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
  
  const toggleRow = (name, desc, defaultChecked) => (
    <div className="toggle-row" style={{ padding:'12px 0' }}>
      <div>
        <div className="toggle-name">{name}</div>
        <div className="toggle-desc">{desc}</div>
      </div>
      <label className="toggle">
        <input type="checkbox" defaultChecked={defaultChecked}/>
        <span className="toggle-slider"></span>
      </label>
    </div>
  )

  return (
    <div>
      {/* Admin Account */}
      <div className="settings-card">
        <div className="settings-title">Admin Account</div>
        <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24, padding:24, background:'var(--brand-ll)', borderRadius:14 }}>
          <div style={{ width:64, height:64, background:'var(--brand)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.5rem', color:'white' }}>{user?.firstName?.[0] || 'J'}{user?.lastName?.[0] || 'D'}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--text)', marginBottom:2 }}>{user?.firstName || 'N/A'} {user?.lastName || 'N/A'}</div>
            <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{user?.email || 'N/A'} &nbsp;•&nbsp; System Administrator</div>
          </div>
        </div>

        <div className="form-row" style={{ marginBottom:20 }}>
          <div className="form-field">
            <label className="form-label">FIRST NAME</label>
            <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
          <div className="form-field">
            <label className="form-label">LAST NAME</label>
            <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
        </div>
        <div className="form-row" style={{ marginBottom:24 }}>
          <div className="form-field">
            <label className="form-label">EMAIL</label>
            <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
          <div className="form-field">
            <label className="form-label">PHONE</label>
            <input className="form-input" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} style={{ background:'var(--bg)', borderColor:'var(--border-l)' }}/>
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding:'10px 24px', borderRadius:10 }} onClick={confirmSave}>
          {saving ? 'Saving...' : 'Edit Profile'}
        </button>
      </div>

      {/* Security */}
      <div className="settings-card">
        <div className="settings-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security Configuration
        </div>
        {toggleRow('Two-Factor Authentication', 'Require MPIN on every admin login', true)}
        <div style={{ borderTop:'1px solid var(--border-l)' }}>
          {toggleRow('Session Timeout', 'Auto-logout after 30 minutes of inactivity', false)}
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="settings-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          Notification Settings
        </div>
        {toggleRow('New Driver Applications', 'Alert when a new driver submits an application', true)}
        <div style={{ borderTop:'1px solid var(--border-l)' }}>
          {toggleRow('Passenger Messages', 'Notify on new passenger inquiries or complaints', true)}
        </div>
        <div style={{ borderTop:'1px solid var(--border-l)' }}>
          {toggleRow('System Reports', 'Weekly summary reports via email', true)}
        </div>
      </div>
    </div>
  )
}
