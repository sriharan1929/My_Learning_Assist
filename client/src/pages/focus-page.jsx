import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button.jsx";
import { DataCard } from "../components/common/data-card.jsx";
import { PageHeader } from "../components/common/page-header.jsx";
import { createItem } from "../services/api.js";

export function FocusPage() {
  const queryClient = useQueryClient();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Ready when you are.");
  const [soundscape, setSoundscape] = useState("none"); // "none", "brown", "rain", "breeze", "tick"

  // Audio refs
  const audioCtxRef = useRef(null);
  const soundSourceRef = useRef(null);
  const lfoRef = useRef(null);
  const gainNodeRef = useRef(null);

  const startSoundscape = (type) => {
    if (type === "none" || type === "tick") {
      stopSoundscape();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      stopSoundscape();

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "brown" || type === "rain") {
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          output[i] = white * 0.5;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const gainNode = ctx.createGain();
      gainNodeRef.current = gainNode;

      if (type === "brown") {
        gainNode.gain.value = 0.15;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
      } else if (type === "rain") {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 800;

        gainNode.gain.value = 0.22;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
      } else if (type === "breeze") {
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 1.5;
        filter.frequency.value = 500;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 350;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        gainNode.gain.value = 0.12;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        lfo.start();
        lfoRef.current = lfo;
      }

      source.start();
      soundSourceRef.current = source;
    } catch (e) {
      console.error("Web Audio API error:", e);
    }
  };

  const stopSoundscape = () => {
    if (soundSourceRef.current) {
      try {
        soundSourceRef.current.stop();
      } catch (e) {}
      soundSourceRef.current = null;
    }
    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
      } catch (e) {}
      lfoRef.current = null;
    }
  };

  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.error(e);
    }
  };

  const playZenChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const freqs = [261.63, 329.63, 392.00, 523.25];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const vol = 0.15 / freqs.length;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + 0.1 * (idx + 1));
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5 - 0.2 * idx);

        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Soundscape playback control
  useEffect(() => {
    if (running) {
      startSoundscape(soundscape);
    } else {
      stopSoundscape();
    }
    return () => stopSoundscape();
  }, [running, soundscape]);

  // Main countdown timer
  useEffect(() => {
    if (!running) return;

    if (seconds <= 0) {
      setRunning(false);
      setMessage("Focus session complete — beautifully done.");
      playZenChime();

      createItem("study-sessions", {
        title: "Focus timer session",
        topic: "Deep work",
        plannedDate: new Date().toISOString().slice(0, 10),
        duration: minutes,
        notes: "Completed with the focus timer.",
        status: "Completed"
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["study-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      });
      return;
    }

    const timer = setInterval(() => {
      setSeconds((value) => {
        const nextValue = value - 1;
        if (soundscape === "tick") {
          playTickSound();
        }
        return nextValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, seconds, minutes, soundscape, queryClient]);

  const choose = (value) => {
    setMinutes(value);
    setSeconds(value * 60);
    setRunning(false);
    setMessage("Ready when you are.");
  };

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  // Circular progress calculations
  const totalSeconds = minutes * 60;
  const progress = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <>
      <PageHeader
        eyebrow="Deep work"
        title="Focus Timer"
        description="Give one useful thing your full attention. Completed sessions are added to your study history."
      />
      <div className="split-content">
        <DataCard>
          <div className="timer" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="preset-row">
              {[15, 25, 45, 60].map((value) => (
                <Button
                  key={value}
                  variant={minutes === value ? "primary" : "secondary"}
                  size="small"
                  onClick={() => choose(value)}
                >
                  {value} min
                </Button>
              ))}
            </div>

            {/* Circular Progress Countdown Timer */}
            <div
              className="timer-container"
              style={{
                position: "relative",
                width: "240px",
                height: "240px",
                margin: "24px auto",
                display: "grid",
                placeItems: "center"
              }}
            >
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  transform: "rotate(-90deg)"
                }}
              >
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  fill="transparent"
                  stroke="var(--surface-soft)"
                  strokeWidth="8"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  fill="transparent"
                  stroke="var(--clay-brown)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.3s linear" }}
                />
              </svg>
              <div style={{ zIndex: 1, textAlign: "center" }}>
                <div
                  className="timer-clock"
                  style={{
                    fontSize: "3.5rem",
                    margin: 0,
                    fontFamily: "Fraunces",
                    lineHeight: 1
                  }}
                  aria-live="polite"
                >
                  {clock}
                </div>
              </div>
            </div>

            <p className="card-copy" style={{ marginTop: 0, marginBottom: "16px" }}>
              {message}
            </p>

            {/* Soundscape Selector Controls */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "24px",
                width: "100%",
                alignItems: "center"
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--walnut-brown)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {soundscape === "none" ? <VolumeX size={14} /> : <Volume2 size={14} />}
                Focus Soundscape
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { id: "none", label: "None" },
                  { id: "brown", label: "Deep Brown" },
                  { id: "rain", label: "Soft Rain" },
                  { id: "breeze", label: "Forest Wind" },
                  { id: "tick", label: "Zen Tick" }
                ].map((sound) => (
                  <Button
                    key={sound.id}
                    variant={soundscape === sound.id ? "primary" : "secondary"}
                    size="small"
                    style={{ fontSize: "0.78rem", padding: "4px 10px", minHeight: "28px" }}
                    onClick={() => {
                      setSoundscape(sound.id);
                      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                        audioCtxRef.current.resume();
                      }
                    }}
                  >
                    {sound.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="timer-actions">
              <Button onClick={() => setRunning((value) => !value)}>
                {running ? (
                  <>
                    <Pause />
                    Pause
                  </>
                ) : (
                  <>
                    <Play />
                    Start focus
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => choose(minutes)}>
                <RotateCcw />
                Reset
              </Button>
            </div>
          </div>
        </DataCard>
        <DataCard>
          <p className="eyebrow">A small ritual</p>
          <h2>Before you begin</h2>
          <div className="list">
            <div className="list-row">
              <strong>1. Name one outcome</strong>
            </div>
            <div className="list-row">
              <strong>2. Remove one distraction</strong>
            </div>
            <div className="list-row">
              <strong>3. Stop when the timer ends</strong>
            </div>
          </div>
          <p className="card-copy">A clean finish makes it easier to begin again tomorrow.</p>
        </DataCard>
      </div>
    </>
  );
}
