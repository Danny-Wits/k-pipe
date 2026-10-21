import React from 'react';
import { Terminal, Lock, Unlock, Radio, GitFork, Activity, Sun, Moon } from 'lucide-react';
import { SCENARIOS } from '../hooks/useKernelTelemetry';

export default function Header({ telemetry, isConnected, isMockMode, onToggleLogs, showLogs, theme, onToggleTheme }) {
  const currentScenario = SCENARIOS[telemetry.scenario] || SCENARIOS.CAT_GREP;
  const isMutexLocked = Boolean(telemetry.mutexLocked);

  return (
    <header className="hud-card p-3 sm:p-4 mb-4 border border-slate-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0d121c]/95 backdrop-blur-md transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Branding & Kernel Source Tag */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:via-[#131c2e] dark:to-cyan-500/10 border border-sky-300 dark:border-cyan-500/40 text-sky-600 dark:text-cyan-400 shadow-sm dark:shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Terminal className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-sky-600 dark:text-cyan-400 font-mono tracking-wider font-extrabold">K-PIPE</span>
                <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 dark:bg-cyan-950/70 dark:border-cyan-500/30 dark:text-cyan-300">
                  Kernel 6.x
                </span>
              </h1>
              <span className="hidden sm:inline-block text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                fs/pipe.c: <span className="text-sky-600 dark:text-cyan-300 font-medium">struct pipe_inode_info</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Linux Circular Ring Buffer &amp; Wait-Queue Observability HUD</span>
            </p>
          </div>
        </div>

        {/* Center/Right: System Status, Mutex & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Active Workload Preset Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300">
            <GitFork className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            <span className="text-slate-400">IPC:</span>
            <span className="text-sky-700 dark:text-cyan-300 font-semibold truncate max-w-[170px] sm:max-w-none">
              {currentScenario.name}
            </span>
          </div>

          {/* Kernel Mutex State Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors duration-200 ${
              isMutexLocked
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-500/50'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500/50'
            }`}
            title="pipe->mutex: Serializes ring buffer reads and writes"
          >
            {isMutexLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
                <span className="font-semibold">MUTEX_LOCKED</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">MUTEX_UNLOCKED</span>
              </>
            )}
          </div>

          {/* Connection Mode Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-300'
                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`} />
            <span>{isConnected ? 'ONLINE [WS 8080]' : 'MOCK HUD ENGINE'}</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-cyan-400 bg-slate-100 dark:bg-[#151c2a] text-slate-700 dark:text-slate-300 transition-all font-mono text-xs shadow-sm"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>

          {/* Log Toggle Button */}
          <button
            onClick={onToggleLogs}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-xs font-mono ${
              showLogs
                ? 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-cyan-950/60 dark:border-cyan-500/60 dark:text-cyan-300 shadow-sm'
                : 'bg-slate-100 border-slate-200 dark:bg-[#151c2a] dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            <span>dmesg {showLogs ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
