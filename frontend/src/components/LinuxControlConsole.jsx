import React from 'react';
import { Play, Pause, StepForward, Sliders, Flame, Snowflake, Zap, Check } from 'lucide-react';
import { SCENARIOS } from '../hooks/useKernelTelemetry';

export default function LinuxControlConsole({ telemetry, sendCommand }) {
  const config = telemetry.config || {
    writeDelayMs: 300,
    readDelayMs: 450,
    capacityPages: telemetry.capacity || 16,
    paused: false,
    scenario: telemetry.scenario || 'CAT_GREP'
  };

  const isPaused = Boolean(config.paused);
  const currentCapacity = config.capacityPages || telemetry.capacity || 16;
  const currentScenario = telemetry.scenario || 'CAT_GREP';

  const handleWriteDelayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    sendCommand({
      action: 'CONFIG',
      writeDelayMs: val
    });
  };

  const handleReadDelayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    sendCommand({
      action: 'CONFIG',
      readDelayMs: val
    });
  };

  const handleCapacityChange = (pages) => {
    sendCommand({
      action: 'CONFIG',
      capacityPages: pages
    });
  };

  const handleScenarioChange = (scenarioKey) => {
    sendCommand({
      action: 'SCENARIO',
      scenario: scenarioKey
    });
  };

  const handleTogglePause = () => {
    if (isPaused) {
      sendCommand({ action: 'RESUME' });
    } else {
      sendCommand({ action: 'PAUSE' });
    }
  };

  const handleStep = () => {
    sendCommand({ action: 'STEP' });
  };

  // Quick preset throttle shortcuts
  const applyPresetThrottle = (type) => {
    if (type === 'BACKPRESSURE') {
      sendCommand({
        action: 'CONFIG',
        writeDelayMs: 100,
        readDelayMs: 1200
      });
    } else if (type === 'STARVATION') {
      sendCommand({
        action: 'CONFIG',
        writeDelayMs: 1200,
        readDelayMs: 100
      });
    } else if (type === 'BALANCED') {
      sendCommand({
        action: 'CONFIG',
        writeDelayMs: 350,
        readDelayMs: 350
      });
    }
  };

  return (
    <div className="hud-card p-4 bg-white dark:bg-[#0a0e18] border border-slate-200 dark:border-cyan-500/20 shadow-sm transition-colors">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <h2 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>KERNEL CONTROL CONSOLE:</span>
            <span className="text-sky-600 dark:text-cyan-400 font-semibold">Syscall Throttling &amp; fcntl() Tuning</span>
          </h2>
        </div>

        {/* Play/Pause & Step Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold transition-all shadow-sm ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'RESUME K-PIPE' : 'PAUSE EXECUTION'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={!isPaused}
            title={isPaused ? 'Single-step next syscall' : 'Pause execution to step'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 dark:bg-[#182338] dark:border-cyan-500/60 dark:text-cyan-300'
                : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>STEP SYSCALL</span>
          </button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Syscall Speed / Delay Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Process A Write Delay
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
              {config.writeDelayMs} ms <span className="text-slate-500 text-[10px]">({((1000 / config.writeDelayMs) * 4).toFixed(1)} KB/s)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-medium">Fast ⚡</span>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={config.writeDelayMs}
              onChange={handleWriteDelayChange}
              className="hud-slider w-full"
            />
            <span className="text-[10px] font-mono text-slate-400 font-medium">Slow 🐌</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-2">
            <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Process B Read Delay
            </span>
            <span className="text-sky-700 dark:text-cyan-400 font-mono font-bold">
              {config.readDelayMs} ms <span className="text-slate-500 text-[10px]">({((1000 / config.readDelayMs) * 4).toFixed(1)} KB/s)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-medium">Fast ⚡</span>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={config.readDelayMs}
              onChange={handleReadDelayChange}
              className="hud-slider w-full"
            />
            <span className="text-[10px] font-mono text-slate-400 font-medium">Slow 🐌</span>
          </div>
        </div>

        {/* Column 2: Pipe Capacity fcntl(F_SETPIPE_SZ) Selector & Quick Scenarios */}
        <div className="space-y-3 font-mono">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                fcntl(pipefd, <span className="text-sky-600 dark:text-cyan-300 font-bold">F_SETPIPE_SZ</span>, size)
              </span>
              <span className="text-[11px] text-sky-700 dark:text-cyan-400 font-bold">
                {currentCapacity} Pages ({currentCapacity * 4} KB)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((pages) => (
                <button
                  key={pages}
                  onClick={() => handleCapacityChange(pages)}
                  className={`py-1.5 px-2 rounded text-xs font-bold border transition-all ${
                    currentCapacity === pages
                      ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-cyan-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 dark:bg-[#0f1422] dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  {pages}p ({pages * 4}K)
                </button>
              ))}
            </div>
          </div>

          {/* Educational Quick Presets */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5 font-medium">Concurrency Pressure Presets:</span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                onClick={() => applyPresetThrottle('BACKPRESSURE')}
                className="py-1 px-1.5 rounded bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-600/40 dark:text-amber-300 flex items-center justify-center gap-1 font-semibold"
                title="Writer fast, Reader slow -> Induces Backpressure in wr_wait"
              >
                <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Fill Ring</span>
              </button>

              <button
                onClick={() => applyPresetThrottle('STARVATION')}
                className="py-1 px-1.5 rounded bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 dark:bg-cyan-950/40 dark:border-cyan-600/40 dark:text-cyan-300 flex items-center justify-center gap-1 font-semibold"
                title="Writer slow, Reader fast -> Induces Starvation in rd_wait"
              >
                <Snowflake className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                <span>Drain Ring</span>
              </button>

              <button
                onClick={() => applyPresetThrottle('BALANCED')}
                className="py-1 px-1.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-600/40 dark:text-emerald-300 flex items-center justify-center gap-1 font-semibold"
                title="Balanced I/O rates"
              >
                <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Balanced</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Workload Pipeline Presets */}
        <div className="font-mono">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-2">
            Linux Workload Pipelines:
          </span>

          <div className="space-y-1.5">
            {Object.values(SCENARIOS).map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`w-full text-left p-2 rounded border text-xs transition-all flex items-center justify-between ${
                  currentScenario === scen.id
                    ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-sm dark:bg-cyan-950/50 dark:border-cyan-400 dark:text-cyan-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 dark:bg-[#0f1422] dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    {currentScenario === scen.id && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />}
                    <span>{scen.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                    {scen.description}
                  </div>
                </div>
                <span className="text-[9px] bg-slate-200 dark:bg-[#090d16] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-500 uppercase border border-slate-300 dark:border-slate-800 font-bold">
                  pipe
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
