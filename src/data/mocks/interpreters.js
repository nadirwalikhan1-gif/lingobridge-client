export const topInterpreters = [
  { id: 1, name: 'Khalid Ahmadzai', rating: 4.9, sessions: 128, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 2, name: 'Rajinder Singh', rating: 4.8, sessions: 97, avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 3, name: 'Sadia Butt', rating: 4.7, sessions: 86, avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 4, name: 'Noorullah Wardak', rating: 4.6, sessions: 74, avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 5, name: 'Amrit Kaur', rating: 4.5, sessions: 63, avatar: 'https://i.pravatar.cc/150?u=8' },
]
export const interpreterStats = {
  todayEarnings: 124.50,
  rating: 4.8,
  sessionsToday: 6,
  hoursToday: '3h 20m',
  monthlyEarnings: 1245.75,
  weeklyEarnings: 850.50,
  lastWeekEarnings: 680.25,
}

export const incomingRequests = [
  { 
    id: 1, 
    type: 'New',
    fromLanguage: 'English (Canada)', 
    toLanguage: 'Pashto (Eastern)', 
    duration: '30 min', 
    sessionType: 'Video Call',
    client: 'Nasrin Ahmadi',
    timeAgo: '2 mins ago',
    price: 12.00,
    avatar: 'https://i.pravatar.cc/150?u=10'
  },
  { 
    id: 2, 
    type: 'New',
    fromLanguage: 'English (US)', 
    toLanguage: 'Punjabi (Shahmukhi)', 
    duration: '15 min', 
    sessionType: 'Audio Call',
    client: 'Parveen Malik',
    timeAgo: '5 mins ago',
    price: 6.00,
    avatar: 'https://i.pravatar.cc/150?u=11'
  },
  { 
    id: 3, 
    type: 'Scheduled',
    fromLanguage: 'English (UK)', 
    toLanguage: 'Punjabi (Gurmukhi)', 
    duration: '60 min', 
    sessionType: 'Video Call',
    client: 'Gurjeet Kaur',
    time: 'Today, 11:00 AM',
    price: 24.00,
    avatar: 'https://i.pravatar.cc/150?u=12'
  },
]

export const todaysSchedule = [
  { time: '11:00 AM', duration: '60 min', fromLanguage: 'English (UK)', toLanguage: 'Punjabi (Gurmukhi)', type: 'Video Call', status: 'Scheduled', price: 24.00, avatar: 'https://i.pravatar.cc/150?u=12' },
  { time: '02:30 PM', duration: '30 min', fromLanguage: 'English (Canada)', toLanguage: 'Pashto (Western)', type: 'Audio Call', status: 'Scheduled', price: 12.00, avatar: 'https://i.pravatar.cc/150?u=13' },
  { time: '04:00 PM', duration: '15 min', fromLanguage: 'English (US)', toLanguage: 'Punjabi (Shahmukhi)', type: 'Audio Call', status: 'Scheduled', price: 6.00, avatar: 'https://i.pravatar.cc/150?u=11' },
]

export const availabilitySchedule = [
  { day: 'Mon', startTime: '9:00 AM', endTime: '5:00 PM', available: true },
  { day: 'Tue', startTime: '9:00 AM', endTime: '5:00 PM', available: true },
  { day: 'Wed', startTime: '9:00 AM', endTime: '5:00 PM', available: true },
  { day: 'Thu', startTime: '9:00 AM', endTime: '5:00 PM', available: true },
  { day: 'Fri', startTime: '9:00 AM', endTime: '5:00 PM', available: true },
  { day: 'Sat', available: false },
  { day: 'Sun', available: false },
]

export const recentSessions = [
  { id: 1, fromLanguage: 'English (Canada)', toLanguage: 'Pashto (Eastern)', duration: '30 min', type: 'Video Call', status: 'Completed', price: 12.00, time: 'Today, 10:30 AM', avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 2, fromLanguage: 'English (US)', toLanguage: 'Punjabi (Shahmukhi)', duration: '15 min', type: 'Audio Call', status: 'Completed', price: 6.00, time: 'Today, 09:15 AM', avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 3, fromLanguage: 'English (UK)', toLanguage: 'Punjabi (Gurmukhi)', duration: '45 min', type: 'Video Call', status: 'Completed', price: 18.00, time: 'Yesterday, 07:45 PM', avatar: 'https://i.pravatar.cc/150?u=14' },
]

export const earningsChartData = [
  { date: 'May 12', earnings: 50 },
  { date: 'May 13', earnings: 110 },
  { date: 'May 14', earnings: 85 },
  { date: 'May 15', earnings: 140 },
  { date: 'May 16', earnings: 100 },
  { date: 'May 17', earnings: 120 },
  { date: 'May 18', earnings: 200 },
]