import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, Zap, CheckCircle2, Flame, ShieldAlert, Database, Terminal, Play, Sparkles } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import confetti from 'canvas-confetti';

export default function StoryMode({ currentChapter, onSelectChapter, onLaunchFullSim }) {
  const [unboundedCount, setUnboundedCount] = useState(3);
  const [hasCrashed, setHasCrashed] = useState(false);

  const handleSimulateFlood = () => {
    sounds.playAlert();
    let count = unboundedCount;
    const interval = setInterval(() => {
      count += 8;
      setUnboundedCount(count);
      if (count >= 40) {
        clearInterval(interval);
        setHasCrashed(true);
        sounds.playAlert();
      }
    }, 80);
  };

  const handleResetFlood = () => {
    sounds.playClick();
    setUnboundedCount(3);
    setHasCrashed(false);
  };

  const chapters = [
    { id: 1, tag: 'CHAPTER 01', title: 'THE COLLISION', desc: 'The Unsynchronized Disaster' },
    { id: 2, tag: 'CHAPTER 02', title: 'THE BUFFER DILEMMA', desc: 'Why Naive Queues Crash' },
    { id: 3, tag: 'CHAPTER 03', title: 'THE LINUX SOLUTION', desc: 'Backpressure & Wait Queues' },
    { id: 4, tag: 'CHAPTER 04', title: 'LIVE ENGINE LAB', desc: 'Full Interactive Simulation' },
  ];

  return (
    <div className="space-y-6">
      {/* Big Blocky Chapter Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {chapters.map((ch) => {
          const isActive = currentChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => {
                sounds.playClick();
                onSelectChapter(ch.id);
              }}
              className={`text-left p-3.5 rounded-2xl border-2 transition-all font-mono ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(2,132,199,1)]'
                  : 'border-slate-200 bg-white hover:border-slate-400 text-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider">
                <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>{ch.tag}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </div>
              <div className="font-black text-xs sm:text-sm mt-1 uppercase tracking-tight truncate">
                {ch.title}
              </div>
              <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                {ch.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── CHAPTER 1: THE COLLISION ─── */}
      {currentChapter === 1 && (
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in fade-in duration-300">
          {/* Eyebrow & Headline */}
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-rose-100 border-2 border-rose-500 text-rose-700 font-mono text-xs font-black uppercase mb-3">
              THE CONCURRENCY PROBLEM // PART 1
            </div>
            <h2 className="font-mono font-black text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight uppercase leading-none">
              ONE FAST THREAD. <br />
              ONE SLOW THREAD. <br />
              <span className="text-rose-600 underline decoration-rose-400 decoration-wavy">TOTAL CATASTROPHE.</span>
            </h2>
            <p className="mt-4 text-base sm:text-xl text-slate-600 font-medium max-w-3xl leading-relaxed">
              In modern operating systems, programs don't run alone. You pipe commands together constantly:
              <code className="mx-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-mono font-black text-sm sm:text-base">
                cat bigfile.log | grep "500"
              </code>
            </p>
          </div>

          {/* Blocky Problem Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Thread A */}
            <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded">
                  PRODUCER (WRITER)
                </span>
                <span className="text-xs font-bold text-emerald-600">SPEED: 100 MB/s ⚡</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Process A: cat bigfile.log</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Reading raw bytes straight from NVMe cache. Blazing fast. Emitting millions of memory pages per second into the pipe.
              </p>
            </div>

            {/* Thread B */}
            <div className="p-5 rounded-2xl border-2 border-amber-500 bg-amber-50/40 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                  CONSUMER (READER)
                </span>
                <span className="text-xs font-bold text-amber-600">SPEED: 1 MB/s 🐌</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Process B: grep "500"</h3>
              <p className="text-xs text-slate-600 leading-normal">
                Running heavy regex parsing on every single character. It is 100 times slower than the writer.
              </p>
            </div>
          </div>

          {/* The Dilemma Callout */}
          <div className="p-5 rounded-2xl border-2 border-slate-900 bg-slate-50 font-mono space-y-2">
            <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">THE CORE QUESTION</span>
            <div className="text-base sm:text-lg font-extrabold text-slate-900">
              Where do all the extra pages go while Process B is struggling to keep up?
            </div>
            <p className="text-xs text-slate-600">
              Without coordination, the system will either exhaust all RAM and crash, or overwrite unread data.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-slate-100">
            <span className="font-mono text-xs text-slate-400 font-bold">
              STEP 1 OF 3 // WHAT IS THE PROBLEM?
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(2);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(2,132,199,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>SEE WHY NAIVE BUFFERS CRASH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── CHAPTER 2: THE BUFFER DILEMMA ─── */}
      {currentChapter === 2 && (
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in fade-in duration-300">
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-amber-100 border-2 border-amber-500 text-amber-800 font-mono text-xs font-black uppercase mb-3">
              THE UNBOUNDED FAILURE // PART 2
            </div>
            <h2 className="font-mono font-black text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight uppercase leading-none">
              NAIVE BUFFERS DIE OF <br />
              <span className="text-rose-600 underline decoration-rose-400">MEMORY EXHAUSTION.</span>
            </h2>
            <p className="mt-4 text-base sm:text-xl text-slate-600 font-medium max-w-3xl leading-relaxed">
              Why can't we just give the pipe an infinite buffer? Because memory is finite. When a fast writer outruns a slow reader, memory explodes.
            </p>
          </div>

          {/* Interactive Disaster Playground */}
          <div className="p-6 rounded-2xl border-2 border-slate-900 bg-slate-50 font-mono space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-black uppercase text-slate-900">
                  INTERACTIVE LAB: UNBOUNDED BUFFER SIMULATION
                </span>
                <p className="text-[11px] text-slate-500">
                  Click below to inject data without backpressure controls
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateFlood}
                  disabled={hasCrashed}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm ${
                    hasCrashed
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Flood Buffer</span>
                </button>

                {hasCrashed && (
                  <button
                    onClick={handleResetFlood}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Visual Overflow Bucket */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>BUFFER MEMORY ALLOCATION:</span>
                <span className={hasCrashed ? 'text-rose-600 font-black animate-pulse' : 'text-slate-700'}>
                  {unboundedCount * 4} KB ALLOCATED {hasCrashed ? '(KERNEL OOM CRASH 💥)' : ''}
                </span>
              </div>

              <div className="h-6 w-full bg-slate-200 rounded-lg overflow-hidden p-0.5 border border-slate-300">
                <div
                  className={`h-full rounded transition-all duration-200 ${
                    hasCrashed ? 'bg-rose-600 animate-pulse' : 'bg-gradient-to-r from-sky-500 to-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (unboundedCount / 40) * 100)}%` }}
                />
              </div>

              {hasCrashed ? (
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    SYSTEM PANIC: Linux Out-Of-Memory (OOM) killer invoked! Process killed to save system.
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Notice: As writer floods, the buffer grows indefinitely. In real systems, this freezes the machine.
                </div>
              )}
            </div>
          </div>

          {/* 2 Flawed Approaches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 space-y-1.5">
              <span className="font-extrabold text-rose-800 uppercase block">❌ FLAWED APPROACH A: UNBOUNDED BUFFER</span>
              <p className="text-slate-600">
                Buffer grows infinitely in RAM. Fast writer eats all available memory until the computer freezes and crashes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/50 space-y-1.5">
              <span className="font-extrabold text-rose-800 uppercase block">❌ FLAWED APPROACH B: DROP PACKETS SILENTLY</span>
              <p className="text-slate-600">
                Buffer fixed, but discards overflow. Catastrophic: you lose critical log lines and your analysis produces garbage.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-slate-100">
            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(1);
              }}
              className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900"
            >
              ← BACK TO CHAPTER 1
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(3);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(2,132,199,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>SEE HOW LINUX SOLVED IT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── CHAPTER 3: THE LINUX SOLUTION ─── */}
      {currentChapter === 3 && (
        <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in fade-in duration-300">
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-emerald-100 border-2 border-emerald-500 text-emerald-800 font-mono text-xs font-black uppercase mb-3">
              THE ARCHITECTURAL FIX // PART 3
            </div>
            <h2 className="font-mono font-black text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight uppercase leading-none">
              THE LINUX FIX: <br />
              <span className="text-sky-600">PUT FAST THREADS TO SLEEP.</span>
            </h2>
            <p className="mt-4 text-base sm:text-xl text-slate-600 font-medium max-w-3xl leading-relaxed">
              In Linux kernel source (<code className="text-slate-900 font-bold">fs/pipe.c</code>), every pipe gets a bounded 16-page circular ring buffer (64KB). Synchronization is governed by two elegant rules:
            </p>
          </div>

          {/* The 2 Rules Blocky Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            {/* Rule 1 */}
            <div className="p-6 rounded-2xl border-2 border-slate-900 bg-sky-50/60 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-black text-xs">
                  RULE #1
                </span>
                <span className="font-black text-xs uppercase text-slate-700">BACKPRESSURE (FULL)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                IF BUFFER == FULL, <br />
                PUT WRITER TO SLEEP.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When Process A fills all 16 pages, its <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-bold">sys_write()</code> blocks.
                The kernel transitions it to <strong className="text-sky-900">TASK_INTERRUPTIBLE</strong> on <code className="bg-white px-1 rounded">pipe-&gt;wr_wait</code>. 
                Zero CPU cycles wasted.
              </p>
              <div className="pt-2 text-[11px] text-sky-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>As soon as reader takes 1 page: WAKE WRITER UP!</span>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="p-6 rounded-2xl border-2 border-slate-900 bg-emerald-50/60 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-xs">
                  RULE #2
                </span>
                <span className="font-black text-xs uppercase text-slate-700">STARVATION (EMPTY)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                IF BUFFER == EMPTY, <br />
                PUT READER TO SLEEP.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When the pipe runs dry, Process B's <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold">sys_read()</code> blocks.
                The kernel transitions it to <strong className="text-emerald-900">TASK_INTERRUPTIBLE</strong> on <code className="bg-white px-1 rounded">pipe-&gt;rd_wait</code>.
                No busy spinloop burning your battery.
              </p>
              <div className="pt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>As soon as writer pushes 1 page: WAKE READER UP!</span>
              </div>
            </div>
          </div>

          {/* Circular Ring Benefit */}
          <div className="p-5 rounded-2xl border-2 border-slate-900 bg-slate-50 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">THE DATA STRUCTURE</span>
              <div className="font-black text-sm text-slate-900">
                CIRCULAR FIFO RING BUFFER: <code className="text-sky-600">head % capacity</code> &amp; <code className="text-sky-600">tail % capacity</code>
              </div>
              <p className="text-xs text-slate-600">
                Pointers wrap around continuously without allocating new memory blocks. Fast, bounded, and deterministic.
              </p>
            </div>
            <div className="flex items-center gap-2 text-2xl shrink-0">
              <span>🔄</span>
              <span className="text-xs font-extrabold text-slate-400">Zero Memory Reallocation</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-slate-100">
            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(2);
              }}
              className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900"
            >
              ← BACK TO CHAPTER 2
            </button>

            <button
              onClick={() => {
                sounds.playChime();
                confetti({
                  particleCount: 70,
                  spread: 70,
                  origin: { y: 0.6 }
                });
                onSelectChapter(4);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>LAUNCH THE FULL SIMULATOR LAB</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
