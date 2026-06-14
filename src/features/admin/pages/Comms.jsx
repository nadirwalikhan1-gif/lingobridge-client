// Comms.jsx — Admin communications and support inbox
// Messages between clients, interpreters, and platform support.

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from "../../../lib/api";
import ErrorState from '../../../components/ui/ErrorState'

const FILTERS = ['All', 'Unread', 'Support', 'Disputes', 'System']

export default function Comms() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedThread, setSelectedThread] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const { data: threads, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'communications'],
    queryFn: () => api.get('/v1/admin/communications'),
    staleTime: 30000,
  })

  const filtered = useMemo(() => {
    if (!threads) return []
    return threads.filter(t => {
      const matchType = filter === 'All'
        || (filter === 'Unread' && t.unreadCount > 0)
        || (filter === 'Support' && t.type === 'support')
        || (filter === 'Disputes' && t.type === 'dispute')
        || (filter === 'System' && t.type === 'system')
      const matchSearch = t.participants?.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
        || t.lastMessage?.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [threads, filter, search])

  const activeThread = threads?.find(t => t.id === selectedThread)

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedThread) return
    setSendingReply(true)
    try {
      await api.post(`/v1/admin/communications/${selectedThread}/reply`, {
        text: replyText,
      })
      setReplyText('')
      refetch()
    } catch (err) {
      console.error('Failed to send reply:', err)
    } finally {
      setSendingReply(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
        <div className="h-[70vh] bg-lb-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />
  }

  return (
    <div className="space-y-3 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Platform communications</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Comms</h1>
        </div>
      </div>

      <div className="flex gap-3 h-full">
        {/* Thread list */}
        <div className="w-80 flex flex-col gap-3">
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded border transition-colors ${
                  filter === f
                    ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
                    : 'bg-white text-lb-muted border-lb-border hover:bg-lb-surface'
                }`}
              >
                {f}
                {f === 'Unread' && threads?.some(t => t.unreadCount > 0) && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#A32D2D] text-white text-[9px]">
                    {threads.filter(t => t.unreadCount > 0).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search threads…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-[11px] border border-lb-border rounded px-3 py-1.5 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD]"
          />

          <div className="lb-card flex-1 overflow-y-auto">
            {threads?.length === 0 ? (
              <p className="text-[12px] text-lb-muted text-center py-8">No communications</p>
            ) : (
              <div className="divide-y divide-lb-border">
                {filtered.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThread(t.id)}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      selectedThread === t.id ? 'bg-[#EEEDFE]/50' : 'hover:bg-lb-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-medium text-lb-ink truncate">{t.subject}</p>
                        {t.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#A32D2D] text-white text-[9px] font-semibold shrink-0">
                            {t.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-lb-subtle shrink-0">{t.lastActive}</span>
                    </div>
                    <p className="text-[10px] text-lb-muted truncate">{t.lastMessage}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {t.participants?.slice(0, 3).map((p, i) => (
                        <div key={i} className="w-4 h-4 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[7px] font-medium text-[#534AB7]">
                          {p.initials}
                        </div>
                      ))}
                      <span className="text-[9px] text-lb-subtle">
                        {t.participants?.length > 3 ? `+${t.participants.length - 3}` : ''}
                      </span>
                      <span className={`text-[9px] font-medium px-1 py-0.5 rounded ml-auto ${
                        t.type === 'support' ? 'bg-[#EEEDFE] text-[#534AB7]' :
                        t.type === 'dispute' ? 'bg-[#FCEBEB] text-[#A32D2D]' :
                        t.type === 'system' ? 'bg-lb-surface text-lb-muted' :
                        'bg-[#E1F5EE] text-[#0F6E56]'
                      }`}>
                        {t.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && threads?.length > 0 && (
              <p className="text-[12px] text-lb-muted text-center py-8">No threads match</p>
            )}
          </div>
        </div>

        {/* Thread detail */}
        <div className="flex-1 lb-card flex flex-col">
          {!activeThread ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-lb-muted">Select a thread to view messages</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-lb-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-lb-ink">{activeThread.subject}</p>
                    <p className="text-[10px] text-lb-muted">
                      {activeThread.participants?.map(p => p.name).join(', ')}
                    </p>
                  </div>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                    activeThread.type === 'support' ? 'bg-[#EEEDFE] text-[#534AB7]' :
                    activeThread.type === 'dispute' ? 'bg-[#FCEBEB] text-[#A32D2D]' :
                    'bg-lb-surface text-lb-muted'
                  }`}>
                    {activeThread.type}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {activeThread.messages?.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.fromAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 ${
                      msg.fromAdmin ? 'bg-[#7F77DD] text-white' : 'bg-lb-surface text-lb-muted'
                    }`}>
                      {msg.initials}
                    </div>
                    <div className={`max-w-[70%] px-3 py-2 rounded-lg ${
                      msg.fromAdmin
                        ? 'bg-[#7F77DD] text-white'
                        : 'bg-lb-surface text-lb-ink'
                    }`}>
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      <p className={`text-[9px] mt-1 ${msg.fromAdmin ? 'text-white/60' : 'text-lb-subtle'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-lb-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type a reply…"
                    className="flex-1 text-[11px] border border-lb-border rounded px-3 py-2 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD]"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="px-3 py-2 rounded bg-[#7F77DD] text-white text-[11px] font-medium hover:bg-[#534AB7] transition-colors disabled:opacity-50"
                  >
                    {sendingReply ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
