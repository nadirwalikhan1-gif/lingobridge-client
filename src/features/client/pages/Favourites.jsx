import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, Video, Search, ArrowRight } from 'lucide-react';
import { StarRating } from '@/features/client/components/dashboard/SessionHistoryList';

export default function Favourites() {
  const navigate = useNavigate();
  const [removed, setRemoved] = useState([]);

  const allFavourites = [
    {
      id: 1,
      name: 'Maria Gonzalez',
      initials: 'MG',
      languages: 'Spanish, English',
      rating: 5,
      reviews: 48,
      rate: '$0.75/min',
      specialties: ['Medical', 'Legal'],
    },
    {
      id: 2,
      name: 'John Doe',
      initials: 'JD',
      languages: 'French, English',
      rating: 4,
      reviews: 32,
      rate: '$0.65/min',
      specialties: ['Business', 'Technical'],
    },
    {
      id: 3,
      name: 'Sarah Chen',
      initials: 'SC',
      languages: 'Mandarin, English',
      rating: 5,
      reviews: 67,
      rate: '$0.80/min',
      specialties: ['Business', 'Medical'],
    },
  ];

  // Filter out removed favourites
  const favourites = allFavourites.filter((f) => !removed.includes(f.id));

  const handleRemove = (id) => {
    setRemoved((prev) => [...prev, id]);
  };

  const handleBook = (interpreterId, type) => {
    // Wire to /client/booking with URL params
    navigate(`/client/booking?interpreter=${interpreterId}&type=${type}`);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Favourites</h1>
      </div>

      {favourites.length === 0 ? (
        /* Empty State */
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-base font-medium text-slate-600 mb-2">No favourites yet</p>
          <p className="text-sm text-slate-400 mb-4 max-w-xs mx-auto">
            Save your preferred interpreters to book them quickly next time
          </p>
          <button
            onClick={() => navigate('/client/booking')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lb-primary text-white text-sm font-medium rounded-lg hover:bg-lb-deep transition-colors"
          >
            <Search className="w-4 h-4" />
            Find Interpreters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {favourites.map((fav) => (
            <div
              key={fav.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-600">{fav.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{fav.name}</h3>
                      <p className="text-xs text-slate-500">{fav.languages}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(fav.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove from favourites"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <StarRating rating={fav.rating} size="w-3 h-3" />
                      <span className="text-xs text-slate-500">({fav.reviews})</span>
                    </div>
                    <span className="text-xs font-medium text-slate-600">{fav.rate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    {fav.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Quick Book Buttons - wired with navigation */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleBook(fav.id, 'audio')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Audio
                    </button>
                    <button
                      onClick={() => handleBook(fav.id, 'video')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                    >
                      <Video className="w-3 h-3" />
                      Video
                    </button>
                    <button
                      onClick={() => navigate(`/client/booking?interpreter=${fav.id}`)}
                      className="ml-auto flex items-center gap-1 text-xs font-medium text-lb-primary hover:text-lb-deep transition-colors"
                    >
                      View Profile
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
