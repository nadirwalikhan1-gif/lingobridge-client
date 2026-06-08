// Messages.jsx — full client messaging
// Target: 9/10 — split-pane layout, real chat, empty states, proper loading

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Send, Phone, Video, MoreVertical,
  ChevronLeft, Paperclip, Check, CheckCheck, Clock,
  Plus, X, Loader2,
} from 'lucide-react';

// ── Mock data — replace with API: GET /api/client/messages ──
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    interpreter: { name: 'Maria Gonzalez', initials: 'MG', online: true },
    lastMessage: { text: 'Thank you for the session today! The deposition went smoothly.', time: '10:32 AM', read: false, sender: 'them' },
    unread: 2,
    sessionContext: 'Legal Deposition — Jan 15, 2024',
  },
  {
    id: 2,
    interpreter: { name: 'John Doe', initials: 'JD', online: false },
    lastMessage: { text: 'See you at the next appointment. I have prepared the medical terminology list.', time: 'Yesterday', read: true, sender: 'them' },
    unread: 0,
    sessionContext: 'Medical Consultation — Jan 12, 2024',
  },
  {
    id: 3,
    interpreter: { name: 'Sarah Chen', initials: 'SC', online: true },
    lastMessage: { text: 'The contract documents have been sent to your email.', time: 'Jan 10', read: true, sender: 'them' },
    unread: 0,
    sessionContext: 'Business Contract — Jan 10, 2024',
  },
  {
    id: 4,
    interpreter: { name: 'Ahmed Hassan', initials: 'AH', online: false },
    lastMessage: { text: "Can we reschedule Thursday's session to Friday morning?", time: 'Jan 08', read: false, sender: 'them' },
    unread: 1,
    sessionContext: 'Legal Consultation — Jan 08, 2024',
  },
];

const MOCK_MESSAGES = {
  1: [
    { id: 1, text: 'Hello Maria, are you available for the deposition at 2 PM?', time: '9:45 AM', sender: 'me', status: 'read' },
    { id: 2, text: 'Yes, I will be ready. I have reviewed the case brief.', time: '9:47 AM', sender: 'them', status: 'read' },
    { id: 3, text: 'Perfect. The client is running 10 minutes late.', time: '10:15 AM', sender: 'me', status: 'read' },
    { id: 4, text: 'No problem, I will wait in the virtual room.', time: '10:16 AM', sender: 'them', status: 'read' },
    { id: 5, text: 'Thank you for the session today! The deposition went smoothly.', time: '10:32 AM', sender: 'them', status: 'delivered' },
  ],
  2: [
    { id: 1, text: 'Hi John, confirming our medical consultation for tomorrow.', time: 'Jan 11, 3:00 PM', sender: 'me', status: 'read' },
    { id: 2, text: 'Confirmed. I have prepared the medical terminology list.', time: 'Jan 11, 3:05 PM', sender: 'them', status: 'read' },
  ],
};

// ── Status icon ──
function MessageStatus({ status }) {
  if (status === 'read') return <CheckCheck size={12} className="text-[#7F77DD]" />;
  if (status === 'delivered') return <Check size={12} className="text-white/30" />;
  return <Clock size={12} className="text-white/20" />;
}

// ── Empty conversation list state ──
function EmptyConversationList({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-16 h-16 rounded-2xl bg-[#7F77DD]/10 flex items-center justify-center mb-4">
        <MessageSquare size={28} className="text-[#7F77DD]" />
      </div>
      <h3 className="text-[16px] font-medium text-white mb-1">No messages yet</h3>
      <p className="text-[13px] text-white/40 text-center max-w-xs mb-5">
        Start a conversation with an interpreter to discuss session details, share documents, or ask questions.
      </p>
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6B64C4] transition-colors"
      >
        <Plus size={14} />
        Start a Conversation
      </button>
    </div>
  );
}

// ── Empty chat state (when no conversation selected) ──
function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-20 h-20 rounded-2xl bg-[#7F77DD]/10 flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-[#7F77DD]" />
      </div>
      <h3 className="text-[18px] font-medium text-white mb-2">Select a conversation</h3>
      <p className="text-[13px] text-white/40 text-center max-w-sm">
        Choose an interpreter from the list to view messages, share files, or schedule follow-up sessions.
      </p>
    </div>
  );
}

// ── New conversation modal ──
function NewConversationModal({ onClose, onStart }) {
  const [search, setSearch] = useState('');
  const interpreters = [
    { id: 101, name: 'Maria Gonzalez', initials: 'MG', language: 'Spanish → English', status: 'online' },
    { id: 102, name: 'John Doe', initials: 'JD', language: 'English → Spanish', status: 'offline' },
    { id: 103, name: 'Sarah Chen', initials: 'SC', language: 'Mandarin → English', status: 'online' },
    { id: 104, name: 'Ahmed Hassan', initials: 'AH', language: 'Arabic → English', status: 'offline' },
  ];

  const filtered = interpreters.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1A2E] border border-white/10 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/8">
          <h3 className="text-[16px] font-semibold text-white">New Conversation</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 border-b border-white/8">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search interpreters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#13111F] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-[13px] text-white/30 py-8">No interpreters found</p>
          ) : (
            filtered.map((interp) => (
              <button
                key={interp.id}
                onClick={() => { onStart(interp); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#7F77DD]/20 flex items-center justify-center">
                    <span className="text-[13px] font-semibold text-[#A8A3E8]">{interp.initials}</span>
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1C1A2E] ${
                    interp.status === 'online' ? 'bg-[#1D9E75]' : 'bg-white/20'
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{interp.name}</p>
                  <p className="text-[11px] text-white/40">{interp.language}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(true);
  const messagesEndRef = useRef(null);

  // Load conversations
  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 400));
      setConversations(MOCK_CONVERSATIONS);
      setMessages(MOCK_MESSAGES);
      setLoading(false);
    };
    load();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const filteredConversations = conversations.filter((c) =>
    c.interpreter.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.text.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!input.trim() || !activeId) return;

    const newMsg = {
      id: Date.now(),
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, lastMessage: { text: input.trim(), time: 'Just now', read: true, sender: 'me' }, unread: 0 }
          : c
      )
    );

    setInput('');

    // Simulate reply after 2s
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeId]: [
          ...(prev[activeId] || []),
          {
            id: Date.now() + 1,
            text: 'Thank you for your message. I will review and get back to you shortly.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: 'them',
            status: 'read',
          },
        ],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: { text: 'Thank you for your message...', time: 'Just now', read: false, sender: 'them' }, unread: 1 }
            : c
        )
      );
    }, 2000);
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setMobileShowList(false);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleStartNew = (interp) => {
    const newConv = {
      id: Date.now(),
      interpreter: { name: interp.name, initials: interp.initials, online: interp.status === 'online' },
      lastMessage: { text: 'Conversation started', time: 'Just now', read: true, sender: 'me' },
      unread: 0,
      sessionContext: 'New conversation',
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setMobileShowList(false);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="h-full flex overflow-hidden bg-[#13111F]">
      {/* ── Conversation List ── */}
      <div className={`${
        mobileShowList ? 'flex' : 'hidden'
      } md:flex flex-col w-full md:w-[320px] lg:w-[360px] border-r border-white/8 bg-[#1C1A2E]`}>
        {/* Header */}
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[16px] font-semibold text-white">Messages</h1>
              <p className="text-[11px] text-white/40">
                {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="p-2 rounded-lg bg-[#7F77DD] text-white hover:bg-[#6B64C4] transition-colors"
              title="New conversation"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#13111F] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={20} className="text-[#7F77DD] animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <EmptyConversationList onStart={() => setShowNewModal(true)} />
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeId === conv.id
                      ? 'bg-[#7F77DD]/15 border border-[#7F77DD]/20'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#7F77DD]/20 flex items-center justify-center">
                      <span className="text-[13px] font-semibold text-[#A8A3E8]">
                        {conv.interpreter.initials}
                      </span>
                    </div>
                    {conv.interpreter.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1D9E75] border-2 border-[#1C1A2E]" />
                    )}
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E24B4A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-[13px] truncate ${conv.unread > 0 ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>
                        {conv.interpreter.name}
                      </p>
                      <span className="text-[10px] text-white/30 shrink-0 ml-2">{conv.lastMessage.time}</span>
                    </div>
                    <p className={`text-[12px] truncate ${conv.unread > 0 ? 'text-white/70 font-medium' : 'text-white/40'}`}>
                      {conv.lastMessage.sender === 'me' && 'You: '}{conv.lastMessage.text}
                    </p>
                    <p className="text-[10px] text-white/20 mt-1">{conv.sessionContext}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className={`${
        !mobileShowList ? 'flex' : 'hidden'
      } md:flex flex-1 flex-col bg-[#13111F]`}>
        {!activeConversation ? (
          <EmptyChat />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-white/8 bg-[#1C1A2E]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowList(true)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#7F77DD]/20 flex items-center justify-center">
                    <span className="text-[12px] font-semibold text-[#A8A3E8]">
                      {activeConversation.interpreter.initials}
                    </span>
                  </div>
                  {activeConversation.interpreter.online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#1D9E75] border-2 border-[#1C1A2E]" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white">{activeConversation.interpreter.name}</p>
                  <p className="text-[11px] text-white/40">
                    {activeConversation.interpreter.online ? 'Online' : 'Offline'} · {activeConversation.sessionContext}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="Voice call">
                  <Phone size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="Video call">
                  <Video size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="More">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[activeId] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === 'me'
                      ? 'bg-[#7F77DD] text-white rounded-br-md'
                      : 'bg-[#1C1A2E] text-white/80 rounded-bl-md border border-white/8'
                  }`}>
                    <p className="text-[13px] leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      msg.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-[10px] text-white/40">{msg.time}</span>
                      {msg.sender === 'me' && <MessageStatus status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/8 bg-[#1C1A2E]">
              <div className="flex items-end gap-2">
                <button className="p-2.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0">
                  <Paperclip size={18} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-[#13111F] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50 resize-none max-h-32"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-lg bg-[#7F77DD] text-white hover:bg-[#6B64C4] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── New Conversation Modal ── */}
      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onStart={handleStartNew}
        />
      )}
    </div>
  );
}