"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Users, Send, StopCircle, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";
import { SignalingClient, ICE_SERVERS } from "@/lib/rtc-client";
import { timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

type LiveInfo = {
  id: number;
  title: string;
  description: string;
  status: "scheduled" | "live" | "ended";
  roomId: string;
  viewerCount: number;
  hostId: number;
  hostUsername: string;
  hostDisplayName: string;
  hostAvatar: string | null;
  isHost: boolean;
};

type ChatMsg = {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export default function LiveRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me } = useAuth();
  const router = useRouter();
  const [info, setInfo] = useState<LiveInfo | null>(null);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [viewers, setViewers] = useState(0);
  const chatSince = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [status, setStatus] = useState<string>("Conectando...");
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const signalingRef = useRef<SignalingClient | null>(null);

  // Load live info
  const loadInfo = useCallback(async () => {
    const r = await fetch(`/api/lives/${id}`);
    if (r.ok) setInfo(await r.json());
  }, [id]);

  useEffect(() => {
    void loadInfo();
  }, [loadInfo]);

  // Chat poll
  useEffect(() => {
    async function poll() {
      const url = chatSince.current
        ? `/api/lives/${id}/chat?since=${encodeURIComponent(chatSince.current)}`
        : `/api/lives/${id}/chat`;
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) {
        const arr: ChatMsg[] = await r.json();
        if (arr.length) {
          setChat((prev) => [...prev, ...arr]);
          chatSince.current = arr[arr.length - 1].createdAt;
        }
      }
    }
    void poll();
    const i = setInterval(poll, 2000);
    return () => clearInterval(i);
  }, [id]);

  // WebRTC setup
  useEffect(() => {
    if (!info || !me) return;
    let cancelled = false;

    const signaling = new SignalingClient(info.roomId, async (msg) => {
      if (cancelled) return;
      const peers = peersRef.current;

      if (info.isHost) {
        // Host handles offers from viewers... but here viewers offer? Simpler: viewers 'join' -> host offers.
        if (msg.kind === "join") {
          setStatus("Novo espectador");
          setViewers((v) => v + 1);
          await hostSendOffer(msg.fromUserId);
        } else if (msg.kind === "answer") {
          const pc = peers.get(msg.fromUserId);
          if (pc) await pc.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
        } else if (msg.kind === "ice") {
          const pc = peers.get(msg.fromUserId);
          if (pc) {
            try {
              await pc.addIceCandidate(msg.payload as RTCIceCandidateInit);
            } catch {}
          }
        } else if (msg.kind === "leave") {
          const pc = peers.get(msg.fromUserId);
          pc?.close();
          peers.delete(msg.fromUserId);
          setViewers((v) => Math.max(0, v - 1));
        }
      } else {
        // Viewer
        if (msg.kind === "offer") {
          const pc = createPeer(msg.fromUserId, false);
          await pc.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          await signaling.send("answer", ans, msg.fromUserId);
          setStatus("Assistindo");
        } else if (msg.kind === "ice") {
          const pc = peers.get(msg.fromUserId);
          if (pc) {
            try {
              await pc.addIceCandidate(msg.payload as RTCIceCandidateInit);
            } catch {}
          }
        }
      }
    });
    signalingRef.current = signaling;

    function createPeer(remoteUserId: number, isHost: boolean): RTCPeerConnection {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peersRef.current.set(remoteUserId, pc);
      pc.onicecandidate = (e) => {
        if (e.candidate) signaling.send("ice", e.candidate.toJSON(), remoteUserId);
      };
      if (isHost && localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) {
          pc.addTrack(track, localStreamRef.current);
        }
      } else if (!isHost) {
        pc.ontrack = (e) => {
          if (videoRef.current) {
            videoRef.current.srcObject = e.streams[0];
          }
        };
      }
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          pc.close();
          peersRef.current.delete(remoteUserId);
        }
      };
      return pc;
    }

    async function hostSendOffer(remoteUserId: number) {
      const pc = createPeer(remoteUserId, true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await signaling.send("offer", offer, remoteUserId);
    }

    (async () => {
      if (info.isHost) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
          }
          setStatus("Transmitindo");
          signaling.start();
        } catch (e) {
          setStatus("Sem acesso à câmera/microfone");
          console.error(e);
        }
      } else {
        signaling.start();
        // announce join
        await signaling.send("join", { userId: me.id });
        setStatus("Aguardando anfitrião...");
      }
    })();

    return () => {
      cancelled = true;
      signaling.stop();
      if (!info.isHost) {
        void signaling.send("leave", { userId: me.id }).catch(() => {});
      }
      for (const pc of peersRef.current.values()) pc.close();
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.roomId, info?.isHost, me?.id]);

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const t = chatInput;
    setChatInput("");
    await fetch(`/api/lives/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: t }),
    });
  }

  function toggleCam() {
    const s = localStreamRef.current;
    if (!s) return;
    const on = !camOn;
    setCamOn(on);
    s.getVideoTracks().forEach((t) => (t.enabled = on));
  }
  function toggleMic() {
    const s = localStreamRef.current;
    if (!s) return;
    const on = !micOn;
    setMicOn(on);
    s.getAudioTracks().forEach((t) => (t.enabled = on));
  }

  async function endLive() {
    if (!confirm("Encerrar a transmissão?")) return;
    await fetch(`/api/lives/${id}`, { method: "DELETE" });
    router.push("/lives");
  }

  if (!info) return <p className="p-4 text-sm text-slate-500">Carregando live...</p>;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
        <header className="flex items-center gap-3 p-3 border-b border-slate-100">
          <Link href="/lives" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft size={18} />
          </Link>
          <Avatar src={info.hostAvatar} name={info.hostDisplayName} size={40} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{info.title}</div>
            <div className="text-xs text-slate-500 truncate">@{info.hostUsername} · {status}</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
            <Users size={12} /> {viewers}
          </div>
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 live-pulse">
            <Radio size={10} /> LIVE
          </span>
        </header>
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          {info.isHost && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 rounded-full p-1">
              <button onClick={toggleMic} className="p-2 rounded-full hover:bg-white/10 text-white">
                {micOn ? <Mic size={16} /> : <MicOff size={16} className="text-red-500" />}
              </button>
              <button onClick={toggleCam} className="p-2 rounded-full hover:bg-white/10 text-white">
                {camOn ? <Video size={16} /> : <VideoOff size={16} className="text-red-500" />}
              </button>
              <button onClick={endLive} className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white">
                <StopCircle size={16} />
              </button>
            </div>
          )}
        </div>
        {info.description && (
          <p className="p-4 text-sm text-slate-600 border-t border-slate-100">{info.description}</p>
        )}
      </div>

      <aside className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
        <header className="p-3 border-b border-slate-100 font-semibold text-sm">Chat da live</header>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {chat.length === 0 && <p className="text-xs text-slate-400 text-center py-6">Seja o primeiro a comentar!</p>}
          {chat.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar src={c.avatarUrl} name={c.displayName} size={28} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-500">
                  <b className="text-slate-800">{c.displayName}</b> · {timeAgo(c.createdAt)}
                </div>
                <p className="text-sm break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        {me && (
          <form onSubmit={sendChat} className="p-2 border-t border-slate-100 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escreva algo..."
              className="flex-1 rounded-full bg-slate-100 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500"
            />
            <button className="p-2 rounded-full bg-cyan-500 text-white">
              <Send size={14} />
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
