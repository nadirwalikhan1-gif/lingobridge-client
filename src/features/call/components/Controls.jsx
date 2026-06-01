// Call controls bar — mic, cam, end call.
// sessionType='audio' hides the camera button entirely.

export default function Controls({ micMuted, camOff, sessionType = 'audio', onToggleMic, onToggleCam, onLeave }) {
  const isVideo = sessionType === 'video';

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Mic toggle */}
      <button
        onClick={onToggleMic}
        title={micMuted ? 'Unmute' : 'Mute'}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ring-2 ${
          micMuted
            ? 'bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F7C1C1] ring-[#E24B4A]'
            : 'bg-lb-surface text-lb-ink hover:bg-lb-border ring-transparent'
        }`}
      >
        {micMuted ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1="2" y1="2" x2="22" y2="22" />
            <path d="M18.89 13.23A7.12 7.12 0 0019 12v-1M5 10v2a7 7 0 0012.6 4.2M15 9.34V5a3 3 0 00-5.94-.6M9 9v3a3 3 0 005.12 2.12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10v2a7 7 0 0014 0v-2M12 19v3M8 22h8" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Camera toggle — video sessions only */}
      {isVideo && (
        <button
          onClick={onToggleCam}
          title={camOff ? 'Turn camera on' : 'Turn camera off'}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ring-2 ${
            camOff
              ? 'bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#F7C1C1] ring-[#E24B4A]'
              : 'bg-lb-surface text-lb-ink hover:bg-lb-border ring-transparent'
          }`}
        >
          {camOff ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="2" y1="2" x2="22" y2="22" />
              <path d="M16 7H5a2 2 0 00-2 2v8a2 2 0 002 2h11m2-5.5l3 1.5V8.5L18 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      )}

      {/* End call */}
      <button
        onClick={onLeave}
        title="End call"
        className="w-14 h-14 rounded-full bg-[#E24B4A] hover:bg-[#A32D2D] text-white flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M22 16.92V19a2 2 0 01-2.18 2A19.79 19.79 0 013 4.18 2 2 0 015 2h2.09a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}