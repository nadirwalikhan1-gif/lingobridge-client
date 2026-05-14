import React, { useState } from 'react';
import { Camera, Save, X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

// Shared input class constant - eliminates 6 duplications
const inputClass = "w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500";

// Profile stats object for easy future data wiring
const profileStats = {
  sessions: 24,
  rating: 4.9,
  spent: 342,
};

export default function Profile() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    language: 'en',
    timezone: 'America/New_York',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Profile Header */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* FIX: Avatar src from user context/prop instead of hardcoded path */}
            <Avatar
              src={null} // Replace with user?.avatar when available
              fallback="JD"
              className="w-16 h-16"
            />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-lb-primary text-white rounded-full flex items-center justify-center shadow-sm hover:bg-lb-deep transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{formData.firstName} {formData.lastName}</h1>
            <p className="text-sm text-slate-500">{formData.email}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{profileStats.sessions}</p>
            <p className="text-xs text-slate-500">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{profileStats.rating}</p>
            <p className="text-xs text-slate-500">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">${profileStats.spent}</p>
            <p className="text-xs text-slate-500">Spent</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">Personal Information</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="zh">Mandarin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Timezone</label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {/* FIX: Cancel button wired with type="reset" to clear unsaved edits */}
          <button
            type="reset"
            onClick={() => setFormData({
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1 (555) 123-4567',
              language: 'en',
              timezone: 'America/New_York',
            })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-lb-primary hover:bg-lb-deep rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
