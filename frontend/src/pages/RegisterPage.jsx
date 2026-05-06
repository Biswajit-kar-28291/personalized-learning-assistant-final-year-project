import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Cpu, User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created! Welcome!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
          }}>
            <Cpu size={26} color="#0a0b0f" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
            Create account
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Start your personalized learning journey</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { key: 'username', label: 'Username', type: 'text', icon: User, placeholder: 'yourname' },
              { key: 'email', label: 'Email address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••' },
            ].map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input className="input-field" type={type} placeholder={placeholder}
                    value={form[key]} onChange={set(key)} required style={{ paddingLeft: 42 }} />
                </div>
              </div>
            ))}
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? <div className="spinner" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text3)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
