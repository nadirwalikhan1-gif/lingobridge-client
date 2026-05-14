export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
]

export const sessionTypes = [
  { id: 'audio', name: 'Audio Call', description: 'Best for quick conversations', icon: 'Headphones' },
  { id: 'video', name: 'Video Call', description: 'Best for detailed communication', icon: 'Video' },
]

export const durations = [
  { minutes: 15, price: 6.00 },
  { minutes: 30, price: 12.00 },
  { minutes: 45, price: 18.00 },
  { minutes: 60, price: 24.00 },
  { minutes: 90, price: 36.00 },
]

export const categories = [
  { id: 'medical', name: 'Medical', icon: 'Heart', color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'legal', name: 'Legal', icon: 'Scale', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'business', name: 'Business', icon: 'Briefcase', color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: 'text-violet-500', bg: 'bg-violet-50' },
  { id: 'general', name: 'General', icon: 'MoreHorizontal', color: 'text-slate-500', bg: 'bg-slate-50' },
]

export const recommendedInterpreters = [
  { id: 1, name: 'Maria Garcia', rating: 4.9, reviews: 128, languages: ['Spanish'], specialty: 'Medical', specialtyColor: 'bg-rose-100 text-rose-700', price: 12.00, avatar: 'https://i.pravatar.cc/150?u=2', online: true },
  { id: 2, name: 'Carlos Ruiz', rating: 4.8, reviews: 97, languages: ['Spanish'], specialty: 'Legal', specialtyColor: 'bg-blue-100 text-blue-700', price: 12.00, avatar: 'https://i.pravatar.cc/150?u=20', online: true },
  { id: 3, name: 'Aisha Khan', rating: 4.9, reviews: 156, languages: ['Spanish', 'English'], specialty: 'Business', specialtyColor: 'bg-amber-100 text-amber-700', price: 12.00, avatar: 'https://i.pravatar.cc/150?u=21', online: true },
  { id: 4, name: 'David Lee', rating: 4.7, reviews: 86, languages: ['Spanish', 'English'], specialty: 'General', specialtyColor: 'bg-slate-100 text-slate-700', price: 12.00, avatar: 'https://i.pravatar.cc/150?u=7', online: true },
]

export const savedPaymentMethods = [
  { id: 'visa', type: 'visa', last4: '4242', expiry: '12/26', default: true },
  { id: 'mastercard', type: 'mastercard', last4: '8888', expiry: '10/25', default: false },
  { id: 'paypal', type: 'paypal', email: 'john.doe@example.com', default: false },
]