import React from 'react';
import { Terminal, Shield, Lock, Unlock, Cpu, Activity, Radio, GitFork } from 'lucide-react';
import { SCENARIOS } from '../hooks/useKernelTelemetry';

export default function Header({ telemetry, isConnected, isMockMode, onToggleLogs, showLogs }) {
  const currentScenario = SCENARIOS[telemetry.scenario] || SCENARIOS.CAT_GREP;
  const isMutexLocked = Boolean(telemetry.mutexLocked);

  return (
    <header className="hud-card p-3 sm:p-4 mb-4 border-b border-cyan-500/20 bg-[#0d121c]/95 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Branding & Kernel Source Tag */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 via-[#131c2e] to-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="text-cyan-400 font-mono tracking-wider">K-PIPE</span>
                <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                  Kernel 6.x
                </span>
              </h1>
              <span className="hidden sm:inline-block text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/60">
                fs/pipe.c: <span className="text-cyan-300">struct pipe_inode_info</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Linux Circular Ring Buffer &amp; Wait-Queue Observability HUD</span>
            </p>
          </div>
        </div>

        {/* Center: System Status & Kernel Mutex */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Active Workload Preset Badge */}
          <div className="flex items-center gap-1.5 bg-[#121826] border border-slate-700/80 px-2.5 py-1 rounded text-slate-300">
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">IPC:</span>
            <span className="text-cyan-300 font-medium truncate max-w-[170px] sm:max-w-none">
              {currentScenario.name}
            </span>
          </div>

          {/* Kernel Mutex State Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors duration-200 ${
              isMutexLocked
                ? 'badge-locked text-rose-300 border-rose-500/50'
                : 'badge-running text-emerald-300 border-emerald-500/50'
            }`}
            title="pipe->mutex: Serializes ring buffer reads and writes"
          >
            {isMutexLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="font-semibold text-rose-300">MUTEX_LOCKED</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">MUTEX_UNLOCKED</span>
              </>
            )}
          </div>

          {/* Connection Mode Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{isConnected ? 'ONLINE [WS 8080]' : 'MOCK HUD ENGINE'}</span>
          </div>

          {/* Log Toggle Button */}
          <button
            onClick={onToggleLogs}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-xs font-mono ${
              showLogs
                ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'bg-[#151c2a] border-slate-700 hover:border-cyan-500/40 text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>dmesg {showLogs ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
