import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { io } from 'socket.io-client'
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

export default function Messages({ role = "passenger" }) {
  const { accessToken } = useContext(AuthContext)
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingMedia, setPendingMedia] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const socketRef = useRef(null)
  const bodyRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!accessToken) return

    // 1. Fetch all support tickets
    async function loadTickets() {
      const res = await fetch(`${API_URL}/support/tickets?role=${role}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      const data = await res.json()
      setTickets(data.tickets || [])
    }
    loadTickets()

    // 2. Connect to Socket.IO (stays open while admin is on this page)
    const socket = io(API_URL, {
      auth: { token: accessToken },
    })

    socket.on('receive_message', (newMsg) => {
      // Update the active chat if the message belongs to the selected ticket
      setMessages(prev => {
        if (prev.some(m => m._id === newMsg._id)) return prev
        const isOwnOptimistic = prev.some(m => 
          m.body === newMsg.body && 
          m.senderRole === newMsg.senderRole && 
          m._id.length < 24
        )
        if (isOwnOptimistic) return prev
        
        // If they are currently viewing this ticket, mark it as read immediately
        if (selected && selected._id === newMsg.ticketId) {
          window.dispatchEvent(new CustomEvent('ticket_read', { detail: selected._id }))
          setTickets(currentTickets => currentTickets.map(t => 
            t._id === selected._id ? { ...t, hasUnreadAdmin: false } : t
          ))
        }
        
        return [...prev, newMsg]
      })
    })

    socket.on('new_ticket', (ticket) => {
      if (ticket.userRole === role) {
        setTickets(prev => [ticket, ...prev])
      }
    })

    socket.on('ticket_updated', ({ ticketId, updatedAt, status, senderRole }) => {
      setTickets(prev => {
        const updated = prev.map(t =>
          t._id === ticketId
            ? { 
                ...t, 
                updatedAt, 
                ...(status ? { status } : {}),
                ...(senderRole ? { hasUnreadAdmin: senderRole !== 'admin' } : {}) 
              }
            : t
        )
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      })
    })

    socket.on('ticket_resolved', () => {
      setSelected(prev => prev ? { ...prev, status: 'resolved' } : prev)
    })

      socketRef.current = socket
      return () => socket.disconnect()
    }, [accessToken, role])

  useEffect(() => {
    if (!selected || !accessToken) return

    // Notify App.jsx to clear the unread badge for this ticket
    window.dispatchEvent(new CustomEvent('ticket_read', { detail: selected._id }))

    async function loadMessages() {
      const res = await fetch(
        `${API_URL}/support/tickets/${selected._id}/messages`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
      const data = await res.json()
      setMessages(data.messages || [])
      
      // Update local ticket list to remove unread badge since we just fetched it
      setTickets(prev => prev.map(t => 
        t._id === selected._id ? { ...t, hasUnreadAdmin: false } : t
      ))
    }
    loadMessages()

    // Join the ticket's socket room so we receive real-time messages for it
    if (socketRef.current) {
      socketRef.current.emit('join_ticket', { ticketId: selected._id })
    }

    // Leave the room when switching to a different ticket
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_ticket', { ticketId: selected._id })
      }
    }
  }, [selected])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      styledSwal.fire('Invalid File', 'Only images and videos are allowed.', 'error')
      e.target.value = ''
      return
    }

    if (isImage && file.size > 5 * 1024 * 1024) {
      styledSwal.fire('File Too Large', 'Images must be less than 5MB.', 'error')
      e.target.value = ''
      return
    }

    if (isVideo && file.size > 20 * 1024 * 1024) {
      styledSwal.fire('File Too Large', 'Videos must be less than 20MB.', 'error')
      e.target.value = ''
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setPendingMedia({ file, previewUrl, mediaType: isImage ? 'image' : 'video' })
    e.target.value = ''
  }

  const cancelPendingMedia = () => {
    if (pendingMedia?.previewUrl) {
      URL.revokeObjectURL(pendingMedia.previewUrl)
    }
    setPendingMedia(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendReply = async () => {
    if ((!reply.trim() && !pendingMedia) || !selected || isUploading) return

    const text = reply.trim()
    const media = pendingMedia
    setReply('')
    setPendingMedia(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    // Optimistically add the message to the UI
    const optimisticMsg = {
      _id: Date.now().toString(),
      ticketId: selected._id,
      senderId: '',
      senderRole: 'admin',
      body: text,
      mediaUrl: media ? media.previewUrl : undefined,
      mediaType: media ? media.mediaType : undefined,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      let finalMediaUrl = undefined
      let finalMediaType = undefined

      if (media) {
        setIsUploading(true)
        const sigRes = await fetch(`${API_URL}/chat/cloudinary-signature`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ mediaType: media.mediaType })
        })
        const sigData = await sigRes.json()

        const formData = new FormData()
        formData.append('file', media.file)
        formData.append('api_key', sigData.apiKey)
        formData.append('timestamp', sigData.timestamp)
        formData.append('signature', sigData.signature)
        if (sigData.folder) formData.append('folder', sigData.folder)
        if (sigData.tags) formData.append('tags', sigData.tags)

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${media.mediaType === 'video' ? 'video' : 'image'}/upload`,
          { method: 'POST', body: formData }
        )
        const uploadData = await uploadRes.json()
        finalMediaUrl = uploadData.secure_url
        finalMediaType = media.mediaType
        setIsUploading(false)
      }

      const payload = {}
      if (text) payload.body = text
      if (finalMediaUrl) {
        payload.mediaUrl = finalMediaUrl
        payload.mediaType = finalMediaType
      }

      const res = await fetch(
        `${API_URL}/support/tickets/${selected._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      setMessages(prev => {
        if (prev.some(m => m._id === data.message._id)) {
          return prev.filter(m => m._id !== optimisticMsg._id)
        }
        return prev.map(m => m._id === optimisticMsg._id ? data.message : m)
      })
    } catch (err) {
      console.error('Failed to send reply:', err)
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id))
      setIsUploading(false)
    }
  }

  const handleResolve = () => {
    if (!selected) return;

    styledSwal.fire({
      title: 'Resolve Ticket',
      text: 'Are you sure you want to mark this ticket as resolved? The user will no longer be able to send messages in this chat.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Resolve',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL}/support/tickets/${selected._id}/resolve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (res.ok) {
            setSelected(prev => ({ ...prev, status: 'resolved' }));
            setTickets(prev => prev.map(t => t._id === selected._id ? { ...t, status: 'resolved' } : t));
            styledSwal.fire('Resolved', 'The ticket has been resolved.', 'success');
          } else {
            styledSwal.fire('Error', 'Could not resolve ticket.', 'error');
          }
        } catch (err) {
          console.error('Failed to resolve ticket:', err);
          styledSwal.fire('Error', 'Unable to reach the server.', 'error');
        }
      }
    });
  }

  // Helper to get display name from a ticket
  const getTicketName = (ticket) => {
    if (ticket.userId?.firstName) {
      return `${ticket.userId.firstName} ${ticket.userId.lastName}`
    }
    return 'Unknown User'
  }

  const getTicketRole = (ticket) => {
    return ticket.userId?.role || 'user'
  }

  const filteredTickets = tickets.filter(t => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const name = getTicketName(t).toLowerCase()
    const subject = (t.subject || '').toLowerCase()
    return name.includes(q) || subject.includes(q)
  })

  return (
    <div className="msg-layout">
      {/* Left sidebar — ticket list */}
      <div className="msg-list">
        <div className="msg-search">
          <input 
            type="text" 
            placeholder="Search messages…" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredTickets.map(t => (
          <div
            key={t._id}
            className={`msg-item${selected?._id === t._id ? ' active' : ''}`}
            onClick={() => setSelected(t)}
          >
            <div className="msg-item-head">
              <span className="msg-sender">{getTicketName(t)}</span>
              <span className="msg-time">
                {new Date(t.updatedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="msg-preview">{t.subject}</div>
              {t.status === 'resolved' && (
                <span style={{ fontSize: '10px', backgroundColor: 'var(--border-l)', color: 'var(--text-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>Resolved</span>
              )}
              {t.hasUnreadAdmin && <div className="msg-unread"></div>}
            </div>
          </div>
        ))}
      </div>

      {/* Right side — chat detail */}
      <div className="msg-detail">
        <div className="msg-detail-head">
          <div>
            <div className="msg-detail-name">
              {selected ? getTicketName(selected) : 'Select a conversation'}
            </div>
            <div className="msg-detail-sub">
              {selected ? `${selected.subject} · ${getTicketRole(selected)}` : ''}
            </div>
          </div>
          {selected && (
            <div style={{ display: 'flex', gap: 8 }}>
              {selected.status === 'open' && (
                <button className="btn btn-ghost btn-sm" onClick={handleResolve}>Mark Resolved</button>
              )}
              <span className={`badge ${selected.status === 'open' ? 'red' : 'green'}`}>
                {selected.status === 'open' ? 'Unresolved' : 'Resolved'}
              </span>
            </div>
          )}
        </div>

        <div className="msg-body" ref={bodyRef}>
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`msg-wrapper ${msg.senderRole === 'admin' ? 'out' : 'in'}`}
            >
              <div className={`bubble ${msg.senderRole === 'admin' ? 'out' : 'in'}`}>
                {msg.body && <div style={{ marginBottom: msg.mediaUrl ? 6 : 0 }}>{msg.body}</div>}
                {msg.mediaUrl && msg.mediaType === 'image' && (
                  <img src={msg.mediaUrl} onClick={() => setPreviewImage(msg.mediaUrl)} alt="attachment" />
                )}
                {msg.mediaUrl && msg.mediaType === 'video' && (
                  <video src={msg.mediaUrl} controls />
                )}
              </div>
              <div className={`bubble-time ${msg.senderRole === 'admin' ? 'out-time' : ''}`}>
                {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit', hour12: true
                })}
              </div>
            </div>
          ))}
        </div>

        {selected ? (
          selected.status === 'open' ? (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1.5px solid var(--border-l)' }}>
              {pendingMedia && (
                <div className="msg-pending-media">
                  <button className="msg-pending-close" onClick={cancelPendingMedia}>✕</button>
                  {pendingMedia.mediaType === 'image' ? (
                    <img src={pendingMedia.previewUrl} alt="preview" />
                  ) : (
                    <video src={pendingMedia.previewUrl} />
                  )}
                </div>
              )}
              <div className="msg-input-bar" style={{ borderTop: 'none' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button 
                  className="msg-attachment-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <input
                  className="msg-input"
                  type="text"
                  placeholder="Type a reply…"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                />
                <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Send'}
                </button>
              </div>
            </div>
          ) : (
            <div className="msg-input-bar" style={{ justifyContent: 'center' }}>
              <span style={{ color: '#888' }}>This ticket has been resolved.</span>
            </div>
          )
        ) : (
          <div className="msg-input-bar" style={{ justifyContent: 'center', backgroundColor: 'transparent', borderTop: 'none' }}>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="media-preview-overlay" onClick={() => setPreviewImage(null)}>
          <button className="media-preview-close" onClick={() => setPreviewImage(null)}>✕</button>
          <img src={previewImage} alt="Fullscreen preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
