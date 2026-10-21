import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Radio,
  Volume2,
  VolumeX,
  BookOpen,
  Activity,
  Terminal,
  Cpu,
  GitBranch
} from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import { SCENARIOS } from '../hooks/useKernelTelemetry';

export default function Header({
  telemetry,
  isConnected,
  isMockMode,
  activeChapter,
  onSelectChapter
}) {
  const currentScenario = SCENARIOS[telemetry?.scenario] || SCENARIOS.CAT_GREP;
  const isMutexLocked = Boolean(telemetry?.mutexLocked);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
  };

  const isFullSim = activeChapter === 4;

  return (
    <header className="bg-white rounded-2xl border-2 border-slate-900 p-3.5 sm:p-5 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* ─── LEFT: AUTHENTIC UNIX PIPE BRAND & KERNEL METRICS ─── */}
        <div className="flex items-center gap-3.5">
          {/* Custom Machined Pipeline Insignia (Zero generic emoji in squircle) */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(2,132,199,1)] shrink-0 group">
            <svg
              className="w-7 h-7 text-sky-400 group-hover:scale-110 transition-transform"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Conduit tube outer */}
              <rect x="2" y="10" width="28" height="12" rx="3" stroke="currentColor" strokeWidth="2.2" fill="#0f172a" />
              {/* Traveling pipe capsule inside */}
              <circle cx="16" cy="16" r="3.5" fill="#38bdf8" />
              {/* Center pipe divider / backpressure gate */}
              <line x1="16" y1="6" x2="16" y2="10" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="16" y1="22" x2="16" y2="26" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
              {/* Ingress flow arrowhead */}
              <path d="M6 16L10 13V19L6 16Z" fill="#10b981" />
              {/* Egress flow arrowhead */}
              <path d="M22 13L26 16L22 19V13Z" fill="#10b981" />
            </svg>
            {/* Blinking hardware status point */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-950 uppercase">
                K·PIPE
              </span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-900 text-white tracking-widest uppercase">
                v1.0.0
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-300">
                sys_pipe2(2)
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                fs/pipe.c
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
              <span className="font-bold text-slate-700">struct pipe_inode_info</span>
              <span className="text-slate-300">•</span>
              <span>16-Slot FIFO Ring (64 KB)</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                ring0 ⇋ ring3 IPC
              </span>
            </div>
          </div>
        </div>

        {/* ─── CENTER: MACHINED HARDWARE SEGMENTED MODE SWITCH ─── */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border-2 border-slate-900 font-mono text-xs shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] self-start lg:self-center">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectChapter(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-black uppercase tracking-tight transition-all ${
              !isFullSim
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>01 // Story Mode</span>
            {!isFullSim && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectChapter(4);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-black uppercase tracking-tight transition-all ${
              isFullSim
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>02 // Kernel Lab ⚡</span>
            {isFullSim && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>
        </div>

        {/* ─── RIGHT: REAL HARDWARE TELEMETRY INSTRUMENTS ─── */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Mutex Bus Monitor */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${
              isMutexLocked
                ? 'bg-rose-50 text-rose-800 border-rose-400 shadow-sm'
                : 'bg-slate-50 text-slate-800 border-slate-300'
            }`}
            title="pipe->mutex serializes sys_write() and sys_read() in fs/pipe.c"
          >
            {isMutexLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span className="font-black text-[11px] text-rose-700">MUTEX_HELD</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-[11px] text-slate-700">MUTEX_FREE</span>
              </>
            )}
          </div>

          {/* Daemon Telemetry Link */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 ${
              isConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
            title={isConnected ? 'Connected to live Java kernel simulation server' : 'Running internal virtual kernel telemetry engine'}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isConnected ? 'text-emerald-600 animate-pulse' : 'text-amber-600'
              }`}
            />
            <span className="font-black text-[11px]">
              {isConnected ? 'IPC :8080' : 'V-BUS 60FPS'}
            </span>
          </div>

          {/* Procedural Audio Chip Controller */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-black text-[11px] transition-all shadow-sm active:translate-x-0.5 active:translate-y-0.5 ${
              isMuted
                ? 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'
                : 'bg-sky-50 border-sky-400 text-sky-900 shadow-[2px_2px_0px_0px_rgba(2,132,199,1)]'
            }`}
            title={isMuted ? 'Click to enable Web Audio synthesizer sound effects' : 'Click to mute sound effects'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>FX: OFF</span>
              </>
            ) : (
              <>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-sky-600 animate-bounce h-2 rounded-full" />
                  <span className="w-1 bg-sky-600 animate-bounce h-3 rounded-full delay-75" />
                  <span className="w-1 bg-sky-600 animate-bounce h-1.5 rounded-full delay-150" />
                </div>
                <span>FX: LIVE</span>
              </>
            )}
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/Danny-Wits/k-pipe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-900 hover:text-white text-slate-900 font-black text-[11px] shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="View open source repository on GitHub"
          >
            <GitBranch className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">REPO</span>
          </a>
        </div>
      </div>
    </header>
  );
}
