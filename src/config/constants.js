// ── Roles ──
export const ROLES = {
  ADMIN: 'admin',
  INTERPRETER: 'interpreter',
  CLIENT: 'client',
}

// ── Languages ──
export const FROM_LANGUAGES = [
  { code: 'en-us', label: 'English (US)', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'en-ca', label: 'English (Canada)', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: 'en-gb', label: 'English (UK)', flag: 'https://flagcdn.com/w40/gb.png' },
]

export const TO_LANGUAGES = [
  { code: 'ps-east', label: 'Pashto (Eastern)', flag: 'https://flagcdn.com/w40/pk.png' },
  { code: 'ps-west', label: 'Pashto (Western)', flag: 'https://flagcdn.com/w40/af.png' },
  { code: 'pa-shahmukhi', label: 'Punjabi (Shahmukhi)', flag: 'https://flagcdn.com/w40/pk.png' },
  { code: 'pa-gurmukhi', label: 'Punjabi (Gurmukhi)', flag: 'https://flagcdn.com/w40/in.png' },
]

export const ALL_LANGUAGES = [...FROM_LANGUAGES, ...TO_LANGUAGES]
export const LANGUAGE_LABELS = Object.fromEntries(
  ALL_LANGUAGES.map((l) => [l.code, l.label])
)

// ── Session Types ──
export const SESSION_TYPES = [
  { value: 'audio', label: 'Audio Call', icon: 'Headphones' },
  { value: 'video', label: 'Video Call', icon: 'Video' },
]

// ── Durations ──
export const DURATIONS = [5, 10, 15, 30, 45, 60]

// FIX: vault-model — client rates (what client pays per active minute)
export const DISPLAY_RATES = {
  audio: 1.49,
  video: 1.79,
}
// Alias — keeps existing imports working until fully migrated
// FIX: vault-model — interpreter earnings (never exposed to client UI)
export const INTERPRETER_EARN_RATES = {
  audio: 0.45,
  video: 0.50,
}

// FIX: vault-model — interpreter hold pay (flat, any session type)
export const INTERPRETER_HOLD_EARN_RATE = 0.10

// FIX: vault-model — minimum payout threshold
export const MIN_PAYOUT = 50.00

// FIX: vault-model — hold tier rates (what client pays during hold)
export const HOLD_TIER_DISPLAY = {
  audio: [
    { label: 'First 5 minutes',  rate: 'Free'        },
    { label: '5–10 minutes',     rate: '$0.65 / min'  },
    { label: 'After 10 minutes', rate: '$1.49 / min'  },
  ],
  video: [
    { label: 'First 5 minutes',  rate: 'Free'        },
    { label: '5–10 minutes',     rate: '$0.75 / min'  },
    { label: 'After 10 minutes', rate: '$1.79 / min'  },
  ],
}

// DEPRECATED: old pricing — remove after full migration
// export const AUDIO_PRICE_PER_MINUTE = 0.99
// export const VIDEO_PRICE_PER_MINUTE = 1.20
// export const PLATFORM_FEE_RATE = 0.05

// FIX: vault-model — client price calculator
export function calculatePrice(minutes, sessionType = 'audio') {
  const rate = DISPLAY_RATES[sessionType] ?? 1.49   // was CLIENT_RATES
  return {
    base:  Number((minutes * rate).toFixed(2)),
    total: Number((minutes * rate).toFixed(2)),
  }
}

// FIX: vault-model — interpreter pay calculator
export function calculateInterpreterPay(minutes, sessionType = 'audio') {
  const rate = INTERPRETER_EARN_RATES[sessionType] ?? 0.45
  return Number((minutes * rate).toFixed(2))
}

// FIX: vault-model — hold cost calculator (client perspective)
export function calculateHoldCost(holdMinutes, sessionType = 'audio') {
  const tiers = HOLD_TIERS[sessionType] ?? HOLD_TIERS.audio
  let cost = 0
  let cursor = 0

  for (const tier of tiers) {
    if (cursor >= holdMinutes) break
    const tierEnd = Math.min(holdMinutes, tier.upTo)
    const minutesInTier = tierEnd - cursor
    if (minutesInTier <= 0) continue
    cost += minutesInTier * tier.rate
    cursor = tierEnd
  }

  return Number(cost.toFixed(2))
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

// ── API ──
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