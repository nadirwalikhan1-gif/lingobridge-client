// Help.jsx — Interpreter Help & Support Page
// No live data needed — static content + contact form via socket

import { useState } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import {
  HelpCircle, MessageSquare, BookOpen, ChevronDown,
  ChevronUp, CheckCircle2, AlertCircle, ExternalLink, Mail
} from 'lucide-react'

// ── FAQ data — static content, not mock API data ──────────────────────────────
const FAQS = [
  {
    q: 'How do I get paid?',
    a: 'Earnings from completed sessions are added to your available balance after a 3-day hold period. You can request a withdrawal from the Payouts page once your balance reaches $50.',
  },
  {
    q: 'How does session acceptance work?',
    a: 'When a client requests an interpreter, you receive a real-time notification. You have a limited window to accept or decline. Unanswered requests expire automatically and do not count against your acceptance rate.',
  },
  {
    q: 'What happens if a client does not show up?',
    a: 'If a client fails to join within the grace period, the session is marked as a no-show. You will receive a no-show fee based on your session type and duration.',
  },
  {
    q: 'How do I update my availability?',
    a: 'Go to the Availability page and set your weekly schedule or toggle your real-time online status. Clients can only book sessions during times you have marked as available.',
  },
  {
    q: 'Can I cancel a session I have already accepted?',
    a: 'Yes, but late cancellations (under 1 hour before the session) may affect your reliability score. Navigate to My Sessions and select the session to cancel.',
  },
  {
    q: 'How is my rating calculated?',
    a: 'Your rating is the average of all star ratings left by clients after completed sessions. Ratings below 3 stars trigger an optional review by our quality team.',
  },
  {
    q: 'How do I dispute a review?',
    a: 'If you believe a review violates our guidelines, contact support from this page with the session ID and your reason. Our team reviews disputes within 3 business days.',
  },
  {
    q: 'What languages and specialties can I list?',
    a: 'You can list any languages you are proficient in and any specialty areas (medical, legal, business, etc.) from your Profile page. Specialties help clients find interpreters with relevant experience.',
  },
]

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-lb-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-start justify-between gap-3 w-full py-3.5 text-left"
      >
        <p className="text-[13px] font-medium text-lb-ink leading-snug">{faq.q}</p>
        {open
          ? <ChevronUp   className="w-4 h-4 text-lb-subtle shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-lb-subtle shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <p className="text-[13px] text-lb-muted leading-relaxed pb-3.5 -mt-1 pr-7">
          {faq.a}
        </p>
      )}
    </div>
  )
}

// ── Contact form ──────────────────────────────────────────────────────────────
const SUBJECTS = [
  'Payout or earnings issue',
  'Session or scheduling issue',
  'Technical problem',
  'Account or profile issue',
  'Review dispute',
  'Other',
]

function ContactForm({ user }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending,  setSending]  = useState(false)
  const [result,   setResult]   = useState(null)   // { ok, text }

  function handleSend() {
    if (!subject || !message.trim()) return
    const socket = getSocket()
    if (!socket) {
      setResult({ ok: false, text: 'Not connected. Please try again.' })
      return
    }
    setSending(true)
    setResult(null)

    socket.emit('submit-support-ticket', {
      userId:  user?.id,
      email:   user?.email,
      subject,
      message: message.trim(),
    })

    const onAck = (data) => {
      socket.off('support-ticket-ack', onAck)
      setSending(false)
      if (data?.ok) {
        setResult({ ok: true, text: `Ticket submitted. Reference: ${data.ticketId ?? 'pending'}. We'll reply to ${user?.email} within 24 hours.` })
        setSubject('')
        setMessage('')
      } else {
        setResult({ ok: false, text: data?.reason ?? 'Failed to submit. Try again or email support directly.' })
      }
    }

    socket.on('support-ticket-ack', onAck)

    // Timeout if no ack
    setTimeout(() => {
      socket.off('support-ticket-ack', onAck)
      if (sending) {
        setSending(false)
        setResult({ ok: false, text: 'Request timed out. Please try again or email us directly.' })
      }
    }, 10000)
  }

  return (
    <div className="lb-card rounded-lb-card p-4 mb-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-[#534AB7]" />
        </div>
        <p className="text-[13px] font-semibold text-lb-ink">Contact support</p>
      </div>

      {result && (
        <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl mb-3 ${
          result.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
        }`}>
          {result.ok
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            : <AlertCircle  className="w-4 h-4 text-red-500    shrink-0 mt-0.5" />
          }
          <p className={`text-[12px] leading-relaxed ${result.ok ? 'text-emerald-800' : 'text-red-700'}`}>
            {result.text}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {/* Subject */}
        <div>
          <label className="text-[11px] font-medium text-lb-subtle uppercase tracking-wider block mb-1">
            Subject
          </label>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-3 py-2 text-[13px] text-lb-ink bg-lb-surface border border-lb-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7F77DD] focus:border-[#7F77DD]"
          >
            <option value="">Select a topic…</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="text-[11px] font-medium text-lb-subtle uppercase tracking-wider block mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your issue in detail. Include any session IDs or dates that are relevant."
            rows={4}
            className="w-full px-3 py-2 text-[13px] text-lb-ink bg-lb-surface border border-lb-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7F77DD] focus:border-[#7F77DD] resize-none"
          />
          <p className="text-[11px] text-lb-subtle mt-1 text-right">{message.length} / 1000</p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !subject || !message.trim()}
          className="w-full py-2.5 rounded-lb-button text-[13px] font-semibold text-white bg-[#7F77DD] hover:bg-[#534AB7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Help() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-medium text-lb-ink pb-1 mb-4">Help &amp; Support</h1>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <a
          href="mailto:support@Andiraw.com"
          className="lb-card rounded-lb-card p-3.5 flex items-center gap-3 hover:bg-lb-surface transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-[#534AB7]" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-lb-ink">Email us</p>
            <p className="text-[11px] text-lb-muted">support@Andiraw.com</p>
          </div>
        </a>
        <a
          href="https://docs.Andiraw.com"
          target="_blank"
          rel="noopener noreferrer"
          className="lb-card rounded-lb-card p-3.5 flex items-center gap-3 hover:bg-lb-surface transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#534AB7]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[12px] font-semibold text-lb-ink">Documentation</p>
              <ExternalLink className="w-3 h-3 text-lb-subtle" />
            </div>
            <p className="text-[11px] text-lb-muted">Guides and tutorials</p>
          </div>
        </a>
      </div>

      {/* Contact form */}
      <ContactForm user={user} />

      {/* FAQ */}
      <div className="lb-card rounded-lb-card px-4 pb-2">
        <div className="flex items-center gap-2 py-3 border-b border-lb-border mb-1">
          <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5 text-[#534AB7]" />
          </div>
          <p className="text-[13px] font-semibold text-lb-ink">Frequently asked questions</p>
        </div>
        {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
      </div>
    </div>
  )
}
