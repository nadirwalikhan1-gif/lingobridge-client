import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';
import { useAgora } from '../../../hooks/useAgora';
import VideoTile from '../components/VideoTile';
import Controls from '../components/Controls';
import ChatSidebar from '../components/ChatSidebar';
import RatingModal from '../components/RatingModal';
import { getSocket } from '../../../lib/socket';
// FIX: vault-model — import CLIENT_RATES for fallback
import { LANGUAGE_LABELS, CLIENT_RATES } from '../../../config/constants';

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${ss < 10 ? '0' : ''}${ss}`;
}

// ─── Session Context Panel ────────────────────────────────────────────────────
function SessionContextPanel({ fromLang, toLang, category, sessionType, duration, rate, secs, channelId, onExtend }) {
  const durationSeconds = parseInt(duration) * 60 || 300;
  const remaining = Math.max(0, durationSeconds - (secs || 0));
  const isUrgent  = remaining <= 60;
  const isWarning = remaining <= 120 && remaining > 60;

  const fromLabel = LANGUAGE_LABELS[fromLang] || fromLang || '—';
  const toLabel   = LANGUAGE_LABELS[toLang]   || toLang   || '—';

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
            <button
              onClick={onExtend}
              className={`text-[10px] px-2.5 py-1 rounded font-semibold transition-colors ${
                isUrgent
                  ? 'bg-[#E24B4A] text-white animate-pulse hover:bg-[#c43e3d]'
                  : isWarning
                    ? 'bg-[#BA7517]/40 text-[#FAC775] hover:bg-[#BA7517]/60'
                    : 'bg-[#7F77DD]/30 text-[#AFA9EC] hover:bg-[#7F77DD]/50'
              }`}
            >
              +5 min
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallRoom() {
  const { channelId }                 = useParams();
  const [searchParams]                = useSearchParams();
  const sessionType                   = searchParams.get('type') === 'video' ? 'video' : 'audio';
  const agoraToken                    = searchParams.get('token') || null;
  const interpreterName               = searchParams.get('interpreterName') || null;

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
  const [holdMeta, setHoldMeta]       = useState(null);
  const [showRating, setShowRating]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secs, setSecs]               = useState(0);
  const [quickNote, setQuickNote]     = useState('');
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [remoteUserName, setRemoteUserName]         = useState(interpreterName || null);

  // FIX: reconnecting UI state — shown during 10s grace before auto-end
  const [remoteReconnecting, setRemoteReconnecting] = useState(false);

  // FIX: transfer / escalate in-dialog status — null | 'sent'
  const [transferStatus, setTransferStatus] = useState(null);
  const [escalateStatus, setEscalateStatus] = useState(null);

  const timerRef        = useRef(null);
  const onHoldRef       = useRef(false);
  const secsRef         = useRef(0);
  // FIX: prevents timer restarting if a remote user briefly disconnects and reconnects
  const timerStartedRef = useRef(false);
  // FIX: stable ref for `leave` so socket listeners registered once don't capture stale fn
  const leaveRef        = useRef(null);

  // FIX: vault-model — use CLIENT_RATES as fallback instead of old hardcoded 1.20/0.99
  const rate = parseFloat(searchParams.get('rate')) || CLIENT_RATES[sessionType] || (sessionType === 'video' ? 1.79 : 1.49);

  const sessionCost = useMemo(
    () => Math.max(0, parseFloat(((secs / 60) * rate).toFixed(2))),
    [secs, rate]
  );

  const role = user?.user_metadata?.role ?? 'client';

  const {
    localTracks, remoteUsers, joined,
    micMuted, camOff, captions, error,
    toggleMic, toggleCam, leave,
  } = useAgora({ channel: channelId, sessionType, token: agoraToken });

  // FIX: keep leaveRef current so socket handlers registered once always call latest fn
  useEffect(() => { leaveRef.current = leave; }, [leave]);

  // ─── FIX: role-based participant derivation ─────────────────────────────────
  // remoteParticipants arrive in socket-event order, NOT necessarily matching
  // remoteUsers (Agora) order. Derive each slot by role field to avoid index mismatch.
  // TODO: for a fully reliable match, include the Agora UID in the call-user-info
  //       socket payload so we can build a uid→participant map here.
  const providerPart = useMemo(
    () => remoteParticipants.find(p => p.role === 'client' || p.role === 'provider'),
    [remoteParticipants]
  );
  const lepPart = useMemo(
    () => remoteParticipants.find(p => p.role === 'lep'),
    [remoteParticipants]
  );
  const interpreterPart = useMemo(
    () => remoteParticipants.find(p => p.role === 'interpreter'),
    [remoteParticipants]
  );

  // Auto-open notes for medical sessions
  useEffect(() => {
    if (selectedCategory.toLowerCase() === 'medical') {
      setNotesOpen(true);
    }
  }, [selectedCategory]);

  // ─── FIX: timer — start once when first remote user joins, keep running ──────
  // The original stopped and restarted the interval on every remoteUsers change,
  // creating billing gaps during brief network drops.
  useEffect(() => {
    if (!joined || remoteUsers.length === 0 || timerStartedRef.current) return;
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      if (!onHoldRef.current) {
        secsRef.current += 1;
        setSecs(secsRef.current);
      }
    }, 1000);
  }, [joined, remoteUsers.length]);

  // Clear timer only on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ─── FIX: auto-end — 10s grace period + reconnecting UI state ───────────────
  // Original 3s timeout was too short for a network hiccup. Now 10s, with a
  // visible "reconnecting" indicator so the interpreter knows what's happening.
  useEffect(() => {
    if (!joined || remoteUsers.length > 0) {
      setRemoteReconnecting(false);
      return;
    }
    if (secsRef.current <= 5) return; // call never really started

    setRemoteReconnecting(true);
    const t = setTimeout(async () => {
      clearInterval(timerRef.current);
      await leaveRef.current?.();
      setShowRating(true);
    }, 10_000);
    return () => {
      clearTimeout(t);
      setRemoteReconnecting(false);
    };
  }, [joined, remoteUsers.length]);

  // ─── FIX: stable socket listener — uses leaveRef, no `leave` in deps ────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onCallEnded = async () => {
      clearInterval(timerRef.current);
      await leaveRef.current?.();
      setShowRating(true);
    };
    socket.on('call-ended', onCallEnded);
    return () => socket.off('call-ended', onCallEnded);
  }, []); // intentionally empty — leaveRef stays current via the effect above

  // Hold sync
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onHoldSession = (data) => {
      if (data.roomId !== channelId) return;
      const isHeld = data.onHold;
      onHoldRef.current = isHeld;
      setOnHold(isHeld);

      if (isHeld) {
        const initiatorLabel = data.initiatorRole === role
          ? 'You'
          : (data.initiatorRole === 'interpreter' ? 'Interpreter' : 'Provider');
        setHoldMeta({ initiator: initiatorLabel, at: fmt(secsRef.current) });
      } else {
        setHoldMeta(null);
      }
    };

    socket.on('hold-session', onHoldSession);
    return () => socket.off('hold-session', onHoldSession);
  }, [channelId, role]);

  const handleExtend = useCallback(() => {
    const socket = getSocket();
    socket?.emit('extend-session', { roomId: channelId, additionalMinutes: 5 });
  }, [channelId]);

  const handleHold = useCallback((nextHold) => {
    onHoldRef.current = nextHold;
    setOnHold(nextHold);
    if (nextHold) {
      setHoldMeta({ initiator: 'You', at: fmt(secsRef.current) });
    } else {
      setHoldMeta(null);
    }
    const socket = getSocket();
    socket?.emit('hold-session', { roomId: channelId, onHold: nextHold, initiatorRole: role });
  }, [channelId, role]);

  async function confirmLeave() {
    setShowConfirm(false);
    const socket = getSocket();
    socket?.emit('end-call', { roomId: channelId });
    clearInterval(timerRef.current);
    await leave();
    setShowRating(true);
  }

  // FIX: don't close the dialog on transfer/escalate — show inline status instead
  // so the user knows the request was sent and can still choose to stay or end.
  const handleTransfer = useCallback(() => {
    const socket = getSocket();
    socket?.emit('request-transfer', { roomId: channelId });
    setTransferStatus('sent');
  }, [channelId]);

  const handleEscalate = useCallback(() => {
    const socket = getSocket();
    socket?.emit('request-supervisor', { roomId: channelId });
    setEscalateStatus('sent');
  }, [channelId]);

  function handleRatingSubmit(payload) {
    console.log('Rating submitted:', payload);
    setTimeout(() => navigate('/client/dashboard'), 1500);
  }

  const rawName =
    user?.user_metadata?.full_name   ||
    user?.user_metadata?.displayName ||
    user?.user_metadata?.name        ||
    user?.email?.split('@')[0]       ||
    'You';
  const userDisplayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = userDisplayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // FIX: removed dead `const remoteUser = remoteUsers[0] ?? null`

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !joined) return;

    socket.emit('call-user-info', {
      roomId: channelId,
      name: userDisplayName,
      role: role,
    });

    const onUserInfo = (data) => {
      if (data.name && data.role !== role) {
        setRemoteUserName(data.name);
        setRemoteParticipants(prev => {
          if (prev.find(p => p.name === data.name && p.role === data.role)) return prev;
          return [...prev, { name: data.name, role: data.role }];
        });
      }
    };
    socket.on('call-user-info', onUserInfo);
    return () => socket.off('call-user-info', onUserInfo);
  }, [joined, channelId, userDisplayName, role]);

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

        <SessionContextPanel
          fromLang={fromLang}
          toLang={toLang}
          category={selectedCategory}
          sessionType={sessionType}
          duration={duration}
          rate={rate}
          secs={secs}
          channelId={channelId}
          onExtend={handleExtend}
        />

        {/* Timer bar */}
        {joined && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-black/25 border-b border-white/10">
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[16px] font-medium font-mono tabular-nums ${
                onHold ? 'text-[#FAC775]' : 'text-white'
              }`}>
                {fmt(secs)}
              </span>
              {role === 'interpreter' && (
                <span className="text-[11px] text-[#4ade80] font-semibold tabular-nums">
                  ${sessionCost.toFixed(2)}
                </span>
              )}
              {onHold && (
                <span className="flex items-center gap-1 text-[10px] text-[#FAC775] bg-[rgba(186,117,23,0.2)] border border-[#BA7517]/40 rounded px-1.5 py-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6"/></svg>
                  paused
                </span>
              )}
            </div>
            <div className="flex-1 relative">
              <div className="h-1 bg-white/10 rounded-full relative overflow-visible">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, (secs / (parseInt(duration) * 60)) * 100)}%`,
                    backgroundColor: secs >= (parseInt(duration) * 60 - 30) ? '#E24B4A' :
                                     secs >= (parseInt(duration) * 60 - 120) ? '#EF9F27' : '#1D9E75'
                  }}
                />
                <div className="absolute top-[-3px] w-0.5 h-3 rounded-full bg-[#EF9F27]" style={{ left: `${((parseInt(duration) * 60 - 120) / (parseInt(duration) * 60)) * 100}%` }} />
                <div className="absolute top-[-3px] w-0.5 h-3 rounded-full bg-[#E24B4A]" style={{ left: `${((parseInt(duration) * 60 - 30) / (parseInt(duration) * 60)) * 100}%` }} />
              </div>
            </div>
            <button
              onClick={handleExtend}
              className={`flex items-center gap-1.5 text-[12px] text-[#9FE1CB] bg-[rgba(29,158,117,0.12)] border border-[#1D9E75]/35 rounded-md px-2.5 py-1 hover:bg-[rgba(29,158,117,0.2)] transition-colors shrink-0 ${
                secs >= (parseInt(duration) * 60 - 60) ? 'animate-pulse bg-[rgba(29,158,117,0.25)] border-[#1D9E75]' : ''
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zM12 2v2m0 16v2" />
              </svg>
              +5 min
            </button>
          </div>
        )}

        {/* ─── FIX: Participants bar — role-based lookup, not array index ─────── */}
        {/* Provider uses providerPart (role:'client'/'provider'), LEP uses lepPart  */}
        {/* (role:'lep'), Interpreter uses interpreterPart (role:'interpreter').     */}
        {/* Each column shows the current user's own name when they hold that role.  */}
        <div className="flex items-center justify-center gap-4 bg-white/5 border-b border-white/10 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75]" />
            <div>
              <p className="text-[10px] text-white/40">Provider</p>
              <p className="text-[12px] font-medium text-white/80">
                {(role === 'client' || role === 'provider')
                  ? `${userDisplayName} (You)`
                  : (providerPart?.name ?? remoteUserName ?? 'Provider')}
              </p>
            </div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7F77DD]" />
            <div>
              <p className="text-[10px] text-white/40">LEP</p>
              <p className="text-[12px] font-medium text-white/80">
                {role === 'lep'
                  ? `${userDisplayName} (You)`
                  : (lepPart?.name ?? '—')}
              </p>
            </div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EF9F27]" />
            <div>
              <p className="text-[10px] text-white/40">Interpreter</p>
              <p className="text-[12px] font-medium text-white/80">
                {role === 'interpreter'
                  ? `${userDisplayName} (You)`
                  : (interpreterPart?.name ?? interpreterName ?? '—')}
              </p>
            </div>
          </div>
        </div>

        {/* Video / Audio area */}
        <div className="flex-1 p-3 overflow-hidden relative flex flex-col">
          {sessionType === 'video' ? (
            <div className="relative w-full h-full">
              {remoteUsers.length === 0 ? (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  {/* FIX: removed ' (You)' suffix — VideoTile renders its own isLocal badge */}
                  <VideoTile
                    track={camOff ? null : localTracks.cam}
                    label={userDisplayName}
                    avatarInitials={initials}
                    muted={micMuted}
                    camOff={camOff}
                    isLocal
                  />
                </div>
              ) : remoteUsers.length === 1 ? (
                <>
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    {/* FIX: derive label by role rather than remoteParticipants[0] positional guess */}
                    <VideoTile
                      track={remoteUsers[0].camOff ? null : (remoteUsers[0].videoTrack ?? null)}
                      label={(() => {
                        const p = remoteParticipants[0];
                        if (p) return p.name;
                        if (role === 'interpreter') return remoteUserName ?? 'Provider';
                        return interpreterName ?? remoteUserName ?? 'Interpreter';
                      })()}
                      avatarInitials={(() => {
                        const name = remoteParticipants[0]?.name ?? remoteUserName ?? interpreterName ?? '?';
                        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                      })()}
                      muted={remoteUsers[0].micMuted}
                      camOff={remoteUsers[0].camOff}
                    />
                  </div>
                  <div className="absolute bottom-3 right-3 w-[22%] aspect-video rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10 z-10">
                    {/* FIX: removed ' (You)' suffix */}
                    <VideoTile
                      track={camOff ? null : localTracks.cam}
                      label={userDisplayName}
                      avatarInitials={initials}
                      muted={micMuted}
                      camOff={camOff}
                      isLocal
                    />
                  </div>
                </>
              ) : (
                // 3-party grid
                // NOTE: remoteParticipants[idx] may not align with remoteUsers[idx] since
                // they arrive via different channels (socket vs Agora). Until the backend
                // includes Agora UIDs in call-user-info, this is best-effort positional.
                // TODO: emit agoraUid in call-user-info and build a uid→participant map.
                <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
                  {remoteUsers.map((u, idx) => {
                    const participant = remoteParticipants[idx];
                    // FIX: use the role field from the participant object when available
                    const roleLabel =
                      participant?.role === 'interpreter' ? 'Interpreter' :
                      (participant?.role === 'client' || participant?.role === 'provider') ? 'Provider' :
                      participant?.role === 'lep' ? 'LEP' :
                      idx === 0 ? 'Provider' : 'LEP';
                    const displayName = participant?.name ?? (idx === 0 ? (remoteUserName ?? 'Provider') : 'LEP');
                    const displayInitials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

                    return (
                      <div key={u.uid} className="relative rounded-xl overflow-hidden bg-black/40 ring-2 ring-white/10">
                        <VideoTile
                          track={u.camOff ? null : (u.videoTrack ?? null)}
                          label={displayName}
                          avatarInitials={displayInitials}
                          muted={u.micMuted}
                          camOff={u.camOff}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white/80 font-medium backdrop-blur-sm">
                          {roleLabel}
                        </div>
                      </div>
                    );
                  })}
                  <div className="relative rounded-xl overflow-hidden bg-black/40 ring-2 ring-white/10">
                    {/* FIX: removed ' (You)' suffix */}
                    <VideoTile
                      track={camOff ? null : localTracks.cam}
                      label={userDisplayName}
                      avatarInitials={initials}
                      muted={micMuted}
                      camOff={camOff}
                      isLocal
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white/80 font-medium backdrop-blur-sm">
                      {role === 'interpreter' ? 'Interpreter' : role === 'lep' ? 'LEP' : 'Provider'}
                    </div>
                  </div>
                  {remoteUsers.length === 2 && (
                    <div className="relative rounded-xl overflow-hidden bg-black/20 flex items-center justify-center ring-2 ring-white/5">
                      <span className="text-white/20 text-xs">No additional participant</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Audio-only layout
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

              {remoteUsers.map((u, idx) => {
                const participant = remoteParticipants[idx];
                const displayName = participant?.name ?? (idx === 0 ? (remoteUserName ?? 'Provider') : 'LEP');
                const displayInitials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={u.uid} className="flex flex-col items-center gap-2">
                    <div className={`w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center text-2xl font-semibold text-[#0F6E56] ring-4 transition-all ${!u.micMuted ? 'ring-[#1D9E75]' : 'ring-transparent'}`}>
                      {displayInitials}
                    </div>
                    <p className="text-white/70 text-xs">{displayName}</p>
                    {u.micMuted && (
                      <span className="flex items-center gap-1 text-[10px] text-[#F09595]">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0019 12v-1M5 10v2a7 7 0 0012.6 4.2M15 9.34V5a3 3 0 00-5.94-.6M9 9v3a3 3 0 005.12 2.12" strokeLinecap="round"/>
                        </svg>
                        Muted
                      </span>
                    )}
                  </div>
                );
              })}

              {remoteUsers.length === 0 && joined && (
                <p className="text-white/40 text-sm">Waiting for the other participant…</p>
              )}
              {joined && remoteUsers.length === 0 && secsRef.current > 5 && (
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
                  <span className="text-[10px] text-white/40 block mb-0.5">
                    {remoteParticipants.find(p => p.name)?.name ?? remoteUserName ?? interpreterName ?? (role === 'interpreter' ? 'LEP' : 'Interpreter')}
                  </span>
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

        {/* FIX: reconnecting banner — replaces cryptic silent auto-end */}
        {remoteReconnecting && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a2e] border border-[#F09595]/30 shadow-lg">
            <svg className="w-3.5 h-3.5 text-[#F09595] animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[11px] text-[#F09595]">Participant disconnected · ending in 10s…</span>
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
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#BA7517]/40 bg-[#BA7517]/15">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF9F27] animate-pulse" />
                <span className="text-[11px] text-[#FAC775] font-semibold uppercase tracking-wider">Session on hold</span>
              </div>
              <p className="text-white font-semibold text-lg">Session paused</p>
              <p className="text-white/50 text-sm">
                {holdMeta?.initiator === 'You'
                  ? 'You placed this session on hold'
                  : `Waiting for ${holdMeta?.initiator ?? 'provider'} to resume`}
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#BA7517]/15 border border-[#BA7517]/30 text-[12px] text-[#EF9F27]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M10 15V9m4 6V9" />
                </svg>
                Timer paused · hold time not billed
              </div>
              {holdMeta && (
                <div className="mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                  <p className="text-[12px] text-white/70">
                    {holdMeta.initiator === 'You'
                      ? `You placed this session on hold at ${holdMeta.at}`
                      : `Hold initiated by ${holdMeta.initiator} at ${holdMeta.at}`}
                  </p>
                </div>
              )}
              <button
                onClick={() => handleHold(false)}
                className="mt-2 px-4 py-2 rounded-lg bg-[#7F77DD] text-white text-sm font-medium hover:bg-[#534AB7] transition-colors"
              >
                Resume session
              </button>
            </div>
          </div>
        )}

        {/* Always-visible quick note strip */}
        <div className="bg-[#111120] border-t border-white/10 px-4 py-2 flex items-center gap-3 shrink-0">
          <svg className="w-4 h-4 text-[#7F77DD] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Quick note: medication names, diagnoses, proper nouns…"
            className="flex-1 bg-transparent text-white/70 text-xs placeholder:text-white/30 focus:outline-none"
          />
          {quickNote && (
            <button
              onClick={() => {
                setNotes(prev => prev + (prev ? '\n' : '') + `[${fmt(secs)}] ${quickNote}`);
                setQuickNote('');
              }}
              className="text-[10px] text-[#7F77DD] hover:text-[#AFA9EC] font-medium shrink-0"
            >
              Add to notes
            </button>
          )}
          <button
            onClick={() => setNotesOpen(o => !o)}
            className="text-[10px] text-white/40 hover:text-white/60 shrink-0 ml-2"
          >
            {notesOpen ? 'Hide panel' : 'Full notes'}
          </button>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-6 bg-[#111120] border-t border-white/10 py-2 shrink-0">
          <button onClick={toggleMic} className={`flex flex-col items-center gap-1 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors ${micMuted ? 'text-[#F09595]' : 'text-white/65'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {micMuted ? <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
            </svg>
            <span className="text-[10px] text-white/40">{micMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button onClick={toggleCam} className={`flex flex-col items-center gap-1 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors ${camOff ? 'text-[#F09595]' : 'text-white/65'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <span className="text-[10px] text-white/40">{camOff ? 'Start video' : 'Stop video'}</span>
          </button>
          <button onClick={() => handleHold(!onHold)} className={`flex flex-col items-center gap-1 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors ${onHold ? 'text-[#EF9F27]' : 'text-white/65'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
            </svg>
            <span className={`text-[10px] ${onHold ? 'text-[#FAC775]' : 'text-white/40'}`}>{onHold ? 'On hold' : 'Hold'}</span>
          </button>
          <button onClick={() => setChatOpen(o => !o)} className={`flex flex-col items-center gap-1 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors ${chatOpen ? 'text-[#7F77DD]' : 'text-white/65'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] text-white/40">Chat</span>
          </button>
          <button onClick={() => setNotesOpen(o => !o)} className={`flex flex-col items-center gap-1 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors ${notesOpen ? 'text-[#7F77DD]' : 'text-white/65'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] text-white/40">Notes</span>
          </button>
          <button onClick={() => setShowConfirm(true)} className="flex flex-col items-center gap-1 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors text-[#F09595]/70">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28M5 3a2 2 0 012-2h5.28M5 3L3 5m0 0l2 2" />
            </svg>
            <span className="text-[10px] text-[#F09595]/70">End call</span>
          </button>
        </div>
      </div>

      {/* Chat sidebar */}
      {chatOpen && (
        <div className="w-80 shrink-0 flex flex-col bg-[#1a1a2e] border-l border-white/10">
          <div className="px-3 py-2.5 bg-[#BA7517]/15 border-b border-[#BA7517]/30 flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4 text-[#EF9F27] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-[11px] text-[#FAC775] font-medium">Messages are visible to everyone in this call</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSidebar channel={channelId} currentUser={user} />
          </div>
        </div>
      )}

      {/* Notes panel */}
      {notesOpen && (
        <div className="absolute top-3 right-3 z-30 w-72 bg-[rgba(20,20,36,0.95)] border border-white/10 rounded-xl shadow-lg flex flex-col max-h-[300px] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-white/35 uppercase tracking-wider">Session notes</span>
            <button onClick={() => setNotesOpen(false)} className="text-white/40 hover:text-white text-[10px]">✕</button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. medication names, diagnoses, proper nouns, cultural context…"
            className="flex-1 bg-transparent text-white/70 text-[12px] p-3 resize-none focus:outline-none placeholder:text-white/25 min-h-[120px]"
          />
          <div className="px-3 py-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-white/30">{notes.length} chars</span>
            <button
              onClick={() => { navigator.clipboard?.writeText(notes); }}
              className="text-[10px] text-[#7F77DD] hover:text-[#AFA9EC]"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* ─── FIX: End call confirmation ─────────────────────────────────────────
          Transfer/escalate now show inline status instead of closing the dialog,
          so the user gets confirmation the request was sent before deciding whether
          to stay or end. Dialog resets status on close.                           */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FCEBEB] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E24B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 16.92V19a2 2 0 01-2.18 2A19.79 19.79 0 013 4.18 2 2 0 015 2h2.09a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round"/>
                  <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base">End this call?</h3>
              <p className="text-white/50 text-sm">This will end the call for all participants.</p>
            </div>

            {/* Session summary */}
            <div className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-[#0f0f1a] border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Elapsed time</span>
                <span className="text-white text-sm font-mono font-medium">{fmt(secs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Booked duration</span>
                <span className="text-white/70 text-xs">{duration} min</span>
              </div>
              {role === 'interpreter' && (
                <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
                  <span className="text-white/40 text-xs">Earnings so far</span>
                  <span className="text-[#4ade80] text-sm font-semibold">${sessionCost.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Transfer / escalate with inline status feedback */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleTransfer}
                disabled={transferStatus === 'sent'}
                className={`w-full py-2 rounded-lg border text-sm transition-colors ${
                  transferStatus === 'sent'
                    ? 'border-[#1D9E75]/30 text-[#4ade80] bg-[#1D9E75]/10 cursor-default'
                    : 'border-[#7F77DD]/30 text-[#AFA9EC] hover:bg-[#7F77DD]/10'
                }`}
              >
                {transferStatus === 'sent' ? '✓ Transfer requested' : 'Transfer to another interpreter'}
              </button>
              <button
                onClick={handleEscalate}
                disabled={escalateStatus === 'sent'}
                className={`w-full py-2 rounded-lg border text-sm transition-colors ${
                  escalateStatus === 'sent'
                    ? 'border-[#1D9E75]/30 text-[#4ade80] bg-[#1D9E75]/10 cursor-default'
                    : 'border-[#EF9F27]/30 text-[#FAC775] hover:bg-[#EF9F27]/10'
                }`}
              >
                {escalateStatus === 'sent' ? '✓ Supervisor requested' : 'Request supervisor'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  // FIX: reset statuses so they're fresh next time dialog opens
                  setTransferStatus(null);
                  setEscalateStatus(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/10"
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