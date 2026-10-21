import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Zap,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  Layers,
  Skull,
  CheckCircle2,
  FileWarning,
  Activity,
  Radio,
  Lock,
  Unlock
} from 'lucide-react';
import { sounds } from '../../audio/SoundEffects';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SIMULATOR 1 (CHAPTER 1): The Unbuffered Direct Pipe Crash (Race & Drop)
 * Shows Process A flooding Process B with NO buffer in between.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function NoBufferCollisionSim() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [droppedCount, setDroppedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [writerSpeed, setWriterSpeed] = useState(220); // ms per packet

  const canvasRef = useRef(null);
  const stateRef = useRef({
    capsules: [],
    particles: [],
    blastRipples: [],
    lastSpawn: 0,
    isPlaying: true,
    writerSpeed: 220,
    consumerBusyUntil: 0,
    width: 600,
    height: 140
  });

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stateRef.current.writerSpeed = writerSpeed;
  }, [writerSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      stateRef.current.width = rect.width;
      stateRef.current.height = rect.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const w = state.width;
      const h = state.height;
      const centerY = h / 2;

      ctx.clearRect(0, 0, w, h);

      const pipeStart = 95;
      const pipeEnd = w - 95;
      const isConsumerBusy = currentTime < state.consumerBusyUntil;

      // ── Draw Direct Naked Wire / Pipe (NO BUFFER) ──
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pipeStart, centerY - 14, pipeEnd - pipeStart, 28, 6);
      ctx.fill();
      ctx.stroke();

      // Red Hazard Stripes indicating unbuffered direct pipe
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pipeStart, centerY - 14, pipeEnd - pipeStart, 28, 6);
      ctx.clip();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.lineWidth = 8;
      for (let x = pipeStart - 20; x < pipeEnd + 40; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x - 20, centerY - 20);
        ctx.lineTo(x + 10, centerY + 20);
        ctx.stroke();
      }
      ctx.restore();

      // Pipe Label Banner
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DIRECT UNBUFFERED WIRE (ZERO INTERMEDIATE QUEUE)', (pipeStart + pipeEnd) / 2, centerY - 20);

      // ── Process A Station (Left: Fast Writer) ──
      ctx.fillStyle = '#ecfdf5';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(8, centerY - 38, 80, 76, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROCESS A', 48, centerY - 16);
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('cat big.log', 48, centerY - 2);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('100 MB/s ⚡', 48, centerY + 14);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText('UNSTOPPABLE', 48, centerY + 27);

      // ── Process B Station (Right: Slow Reader) ──
      ctx.fillStyle = isConsumerBusy ? '#fff1f2' : '#f0fdf4';
      ctx.strokeStyle = isConsumerBusy ? '#f43f5e' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pipeEnd + 7, centerY - 38, 80, 76, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isConsumerBusy ? '#9f1239' : '#065f46';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROCESS B', pipeEnd + 47, centerY - 16);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('grep "500"', pipeEnd + 47, centerY - 2);
      ctx.fillStyle = isConsumerBusy ? '#e11d48' : '#10b981';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText(isConsumerBusy ? 'BUSY (1 MB/s) ⏳' : 'IDLE / READY', pipeEnd + 47, centerY + 14);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText('REGEX PARSING', pipeEnd + 47, centerY + 27);

      // Closed red barrier when consumer is busy
      if (isConsumerBusy) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.roundRect(pipeEnd - 2, centerY - 12, 6, 24, 2);
        ctx.fill();

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Spawn fast capsules from Process A ──
      if (state.isPlaying && currentTime - state.lastSpawn > state.writerSpeed) {
        state.lastSpawn = currentTime;
        state.capsules.push({
          x: pipeStart + 6,
          speed: 360,
          r: 7,
          id: Math.random()
        });
      }

      // ── Update & Draw Capsules ──
      for (let i = state.capsules.length - 1; i >= 0; i--) {
        const cap = state.capsules[i];
        cap.x += cap.speed * dt;

        // Collision or Consumption check at Process B entrance
        if (cap.x >= pipeEnd - 6) {
          const isFree = currentTime > state.consumerBusyUntil;
          if (isFree) {
            // Consumer digests 1 capsule, but stays occupied for 750ms!
            state.consumerBusyUntil = currentTime + 750;
            setPassedCount((p) => p + 1);
            state.capsules.splice(i, 1);
          } else {
            // DISASTER! Collision with occupied reader!
            setDroppedCount((d) => d + 1);
            sounds.playAlert();

            // Spawn blast ripple
            state.blastRipples.push({
              x: pipeEnd,
              y: centerY,
              radius: 4,
              maxRadius: 28,
              alpha: 1.0
            });

            // Spawn explosion sparks
            for (let k = 0; k < 10; k++) {
              state.particles.push({
                x: pipeEnd,
                y: centerY + (Math.random() - 0.5) * 16,
                vx: (Math.random() - 0.8) * 140,
                vy: (Math.random() - 0.5) * 90,
                life: 1.0,
                color: Math.random() > 0.4 ? '#f43f5e' : '#fbbf24'
              });
            }
            state.capsules.splice(i, 1);
            continue;
          }
        }

        // Draw traveling capsule
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(cap.x, centerY, cap.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Shimmer highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cap.x - 2, centerY - 2, cap.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw Blast Waves ──
      for (let r = state.blastRipples.length - 1; r >= 0; r--) {
        const rip = state.blastRipples[r];
        rip.radius += dt * 45;
        rip.alpha -= dt * 2.2;
        if (rip.alpha <= 0) {
          state.blastRipples.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0, rip.alpha)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── Draw Explosion Sparks ──
      for (let p = state.particles.length - 1; p >= 0; p--) {
        const part = state.particles[p];
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.life -= dt * 2.8;

        if (part.life <= 0) {
          state.particles.splice(p, 1);
          continue;
        }

        ctx.fillStyle = part.color;
        ctx.globalAlpha = Math.max(0, part.life);
        ctx.beginPath();
        ctx.arc(part.x, part.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Smash warning callout on canvas
      if (isConsumerBusy && state.capsules.some((c) => c.x > pipeEnd - 50)) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.95)';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💥 SMASH! CONSUMER BUSY (DATA DROPPED)', (pipeStart + pipeEnd) / 2, centerY + 28);
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 rounded-2xl border-2 border-slate-900 bg-white font-mono space-y-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
            FAILURE #1: DIRECT WIRE COLLISION (ZERO BUFFER)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed presets */}
          <button
            onClick={() => {
              sounds.playClick();
              setWriterSpeed(writerSpeed === 220 ? 110 : 220);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              writerSpeed === 110
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {writerSpeed === 110 ? '⚡ Overdrive (2x Flood)' : 'Normal Speed'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIsPlaying(!isPlaying);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setDroppedCount(0);
              setPassedCount(0);
            }}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 border border-slate-200"
            title="Reset counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-36 bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Real-time Telemetry Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl border-2 border-rose-300 bg-rose-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-900 font-extrabold">
            <Skull className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            <span>DROPPED / DESTROYED PACKETS:</span>
          </div>
          <span className="font-mono font-black text-rose-600 text-lg sm:text-xl">
            {droppedCount} pkts
          </span>
        </div>

        <div className="p-3 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>SUCCESSFULLY READ:</span>
          </div>
          <span className="font-mono font-black text-emerald-600 text-lg sm:text-xl">
            {passedCount} pkts
          </span>
        </div>
      </div>

      {/* Analytical Conclusion */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700 leading-relaxed font-mono">
        <strong className="text-slate-900 font-black">WHY IT FAILS: </strong>
        Process A writes at 100 MB/s while Process B can only process 1 MB/s. Because there is no intermediate buffer queue, any page sent while Process B is busy immediately crashes and is discarded into the void.
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SIMULATOR 2 (CHAPTER 2): The Naive Buffer Failures
 * Displays BOTH naive approaches:
 *   1. Unbounded buffer -> RAM ballooning -> Out-Of-Memory (OOM) panic & SIGKILL.
 *   2. Silent Overwrite -> Unread slots overwritten -> Silent data corruption & CRC error.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function NaiveBufferOverflowSim() {
  const [activeTab, setActiveTab] = useState('unbounded'); // 'unbounded' | 'overwrite'

  // Tab 1: Unbounded Heap State
  const [packetCount, setPacketCount] = useState(8);
  const [isFlooding, setIsFlooding] = useState(false);
  const [hasBurst, setHasBurst] = useState(false);
  const maxCapacity = 50;

  // Tab 2: Silent Overwrite State
  const [ringSlots, setRingSlots] = useState([
    { id: 0, text: 'HEAD: log#1', overwritten: false },
    { id: 1, text: 'log#2', overwritten: false },
    { id: 2, text: 'log#3', overwritten: false },
    { id: 3, text: 'TAIL: log#4', overwritten: false }
  ]);
  const [corruptionCount, setCorruptionCount] = useState(0);

  // Unbounded flood action
  const handleStartFlood = () => {
    sounds.playAlert();
    setIsFlooding(true);
    let current = packetCount;
    const timer = setInterval(() => {
      current += 6;
      setPacketCount(current);
      if (current >= maxCapacity) {
        clearInterval(timer);
        setIsFlooding(false);
        setHasBurst(true);
        sounds.playAlert();
      }
    }, 70);
  };

  const handleResetFlood = () => {
    sounds.playClick();
    setPacketCount(8);
    setHasBurst(false);
    setIsFlooding(false);
  };

  // Overwrite action
  const handleSimulateOverwrite = () => {
    sounds.playAlert();
    setCorruptionCount((c) => c + 1);
    setRingSlots((prev) =>
      prev.map((slot, idx) =>
        idx === (corruptionCount % 4)
          ? { ...slot, text: `CORRUPT#${corruptionCount + 1}`, overwritten: true }
          : slot
      )
    );
  };

  const handleResetOverwrite = () => {
    sounds.playClick();
    setCorruptionCount(0);
    setRingSlots([
      { id: 0, text: 'HEAD: log#1', overwritten: false },
      { id: 1, text: 'log#2', overwritten: false },
      { id: 2, text: 'log#3', overwritten: false },
      { id: 3, text: 'TAIL: log#4', overwritten: false }
    ]);
  };

  const memoryAllocatedMb = (packetCount * 4.2).toFixed(1);

  return (
    <div className="p-4 sm:p-6 rounded-2xl border-2 border-slate-900 bg-white font-mono space-y-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header and Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-100 gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
            FAILURE #2 // NAIVE ATTEMPTS
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">
            WHY NAIVE BUFFER IMPLEMENTATIONS FAIL
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('unbounded');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
              activeTab === 'unbounded'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Unbounded (OOM Crash)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('overwrite');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
              activeTab === 'overwrite'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Silent Overwrite (Lossy)
          </button>
        </div>
      </div>

      {/* ─── TAB 1: UNBOUNDED BUFFER SIMULATION ─── */}
      {activeTab === 'unbounded' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-slate-900">
                ATTEMPT A: "MAKE BUFFER INFINITE"
              </span>
              <p className="text-[11px] text-slate-500">
                RAM is physical and bounded. Fast writers push memory allocation until exhaustion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartFlood}
                disabled={isFlooding || hasBurst}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all ${
                  hasBurst
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Flood Memory Heap 🔥</span>
              </button>

              {hasBurst && (
                <button
                  onClick={handleResetFlood}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white font-black text-xs uppercase"
                >
                  Reset Heap
                </button>
              )}
            </div>
          </div>

          {/* Memory Heap Pressure Gauge */}
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-600 uppercase">HEAP ALLOCATION GAUGE:</span>
              <span className={hasBurst ? 'text-rose-600 animate-pulse text-sm' : 'text-slate-900 text-sm'}>
                {memoryAllocatedMb} MB / 200 MB PHYSICAL RAM {hasBurst ? '(OOM CRASH!)' : ''}
              </span>
            </div>

            {/* Ballooning Memory Bar */}
            <div className="h-8 w-full bg-slate-200 rounded-xl overflow-hidden p-1 border-2 border-slate-300">
              <div
                className={`h-full rounded-lg transition-all duration-150 flex items-center justify-center font-black text-[10px] text-white ${
                  hasBurst
                    ? 'bg-rose-600 w-full animate-pulse'
                    : 'bg-gradient-to-r from-sky-500 via-amber-500 to-rose-600'
                }`}
                style={{ width: `${Math.min(100, (packetCount / maxCapacity) * 100)}%` }}
              >
                {hasBurst ? '💥 MEMORY EXHAUSTED' : `${packetCount * 4} KB ALLOCATED`}
              </div>
            </div>

            {/* OOM Killer Panic Terminal Message */}
            {hasBurst ? (
              <div className="p-4 rounded-xl bg-rose-950 text-rose-200 border-2 border-rose-600 text-xs space-y-1.5 font-mono shadow-md animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-400 font-black uppercase text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>[KERNEL PANIC] Out-of-Memory (OOM) Killer Invoked</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono leading-relaxed pl-6">
                  <code>oom-killer: out of memory: kill process 4812 (cat) score 950 or sacrifice child</code><br />
                  <span className="text-rose-400 font-bold">Killed process 4812 (cat) total-vm:2097152kB, anon-rss:2048000kB</span><br />
                  <span className="text-white font-black">EXIT CODE: 137 (SIGKILL 9) — Operating system killed the process.</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">
                Notice: Without backpressure, Process A rapidly outpaces Process B. Memory balloons until all physical memory is depleted.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: SILENT OVERWRITE / LOSSY BUFFER ─── */}
      {activeTab === 'overwrite' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-slate-900">
                ATTEMPT B: "JUST OVERWRITE OLD DATA SILENTLY"
              </span>
              <p className="text-[11px] text-slate-500">
                Fixed size buffer, but without thread sleep. New writes clobber unread slots.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateOverwrite}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <FileWarning className="w-3.5 h-3.5" />
                <span>Write Over Unread Slot ⚠️</span>
              </button>

              {corruptionCount > 0 && (
                <button
                  onClick={handleResetOverwrite}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white font-black text-xs uppercase"
                >
                  Reset Slots
                </button>
              )}
            </div>
          </div>

          {/* 4 Overwrite Slots Demonstration */}
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ringSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    slot.overwritten
                      ? 'border-rose-500 bg-rose-100 text-rose-900 shadow-sm animate-pulse'
                      : 'border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400">SLOT #{slot.id}</div>
                  <div className="font-mono font-black text-xs mt-1 truncate">
                    {slot.overwritten ? '💥 ' + slot.text : slot.text}
                  </div>
                  <div className="text-[9px] mt-1 font-bold">
                    {slot.overwritten ? (
                      <span className="text-rose-600 uppercase">CORRUPTED (DATA LOST)</span>
                    ) : (
                      <span className="text-emerald-600 uppercase">UNREAD OK</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {corruptionCount > 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  SILENT DATA CORRUPTION: Process B will read spliced or missing log lines! Your grep output is now permanently invalidated.
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">
                Click "Write Over Unread Slot" to see what happens when writers are not blocked: data is overwritten before the reader gets to see it.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytical Conclusion */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-700 leading-relaxed font-mono">
        <strong className="text-slate-900 font-black">THE VERDICT: </strong>
        Neither an infinite buffer (OOM kill) nor silent dropping (data corruption) works. 
        The only true solution is to <strong>force the fast thread to sleep</strong> when the buffer is full.
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SIMULATOR 3 (CHAPTER 3): The Linux Kernel Fix (`fs/pipe.c`)
 * Demonstrates the 16-slot bounded buffer with condition sleep/wakeup gates.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function LinuxBackpressureSim() {
  const [slotCount, setSlotCount] = useState(15);
  const [writerState, setWriterState] = useState('TASK_RUNNING');
  const [readerState, setReaderState] = useState('TASK_RUNNING');
  const [gateLocked, setGateLocked] = useState(false);
  const [lightningActive, setLightningActive] = useState(false);
  const [lastAction, setLastAction] = useState('Initialized with 15/16 slots filled.');

  const capacity = 16;

  // Step 1: Writer pushes a page
  const handleWriterPush = () => {
    sounds.playClick();
    if (slotCount < capacity) {
      const next = slotCount + 1;
      setSlotCount(next);

      if (next >= capacity) {
        // BUFFER FULL! Trigger Backpressure sleep
        setGateLocked(true);
        setWriterState('TASK_INTERRUPTIBLE (SLEEPING)');
        setLastAction('Buffer 16/16 FULL! Process A put to sleep on pipe->wr_wait.');
        sounds.playAlert();
      } else {
        setLastAction(`Wrote 1 page. Buffer now ${next}/${capacity}.`);
      }
    }
  };

  // Step 2: Reader consumes a page
  const handleReaderConsume = () => {
    sounds.playClick();
    if (slotCount > 0) {
      const next = slotCount - 1;
      setSlotCount(next);

      // Reader freed space -> Wakes writer up with wake_up_interruptible()!
      if (writerState.includes('SLEEPING') || gateLocked) {
        setLightningActive(true);
        sounds.playChime();
        setLastAction('Reader freed 1 slot! Kernel triggered wake_up_interruptible() ⚡ to awaken Process A.');

        setTimeout(() => {
          setLightningActive(false);
          setGateLocked(false);
          setWriterState('TASK_RUNNING');
        }, 400);
      } else if (next === 0) {
        setReaderState('TASK_INTERRUPTIBLE (SLEEPING)');
        setLastAction('Buffer 0/16 EMPTY! Process B put to sleep on pipe->rd_wait.');
      } else {
        setLastAction(`Read 1 page. Buffer now ${next}/${capacity}.`);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl border-2 border-slate-900 bg-white font-mono space-y-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
            THE ARCHITECTURAL FIX: 16-SLOT RING BUFFER + WAIT QUEUES
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-bold">
          Linux Source: <code className="bg-slate-100 px-1.5 py-0.5 rounded border text-slate-900">fs/pipe.c</code>
        </div>
      </div>

      {/* 3-Station Architectural Demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Writer Station */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            writerState.includes('SLEEPING')
              ? 'border-amber-400 bg-amber-50/70 shadow-sm'
              : 'border-emerald-500 bg-emerald-50/40 shadow-sm'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">
                PRODUCER (WRITER)
              </span>
              <span className="text-[10px] font-bold text-emerald-600">cat access.log</span>
            </div>

            <div className="text-sm font-black text-slate-900">Process A</div>

            {/* State pill */}
            <div
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                writerState.includes('SLEEPING')
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
            >
              {writerState.includes('SLEEPING') ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>💤 SLEEPING (wr_wait)</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>⚡ TASK_RUNNING</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {writerState.includes('SLEEPING')
                ? 'CPU cycles: 0%. Suspended in wait queue until reader consumes.'
                : 'Writing pages into pipe circular memory.'}
            </p>
          </div>

          <button
            onClick={handleWriterPush}
            disabled={gateLocked}
            className={`mt-4 w-full py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all ${
              gateLocked
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
            }`}
          >
            <span>Write Page (Push) ➔</span>
          </button>
        </div>

        {/* Central 16-Slot Reservoir & Backpressure Gate */}
        <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 flex flex-col items-center justify-between min-h-[170px] relative">
          {/* Mechanical Stopgate Indicator */}
          <div
            className={`w-full py-1.5 rounded-xl text-center text-xs font-black uppercase tracking-wider border transition-colors flex items-center justify-center gap-1.5 ${
              gateLocked
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm animate-pulse'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            {gateLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>🚫 GATE LOCKED (wr_wait)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>✓ GATE OPEN (FLOW READY)</span>
              </>
            )}
          </div>

          {/* 16 Memory Slot Matrix */}
          <div className="w-full my-3">
            <div className="grid grid-cols-8 gap-1.5 w-full">
              {Array.from({ length: capacity }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-5 rounded-md border text-[9px] flex items-center justify-center font-black transition-all ${
                    idx < slotCount
                      ? 'bg-sky-500 border-sky-600 text-white shadow-xs'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                  title={`Slot #${idx}`}
                >
                  {idx < slotCount ? '■' : '·'}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] font-black text-slate-700 mt-2">
              <span>RING BUFFER CAPACITY:</span>
              <span className={slotCount === capacity ? 'text-rose-600' : 'text-sky-600'}>
                {slotCount} / {capacity} PAGES ({(slotCount * 4)} KB)
              </span>
            </div>
          </div>

          {/* Wakeup Lightning Pulse Animation */}
          {lightningActive && (
            <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl border-2 border-emerald-500 flex items-center justify-center animate-ping pointer-events-none">
              <Zap className="w-10 h-10 text-emerald-600" />
            </div>
          )}

          <div className="text-[10px] text-slate-500 text-center font-bold">
            Circular FIFO: <code className="text-slate-800">head % 16</code> &amp; <code className="text-slate-800">tail % 16</code>
          </div>
        </div>

        {/* Reader Station */}
        <div className="p-4 rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">
                CONSUMER (READER)
              </span>
              <span className="text-[10px] font-bold text-indigo-600">grep "500"</span>
            </div>

            <div className="text-sm font-black text-slate-900">Process B</div>

            {/* State pill */}
            <div className="px-2.5 py-1.5 rounded-xl text-xs font-black border bg-indigo-100 text-indigo-900 border-indigo-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>⚡ TASK_RUNNING</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Consumes 1 page at a time. Triggers <code className="text-indigo-900 font-bold">wake_up_interruptible()</code> when space opens.
            </p>
          </div>

          <button
            onClick={handleReaderConsume}
            disabled={slotCount === 0}
            className={`mt-4 w-full py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all ${
              slotCount === 0
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
            }`}
          >
            <span>Read Page (Wake Writer) ⚡</span>
          </button>
        </div>
      </div>

      {/* Live Event Log */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
        <Radio className="w-4 h-4 text-sky-600 shrink-0 animate-pulse" />
        <span className="font-bold text-slate-900">KERNEL EVENT:</span>
        <span className="text-slate-600">{lastAction}</span>
      </div>

      {/* Interactive Instruction */}
      <div className="text-[11px] text-slate-500 leading-normal">
        <strong>Try it yourself:</strong> Click <strong>"Write Page"</strong> until the buffer hits 16/16. The stopgate locks and Process A sleeps. Then click <strong>"Read Page"</strong> to see the kernel issue <code className="text-emerald-700 font-bold">wake_up_interruptible(&amp;pipe-&gt;wr_wait)</code> to awaken the writer!
      </div>
    </div>
  );
}
