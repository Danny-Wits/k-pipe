import React, { useState } from 'react';
import { Lock, Unlock, Radio, Volume2, VolumeX, BookOpen, Activity } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';
import { SCENARIOS } from '../hooks/useKernelTelemetry';

export default function Header({ telemetry, isConnected, isMockMode, activeChapter, onSelectChapter }) {
  const currentScenario = SCENARIOS[telemetry.scenario] || SCENARIOS.CAT_GREP;
  const isMutexLocked = Boolean(telemetry.mutexLocked);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
  };

  const isFullSim = activeChapter === 4;

  return (
    <header className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 shrink-0">
            <span className="text-2xl">🐧</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900">
                K-PIPE
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Linux Kernel 6.x
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                fs/pipe.c
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Operating System Pipe &amp; Circular Ring Buffer Concurrency Simulation
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher (Story vs Live Sim) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 font-mono text-xs font-bold w-fit">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectChapter(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              !isFullSim
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>Story Walkthrough</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectChapter(4);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              isFullSim
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Lab ⚡</span>
          </button>
        </div>

        {/* Right: Live Telemetry Badges & Sound Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Mutex State Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
              isMutexLocked
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}
            title="pipe->mutex serializes writes and reads"
          >
            {isMutexLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span className="font-extrabold">MUTEX_LOCKED</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-extrabold">MUTEX_FREE</span>
              </>
            )}
          </div>

          {/* Connection Mode Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600 animate-pulse' : 'text-amber-600'}`} />
            <span className="font-bold">{isConnected ? 'ONLINE [WS 8080]' : 'MOCK HUD ENGINE'}</span>
          </div>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all shadow-sm active:scale-95 ${
              isMuted
                ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-indigo-500/20'
            }`}
            title={isMuted ? 'Click to enable Web Audio sound effects' : 'Click to mute sound effects'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />}
            <span>{isMuted ? 'SOUND OFF' : 'AUDIO ON'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
