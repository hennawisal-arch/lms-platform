import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function LiveClass() {
  const { id: courseId } = useParams();
  const { user } = useAuth();

  const [joined, setJoined] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> { stream, name }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection

  useEffect(() => {
    return () => leaveRoom(); // cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPeerConnection = (socketId, name) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit('signal', { to: socketId, signal: { type: 'ice-candidate', candidate: e.candidate } });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [socketId]: { stream: e.streams[0], name } }));
    };

    peersRef.current[socketId] = pc;
    return pc;
  };

  const handleJoin = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      setError('Could not access camera/microphone. Check browser permissions and try again.');
      return;
    }

    const token = localStorage.getItem('lms_token');
    const socket = io('/', { auth: { token }, path: '/socket.io' });
    socketRef.current = socket;

    socket.on('connect_error', (err) => setError(`Connection failed: ${err.message}`));

    socket.on('existing-participants', async (participants) => {
      for (const p of participants) {
        const pc = createPeerConnection(p.socketId, p.name);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', { to: p.socketId, signal: { type: 'offer', sdp: offer } });
      }
    });

    socket.on('participant-joined', ({ socketId, name }) => {
      setChatMessages((prev) => [...prev, { system: true, message: `${name} joined the class` }]);
    });

    socket.on('signal', async ({ from, signal }) => {
      if (signal.type === 'offer') {
        const pc = peersRef.current[from] || createPeerConnection(from, 'Participant');
        await pc.setRemoteDescription(signal.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal', { to: from, signal: { type: 'answer', sdp: answer } });
      } else if (signal.type === 'answer') {
        await peersRef.current[from]?.setRemoteDescription(signal.sdp);
      } else if (signal.type === 'ice-candidate') {
        try {
          await peersRef.current[from]?.addIceCandidate(signal.candidate);
        } catch {
          /* benign race between candidate and remote description */
        }
      }
    });

    socket.on('participant-left', ({ socketId }) => {
      peersRef.current[socketId]?.close();
      delete peersRef.current[socketId];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    });

    socket.on('chat-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.emit('join-room', { roomId: courseId, name: user.name, role: user.role });
    setJoined(true);
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave-room');
    socketRef.current?.disconnect();
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setRemoteStreams({});
    setJoined(false);
  };

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted((m) => !m);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = videoOff));
    setVideoOff((v) => !v);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current.emit('chat-message', { roomId: courseId, message: chatInput, name: user.name });
    setChatInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link to={`/courses/${courseId}`} className="text-sm text-slate-400 hover:text-white">&larr; Back to course</Link>
      <h1 className="text-2xl font-display font-bold text-white mt-3 mb-1">Live Class</h1>
      <p className="text-sm text-slate-400 mb-6">Real-time video over WebRTC, signaled through this app's Socket.io server.</p>

      {error && <div className="mb-4 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}

      {!joined ? (
        <div className="card p-10 text-center">
          <p className="text-slate-300 mb-4">Join the live session to enable your camera and microphone.</p>
          <button onClick={handleJoin} className="btn-primary">Join Live Class</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full aspect-video rounded-lg bg-black object-cover" />
                <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">You ({user.name})</span>
              </div>
              {Object.entries(remoteStreams).map(([socketId, { stream, name }]) => (
                <RemoteVideo key={socketId} stream={stream} name={name} />
              ))}
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button onClick={toggleMute} className="btn-secondary">{muted ? 'Unmute' : 'Mute'}</button>
              <button onClick={toggleVideo} className="btn-secondary">{videoOff ? 'Turn camera on' : 'Turn camera off'}</button>
              <button onClick={leaveRoom} className="btn bg-red-500/15 text-red-400 hover:bg-red-500/25">Leave Class</button>
            </div>
          </div>

          <div className="card p-4 flex flex-col h-[480px]">
            <h3 className="font-semibold text-white mb-3">Class Chat</h3>
            <div className="flex-1 overflow-y-auto space-y-2 text-sm">
              {chatMessages.map((m, i) => (
                <p key={i} className={m.system ? 'text-slate-500 text-xs italic' : 'text-slate-300'}>
                  {!m.system && <span className="font-semibold text-white">{m.name}: </span>}
                  {m.message}
                </p>
              ))}
            </div>
            <form onSubmit={sendChat} className="flex gap-2 mt-3">
              <input className="input" placeholder="Say something..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RemoteVideo({ stream, name }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <div className="relative">
      <video ref={ref} autoPlay playsInline className="w-full aspect-video rounded-lg bg-black object-cover" />
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">{name}</span>
    </div>
  );
}
