import { useEffect, useRef } from 'react';

// Renders a single Agora video track into a div.
// Pass track=null to show the avatar fallback (audio-only or cam off).

export default function VideoTile({ track, label, avatarInitials, muted = false, isLocal = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!track || !containerRef.current) return;
    track.play(containerRef.current);
    return () => {
      track.stop();
    };
  }, [track]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#1a1a2e]">
      {/* Video surface */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ display: track ? 'block' : 'none' }}
      />

      {/* Fallback — no video track */}
      {!track && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#EEEDFE] flex items-center justify-center text-xl font-semibold text-[#534AB7]">
            {avatarInitials ?? '?'}
          </div>
        </div>
      )}

      {/* Name label */}
      {label && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/50 text-white text-xs font-medium">
          {label}{isLocal ? ' (you)' : ''}
          {muted && (
            <span className="ml-1.5 text-[10px] opacity-75">🔇</span>
          )}
        </div>
      )}
    </div>
  );
}
