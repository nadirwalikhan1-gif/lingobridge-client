import React from 'react';
import { Calendar, Heart, Star, ArrowRight, Clock, Video, Phone } from 'lucide-react';

// StatCard component inline (no external import needed)
function StatCard({ label, value, trendValue, icon: Icon }) {
  const getTrendColor = () => {
    if (!trendValue) return 'text-slate-500';
    if (trendValue.startsWith('+')) return 'text-emerald-600';
    if (trendValue.startsWith('-')) return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          {trendValue && (
            <p className={`text-xs font-medium mt-1.5 ${getTrendColor()}`}>
              {trendValue}
            </p>
          )}
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          {Icon && <Icon className="w-4 h-4 text-slate-600" />}
        </div>
      </div>
    </div>
  );
}

// SessionHistoryList component inline
function SessionHistoryList({ maxItems }) {
  const demoSessions = [
    {
      id: 1,
      interpreter: { name: 'Maria Gonzalez', initials: 'MG' },
      type: 'video',
      language: 'Spanish → English',
      duration: '45 min',
      price: 32.50,
      rating: 5,
      date: '2024-01-15',
    },
    {
      id: 2,
      interpreter: { name: 'John Doe', initials: 'JD' },
      type: 'audio',
      language: 'French → English',
      duration: '30 min',
      price: 22.00,
      rating: 4,
      date: '2024-01-12',
    },
    {
      id: 3,
      interpreter: { name: 'Sarah Chen', initials: 'SC' },
      type: 'video',
      language: 'Mandarin → English',
      duration: '60 min',
      price: 45.00,
      rating: 5,
      date: '2024-01-10',
    },
  ];

  const sessions = maxItems ? demoSessions.slice(0, maxItems) : demoSessions;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Recent Sessions</h3>
        <button className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-slate-600">{s.interpreter.initials}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800 truncate">{s.interpreter.name}</p>
                {s.type === 'video' ? (
                  <Video className="w-3 h-3 text-violet-500 flex-shrink-0" />
                ) : (
                  <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500">{s.language} • {s.duration}</p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <p className="text-sm font-semibold text-slate-800">${s.price.toFixed(2)}</p>
              <p className="text-[10px] text-slate-400">{s.date}</p>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < s.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Sessions',
      value: '24',
      trendValue: '+3 this month',
      icon: Calendar,
    },
    {
      label: 'Favourites',
      value: '12',
      trendValue: '+2 new',
      icon: Heart,
    },
    {
      label: 'Rating',
      value: '4.9',
      trendValue: 'Top 5%',
      icon: Star,
    },
  ];

  const quickActions = [
    { icon: Video, label: 'Book Video Session', description: 'Face-to-face interpretation', color: 'bg-violet-50 text-violet-600' },
    { icon: Phone, label: 'Book Audio Session', description: 'Voice-only interpretation', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Clock, label: 'Schedule Later', description: 'Plan your next session', color: 'bg-amber-50 text-amber-600' },
  ];

  const recentActivity = [
    { type: 'session', text: 'Completed video session with Maria G.', time: '2 hours ago' },
    { type: 'review', text: 'Left a 5-star review for John D.', time: 'Yesterday' },
    { type: 'wallet', text: 'Added $50.00 to wallet', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <SessionHistoryList maxItems={3} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'session' ? 'bg-violet-50 text-violet-600' :
                activity.type === 'review' ? 'bg-amber-50 text-amber-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {activity.type === 'session' ? <Video className="w-4 h-4" /> :
                 activity.type === 'review' ? <Star className="w-4 h-4" /> :
                 <Clock className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800">{activity.text}</p>
                <p className="text-xs text-slate-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}