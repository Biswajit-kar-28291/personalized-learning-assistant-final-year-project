import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import { LayoutDashboard, Upload, LogOut, Cpu, User, Trash2, X } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showEdit, setShowEdit] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleUpdateProfile = async (e) => {
  e.preventDefault()

  try {
    const oldUsername = user?.username
    const oldEmail = user?.email

    const isPasswordChanged = password.trim().length > 0
    const isUsernameChanged = username !== oldUsername
    const isEmailChanged = email !== oldEmail

    const data = {
      username,
      email
    }

    if (isPasswordChanged) {
      data.password = password
    }

    await api.put('/auth/update', data)

    alert('Profile updated successfully')

    setShowEdit(false)

    if (
      isPasswordChanged ||
      isUsernameChanged ||
      isEmailChanged
    ) {
      localStorage.removeItem('token')
      logout()
      navigate('/login')
    } else {
      window.location.reload()
    }

  } catch (error) {
    console.error(error)
    alert(error.response?.data?.detail || 'Failed to update profile')
  }
}
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account?')
    if (!confirmDelete) return

    try {
      await api.delete('/auth/delete-account')
      localStorage.removeItem('token')
      logout()
      navigate('/login')
    } catch (error) {
      alert('Failed to delete account')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflowX: 'hidden',
      background: 'var(--bg)'
    }}>

      <aside style={{
        width: isMobile ? '100%' : 240,
        flexShrink: 0,
        background: 'var(--bg2)',
        borderRight: isMobile ? 'none' : '1px solid var(--border)',
        borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        minHeight: isMobile ? 'auto' : '100vh',
        height: isMobile ? 'auto' : '100vh',
        padding: isMobile ? '10px' : '24px 0',
        position: isMobile ? 'relative' : 'sticky',
        top: 0,
        zIndex: 50,
        gap: isMobile ? 8 : 0,
        overflowX: isMobile ? 'auto' : 'visible'
      }}>

        <div style={{
          padding: isMobile ? 0 : '0 20px 28px',
          borderBottom: isMobile ? 'none' : '1px solid var(--border)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={20} color="#0a0b0f" />
            </div>

            {!isMobile && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                  LearnAI
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Learning Assistant
                </div>
              </div>
            )}
          </div>
        </div>

        <nav style={{
          flex: 1,
          padding: isMobile ? 0 : '20px 12px',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: 6,
          minWidth: 0
        }}>
          {[
            { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
            { to: '/upload', icon: Upload, label: 'Upload' }
          ].map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: isMobile ? '10px 12px' : '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'rgba(110,231,183,0.08)' : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              })}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: isMobile ? 0 : '16px 12px',
          borderTop: isMobile ? 'none' : '1px solid var(--border)',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: 6,
          flexShrink: 0
        }}>

          {!isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg3)',
              marginBottom: 8
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff'
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {user?.role}
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>
            <User size={16} />
            {!isMobile && <span>Edit Profile</span>}
          </button>

          <button className="btn btn-ghost" onClick={handleDeleteAccount} style={{ color: '#ef4444' }}>
            <Trash2 size={16} />
            {!isMobile && <span>Delete Account</span>}
          </button>

          <button className="btn btn-ghost" onClick={handleLogout}>
            <LogOut size={16} />
            {!isMobile && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        minWidth: 0,
        width: '100%',
        height: isMobile ? 'auto' : '100vh',
        overflow: isMobile ? 'visible' : 'auto',
        background: 'var(--bg)'
      }}>
        <Outlet />
      </main>

      {showEdit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="card" style={{ width: 420, maxWidth: '100%', position: 'relative' }}>
            <button
              onClick={() => setShowEdit(false)}
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
                border: 'none',
                background: 'transparent',
                color: 'var(--text3)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
              Edit Profile
            </h2>

            <form onSubmit={handleUpdateProfile}>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={inputStyle}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={inputStyle}
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password optional"
                style={inputStyle}
              />

              <button className="btn btn-primary" style={{ width: '100%' }}>
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  marginBottom: 14,
  padding: '12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg3)',
  color: 'var(--text)'
}