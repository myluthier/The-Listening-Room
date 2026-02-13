import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music2 } from "lucide-react";
import { extractVideoId } from "../lib/supabase";

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function DualPlayer({ instrumentA, instrumentB, activeSlot, onToggle, blindMode }) {
  const containerARef = useRef(null);
  const containerBRef = useRef(null);
  const playerARef = useRef(null);
  const playerBRef = useRef(null);
  const pollRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);

  const getActive = () => (activeSlot === "A" ? playerARef : playerBRef);
  const getInactive = () => (activeSlot === "A" ? playerBRef : playerARef);

  useEffect(() => {
    if (!window.YT?.Player) return;

    const createPlayer = (containerRef, playerRef, inst, slot) => {
      try { playerRef.current?.destroy?.(); } catch (e) {}
      playerRef.current = null;
      if (!containerRef.current || !inst) return;
      containerRef.current.innerHTML = "";
      const div = document.createElement("div");
      div.id = `yt-${slot}-${Date.now()}`;
      containerRef.current.appendChild(div);
      const videoId = extractVideoId(inst.youtube_url);
      if (!videoId) return;

      playerRef.current = new window.YT.Player(div.id, {
        videoId,
        playerVars: {
          controls: 0, modestbranding: 1, rel: 0, showinfo: 0,
          iv_load_policy: 3, disablekb: 1, playsinline: 1, loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (e) => {
            if (slot === activeSlot) {
              e.target.setVolume(volume);
              if (!muted) e.target.unMute(); else e.target.mute();
            } else {
              e.target.mute();
            }
          },
          onStateChange: (e) => {
            if (slot === activeSlot) {
              setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
            }
          },
        },
      });
    };

    createPlayer(containerARef, playerARef, instrumentA, "A");
    createPlayer(containerBRef, playerBRef, instrumentB, "B");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    return () => {
      try { playerARef.current?.destroy?.(); } catch (e) {}
      try { playerBRef.current?.destroy?.(); } catch (e) {}
      playerARef.current = null;
      playerBRef.current = null;
    };
  }, [instrumentA?.id, instrumentB?.id]);

  useEffect(() => {
    const active = getActive().current;
    const inactive = getInactive().current;
    if (!active || !inactive) return;
    try {
      const time = inactive.getCurrentTime?.() || currentTime;
      active.seekTo(time, true);
      active.setVolume(volume);
      if (!muted) active.unMute(); else active.mute();
      active.playVideo();
      inactive.mute();
      inactive.seekTo(time, true);
      inactive.playVideo();
    } catch (e) {}
  }, [activeSlot]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      const active = getActive().current;
      if (active?.getCurrentTime) {
        try {
          setCurrentTime(active.getCurrentTime());
          setDuration(active.getDuration() || 0);
        } catch (e) {}
      }
    }, 250);
    return () => clearInterval(pollRef.current);
  }, [activeSlot]);

  const togglePlay = () => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return;
    try {
      if (isPlaying) { a.pauseVideo(); b.pauseVideo(); }
      else { a.playVideo(); b.playVideo(); }
    } catch (e) {}
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pct * duration;
    try {
      playerARef.current?.seekTo(time, true);
      playerBRef.current?.seekTo(time, true);
      setCurrentTime(time);
    } catch (e2) {}
  };

  const toggleMute = () => {
    const active = getActive().current;
    if (!active) return;
    if (muted) { active.unMute(); active.setVolume(volume); }
    else { active.mute(); }
    setMuted(!muted);
  };

  const fraction = duration > 0 ? currentTime / duration : 0;

  return (
    <div>
      <div className="relative aspect-video bg-stone-900 rounded-2xl overflow-hidden shadow-xl">
        <div
          ref={containerARef}
          className="absolute inset-0 transition-opacity duration-150"
          style={{
            opacity: activeSlot === "A" ? 1 : 0,
            pointerEvents: activeSlot === "A" ? "auto" : "none",
            visibility: blindMode ? "hidden" : "visible",
          }}
        />
        <div
          ref={containerBRef}
          className="absolute inset-0 transition-opacity duration-150"
          style={{
            opacity: activeSlot === "B" ? 1 : 0,
            pointerEvents: activeSlot === "B" ? "auto" : "none",
            visibility: blindMode ? "hidden" : "visible",
          }}
        />

        {blindMode && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)" }}
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-stone-700/50 flex items-center justify-center">
                <Music2 size={32} className="text-stone-500" />
              </div>
              {isPlaying && (
                <div className="absolute inset-0 w-20 h-20 rounded-full border border-stone-600 animate-ping opacity-20" />
              )}
            </div>
            <p className="text-stone-400 text-lg font-semibold tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Blind Listening
            </p>
            <p className="text-stone-600 text-sm mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Now playing</p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeSlot === "A" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-500"
              }`} style={{ fontFamily: "'Outfit', sans-serif" }}>A</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeSlot === "B" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-500"
              }`} style={{ fontFamily: "'Outfit', sans-serif" }}>B</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center bg-black/70 backdrop-blur-md rounded-full p-1 shadow-2xl">
            {["A", "B"].map((s) => (
              <button
                key={s}
                onClick={() => onToggle(s)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeSlot === s ? "bg-white text-stone-900 shadow-md" : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >{s}</button>
            ))}
          </div>
        </div>

        {!blindMode && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
            <span className="text-white text-xs font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {activeSlot === "A" ? instrumentA?.maker : instrumentB?.maker}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 px-1">
        <div className="relative h-6 flex items-center cursor-pointer group" onClick={handleSeek}>
          <div className="absolute left-0 right-0 h-1 bg-stone-200 rounded-full group-hover:h-1.5 transition-all">
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${fraction * 100}%`, background: "linear-gradient(90deg, #78350f, #b45309)" }}
            />
          </div>
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-amber-800 shadow-md -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${fraction * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button onClick={togglePlay} className="p-2 rounded-full hover:bg-stone-100 text-stone-700 transition">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <span className="text-xs text-stone-400 tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <button onClick={toggleMute} className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
