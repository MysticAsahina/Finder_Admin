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
  const socketRef = useRef(null)
  const bodyRef = useRef(null)

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
        return [...prev, newMsg]
      })
    })

    socket.on('new_ticket', (ticket) => {
      if (ticket.userRole === role) {
        setTickets(prev => [ticket, ...prev])
      }
    })

    socket.on('ticket_updated', ({ ticketId, updatedAt, status }) => {
      setTickets(prev => {
        const updated = prev.map(t =>
          t._id === ticketId
            ? { ...t, updatedAt, ...(status ? { status } : {}) }
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

    async function loadMessages() {
      const res = await fetch(
        `${API_URL}/support/tickets/${selected._id}/messages`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
      const data = await res.json()
      setMessages(data.messages || [])
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

  const sendReply = async () => {
    if (!reply.trim() || !selected) return

    const text = reply.trim()
    setReply('')

    // Optimistically add the message to the UI
    const optimisticMsg = {
      _id: Date.now().toString(),
      ticketId: selected._id,
      senderId: '',
      senderRole: 'admin',
      body: text,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await fetch(
        `${API_URL}/support/tickets/${selected._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ body: text }),
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

  return (
    <div className="msg-layout">
      {/* Left sidebar — ticket list */}
      <div className="msg-list">
        <div className="msg-search">
          <input type="text" placeholder="Search messages…" />
        </div>
        {tickets.map(t => (
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
              {t.status === 'open' && <div className="msg-unread"></div>}
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
                {msg.body}
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
            <div className="msg-input-bar">
              <input
                className="msg-input"
                type="text"
                placeholder="Type a reply…"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
              />
              <button className="btn btn-primary btn-sm" onClick={sendReply}>Send</button>
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
    </div>
  )
}
