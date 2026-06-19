import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { getSocket } from '../../../lib/socket';

export default function ChatSidebar({ channel, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft]       = useState('');
  const bottomRef               = useRef(null);

  // Receive messages via socket
  useSocket('chat:message', (msg) => {
    if (msg.channel === channel) {
      setMessages(prev => [...prev, msg]);
    }
  });

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;

    const socket = getSocket();
    const msg = {
      channel,
      text,
      senderId: currentUser?.id,
      senderName: currentUser?.user_metadata?.name ?? currentUser?.email ?? 'You',
      sentAt: new Date().toISOString(),
    };

    // Optimistic local append
    setMessages(prev => [...prev, { ...msg, local: true }]);
    socket?.emit('chat:message', msg);
    setDraft('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-lb-border bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-lb-border">
        <p className="text-[13px] font-medium text-lb-ink">In-call chat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <p className="text-xs text-lb-muted text-center mt-6">Messages are visible to everyone in the call</p>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderId === currentUser?.id || m.local;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-[10px] text-lb-muted mb-0.5">{m.senderName}</span>
              )}
              <div className={`max-w-[85%] px-3 py-1.5 rounded-lg text-[13px] leading-relaxed ${
                isMe
                  ? 'bg-[#7F77DD] text-white rounded-br-sm'
                  : 'bg-lb-surface text-lb-ink rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-lb-border flex gap-2 items-end">
        <textarea
          rows={1}
          aria-label="Type a message"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Send a message…"
          className="flex-1 resize-none text-[13px] px-3 py-2 rounded-lg border border-lb-border focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD] bg-lb-surface text-lb-ink"
          style={{ maxHeight: 96 }}
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="w-8 h-8 rounded-lg bg-[#7F77DD] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#534AB7] transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
