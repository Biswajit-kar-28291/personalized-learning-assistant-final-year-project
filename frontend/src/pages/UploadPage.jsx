import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Upload, Film, CheckCircle, AlertCircle, X } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  const STEPS = [
    'Uploading video file...',
    'Extracting audio track...',
    'Running Whisper transcription...',
    'Processing with AI...',
    'Finalizing...',
  ]

  const handleFile = (f) => {
    const allowed = ['video/mp4','video/x-msvideo','video/x-matroska','video/webm']
    if (!allowed.includes(f.type)) {
      toast.error('Please upload MP4, AVI, MKV or WebM')
      return
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error('File too large (max 500MB)')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)

    // Simulate progress steps
    let stepIdx = 0
    setProgress(STEPS[0])
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1)
      setProgress(STEPS[stepIdx])
    }, 3500)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      clearInterval(interval)
      toast.success('Video transcribed successfully!')
      navigate(`/video/${res.data.video_id}`)
    } catch (err) {
      clearInterval(interval)
      toast.error(err.response?.data?.detail || 'Upload failed')
      setUploading(false)
      setProgress('')
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 720, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
          Upload Video
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: 15 }}>
          Upload an educational video — we'll transcribe it and make it searchable
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--accent3)' : 'var(--border2)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: file ? 'default' : 'pointer',
          background: dragging ? 'rgba(110,231,183,0.04)' : 'var(--bg2)',
          transition: 'all var(--transition)',
          marginBottom: 24,
        }}
      >
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

        {file ? (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(110,231,183,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Film size={26} color="var(--accent)" />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 16, marginBottom: 6 }}>{file.name}</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>{formatSize(file.size)}</p>
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={(e) => { e.stopPropagation(); setFile(null) }}>
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Upload size={26} color="var(--text3)" />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 16, marginBottom: 6 }}>
              {dragging ? 'Drop your video here' : 'Drag & drop or click to browse'}
            </p>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>MP4, AVI, MKV, WebM — up to 500MB</p>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="card fade-in" style={{ marginBottom: 24, background: 'rgba(110,231,183,0.05)', border: '1px solid rgba(110,231,183,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="spinner" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                Processing your video
              </div>
              <div style={{ fontSize: 13, color: 'var(--accent)' }}>{progress}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, animation: 'progress 15s ease-in-out forwards' }} />
          </div>
          <style>{`@keyframes progress { from{width:0%} to{width:95%} }`}</style>
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {[
          { icon: CheckCircle, color: 'var(--accent)', title: 'Auto Transcription', desc: 'Whisper AI converts speech to text' },
          { icon: CheckCircle, color: 'var(--info)', title: 'Groq AI Q&A', desc: 'Ask questions about your video' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!file || uploading}
        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
        {uploading ? <><div className="spinner" /> Processing...</> : <><Upload size={16} /> Upload & Transcribe</>}
      </button>

      {!uploading && (
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text3)' }}>
          <AlertCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
          Transcription may take 1–3 minutes depending on video length
        </p>
      )}
    </div>
  )
}
