import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';
import { useAgora } from '../../../hooks/useAgora';
import VideoTile from '../components/VideoTile';
import Controls from '../components/Controls';
import ChatSidebar from '../components/ChatSidebar';
import RatingModal from '../components/RatingModal';
import { getSocket } from '../../../lib/socket';

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${ss < 10 ? '0' : ''}${ss}`;
}

export default function CallRoom() {
  const { channelId }                 = useParams();
  const [searchParams]                = useSearchParams();
  const sessionType                   = searchParams.get('type') === 'video' ? 'video' : 'audio';
  const agoraToken                    = searchParams.get('token') || null;
  // Fix #1 — interpreter name passed from BookingPage via ?interpreterName=
  const interpreterName               = searchParams.get('interpreterName') || null;
  const interpreterInitials           = interpreterName
    ? interpreterName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const navigate                      = useNavigate();
  const { user }                      = useAuth();
  const [chatOpen, setChatOpen]       = useState(false);
  const [showRating, setShowRating]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secs, setSecs]               = useState(0);
  const timerRef                      = useRef(null);

  const rate = sessionType === 'video' ? 1.20 : 0.99
  const sessionCost = Math.max(0, parseFloat(((secs / 60) * rate).toFixed(2)))
  const role = user?.user_metadata?.role ?? 'client';

  const {
    localTracks, remoteUsers, joined,
    micMuted, camOff, captions, error,
    toggleMic, toggleCam, leave,
  } = useAgora({ channel: channelId, sessionType, token: agoraToken });

  // Timer — starts when remote joins
  useEffect(() => {
    if (joined && remoteUsers.length > 0) {
      timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [joined, remoteUsers.length]);

  // Auto-end when remote leaves
  useEffect(() => {
    if (joined && remoteUsers.length === 0 && secs > 5) {
      const t = setTimeout(async () => {
        clearInterval(timerRef.current);
        await leave();
        setShowRating(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [joined, remoteUsers.length, secs]);

  // Socket call-ended
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onCallEnded = async () => {
      clearInterval(timerRef.current);
      await leave();
      setShowRating(true);
    };
    socket.on('call-ended', onCallEnded);
    return () => socket.off('call-ended', onCallEnded);
  }, [leave]);

  async function confirmLeave() {
    setShowConfirm(false);
    const socket = getSocket();
    socket?.emit('end-call', { roomId: channelId });
    clearInterval(timerRef.current);
    await leave();
    setShowRating(true);
  }

  function handleRatingSubmit(payload) {
    console.log('Rating submitted:', payload);
    setTimeout(() => navigate('/client/dashboard'), 1500);
  }

  const initials = user?.user_metadata?.name
    ? user.user_metadata.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  const remoteUser = remoteUsers[0] ?? null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-[#0f0f1a] text-white gap-4">
        <p className="text-sm text-[#F09595]">Could not join call: {error}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-lb-surface text-lb-ink text-sm hover:bg-lb-border transition-colors">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-[#0f0f1a] overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">

        {/* Timer bar */}
        {joined && (
          <div className="flex items-center justify-center py-2 bg-[#0f0f1a] border-b border-white/10">
            {remoteUser ? (
              <span className="text-white/70 text-sm font-mono tabular-nums tracking-widest">
                {fmt(secs)}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                {/* Pulsing dots */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
                <span className="text-white/50 text-sm">Connecting your interpreter</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#7F77DD]/20 text-[#AFA9EC]">
                  &lt; 1 min
                </span>
              </div>
            )}
          </div>
        )}

        {/* Video / Audio area */}
        <div className="flex-1 p-3 overflow-hidden relative">
          {sessionType === 'video' ? (
            // Fix #2 — two-tile layout only, no third black panel
            <div className="relative w-full h-full">

              {/* Main tile — remote user (large, full area) */}
              {remoteUser ? (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <VideoTile
                    track={remoteUser.camOff ? null : (remoteUser.videoTrack ?? null)}
                    label={interpreterName ?? `Participant ${remoteUser.uid}`}
                    avatarInitials={interpreterInitials}
                    muted={remoteUser.micMuted}
                    camOff={remoteUser.camOff}
                  />
                </div>
              ) : (
                /* Waiting state — local fills the main area */
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <VideoTile
                    track={camOff ? null : localTracks.cam}
                    label={user?.user_metadata?.name ?? user?.email ?? 'You'}
                    avatarInitials={initials}
                    muted={micMuted}
                    camOff={camOff}
                    isLocal
                  />
                </div>
              )}

              {/* PiP tile — local user (small, bottom-right) */}
              {remoteUser && (
                <div className="absolute bottom-3 right-3 w-[22%] aspect-video rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10 z-10">
                  <VideoTile
                    track={camOff ? null : localTracks.cam}
                    label={user?.user_metadata?.name ?? user?.email ?? 'You'}
                    avatarInitials={initials}
                    muted={micMuted}
                    camOff={camOff}
                    isLocal
                  />
                </div>
              )}
            </div>
          ) : (
            /* ── Audio call layout ── */
            <div className="flex items-center justify-center h-full gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-20 h-20 rounded-full bg-[#EEEDFE] flex items-center justify-center text-2xl font-semibold text-[#534AB7] ring-4 transition-all ${!micMuted ? 'ring-[#7F77DD]' : 'ring-transparent'}`}>
                  {initials}
                </div>
                <p className="text-white/70 text-xs">{user?.user_metadata?.name ?? 'You'}</p>
                {micMuted && (
                  <span className="flex items-center gap-1 text-[10px] text-[#F09595]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0019 12v-1M5 10v2a7 7 0 0012.6 4.2M15 9.34V5a3 3 0 00-5.94-.6M9 9v3a3 3 0 005.12 2.12" strokeLinecap="round"/>
                    </svg>
                    Muted
                  </span>
                )}
              </div>

              {remoteUsers.map(u => (
                <div key={u.uid} className="flex flex-col items-center gap-2">
                  <div className={`w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center text-2xl font-semibold text-[#0F6E56] ring-4 transition-all ${!u.micMuted ? 'ring-[#1D9E75]' : 'ring-transparent'}`}>
                    {interpreterInitials}
                  </div>
                  <p className="text-white/70 text-xs">{interpreterName ?? `Participant ${u.uid}`}</p>
                  {u.micMuted && (
                    <span className="flex items-center gap-1 text-[10px] text-[#F09595]">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0019 12v-1M5 10v2a7 7 0 0012.6 4.2M15 9.34V5a3 3 0 00-5.94-.6M9 9v3a3 3 0 005.12 2.12" strokeLinecap="round"/>
                      </svg>
                      Muted
                    </span>
                  )}
                </div>
              ))}

              {remoteUsers.length === 0 && joined && (
                <p className="text-white/40 text-sm">Waiting for the other participant…</p>
              )}
              {joined && remoteUsers.length === 0 && secs > 5 && (
                <p className="text-[#F09595] text-sm animate-pulse">Other participant left — ending call…</p>
              )}
            </div>
          )}

          {/* Captions overlay */}
          {joined && (captions.local || remoteUsers.some(u => captions[u.uid])) && (
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 pointer-events-none">
              {captions.local && (
                <div className="self-end max-w-[80%] px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm text-right">
                  <span className="text-[10px] text-white/40 block mb-0.5">You</span>
                  {captions.local}
                </div>
              )}
              {remoteUsers.map(u => captions[u.uid] ? (
                <div key={u.uid} className="self-start max-w-[80%] px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm">
                  <span className="text-[10px] text-white/40 block mb-0.5">Participant</span>
                  {captions[u.uid]}
                </div>
              ) : null)}
            </div>
          )}
        </div>

        {/* Connecting state */}
        {!joined && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]/80">
            <p className="text-white/60 text-sm animate-pulse">Connecting…</p>
          </div>
        )}

        {/* Controls bar */}
        <div className="flex items-center justify-between px-4 bg-[#0f0f1a] border-t border-white/10">
          <div className="w-24">
            {sessionType === 'video' && <span className="text-[11px] text-white/30 uppercase tracking-wide">Video call</span>}
          </div>
          <Controls
            micMuted={micMuted}
            camOff={camOff}
            sessionType={sessionType}
            chatOpen={chatOpen}
            onToggleMic={toggleMic}
            onToggleCam={toggleCam}
            onToggleChat={() => setChatOpen(o => !o)}
            onLeave={() => setShowConfirm(true)}
          />
          <div className="w-24" />
        </div>
      </div>

      {chatOpen && (
        <div className="w-72 shrink-0">
          <ChatSidebar channel={channelId} currentUser={user} />
        </div>
      )}

      {/* End call confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-xs w-full flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FCEBEB] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E24B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 16.92V19a2 2 0 01-2.18 2A19.79 19.79 0 013 4.18 2 2 0 015 2h2.09a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round"/>
                  <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base">End this call?</h3>
              <p className="text-white/50 text-sm">This will end the call for both participants.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/5 transition-colors"
              >
                No, stay
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 py-2.5 rounded-xl bg-[#E24B4A] text-white text-sm font-medium hover:bg-[#A32D2D] transition-colors"
              >
                Yes, end
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating modal */}
      {showRating && (
        <RatingModal
          role={role}
          sessionDuration={secs}
          sessionCost={sessionCost}
          interpreterName={interpreterName}
          onSubmit={handleRatingSubmit}
          onSkip={() => navigate('/client/dashboard')}
        />
      )}
    </div>
  );
}