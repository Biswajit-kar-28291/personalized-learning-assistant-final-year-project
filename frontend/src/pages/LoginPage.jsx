import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Cpu, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(110,231,183,0.06), transparent)',
      padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
          }}>
            <Cpu size={26} color="#0a0b0f" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sign in to your learning account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input className="input-field" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ paddingLeft: 42 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input className="input-field" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ paddingLeft: 42 }} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? <div className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text3)', fontSize: 14 }}>
          No account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
