import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Agora App ID — must match the server's AGORA_APP_ID env var
const AGORA_APP_ID = '02ad13c34a7643dfbcc4e6c39f05ad1d';

export function useAgora({ channel, sessionType = 'audio', token: tokenProp }) {
  const clientRef = useRef(null);

  const [localTracks, setLocalTracks] = useState({ mic: null, cam: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined]           = useState(false);
  const [micMuted, setMicMuted]       = useState(false);
  const [camOff, setCamOff]           = useState(false);
  const [error, setError]             = useState(null);
  const [captions, setCaptions]       = useState({});

  useEffect(() => {
    if (!channel) return;

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    // ── Remote user published a track ──────────────────────────────────────
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') user.audioTrack?.play();
      setRemoteUsers(prev => {
        const existing = prev.find(u => u.uid === user.uid) ?? {};
        const without  = prev.filter(u => u.uid !== user.uid);
        return [...without, {
          ...existing,
          uid:        user.uid,
          audioTrack: mediaType === 'audio' ? user.audioTrack : existing.audioTrack,
          videoTrack: mediaType === 'video' ? user.videoTrack : existing.videoTrack,
          micMuted:   mediaType === 'audio' ? false : (existing.micMuted ?? false),
          camOff:     mediaType === 'video' ? false : (existing.camOff  ?? true),
        }];
      });
    });

    // ── Remote user unpublished a track ────────────────────────────────────
    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        user.videoTrack?.stop();
        setRemoteUsers(prev =>
          prev.map(u => u.uid === user.uid ? { ...u, videoTrack: null, camOff: true } : u)
        );
      }
      if (mediaType === 'audio') {
        setRemoteUsers(prev =>
          prev.map(u => u.uid === user.uid ? { ...u, micMuted: true } : u)
        );
      }
    });

    // ── Mute state changes ──────────────────────────────────────────────────
    client.on('user-info-updated', (uid, msg) => {
      setRemoteUsers(prev => prev.map(u => {
        if (u.uid !== uid) return u;
        if (msg === 'mute-audio')   return { ...u, micMuted: true  };
        if (msg === 'unmute-audio') return { ...u, micMuted: false };
        if (msg === 'mute-video')   return { ...u, camOff:   true  };
        if (msg === 'unmute-video') return { ...u, camOff:   false };
        return u;
      }));
    });

    // ── Remote user left ────────────────────────────────────────────────────
    client.on('user-left', (user) => {
      user.audioTrack?.stop();
      user.videoTrack?.stop();
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    // ── Join and publish local tracks ───────────────────────────────────────
    async function join() {
      try {
        // Restore + chars that URL encoding may have corrupted to spaces
        const token = tokenProp ? tokenProp.replace(/ /g, '+') : null;
        if (import.meta.env.DEV) console.log('[Agora] joining', { appId: AGORA_APP_ID.substring(0, 6), channel, sessionType, tokenLength: token?.length });

        await client.join(AGORA_APP_ID, channel, token, 0);

        let mic, cam;
        if (sessionType === 'video') {
          [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } else {
          mic = await AgoraRTC.createMicrophoneAudioTrack();
        }

        await client.publish(cam ? [mic, cam] : [mic]);
        setLocalTracks({ mic, cam: cam ?? null });
        setJoined(true);
        if (import.meta.env.DEV) console.log('[Agora] joined successfully');

        // Live captions via Web Speech API (best-effort, non-critical)
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous     = true;
          recognition.interimResults = true;
          recognition.lang           = 'en-US';
          recognition.onresult = (event) => {
            let interim = '', final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const t = event.results[i][0].transcript;
              if (event.results[i].isFinal) final += t;
              else interim += t;
            }
            const text = final || interim;
            if (text) setCaptions(prev => ({ ...prev, local: text }));
            if (final) setTimeout(() => setCaptions(prev => ({ ...prev, local: '' })), 3000);
          };
          recognition.onerror = () => {};
          recognition.start();
          client._recognition = recognition;
        }
      } catch (err) {
        console.error('[Agora] join error:', err);
        setError(err.message || 'Failed to join call');
      }
    }

    join();

    // ── Cleanup on unmount / channel change ────────────────────────────────
    return () => {
      client._recognition?.stop();
      setLocalTracks(prev => {
        prev.mic?.close();
        prev.cam?.close();
        return { mic: null, cam: null };
      });
      client.leave().catch(() => {});
      setJoined(false);
      setRemoteUsers([]);
    };
  }, [channel, sessionType, tokenProp]);

  const toggleMic = useCallback(async () => {
    if (!localTracks.mic) return;
    await localTracks.mic.setMuted(!micMuted);
    setMicMuted(m => !m);
  }, [localTracks.mic, micMuted]);

  const toggleCam = useCallback(async () => {
    if (!localTracks.cam) return;
    await localTracks.cam.setMuted(!camOff);
    setCamOff(c => !c);
  }, [localTracks.cam, camOff]);

  const leave = useCallback(async () => {
    clientRef.current?._recognition?.stop();
    localTracks.mic?.close();
    localTracks.cam?.close();
    await clientRef.current?.leave();
    setJoined(false);
    setLocalTracks({ mic: null, cam: null });
    setRemoteUsers([]);
  }, [localTracks]);

  return { localTracks, remoteUsers, joined, micMuted, camOff, captions, error, toggleMic, toggleCam, leave };
}
