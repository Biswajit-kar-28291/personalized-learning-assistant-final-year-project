import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft, Send, FileText, Search, Bot, User,
  Sparkles, Clock, BookOpen, ChevronDown, ChevronUp, Layers
} from 'lucide-react'

export default function VideoPage() {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('chat')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatBottomRef = useRef(null)

  const [showFull, setShowFull] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => {
    api.get(`/videos/${videoId}`)
      .then(res => setVideo(res.data))
      .catch(() => toast.error('Failed to load video'))
      .finally(() => setLoading(false))
  }, [videoId])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return

    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]

    setMessages(newMessages)
    setInput('')
    setChatLoading(true)

    try {
      const res = await api.post('/qa/chat', {
        video_id: videoId,
        messages: newMessages
      })

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.answer }
      ])
    } catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.detail || 'Failed to get answer')
    } finally {
      setChatLoading(false)
    }
  }

  const loadSummary = async () => {
    if (summary || summaryLoading) return

    setSummaryLoading(true)

    try {
      const res = await api.get(`/videos/${videoId}/summary`)
      setSummary(res.data.summary)
    } catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.detail || 'Failed to generate summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const res = await api.get(
        `/search?video_id=${videoId}&query=${encodeURIComponent(searchQuery)}`
      )
      setSearchResults(res.data)
    } catch (err) {
      console.log(err)
      toast.error('Search failed')
    }
  }

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'search', label: 'Search', icon: Search }
  ]

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  return (
    <div style={{
      height: '100dvh',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexShrink: 0,
        minWidth: 0
      }}>
        <Link to="/" className="btn btn-ghost" style={{ padding: '8px 12px', flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </Link>

        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {video?.video_title}
          </h1>

          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 2,
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: 12,
              color: 'var(--text3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Clock size={11} />
              {video?.upload_date ? new Date(video.upload_date).toLocaleDateString() : 'N/A'}
            </span>

            <span style={{
              fontSize: 12,
              color: 'var(--text3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <BookOpen size={11} />
              {video?.transcript_text?.split(' ')?.length?.toLocaleString() || 0} words
            </span>
          </div>
        </div>

        <span className="badge badge-green" style={{ flexShrink: 0 }}>
          <Layers size={12} /> Transcribed
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        gap: 0,
        flexShrink: 0,
        overflowX: 'auto',
        overflowY: 'hidden'
      }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id)
              if (id === 'summary') loadSummary()
            }}
            style={{
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 500,
              color: tab === id ? 'var(--accent)' : 'var(--text3)',
              borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all var(--transition)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {tab === 'chat' && (
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 50 }} className="fade-in">
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: 'rgba(110,231,183,0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Bot size={28} color="var(--accent)" />
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text)',
                    marginBottom: 8
                  }}>
                    Ask anything about this video
                  </h3>

                  <p style={{
                    color: 'var(--text3)',
                    fontSize: 14,
                    maxWidth: 400,
                    margin: '0 auto 24px'
                  }}>
                    I've read the transcript — ask any question.
                  </p>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center'
                  }}>
                    {[
                      'What are the main topics?',
                      'Summarize in 3 points',
                      'What did I miss?',
                      'Give me a quiz question'
                    ].map(q => (
                      <button
                        key={q}
                        className="btn btn-ghost"
                        style={{ fontSize: 13, padding: '8px 14px' }}
                        onClick={() => setInput(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="fade-in"
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    minWidth: 0
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: msg.role === 'user'
                      ? 'var(--accent3)'
                      : 'rgba(110,231,183,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {msg.role === 'user'
                      ? <User size={16} color="#fff" />
                      : <Bot size={16} color="var(--accent)" />}
                  </div>

                  <div style={{
                    maxWidth: 'min(720px, 78%)',
                    minWidth: 0,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user'
                      ? '12px 4px 12px 12px'
                      : '4px 12px 12px 12px',
                    background: msg.role === 'user' ? 'var(--accent3)' : 'var(--bg2)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: msg.role === 'user' ? '#fff' : 'var(--text)'
                  }}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ marginBottom: 8 }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ul>,
                          li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                          strong: ({ children }) => <strong style={{ color: 'var(--accent)' }}>{children}</strong>,
                          code: ({ children }) => (
                            <code style={{
                              background: 'var(--bg3)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 12,
                              whiteSpace: 'pre-wrap'
                            }}>
                              {children}
                            </code>
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="fade-in">
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(110,231,183,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bot size={16} color="var(--accent)" />
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          opacity: 0.6,
                          animation: `pulse 1.2s ${i * 0.2}s ease infinite`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg2)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  className="input-field"
                  placeholder="Ask a question about this video..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) sendMessage()
                  }}
                  style={{ flex: 1, minWidth: 0 }}
                />

                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!input.trim() || chatLoading}
                  style={{ padding: '12px 20px', flexShrink: 0 }}
                >
                  {chatLoading
                    ? <div className="spinner" style={{ width: 16, height: 16 }} />
                    : <Send size={16} />}
                </button>
              </div>

              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                Powered by Groq LLaMA 3 · Answers based strictly on video transcript
              </p>
            </div>
          </div>
        )}

        {tab === 'transcript' && (
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24 }}>
            <div className="card fade-in">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 20
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text)'
                }}>
                  Full Transcript
                </h3>

                <span className="badge badge-blue">
                  {video?.transcript_text?.split(' ')?.length?.toLocaleString() || 0} words
                </span>
              </div>

              <div style={{
                fontSize: 14,
                lineHeight: 1.85,
                color: 'var(--text2)',
                maxHeight: showFull ? 'none' : 300,
                overflow: 'hidden',
                position: 'relative',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}>
                {video?.transcript_text || 'No transcript available.'}

                {!showFull && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    background: 'linear-gradient(transparent, var(--bg2))'
                  }} />
                )}
              </div>

              <button
                className="btn btn-ghost"
                style={{ marginTop: 16, fontSize: 13 }}
                onClick={() => setShowFull(s => !s)}
              >
                {showFull
                  ? <><ChevronUp size={14} /> Show less</>
                  : <><ChevronDown size={14} /> Show full transcript</>}
              </button>
            </div>
          </div>
        )}

        {tab === 'summary' && (
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24 }}>
            <div
              className="card fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(110,231,183,0.05), rgba(96,165,250,0.05))',
                border: '1px solid rgba(110,231,183,0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Sparkles size={18} color="var(--accent)" />

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text)'
                }}>
                  AI Summary
                </h3>
              </div>

              {summaryLoading ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="spinner" />
                  Generating summary...
                </div>
              ) : summary ? (
                <div style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: 'var(--text2)',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word'
                }}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ marginBottom: 10 }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ paddingLeft: 20 }}>{children}</ul>,
                      li: ({ children }) => <li style={{ marginBottom: 8, color: 'var(--text)' }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ color: 'var(--accent)' }}>{children}</strong>
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>
                  Click Summary tab to generate.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24 }}>
            <div style={{ marginBottom: 24 }} className="fade-in">
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  className="input-field"
                  placeholder="Search in transcript..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                  style={{ flex: 1, minWidth: 0 }}
                />

                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  style={{ flexShrink: 0 }}
                >
                  <Search size={16} /> Search
                </button>
              </div>
            </div>

            {searchResults && (
              <div className="fade-in">
                <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
                  {searchResults.total} matches found
                </p>

                {searchResults.matches.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {searchResults.matches.map((m, i) => (
                      <div key={i} className="card" style={{ padding: 16 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8
                        }}>
                          <span className="badge badge-blue">
                            <Clock size={10} />
                            {Math.floor(m.start / 60)}:
                            {String(Math.floor(m.start % 60)).padStart(2, '0')}
                          </span>
                        </div>

                        <p style={{
                          fontSize: 14,
                          color: 'var(--text2)',
                          lineHeight: 1.7,
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}>
                          {m.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : searchResults.snippet ? (
                  <div className="card" style={{ padding: 20 }}>
                    <p style={{
                      fontSize: 14,
                      color: 'var(--text2)',
                      lineHeight: 1.7,
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}>
                      ...{searchResults.snippet}...
                    </p>
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: 'var(--text3)' }}>
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}