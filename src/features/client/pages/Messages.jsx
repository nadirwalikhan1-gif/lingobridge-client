import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MessageSquare, Search, Send, Phone, Video, MoreVertical,
  ChevronLeft, Paperclip, Check, CheckCheck, Clock,
  Plus, X, Loader2, FileText, Image
} from 'lucide-react';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/providers/AuthProvider';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchConversations = async (search = '') => {
  const { data } = await api.get('/v1/messages', { params: { search } });
  return data.conversations;
};

const fetchMessages = async (conversationId, before = null) => {
  const { data } = await api.get(`/v1/conversations/${conversationId}/messages`, {
    params: { before, limit: 50 }
  });
  return data;
};

const sendMessage = async ({ conversationId, text, attachments = [] }) => {
  const { data } = await api.post(`/v1/conversations/${conversationId}/messages`, {
    text, attachments
  });
  return data;
};

const markAsRead = async (conversationId) => {
  await api.post(`/v1/conversations/${conversationId}/read`);
};

const startConversation = async (interpreterId) => {
  const { data } = await api.post('/v1/conversations', { interpreterId });
  return data;
};

const searchInterpreters = async (query) => {
  const { data } = await api.get('/v1/interpreters/search', { params: { q: query, limit: 20 } });
  return data.interpreters;
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/v1/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// ─── Message Status Component ───────────────────────────────────────────────
function MessageStatus({ status, readAt }) {
  if (status === 'read' || readAt) return <CheckCheck size={12} className="text-violet-600" />;
  if (status === 'delivered') return <Check size={12} className="text-slate-400" />;
  return <Clock size={12} className="text-slate-300" />;
}

// ─── File Attachment Component ────────────────────────────────────────────────
function FileAttachment({ attachment }) {
  const isImage = attachment.mimeType?.startsWith('image/');

  if (isImage) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-w-[200px]">
        <img 
          src={attachment.url} 
          alt={attachment.name} 
          className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(attachment.url, '_blank')}
        />
      </div>
    );
  }

  return (
    <a 
      href={attachment.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
    >
      <FileText size={14} className="text-white/70" />
      <span className="text-[12px] text-white/90 truncate">{attachment.name}</span>
    </a>
  );
}

// ─── Empty States ───────────────────────────────────────────────────────────
function EmptyConversationList({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <MessageSquare size={28} className="text-violet-600" />
      </div>
      <h3 className="text-[16px] font-medium text-slate-900 mb-1">No messages yet</h3>
      <p className="text-[13px] text-slate-400 text-center max-w-xs mb-5">
        Start a conversation with an interpreter to discuss session details, share documents, or ask questions.
      </p>
      <button 
        onClick={onStart} 
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"
      >
        <Plus size={14} /> Start a Conversation
      </button>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-violet-600" />
      </div>
      <h3 className="text-[18px] font-medium text-slate-900 mb-2">Select a conversation</h3>
      <p className="text-[13px] text-slate-400 text-center max-w-sm">
        Choose an interpreter from the list to view messages, share files, or schedule follow-up sessions.
      </p>
    </div>
  );
}

// ─── New Conversation Modal ─────────────────────────────────────────────────
function NewConversationModal({ onClose, onStart }) {
  const [search, setSearch] = useState('');
  const [selectedInterp, setSelectedInterp] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');

  const { data: interpreters, isLoading } = useQuery({
    queryKey: ['interpreters-search', search],
    queryFn: () => searchInterpreters(search),
    enabled: search.length >= 2,
    staleTime: 60000,
  });

  const sendInitialMutation = useMutation({
    mutationFn: sendMessage,
    onError: () => toast.error('Conversation started, but failed to send first message.'),
  });

  const startMutation = useMutation({
    mutationFn: startConversation,
    onSuccess: async (data) => {
      if (initialMessage.trim()) {
        await sendInitialMutation.mutateAsync({
          conversationId: data.id,
          text: initialMessage.trim(),
        });
      }
      onStart(data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start conversation');
    }
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-[16px] font-bold text-slate-900">New Conversation</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search interpreters by name or language..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-violet-600 animate-spin" />
            </div>
          ) : search.length < 2 ? (
            <p className="text-center text-[13px] text-slate-400 py-8">Type at least 2 characters to search</p>
          ) : !interpreters?.length ? (
            <p className="text-center text-[13px] text-slate-400 py-8">No interpreters found</p>
          ) : (
            interpreters.map((interp) => (
              <button 
                key={interp.id} 
                onClick={() => setSelectedInterp(interp)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                  selectedInterp?.id === interp.id ? 'bg-violet-50 border border-violet-200' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-[13px] font-semibold text-violet-600">{interp.initials}</span>
                  </div>
                  {interp.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-900">{interp.name}</p>
                  <p className="text-[11px] text-slate-400">{interp.languages?.join(' → ')}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {selectedInterp && (
          <div className="p-4 border-t border-slate-100">
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder={`Write your first message to ${selectedInterp.name}...`}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 resize-none mb-3"
            />
            <button
              onClick={() => startMutation.mutate(selectedInterp.id)}
              disabled={startMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {startMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {startMutation.isPending ? 'Starting...' : 'Start Conversation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Messages Component ──────────────────────────────────────────────────
export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Handle URL param for pre-selected interpreter
  useEffect(() => {
    const interpId = searchParams.get('interpreter');
    if (interpId) {
      startConversation(interpId).then(conv => {
        setActiveId(conv.id);
        setMobileShowList(false);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }).catch(() => {
        toast.error('Failed to start conversation');
      });
    }
  }, [searchParams, queryClient]);

  // WebSocket for real-time messages
  const { lastMessage: wsMessage, sendMessage: wsSend } = useWebSocket('/ws/messages');

  useEffect(() => {
    if (wsMessage?.type === 'new_message' && wsMessage.conversationId === activeId) {
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      markAsRead(activeId);
    }
    if (wsMessage?.type === 'typing') {
      setIsTyping(wsMessage.conversationId === activeId);
      setTimeout(() => setIsTyping(false), 3000);
    }
  }, [wsMessage, activeId, queryClient]);

  // Fetch conversations
  const { data: conversations, isLoading: convLoading } = useQuery({
    queryKey: ['conversations', search],
    queryFn: () => fetchConversations(search),
    staleTime: 10000,
  });

  // Fetch messages for active conversation
  const { data: messagesData, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', activeId],
    queryFn: () => fetchMessages(activeId),
    enabled: !!activeId,
    staleTime: 5000,
  });

  const messages = messagesData?.messages ?? [];

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setInput('');
      setAttachments([]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onError: () => toast.error('Failed to upload file')
  });

  const handleSend = useCallback(() => {
    if (!input.trim() && !attachments.length) return;
    if (!activeId) return;

    sendMutation.mutate({
      conversationId: activeId,
      text: input.trim(),
      attachments
    });

    // Send typing indicator via WebSocket
    wsSend({ type: 'typing', conversationId: activeId });
  }, [input, attachments, activeId, sendMutation, wsSend]);

  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      try {
        const result = await uploadMutation.mutateAsync(file);
        setAttachments(prev => [...prev, { id: result.id, url: result.url, name: file.name, mimeType: file.type }]);
      } catch {
        // Error handled by mutation
      }
    }
  }, [uploadMutation]);

  const handleSelect = useCallback((id) => {
    setActiveId(id);
    setMobileShowList(false);
    markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  const handleStartNew = useCallback((conv) => {
    setActiveId(conv.id);
    setMobileShowList(false);
    setShowNewModal(false);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    navigate('/messages', { replace: true });
  }, [queryClient, navigate]);

  const totalUnread = conversations?.reduce((sum, c) => sum + (c.unread ?? 0), 0) ?? 0;
  const activeConversation = conversations?.find((c) => c.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Conversation List */}
      <div className={`flex-col w-full md:w-[320px] lg:w-[360px] border-r border-slate-200 bg-white ${mobileShowList ? "flex" : "hidden md:flex"}`}>
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[16px] font-bold text-slate-900">Messages</h1>
              <p className="text-[11px] text-slate-400">{totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}</p>
            </div>
            <button 
              onClick={() => setShowNewModal(true)} 
              className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors" 
              title="New conversation"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={20} className="text-violet-600 animate-spin" />
            </div>
          ) : !conversations?.length ? (
            <EmptyConversationList onStart={() => setShowNewModal(true)} />
          ) : (
            <div className="p-2 space-y-0.5">
              {conversations.map((conv) => (
                <button 
                  key={conv.id} 
                  onClick={() => handleSelect(conv.id)} 
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                    activeId === conv.id ? "bg-violet-50 border border-violet-100" : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <span className="text-[13px] font-semibold text-violet-600">{conv.interpreter?.initials}</span>
                    </div>
                    {conv.interpreter?.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-[13px] truncate ${conv.unread > 0 ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                        {conv.interpreter?.name}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{conv.lastMessage?.time}</span>
                    </div>
                    <p className={`text-[12px] truncate ${conv.unread > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                      {conv.lastMessage?.sender === 'me' && "You: "}{conv.lastMessage?.text}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1">{conv.sessionContext}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col bg-white ${!mobileShowList ? "flex" : "hidden md:flex"}`}>
        {!activeConversation ? <EmptyChat /> : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileShowList(true)} 
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-[12px] font-semibold text-violet-600">{activeConversation.interpreter?.initials}</span>
                  </div>
                  {activeConversation.interpreter?.online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-900">{activeConversation.interpreter?.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {activeConversation.interpreter?.online ? "Online" : "Offline"} · {activeConversation.sessionContext}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => navigate(`/call?interpreter=${activeConversation.interpreter?.id}&type=audio`)}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors" 
                  title="Voice call"
                >
                  <Phone size={16} />
                </button>
                <button 
                  onClick={() => navigate(`/call?interpreter=${activeConversation.interpreter?.id}&type=video`)}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors" 
                  title="Video call"
                >
                  <Video size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors" title="More">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="text-violet-600 animate-spin" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'me' 
                        ? "bg-violet-600 text-white rounded-br-md" 
                        : "bg-slate-100 text-slate-700 rounded-bl-md border border-slate-200"
                    }`}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      {msg.attachments?.map(att => (
                        <FileAttachment key={att.id} attachment={att} />
                      ))}
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-white/60">{msg.time}</span>
                        {msg.sender === 'me' && <MessageStatus status={msg.status} readAt={msg.readAt} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-2.5 border border-slate-200">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white">
              {attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-1 rounded-lg text-[11px]">
                      <FileText size={10} />
                      <span className="truncate max-w-[100px]">{att.name}</span>
                      <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="hover:text-violet-900">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-colors shrink-0"
                >
                  <Paperclip size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
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
                    onFocus={() => wsSend({ type: 'typing', conversationId: activeId })}
                    placeholder="Type a message..." 
                    rows={1} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 resize-none max-h-32" 
                    style={{ minHeight: "40px" }} 
                  />
                </div>
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() && !attachments.length || sendMutation.isPending}
                  className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  {sendMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-300 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>

      {showNewModal && (
        <NewConversationModal 
          onClose={() => setShowNewModal(false)} 
          onStart={handleStartNew} 
        />
      )}
    </div>
  );
}