import { useEffect, useRef } from 'react';

// Renders a single Agora video track into a div.
// Shows muted/camera-off indicators for remote users.

export default function VideoTile({ track, label, avatarInitials, muted = false, camOff = false, isLocal = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
  if (!track || !containerRef.current) return;
  track.play(containerRef.current);
  // Prevent cropping — show full face without zoom
  const video = containerRef.current.querySelector('video');
  if (video) video.style.objectFit = 'contain';
  return () => track.stop();
}, [track]);

  const showAvatar = !track || camOff;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#1a1a2e]">
      {/* Video surface */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ display: showAvatar ? 'none' : 'block' }}
      />

      {/* Fallback — no video / cam off */}
      {showAvatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[#EEEDFE] flex items-center justify-center text-xl font-semibold text-[#534AB7]">
            {avatarInitials ?? '?'}
          </div>
          {camOff && !isLocal && (
            <span className="text-white/40 text-xs">Camera off</span>
          )}
        </div>
      )}

      {/* Bottom bar — name + muted indicator */}
      {label && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/50">
            <span className="text-white text-xs font-medium">
              {label}{isLocal ? ' (you)' : ''}
            </span>
            {muted && (
              <svg className="w-6 h-6 text-[#F09595]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0019 12v-1M5 10v2a7 7 0 0012.6 4.2M15 9.34V5a3 3 0 00-5.94-.6M9 9v3a3 3 0 005.12 2.12" strokeLinecap="round" />
              </svg>
            )}
          </div>

          {/* Camera off badge */}
          {camOff && (
            <div className="px-2 py-1 rounded bg-black/50">
              <svg className="w-6 h-6 text-[#F09595]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
                <path d="M16 7H5a2 2 0 00-2 2v8a2 2 0 002 2h11m2-5.5l3 1.5V8.5L18 10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
