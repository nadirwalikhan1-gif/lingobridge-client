import React from 'react';

/**
 * Avatar Component
 * 
 * Displays a user avatar image with a text fallback.
 * 
 * @param {string|null} src - Image URL
 * @param {string} fallback - Fallback initials/text when no image
 * @param {string} className - Additional Tailwind classes
 */
export default function Avatar({ src, fallback = 'U', className = '' }) {
  const [error, setError] = React.useState(false);

  // Show fallback if no src or image failed to load
  if (!src || error) {
    return (
      <div
        className={`rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold ${className}`}
        title={fallback}
      >
        <span className="text-sm">{fallback.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Avatar"
      onError={() => setError(true)}
      className={`rounded-full object-cover ${className}`}
    />
  );
}