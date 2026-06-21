import React from 'react';
export default function Avatar({ src, fallback = 'U', className = '', ring = false }) {
  const [error, setError] = React.useState(false);
  const ringClass = ring ? 'ring-2 ring-lb-primary/20 ring-offset-1' : '';
  if (!src || error) {
    return (
      <div className={`rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#4C3FCC] font-bold ${ringClass} ${className}`} title={fallback}>
        <span className="text-[11px] leading-none">{fallback.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }
  return <img src={src} alt="Avatar" onError={() => setError(true)} className={`rounded-full object-cover ${ringClass} ${className}`} />;
}
