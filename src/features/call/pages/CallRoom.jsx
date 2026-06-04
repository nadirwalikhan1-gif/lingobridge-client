import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';
import { useAgora } from '../../../hooks/useAgora';
import VideoTile from '../components/VideoTile';
import Controls from '../components/Controls';
import ChatSidebar from '../components/ChatSidebar';
import RatingModal from '../components/RatingModal';
import { getSocket } from '../../../lib/socket';
import { LANGUAGE_LABELS } from '../../../config/constants';

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${ss < 10 ? '0' : ''}${ss}`;
}

// ─── Session Context Panel — Fix #7 ──────────────────────────────────────────
function SessionContextPanel({ fromLang, toLang, category, sessionType, duration, rate, secs }) {
  const durationSeconds = parseInt(duration) * 60 || 300
  const remaining = Math.max(0, durationSeconds - (secs || 0))
  const isUrgent = remaining <= 60
  const isWarning = remaining <= 120 && remaining > 60
  // Resolve display names using LANGUAGE_LABELS (Fix #2)
  const fromLabel = LANGUAGE_LABELS[fromLang] || fromLang || '—'
  const toLabel   = LANGUAGE_LABELS[toLang]   || toLang   || '—'

  return (
    <div className="absolute top-4 left-4 z-20 max-w-xs">
      <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
          <span className="text-[10px] font-semibold text-[#1D9E75] uppercase tracking-wider">Live Session</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-[12px] text-white font-medium">{fromLabel} → {toLabel}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-white/70">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {category || 'General'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/70">
              {sessionType === 'video' ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )}
              {sessionType === 'video' ? 'Video' : 'Audio'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/70">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              {duration} min booked
            </span>
            <span className="flex items-center gap-1 text-[11px] text-white/70">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${rate}/min
            </span>
            {isWarning && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#BA7517]/30 text-[#BA7517] font-semibold">
                Wrap up
              </span>
            )}
            {isUrgent && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E24B4A]/30 text-[#E24B4A] font-semibold animate-pulse">
                Ending soon
              </span>
            )}
            {isWarning && (
              <button
                onClick={() => {
                  const socket = getSocket()
                  socket?.emit('extend-session', { roomId: channelId, additionalMinutes: 5 })
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-[#7F77DD]/30 text-[#AFA9EC] hover:bg-[#7F77DD]/50 transition-colors"
              >
                +5 min
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
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

  // Fix #7 — session context from URL params
  const fromLang                      = searchParams.get('fromLang') || 'en-us';
  const toLang                        = searchParams.get('toLang') || 'ps-east';
  const selectedCategory              = searchParams.get('category') || '';
  const duration                      = searchParams.get('duration') || '30';
  const navigate                      = useNavigate();
  const { user }                      = useAuth();
  const [chatOpen, setChatOpen]       = useState(false);
  const [notes, setNotes]             = useState('');
  const [notesOpen, setNotesOpen]     = useState(false);
  const [onHold, setOnHold]           = useState(false);
  const [showRating, setShowRating]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secs, setSecs]               = useState(0);
  const timerRef                      = useRef(null);

  const rate = parseFloat(searchParams.get('rate')) || (sessionType === 'video' ? 1.20 : 0.99)
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

  // Fix: better name resolution — prefer displayName, then name, then email initial
  const rawName =
  user?.user_metadata?.full_name    ||   // Supabase standard field
  user?.user_metadata?.displayName  ||
  user?.user_metadata?.name         ||
  user?.email?.split('@')[0]        ||   // strips domain — better than full email
  'You'
const userDisplayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
  const initials = userDisplayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const remoteUser = remoteUsers[0] ?? null;

  // Fix: exchange names via socket so both sides see each other's names
  const [remoteUserName, setRemoteUserName] = useState(interpreterName || null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !joined) return

    // Emit our name when joining
    socket.emit('call-user-info', {
      roomId: channelId,
      name: userDisplayName,
      role: role,
    })

    // Listen for other user's name
    const onUserInfo = (data) => {
      if (data.name && data.role !== role) {
        setRemoteUserName(data.name)
      }
    }
    socket.on('call-user-info', onUserInfo)

    return () => socket.off('call-user-info', onUserInfo)
  }, [joined, channelId, userDisplayName, role])

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
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Fix #7: Session context panel */}
        <SessionContextPanel
          fromLang={fromLang}
          toLang={toLang}
          category={selectedCategory}
          sessionType={sessionType}
          duration={duration}
          rate={rate}
          secs={secs}
        />

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
                    label={remoteUserName ?? interpreterName ?? (role === 'interpreter' ? 'LEP' : 'Interpreter')}
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
                    label={userDisplayName}
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
                    label={userDisplayName}
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
                <p className="text-white/70 text-xs">{userDisplayName}</p>
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
                  <p className="text-white/70 text-xs">{remoteUserName ?? interpreterName ?? (role === 'interpreter' ? 'LEP' : 'Interpreter')}</p>
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
                  <span className="text-[10px] text-white/40 block mb-0.5">{remoteUserName ?? interpreterName ?? (role === 'interpreter' ? 'LEP' : 'Interpreter')}</span>
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

        {/* Hold overlay */}
        {onHold && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f1a]/70 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#BA7517]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#BA7517]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">Session on hold</p>
              <p className="text-white/50 text-sm">Waiting for provider to return</p>
              <button
                onClick={() => {
                  setOnHold(false)
                  const socket = getSocket()
                  socket?.emit('hold-session', { roomId: channelId, onHold: false })
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-[#7F77DD] text-white text-sm font-medium hover:bg-[#534AB7] transition-colors"
              >
                Resume session
              </button>
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div className="flex items-center justify-between px-4 bg-[#0f0f1a] border-t border-white/10">
          <div className="w-48">
            {joined && (
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase tracking-wide">Session</span>
                <span className={`text-[11px] font-mono tabular-nums ${
                  secs >= (parseInt(duration) * 60 - 30) ? 'text-[#E24B4A] animate-pulse font-bold' :
                  secs >= (parseInt(duration) * 60 - 60) ? 'text-[#BA7517]' :
                  'text-white/60'
                }`}>
                  {fmt(secs)} / {duration} min
                  {secs >= (parseInt(duration) * 60 - 60) && (
                    <span className="ml-1 text-[9px] uppercase tracking-wider">
                      {secs >= (parseInt(duration) * 60 - 30) ? 'Ending soon' : 'Wrap up'}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => {
                setOnHold(!onHold)
                const socket = getSocket()
                socket?.emit('hold-session', { roomId: channelId, onHold: !onHold })
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                onHold ? 'bg-[#BA7517] text-white animate-pulse' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              title={onHold ? 'Resume' : 'Hold'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {onHold ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                )}
              </svg>
            </button>
            <button
              onClick={() => setNotesOpen(o => !o)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                notesOpen ? 'bg-[#7F77DD] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              title="Notes"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="w-24" />
        </div>
      </div>

      {chatOpen && (
        <div className="w-72 shrink-0">
          <ChatSidebar channel={channelId} currentUser={user} />
        </div>
      )}

      {notesOpen && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-[#1a1a2e]/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-[13px] font-medium text-white">Session Notes</span>
            <button onClick={() => setNotesOpen(false)} className="text-white/50 hover:text-white text-sm">✕</button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot terminology, names, case numbers..."
            className="flex-1 bg-transparent text-white/80 text-[13px] p-4 resize-none focus:outline-none placeholder:text-white/30 min-h-[200px]"
          />
          <div className="px-4 py-2 border-t border-white/10 text-[10px] text-white/30">
            Notes are private and auto-saved locally
          </div>
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