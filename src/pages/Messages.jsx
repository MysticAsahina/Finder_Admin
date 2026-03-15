import { useState } from 'react'

const MESSAGES = [
  { id:1, sender:'Ana Lim', preview:'Complaint about driver behavior…', time:'10:32 AM', subject:'Complaint about driver', content:'Hello, I would like to report that the driver was very rude during my trip earlier today. He refused to follow my preferred route and was quite aggressive.', unread:true },
  { id:2, sender:'Roberto Tan', preview:'Booking issue — no drivers available', time:'9:15 AM', subject:'Booking issue', content:'I tried to book a ride at around 8pm last night but the app kept showing no available drivers. Is there a problem with the system?', unread:true },
  { id:3, sender:'Maria Garcia', preview:'Fare inquiry — discrepancy in amount', time:'Yesterday', subject:'Fare inquiry', content:'Good day! I just want to ask about the current fare rates. The app showed a different amount from what the driver charged me.' },
  { id:4, sender:'John Bautista', preview:'Lost item — left umbrella in tricycle', time:'Yesterday', subject:'Lost item', content:'Hi! I left my umbrella in the tricycle earlier. Can you help me contact the driver?' },
  { id:5, sender:'Lisa Santos', preview:'Great experience using the app!', time:'Mar 6', subject:'General feedback', content:'Just wanted to say that the FINDER app is really convenient! Much better than waiting at the terminal.' },
]

export default function Messages() {
  const [selected, setSelected] = useState(MESSAGES[0])
  const [reply, setReply] = useState('')
  const [replies, setReplies] = useState([])

  const sendReply = () => {
    if (!reply.trim()) return
    setReplies(prev => [...prev, reply])
    setReply('')
  }

  return (
    <div className="msg-layout">
      <div className="msg-list">
        <div className="msg-search">
          <input type="text" placeholder="Search messages…"/>
        </div>
        {MESSAGES.map(m => (
          <div
            key={m.id}
            className={`msg-item${selected?.id === m.id ? ' active' : ''}`}
            onClick={() => { setSelected(m); setReplies([]) }}
          >
            <div className="msg-item-head">
              <span className="msg-sender">{m.sender}</span>
              <span className="msg-time">{m.time}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div className="msg-preview">{m.preview}</div>
              {m.unread && <div className="msg-unread"></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="msg-detail">
        <div className="msg-detail-head">
          <div>
            <div className="msg-detail-name">{selected?.sender}</div>
            <div className="msg-detail-sub">{selected?.subject}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm">Mark Resolved</button>
            <span className="badge red">Unresolved</span>
          </div>
        </div>
        <div className="msg-body">
          <div>
            <div className="bubble in">{selected?.content}</div>
            <div className="bubble-time">{selected?.time}</div>
          </div>
          {replies.map((r, i) => (
            <div key={i} style={{ alignSelf:'flex-end' }}>
              <div className="bubble out">{r}</div>
              <div className="bubble-time out-time">Just now</div>
            </div>
          ))}
        </div>
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
      </div>
    </div>
  )
}
