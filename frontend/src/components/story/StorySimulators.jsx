import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Skull,
  CheckCircle2,
  FileWarning,
  Lock,
  Unlock
} from 'lucide-react';
import { sounds } from '../../audio/SoundEffects';

/**
 * SIMULATOR 1 (CHAPTER 1): The Unbuffered Direct Pipe Collision
 * Shows Process A flooding Process B with zero buffer in between.
 */
export function NoBufferCollisionSim() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [droppedCount, setDroppedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [writerSpeed, setWriterSpeed] = useState(220);

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

      // Pure white crisp canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const pipeStart = 95;
      const pipeEnd = w - 95;
      const isConsumerBusy = currentTime < state.consumerBusyUntil;

      // Direct Naked Wire / Pipe
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(pipeStart, centerY - 14, pipeEnd - pipeStart, 28);
      ctx.fill();
      ctx.stroke();

      // Red Hazard Diagonal Stripes
      ctx.save();
      ctx.beginPath();
      ctx.rect(pipeStart, centerY - 14, pipeEnd - pipeStart, 28);
      ctx.clip();
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.15)';
      ctx.lineWidth = 8;
      for (let x = pipeStart - 20; x < pipeEnd + 40; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x - 20, centerY - 20);
        ctx.lineTo(x + 10, centerY + 20);
        ctx.stroke();
      }
      ctx.restore();

      // Label Banner
      ctx.fillStyle = '#71717a';
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DIRECT WIRE (NO QUEUE)', (pipeStart + pipeEnd) / 2, centerY - 20);

      // Process A Station (Left)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(8, centerY - 38, 80, 76);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROCESS A', 48, centerY - 16);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.fillText('100 MB/s', 48, centerY + 2);
      ctx.fillStyle = '#71717a';
      ctx.font = 'normal 9px "Space Mono", monospace';
      ctx.fillText('cat big.log', 48, centerY + 18);

      // Process B Station (Right)
      ctx.fillStyle = isConsumerBusy ? '#fff1f2' : '#ffffff';
      ctx.strokeStyle = isConsumerBusy ? '#e11d48' : '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(pipeEnd + 7, centerY - 38, 80, 76);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROCESS B', pipeEnd + 47, centerY - 16);
      ctx.fillStyle = isConsumerBusy ? '#e11d48' : '#e11d48';
      ctx.font = 'bold 10px "Space Mono", monospace';
      ctx.fillText(isConsumerBusy ? 'BUSY' : '1 MB/s', pipeEnd + 47, centerY + 2);
      ctx.fillStyle = '#71717a';
      ctx.font = 'normal 9px "Space Mono", monospace';
      ctx.fillText('grep "500"', pipeEnd + 47, centerY + 18);

      // Closed red barrier when consumer is busy
      if (isConsumerBusy) {
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(pipeEnd - 2, centerY - 14, 6, 28);
      }

      // Spawn fast capsules
      if (state.isPlaying && currentTime - state.lastSpawn > state.writerSpeed) {
        state.lastSpawn = currentTime;
        state.capsules.push({
          x: pipeStart + 6,
          speed: 360,
          r: 7,
          id: Math.random()
        });
      }

      // Update & Draw Capsules
      for (let i = state.capsules.length - 1; i >= 0; i--) {
        const cap = state.capsules[i];
        cap.x += cap.speed * dt;

        if (cap.x >= pipeEnd - 6) {
          const isFree = currentTime > state.consumerBusyUntil;
          if (isFree) {
            state.consumerBusyUntil = currentTime + 750;
            setPassedCount((p) => p + 1);
            state.capsules.splice(i, 1);
          } else {
            // Collision crash
            setDroppedCount((d) => d + 1);
            sounds.playAlert();

            state.blastRipples.push({
              x: pipeEnd,
              y: centerY,
              radius: 4,
              maxRadius: 28,
              alpha: 1.0
            });

            for (let k = 0; k < 12; k++) {
              state.particles.push({
                x: pipeEnd,
                y: centerY + (Math.random() - 0.5) * 16,
                vx: (Math.random() - 0.8) * 160,
                vy: (Math.random() - 0.5) * 100,
                life: 1.0,
                color: Math.random() > 0.4 ? '#e11d48' : '#000000'
              });
            }
            state.capsules.splice(i, 1);
            continue;
          }
        }

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(cap.x, centerY, cap.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Blast Waves
      for (let r = state.blastRipples.length - 1; r >= 0; r--) {
        const rip = state.blastRipples[r];
        rip.radius += dt * 45;
        rip.alpha -= dt * 2.2;
        if (rip.alpha <= 0) {
          state.blastRipples.splice(r, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(225, 29, 72, ${Math.max(0, rip.alpha)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Explosion Sparks
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

      if (isConsumerBusy && state.capsules.some((c) => c.x > pipeEnd - 50)) {
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 11px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COLLISION: PACKET DESTROYED', (pipeStart + pipeEnd) / 2, centerY + 28);
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
    <div className="p-6 border-2 border-black bg-white font-mono space-y-4 shadow-[4px_4px_0px_0px_#000000]">
      {/* Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black gap-3">
        <div>
          <span className="font-display font-black text-sm uppercase tracking-tight text-black">
            DEMONSTRATION: DIRECT UNBUFFERED COLLISION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setWriterSpeed(writerSpeed === 220 ? 110 : 220);
            }}
            className={`px-3 py-1.5 text-xs font-bold border-2 border-black uppercase transition-all shadow-[2px_2px_0px_0px_#000] ${
              writerSpeed === 110
                ? 'bg-red-600 text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            {writerSpeed === 110 ? 'OVERDRIVE: 2x FLOOD' : 'NORMAL SPEED'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIsPlaying(!isPlaying);
            }}
            className="px-3 py-1.5 bg-black text-white font-bold text-xs uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setDroppedCount(0);
              setPassedCount(0);
            }}
            className="p-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            title="Reset counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-36 bg-white border-2 border-black overflow-hidden shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Real-time Telemetry Counters (Big Bold Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-2 text-black font-bold uppercase">
            <Skull className="w-5 h-5 text-red-600 shrink-0" />
            <span>DROPPED DATA:</span>
          </div>
          <span className="font-display font-black text-red-600 text-2xl">
            {droppedCount} PKTS
          </span>
        </div>

        <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
          <div className="flex items-center gap-2 text-black font-bold uppercase">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>SUCCESSFULLY READ:</span>
          </div>
          <span className="font-display font-black text-black text-2xl">
            {passedCount} PKTS
          </span>
        </div>
      </div>

      {/* Analytical Conclusion */}
      <div className="p-4 bg-neutral-100 border-2 border-black text-xs text-black leading-relaxed font-mono">
        <strong className="uppercase">THE TAKEAWAY: </strong>
        Process A writes at 100 MB/s while Process B consumes at 1 MB/s. Without an intermediate buffer queue, every subsequent page crashes into the busy reader and is permanently lost.
      </div>
    </div>
  );
}

/**
 * SIMULATOR 2 (CHAPTER 2): The Naive Buffer Failures
 * Demonstrates Unbounded OOM Crash & Silent Overwrite Data Corruption.
 */
export function NaiveBufferOverflowSim() {
  const [activeTab, setActiveTab] = useState('unbounded');

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
    <div className="p-6 border-2 border-black bg-white font-mono space-y-5 shadow-[4px_4px_0px_0px_#000000]">
      {/* Header and Sub-Tab Navigation (No //) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black gap-3">
        <div>
          <h3 className="font-display font-black text-base sm:text-lg text-black uppercase">
            WHY NAIVE BUFFER IMPLEMENTATIONS FAIL
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('unbounded');
            }}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all ${
              activeTab === 'unbounded'
                ? 'bg-black text-white'
                : 'text-black hover:bg-white'
            }`}
          >
            1. Unbounded (OOM Crash)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('overwrite');
            }}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all ${
              activeTab === 'overwrite'
                ? 'bg-black text-white'
                : 'text-black hover:bg-white'
            }`}
          >
            2. Silent Overwrite (Lossy)
          </button>
        </div>
      </div>

      {/* TAB 1: UNBOUNDED BUFFER SIMULATION */}
      {activeTab === 'unbounded' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase text-black">
                ATTEMPT A: "MAKE BUFFER INFINITE"
              </span>
              <p className="text-xs text-neutral-600">
                RAM is physical and finite. Fast writers push memory allocation until system exhaustion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartFlood}
                disabled={isFlooding || hasBurst}
                className={`px-4 py-2 font-bold text-xs uppercase flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:scale-95 transition-all ${
                  hasBurst
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Flood Memory Heap</span>
              </button>

              {hasBurst && (
                <button
                  onClick={handleResetFlood}
                  className="px-3 py-2 bg-black text-white font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                >
                  Reset Heap
                </button>
              )}
            </div>
          </div>

          {/* Memory Heap Pressure Gauge */}
          <div className="p-5 bg-neutral-50 border-2 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-700 uppercase">HEAP ALLOCATION:</span>
              <span className={hasBurst ? 'text-red-600 text-sm font-black' : 'text-black text-sm'}>
                {memoryAllocatedMb} MB / 200 MB PHYSICAL RAM {hasBurst ? '(OOM CRASH)' : ''}
              </span>
            </div>

            {/* Ballooning Memory Bar in Stark Red */}
            <div className="h-8 w-full bg-white border-2 border-black p-0.5">
              <div
                className={`h-full transition-all duration-150 flex items-center justify-center font-bold text-xs text-white ${
                  hasBurst ? 'bg-red-600 w-full' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(100, (packetCount / maxCapacity) * 100)}%` }}
              >
                {hasBurst ? 'MEMORY EXHAUSTED' : `${packetCount * 4} KB ALLOCATED`}
              </div>
            </div>

            {/* OOM Killer Panic Box */}
            {hasBurst ? (
              <div className="p-4 bg-white border-2 border-red-600 text-xs space-y-1.5 font-mono shadow-[4px_4px_0px_0px_#dc2626]">
                <div className="flex items-center gap-2 text-red-600 font-bold uppercase text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>KERNEL PANIC: Out-Of-Memory (OOM) Killer Invoked</span>
                </div>
                <div className="text-xs text-neutral-800 font-mono leading-relaxed pl-6">
                  <code>oom-killer: out of memory: kill process 4812 (cat) score 950</code><br />
                  <span className="text-red-600 font-bold">Killed process 4812 (cat) total-vm:2097152kB, anon-rss:2048000kB</span><br />
                  <span className="text-black font-bold">EXIT CODE 137 (SIGKILL 9) — Kernel terminated process to protect system.</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500">
                Notice: Without backpressure, Process A rapidly outpaces Process B. Memory grows until the operating system crashes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SILENT OVERWRITE */}
      {activeTab === 'overwrite' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase text-black">
                ATTEMPT B: "JUST OVERWRITE OLD DATA SILENTLY"
              </span>
              <p className="text-xs text-neutral-600">
                Fixed size buffer, but without thread sleep. New writes clobber unread slots.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateOverwrite}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:scale-95 transition-all"
              >
                <FileWarning className="w-3.5 h-3.5 text-yellow-400" />
                <span>Write Over Unread Slot</span>
              </button>

              {corruptionCount > 0 && (
                <button
                  onClick={handleResetOverwrite}
                  className="px-3 py-2 bg-white hover:bg-neutral-100 text-black font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                >
                  Reset Slots
                </button>
              )}
            </div>
          </div>

          {/* 4 Overwrite Slots Demonstration */}
          <div className="p-5 bg-neutral-50 border-2 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ringSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 border-2 text-center transition-all ${
                    slot.overwritten
                      ? 'border-red-600 bg-red-100 text-red-900 shadow-[2px_2px_0px_0px_#dc2626]'
                      : 'border-black bg-white text-black'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-500">SLOT #{slot.id}</div>
                  <div className="font-mono font-bold text-xs mt-1 truncate">
                    {slot.overwritten ? '[CLOBBERED] ' + slot.text : slot.text}
                  </div>
                  <div className="text-xs mt-1 font-bold">
                    {slot.overwritten ? (
                      <span className="text-red-600 uppercase">CORRUPTED</span>
                    ) : (
                      <span className="text-emerald-700 uppercase">UNREAD OK</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {corruptionCount > 0 ? (
              <div className="p-3 bg-red-50 border-2 border-red-600 text-red-900 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  SILENT CORRUPTION: Process B reads spliced or missing lines. Output data is permanently invalidated.
                </span>
              </div>
            ) : (
              <div className="text-xs text-neutral-500">
                Click "Write Over Unread Slot" to see what happens when writers are not blocked: unread data is overwritten.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytical Conclusion */}
      <div className="p-4 bg-neutral-100 border-2 border-black text-xs text-black leading-relaxed font-mono">
        <strong className="uppercase">THE VERDICT: </strong>
        Neither an infinite buffer (OOM kill) nor silent dropping (data corruption) works. 
        The only true solution is to <strong>force the fast thread to sleep</strong> when the buffer is full.
      </div>
    </div>
  );
}

/**
 * SIMULATOR 3 (CHAPTER 3): The Linux Kernel Fix (fs/pipe.c)
 * Demonstrates the 16-slot bounded buffer with condition sleep/wakeup gates.
 */
export function LinuxBackpressureSim() {
  const [slotCount, setSlotCount] = useState(15);
  const [writerState, setWriterState] = useState('TASK_RUNNING');
  const [gateLocked, setGateLocked] = useState(false);
  const [lastAction, setLastAction] = useState('Initialized with 15/16 slots filled.');

  const capacity = 16;

  const handleWriterPush = () => {
    sounds.playClick();
    if (slotCount < capacity) {
      const next = slotCount + 1;
      setSlotCount(next);

      if (next >= capacity) {
        setGateLocked(true);
        setWriterState('SLEEPING (wr_wait)');
        setLastAction('Buffer 16/16 full. Process A put to sleep on pipe->wr_wait.');
        sounds.playAlert();
      } else {
        setLastAction(`Wrote 1 page. Buffer now ${next}/${capacity}.`);
      }
    }
  };

  const handleReaderConsume = () => {
    sounds.playClick();
    if (slotCount > 0) {
      const next = slotCount - 1;
      setSlotCount(next);

      if (writerState.includes('SLEEPING') || gateLocked) {
        sounds.playChime();
        setLastAction('Reader freed 1 slot. Kernel fired wake_up_interruptible() to awaken Process A.');

        setTimeout(() => {
          setGateLocked(false);
          setWriterState('TASK_RUNNING');
        }, 300);
      } else {
        setLastAction(`Read 1 page. Buffer now ${next}/${capacity}.`);
      }
    }
  };

  return (
    <div className="p-6 border-2 border-black bg-white font-mono space-y-5 shadow-[4px_4px_0px_0px_#000000]">
      {/* Header (No //) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-black gap-2">
        <span className="font-display font-black text-sm uppercase tracking-tight text-black">
          THE ARCHITECTURAL FIX: 16-SLOT RING BUFFER + WAIT QUEUES
        </span>

        <span className="text-xs text-neutral-600 font-bold uppercase">
          LINUX SOURCE: fs/pipe.c
        </span>
      </div>

      {/* 3-Station Architectural Demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Writer Station */}
        <div className={`p-5 border-2 border-black transition-all flex flex-col justify-between shadow-[4px_4px_0px_0px_#000] ${
          writerState.includes('SLEEPING') ? 'bg-red-50' : 'bg-white'
        }`}>
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-500 uppercase">
              PRODUCER (WRITER)
            </div>
            <div className="font-display font-bold text-lg text-black">Process A: cat</div>

            <div className={`px-2.5 py-1.5 text-xs font-bold border-2 border-black uppercase ${
              writerState.includes('SLEEPING')
                ? 'bg-red-600 text-white'
                : 'bg-emerald-100 text-emerald-900 border-emerald-600'
            }`}>
              {writerState.includes('SLEEPING') ? 'SLEEPING IN WR_WAIT' : 'TASK_RUNNING (WRITING)'}
            </div>

            <p className="text-xs text-neutral-600">
              {writerState.includes('SLEEPING')
                ? '0% CPU cycles. Suspended in kernel wait queue.'
                : 'Writing pages into pipe circular memory.'}
            </p>
          </div>

          <button
            onClick={handleWriterPush}
            disabled={gateLocked}
            className={`mt-4 w-full py-3 font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              gateLocked
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            Write 1 Page (Push)
          </button>
        </div>

        {/* Central 16-Slot Reservoir & Backpressure Gate */}
        <div className="p-5 border-2 border-black bg-neutral-50 flex flex-col items-center justify-between min-h-[170px] shadow-[4px_4px_0px_0px_#000]">
          {/* Mechanical Stopgate Indicator */}
          <div className={`w-full py-2 text-center text-xs font-bold uppercase tracking-wider border-2 border-black ${
            gateLocked
              ? 'bg-red-600 text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black'
          }`}>
            {gateLocked ? 'GATE LOCKED (BUFFER FULL)' : 'GATE OPEN (FLOW READY)'}
          </div>

          {/* 16 Memory Slot Matrix */}
          <div className="w-full my-3">
            <div className="grid grid-cols-8 gap-1.5 w-full">
              {Array.from({ length: capacity }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-5 border-2 border-black transition-colors ${
                    idx < slotCount ? 'bg-red-600' : 'bg-neutral-100'
                  }`}
                  title={`Slot #${idx}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-black mt-2">
              <span>RING CAPACITY:</span>
              <span className={slotCount === capacity ? 'text-red-600' : 'text-black'}>
                {slotCount} / {capacity} PAGES ({(slotCount * 4)} KB)
              </span>
            </div>
          </div>

          <div className="text-xs text-neutral-600 text-center font-bold">
            Circular FIFO: <code className="text-black">head % 16</code> and <code className="text-black">tail % 16</code>
          </div>
        </div>

        {/* Reader Station */}
        <div className="p-5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-500 uppercase">
              CONSUMER (READER)
            </div>
            <div className="font-display font-bold text-lg text-black">Process B: grep</div>

            <div className="px-2.5 py-1.5 text-xs font-bold border-2 border-black bg-neutral-100 text-black uppercase">
              TASK_RUNNING (READING)
            </div>

            <p className="text-xs text-neutral-600">
              Consumes 1 page at a time. Triggers <code className="font-bold text-black">wake_up_interruptible()</code> when space opens.
            </p>
          </div>

          <button
            onClick={handleReaderConsume}
            disabled={slotCount === 0}
            className={`mt-4 w-full py-3 font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              slotCount === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Read Page (Wake Writer)
          </button>
        </div>
      </div>

      {/* Live Event Log */}
      <div className="p-3.5 bg-neutral-100 border-2 border-black text-xs text-black flex items-center gap-2">
        <span className="font-bold uppercase text-red-600">KERNEL EVENT:</span>
        <span className="text-neutral-800">{lastAction}</span>
      </div>

      <div className="text-xs text-neutral-600 leading-normal">
        <strong>Try it yourself:</strong> Click <strong>"Write 1 Page"</strong> until the buffer hits 16/16. The stopgate locks and Process A sleeps. Then click <strong>"Read Page"</strong> to watch the kernel wake the writer with zero lost data!
      </div>
    </div>
  );
}
