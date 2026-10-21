import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import confetti from 'canvas-confetti';
import {
  NoBufferCollisionSim,
  NaiveBufferOverflowSim,
  LinuxBackpressureSim
} from './story/StorySimulators';

export default function StoryMode({ currentChapter, onSelectChapter, onLaunchFullSim }) {
  const chapters = [
    { id: 1, tag: 'CHAPTER 1', title: 'THE COLLISION', desc: 'The Unsynchronized Disaster' },
    { id: 2, tag: 'CHAPTER 2', title: 'NAIVE BUFFERS', desc: 'Why Memory Explodes' },
    { id: 3, tag: 'CHAPTER 3', title: 'THE LINUX FIX', desc: 'Backpressure & Wait Queues' },
    { id: 4, tag: 'CHAPTER 4', title: 'SIMULATOR LAB', desc: 'Full Concurrency Engine' },
  ];

  return (
    <div className="space-y-6">
      {/* Bold Blocky Chapter Stepper (No // and no blinking dots) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {chapters.map((ch) => {
          const isActive = currentChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => {
                sounds.playClick();
                onSelectChapter(ch.id);
              }}
              className={`text-left p-4 border-2 transition-all ${
                isActive
                  ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_#e11d48]'
                  : 'border-black bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_0px_#000000]'
              }`}
            >
              <div className="text-xs font-bold tracking-wider">
                <span className={isActive ? 'text-red-400' : 'text-neutral-500'}>{ch.tag}</span>
              </div>
              <div className="font-display font-black text-sm sm:text-base mt-1 uppercase tracking-tight truncate">
                {ch.title}
              </div>
              <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {ch.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── CHAPTER 1: THE COLLISION ─── */}
      {currentChapter === 1 && (
        <div className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000000] space-y-8 animate-in fade-in duration-200">
          {/* Eyebrow & Headline with Monumental Typography */}
          <div>
            <div className="inline-block px-3 py-1 bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider mb-4 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              THE PROBLEM: CONCURRENCY FAILURE
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-black tracking-tight uppercase leading-[0.95]">
              ONE FAST THREAD. <br />
              ONE SLOW THREAD. <br />
              <span className="bg-red-600 text-white px-2 py-0.5 mt-2 inline-block">TOTAL CATASTROPHE.</span>
            </h2>
            <p className="mt-5 text-base sm:text-xl text-neutral-800 font-medium max-w-3xl leading-relaxed">
              In modern operating systems, programs don't run alone. You pipe commands together constantly:
              <code className="mx-2 px-2.5 py-1 bg-neutral-100 border-2 border-black text-black font-mono font-bold text-sm sm:text-base">
                cat bigfile.log | grep "500"
              </code>
            </p>
          </div>

          {/* Blocky Problem Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
            {/* Thread A */}
            <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="uppercase text-neutral-500">PRODUCER (WRITER)</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 border border-emerald-400">100 MB/s FAST</span>
              </div>
              <h3 className="font-display font-bold text-xl text-black">Process A: cat bigfile.log</h3>
              <p className="text-xs text-neutral-600 leading-normal">
                Reading raw bytes straight from NVMe cache. Blazing fast. Emitting millions of memory pages per second into the pipe.
              </p>
            </div>

            {/* Thread B */}
            <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="uppercase text-neutral-500">CONSUMER (READER)</span>
                <span className="text-red-700 bg-red-100 px-2 py-0.5 border border-red-400">1 MB/s SLOW</span>
              </div>
              <h3 className="font-display font-bold text-xl text-black">Process B: grep "500"</h3>
              <p className="text-xs text-neutral-600 leading-normal">
                Running heavy regex parsing on every single character. It is 100 times slower than the writer.
              </p>
            </div>
          </div>

          {/* ─── LIVE VISUAL SIMULATOR: UNBUFFERED CRASH ─── */}
          <section aria-label="Visual Collision Demonstration">
            <NoBufferCollisionSim />
          </section>

          {/* The Dilemma Callout */}
          <div className="p-6 border-2 border-black bg-neutral-50 font-mono space-y-2 shadow-[4px_4px_0px_0px_#000000]">
            <span className="text-xs font-bold uppercase text-neutral-500 block tracking-wider">THE CORE QUESTION</span>
            <div className="text-base sm:text-lg font-bold text-black">
              Where do all the extra pages go while Process B is struggling to keep up?
            </div>
            <p className="text-xs text-neutral-600">
              Without coordination, the system will either exhaust all RAM and crash, or overwrite unread data.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black font-mono">
            <span className="text-xs text-neutral-500 font-bold uppercase">
              STEP 1 OF 3: THE PROBLEM
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(2);
              }}
              className="w-full sm:w-auto px-7 py-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_#e11d48] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <span>SEE WHY NAIVE BUFFERS CRASH</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* ─── CHAPTER 2: THE BUFFER DILEMMA ─── */}
      {currentChapter === 2 && (
        <div className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000000] space-y-8 animate-in fade-in duration-200">
          <div>
            <div className="inline-block px-3 py-1 bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider mb-4 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              THE FAILURE: NAIVE APPROACHES
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-black tracking-tight uppercase leading-[0.95]">
              NAIVE BUFFERS DIE OF <br />
              <span className="bg-red-600 text-white px-2 py-0.5 mt-2 inline-block">MEMORY EXHAUSTION.</span>
            </h2>
            <p className="mt-5 text-base sm:text-xl text-neutral-800 font-medium max-w-3xl leading-relaxed">
              Why can't we just give the pipe an infinite buffer? Because memory is finite. When a fast writer outruns a slow reader, memory explodes.
            </p>
          </div>

          {/* ─── LIVE VISUAL SIMULATOR: NAIVE ATTEMPTS (OOM & OVERWRITE) ─── */}
          <section aria-label="Naive Buffer Overflow Demonstration">
            <NaiveBufferOverflowSim />
          </section>

          {/* 2 Flawed Approaches Technical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-5 border-2 border-black bg-white space-y-1.5 shadow-[4px_4px_0px_0px_#000000]">
              <span className="font-bold text-red-600 uppercase block text-sm">FLAWED APPROACH A: UNBOUNDED BUFFER</span>
              <p className="text-neutral-700 leading-normal">
                Buffer grows infinitely in RAM. Fast writer eats all available memory until the operating system invokes OOM Killer and forces a <code className="bg-black text-white px-1.5 py-0.5 font-bold">SIGKILL</code>.
              </p>
            </div>

            <div className="p-5 border-2 border-black bg-white space-y-1.5 shadow-[4px_4px_0px_0px_#000000]">
              <span className="font-bold text-red-600 uppercase block text-sm">FLAWED APPROACH B: DROP PACKETS SILENTLY</span>
              <p className="text-neutral-700 leading-normal">
                Buffer fixed, but discards overflow or overwrites unread memory. Catastrophic: you lose critical log lines and your downstream analysis produces corrupted garbage.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black font-mono">
            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(1);
              }}
              className="text-xs font-bold text-neutral-600 hover:text-black uppercase"
            >
              ← BACK TO CHAPTER 1
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(3);
              }}
              className="w-full sm:w-auto px-7 py-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_#e11d48] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <span>SEE HOW LINUX SOLVED IT</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* ─── CHAPTER 3: THE LINUX SOLUTION ─── */}
      {currentChapter === 3 && (
        <div className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000000] space-y-8 animate-in fade-in duration-200">
          <div>
            <div className="inline-block px-3 py-1 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider mb-4 border-2 border-black shadow-[2px_2px_0px_0px_#e11d48]">
              THE ARCHITECTURAL FIX: STRUCT PIPE_INODE_INFO
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-black tracking-tight uppercase leading-[0.95]">
              THE LINUX FIX: <br />
              <span className="bg-black text-white px-2 py-0.5 mt-2 inline-block">PUT FAST THREADS TO SLEEP.</span>
            </h2>
            <p className="mt-5 text-base sm:text-xl text-neutral-800 font-medium max-w-3xl leading-relaxed">
              In Linux kernel source (<code className="text-red-600 font-bold font-mono">fs/pipe.c</code>), every pipe gets a bounded 16-page circular ring buffer (64KB). Synchronization is governed by two elegant rules:
            </p>
          </div>

          {/* ─── LIVE VISUAL SIMULATOR: LINUX BACKPRESSURE + WAIT QUEUES ─── */}
          <section aria-label="Linux Backpressure Demonstration">
            <LinuxBackpressureSim />
          </section>

          {/* The 2 Rules Blocky Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            {/* Rule 1 */}
            <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-black text-white font-bold text-xs uppercase">
                  RULE 1
                </span>
                <span className="font-bold text-xs uppercase text-red-600">BACKPRESSURE (FULL)</span>
              </div>
              <h3 className="font-display font-black text-xl text-black leading-tight">
                IF BUFFER IS FULL, <br />
                PUT WRITER TO SLEEP.
              </h3>
              <p className="text-xs text-neutral-700 leading-relaxed">
                When Process A fills all 16 pages, its <code className="bg-neutral-100 px-1.5 py-0.5 border border-black font-bold">sys_write()</code> blocks.
                The kernel transitions it to <strong>TASK_INTERRUPTIBLE</strong> on <code className="bg-neutral-100 px-1 font-bold">pipe-&gt;wr_wait</code>. 
                Zero CPU cycles wasted.
              </p>
              <div className="pt-2 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>As soon as reader takes 1 page: WAKE WRITER UP!</span>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-black text-white font-bold text-xs uppercase">
                  RULE 2
                </span>
                <span className="font-bold text-xs uppercase text-emerald-700">STARVATION (EMPTY)</span>
              </div>
              <h3 className="font-display font-black text-xl text-black leading-tight">
                IF BUFFER IS EMPTY, <br />
                PUT READER TO SLEEP.
              </h3>
              <p className="text-xs text-neutral-700 leading-relaxed">
                When the pipe runs dry, Process B's <code className="bg-neutral-100 px-1.5 py-0.5 border border-black font-bold">sys_read()</code> blocks.
                The kernel transitions it to <strong>TASK_INTERRUPTIBLE</strong> on <code className="bg-neutral-100 px-1 font-bold">pipe-&gt;rd_wait</code>.
                No busy spinloop burning your battery.
              </p>
              <div className="pt-2 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>As soon as writer pushes 1 page: WAKE READER UP!</span>
              </div>
            </div>
          </div>

          {/* Circular Ring Benefit */}
          <div className="p-5 border-2 border-black bg-neutral-50 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#000000]">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-neutral-500 block tracking-wider">THE DATA STRUCTURE</span>
              <div className="font-bold text-sm text-black">
                CIRCULAR FIFO RING BUFFER: <code className="text-red-600 font-bold">head % capacity</code> and <code className="text-red-600 font-bold">tail % capacity</code>
              </div>
              <p className="text-xs text-neutral-600">
                Pointers wrap around continuously without allocating new memory blocks. Fast, bounded, and deterministic.
              </p>
            </div>
            <div className="text-xs font-bold text-neutral-500 shrink-0 uppercase border border-neutral-300 px-2 py-1 bg-white">
              Zero Memory Reallocation
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black font-mono">
            <button
              onClick={() => {
                sounds.playClick();
                onSelectChapter(2);
              }}
              className="text-xs font-bold text-neutral-600 hover:text-black uppercase"
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
              className="w-full sm:w-auto px-8 py-5 bg-red-600 hover:bg-red-700 text-white font-display font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 border-2 border-black shadow-[6px_6px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>LAUNCH THE FULL SIMULATOR LAB</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
