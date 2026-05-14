// ── Roles ──
export const ROLES = {
  ADMIN: 'admin',
  INTERPRETER: 'interpreter',
  CLIENT: 'client',
}
// ── Languages ──
// FROM: English variants (source language)
export const FROM_LANGUAGES = [
  { code: 'en-us', label: 'English (US)', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'en-ca', label: 'English (Canada)', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: 'en-gb', label: 'English (UK)', flag: 'https://flagcdn.com/w40/gb.png' },
]

// TO: Pashto & Punjabi variants (target language)
export const TO_LANGUAGES = [
  { code: 'ps-east', label: 'Pashto (Eastern)', flag: 'https://flagcdn.com/w40/pk.png' },
  { code: 'ps-west', label: 'Pashto (Western)', flag: 'https://flagcdn.com/w40/af.png' },
  { code: 'pa-shahmukhi', label: 'Punjabi (Shahmukhi)', flag: 'https://flagcdn.com/w40/pk.png' },
  { code: 'pa-gurmukhi', label: 'Punjabi (Gurmukhi)', flag: 'https://flagcdn.com/w40/in.png' },
]

// Combined for session summary display
export const ALL_LANGUAGES = [...FROM_LANGUAGES, ...TO_LANGUAGES]
export const LANGUAGE_LABELS = Object.fromEntries(
  ALL_LANGUAGES.map((l) => [l.code, l.label])
)

// ── Session Types ──
export const SESSION_TYPES = [
  { value: 'audio', label: 'Audio Call', icon: 'Headphones' },
  { value: 'video', label: 'Video Call', icon: 'Video' },
]

// ── Durations & Pricing ──
export const DURATIONS = [5, 10, 15, 30, 45, 60]

export const AUDIO_PRICE_PER_MINUTE = 0.99
export const VIDEO_PRICE_PER_MINUTE = 1.20
export const INTERPRETER_AUDIO_PAY = 0.45
export const INTERPRETER_VIDEO_PAY = 0.50
export const PLATFORM_FEE_RATE = 0.05

export function calculatePrice(minutes, sessionType = 'audio') {
  const rate = sessionType === 'video' ? VIDEO_PRICE_PER_MINUTE : AUDIO_PRICE_PER_MINUTE
  const base = minutes * rate
  const fee = base * PLATFORM_FEE_RATE
  return {
    base: Number(base.toFixed(2)),
    fee: Number(fee.toFixed(2)),
    total: Number((base + fee).toFixed(2)),
  }
}

export function calculateInterpreterPay(minutes, sessionType = 'audio') {
  const rate = sessionType === 'video' ? INTERPRETER_VIDEO_PAY : INTERPRETER_AUDIO_PAY
  return Number((minutes * rate).toFixed(2))
}

// ── Interpreter Specialties ──
export const SPECIALTIES = [
  { value: 'medical', label: 'Medical', color: 'bg-slate-100 text-slate-700 border border-slate-200' },
  { value: 'legal', label: 'Legal', color: 'bg-slate-100 text-slate-700 border border-slate-200' },
  { value: 'business', label: 'Business', color: 'bg-slate-100 text-slate-700 border border-slate-200' },
  { value: 'immigration', label: 'Immigration', color: 'bg-slate-100 text-slate-700 border border-slate-200' },
  { value: 'technical', label: 'Technical', color: 'bg-slate-100 text-slate-700 border border-slate-200' },
]

// ── Statuses ──
export const SESSION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
}

export const INTERPRETER_STATUS = {
  ONLINE: 'online',
  BUSY: 'busy',
  OFFLINE: 'offline',
}

// ── Payout Methods ──
export const PAYOUT_METHODS = [
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'wise', label: 'Wise' },
]

// ── API (stub) ──
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  BOOKING: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAIL: (id) => `/bookings/${id}`,
  },
  INTERPRETER: {
    LIST: '/interpreters',
    AVAILABILITY: (id) => `/interpreters/${id}/availability`,
  },
  ADMIN: {
    USERS: '/admin/users',
    SESSIONS: '/admin/sessions',
    TRANSACTIONS: '/admin/transactions',
  },
}

// ── UI ──
export const SIDEBAR_WIDTH = 260
export const TOAST_DURATION = 4000
export const DEBOUNCE_DELAY = 300

// ── Pagination ──
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]