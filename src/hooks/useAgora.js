import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export function useAgora({ channel, uid, sessionType = 'audio', token: tokenProp }) {
  const clientRef = useRef(null);

  const [localTracks, setLocalTracks]   = useState({ mic: null, cam: null });
  const [remoteUsers, setRemoteUsers]   = useState([]);
  const [joined, setJoined]             = useState(false);
  const [micMuted, setMicMuted]         = useState(false);
  const [camOff, setCamOff]             = useState(false);
  const [error, setError]               = useState(null);
  // Captions: { uid -> latest transcript text }
  const [captions, setCaptions]         = useState({});

  const appId = import.meta.env.VITE_AGORA_APP_ID;
  console.log('[useAgora] appId:', appId?.substring(0,6), 'channel:', channel, 'token:', tokenProp?.substring(0,10));

  useEffect(() => {
    if (!channel) return;
    if (!appId) { console.error('[useAgora] VITE_AGORA_APP_ID is undefined!'); return; }

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === 'audio') user.audioTrack?.play();
      if (mediaType === 'video') user.videoTrack?.play(`video-${user.uid}`);

      setRemoteUsers(prev => {
        const without = prev.filter(u => u.uid !== user.uid);
        return [...without, { ...user, micMuted: false, camOff: false }];
      });
    });

    // FIX: track mute/unmute state for remote users
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

    // When remote user re-publishes (unmutes)
    client.on('user-info-updated', (uid, msg) => {
      if (msg === 'mute-audio') {
        setRemoteUsers(prev => prev.map(u => u.uid === uid ? { ...u, micMuted: true } : u));
      }
      if (msg === 'unmute-audio') {
        setRemoteUsers(prev => prev.map(u => u.uid === uid ? { ...u, micMuted: false } : u));
      }
      if (msg === 'mute-video') {
        setRemoteUsers(prev => prev.map(u => u.uid === uid ? { ...u, camOff: true } : u));
      }
      if (msg === 'unmute-video') {
        setRemoteUsers(prev => prev.map(u => u.uid === uid ? { ...u, camOff: false } : u));
      }
    });

    client.on('user-left', (user) => {
      user.audioTrack?.stop();
      user.videoTrack?.stop();
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    async function join() {
      try {
        // TEMP: hardcoded token for testing — replace with tokenProp after confirming
        const token = tokenProp ?? null;

        console.log('Agora joining:', { appId: appId?.substring(0, 6), channel, tokenLength: token?.length });
        await client.join(appId, channel, token, uid ?? null);

        const isVideo = sessionType === 'video';

        let mic, cam;
        if (isVideo) {
          [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } else {
          mic = await AgoraRTC.createMicrophoneAudioTrack();
        }

        await client.publish(cam ? [mic, cam] : [mic]);
        setLocalTracks({ mic, cam: cam ?? null });
        setJoined(true);
        console.log('✅ Agora joined!');

        // ── Captions via Web Speech API ──────────────────────
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
          const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
            const text = finalTranscript || interimTranscript;
            if (text) {
              // 'local' key for this user's captions
              setCaptions(prev => ({ ...prev, local: text }));
            }
          };

          recognition.onerror = () => {};
          recognition.start();
          client._recognition = recognition;
        }
      } catch (err) {
        console.error('Agora join error:', err);
        setError(err.message || 'Failed to join call');
      }
    }

    join();

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
  }, [appId, channel, uid, sessionType, tokenProp]);

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

  return {
    localTracks,
    remoteUsers,
    joined,
    micMuted,
    camOff,
    captions,
    error,
    toggleMic,
    toggleCam,
    leave,
  };
}