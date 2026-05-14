import React, { useState } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Calendar } from 'lucide-react';

export default function Messages() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  // Demo contacts data
  const contacts = [
    {
      id: 1,
      name: 'Maria Gonzalez',
      initials: 'MG',
      lastMessage: 'Thank you for the session!',
      time: '2h ago',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'John Doe',
      initials: 'JD',
      lastMessage: 'Can we reschedule?',
      time: '5h ago',
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: 'Sarah Chen',
      initials: 'SC',
      lastMessage: "I'll be ready at 3pm",
      time: '1d ago',
      unread: 1,
      online: true,
    },
  ];

  const messages = [
    { id: 1, sender: 'them', text: 'Hi! Are you available for a session tomorrow?', time: '10:30 AM' },
    { id: 2, sender: 'me', text: "Yes, I'm free at 2pm. Would that work?", time: '10:32 AM' },
    { id: 3, sender: 'them', text: "Perfect! I'll book it now.", time: '10:33 AM' },
  ];

  return (
    /* FIX: h-full instead of fragile h-[calc(100vh-44px-12px)] */
    <div className="flex h-full bg-white rounded-xl border border-slate-100 overflow-hidden">
      {/* Contacts List - responsive width */}
      <div className="w-48 sm:w-56 flex-shrink-0 border-r border-slate-100 flex flex-col">
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-lb-primary/20 focus:border-lb-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Empty state for contacts */}
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">No conversations yet</p>
              <p className="text-xs text-slate-400 mb-3">Start by booking a session with an interpreter</p>
              <a
                href="/client/booking"
                className="px-3 py-1.5 bg-lb-primary text-white text-xs font-medium rounded-lg hover:bg-lb-deep transition-colors"
              >
                Book a Session
              </a>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-2.5 p-3 text-left transition-colors ${
                  selectedContact?.id === contact.id
                    ? 'bg-violet-50' // Active contact highlight
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-600">{contact.initials}</span>
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800 truncate">{contact.name}</p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{contact.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{contact.lastMessage}</p>
                </div>
                {/* FIX: Unread badge uses bg-rose-500 to differentiate from active highlight */}
                {contact.unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {contact.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-600">{selectedContact.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{selectedContact.name}</p>
                  <p className="text-xs text-emerald-600">{selectedContact.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${
                      msg.sender === 'me'
                        ? 'bg-lb-primary text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-lb-primary/20 focus:border-lb-primary"
                />
                <button className="p-2 bg-lb-primary text-white rounded-lg hover:bg-lb-deep transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state when no contact selected */
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-base font-medium text-slate-600 mb-2">Select a conversation</p>
            <p className="text-sm text-slate-400 max-w-xs">Choose an interpreter from the list to start messaging or view your conversation history</p>
          </div>
        )}
      </div>
    </div>
  );
}