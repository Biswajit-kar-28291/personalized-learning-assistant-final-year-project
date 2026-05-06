import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import { Video, MessageSquare, Upload, Play, Clock, ChevronRight, BookOpen, Zap } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/videos'),
    ]).then(([statsRes, videosRes]) => {
      setStats(statsRes.data)
      setVideos(videosRes.data.videos)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Videos Uploaded', value: stats?.total_videos ?? 0, icon: Video, color: 'var(--accent)' },
    { label: 'Questions Asked', value: stats?.total_questions ?? 0, icon: MessageSquare, color: 'var(--info)' },
  ]

  return (
    <div style={{
  padding: window.innerWidth <= 768 ? '24px 16px' : '40px 48px',
  maxWidth: 1100,
  margin: '0 auto',
  width: '100%'
}}>
      {/* Header */}
      <div style={{ marginBottom: 40 }} className="fade-in">
        <div style={{
  display: 'flex',
  alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
  justifyContent: 'space-between',
  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
  gap: 16
}}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span className="gradient-text">{user?.username}</span> 👋
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 15 }}>Ready to learn something new today?</p>
          </div>
          <Link to="/upload" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
            <Upload size={16} /> Upload Video
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }} className="fade-in">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>{label}</div>
            </div>
          </div>
        ))}

        {/* Quick tip card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(110,231,183,0.08), rgba(96,165,250,0.08))', border: '1px solid rgba(110,231,183,0.15)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(110,231,183,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={22} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>Powered by Groq</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Ultra-fast AI responses</div>
          </div>
        </div>
      </div>

      {/* Videos section */}
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            Your Videos
          </h2>
          <Link to="/upload" style={{ fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Add new <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} className="card pulse" style={{ flex: 1, height: 120 }} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '56px 32px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <BookOpen size={28} color="var(--text3)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              No videos yet
            </h3>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24 }}>
              Upload your first educational video to get started
            </p>
            <Link to="/upload" className="btn btn-primary">
              <Upload size={16} /> Upload Video
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {videos.map(video => (
              <Link key={video.video_id} to={`/video/${video.video_id}`}
                style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ cursor: 'pointer' }}>
                  {/* Thumbnail placeholder */}
                  <div style={{
                    height: 120, borderRadius: 8, background: 'var(--bg3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16, position: 'relative', overflow: 'hidden',
                    backgroundImage: 'linear-gradient(135deg, var(--bg3) 0%, #1a2030 100%)'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: 'rgba(110,231,183,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Play size={20} color="var(--accent)" />
                    </div>
                    <span className="badge badge-green" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Ready
                    </span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {video.video_title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {new Date(video.upload_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
