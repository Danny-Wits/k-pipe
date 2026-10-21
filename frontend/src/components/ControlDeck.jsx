import React from 'react';
import { Play, Pause, StepForward, Sliders, Flame, Snowflake, Zap, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/SoundEffects';
import { SCENARIOS } from '../hooks/useKernelTelemetry';

export default function ControlDeck({ telemetry, sendCommand }) {
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
    sounds.playClick();
    sendCommand({
      action: 'CONFIG',
      writeDelayMs: parseInt(e.target.value, 10)
    });
  };

  const handleReadDelayChange = (e) => {
    sounds.playClick();
    sendCommand({
      action: 'CONFIG',
      readDelayMs: parseInt(e.target.value, 10)
    });
  };

  const handleCapacityChange = (pages) => {
    sounds.playClick();
    sendCommand({
      action: 'CONFIG',
      capacityPages: pages
    });
  };

  const handleScenarioChange = (scenarioKey) => {
    sounds.playClick();
    sendCommand({
      action: 'SCENARIO',
      scenario: scenarioKey
    });
  };

  const handleTogglePause = () => {
    sounds.playClick();
    if (isPaused) {
      sendCommand({ action: 'RESUME' });
    } else {
      sendCommand({ action: 'PAUSE' });
    }
  };

  const handleStep = () => {
    sounds.playClick();
    sendCommand({ action: 'STEP' });
  };

  // Dramatic Experience Presets
  const triggerDramaPreset = (type) => {
    sounds.playClick();
    if (type === 'BACKPRESSURE') {
      sounds.playAlert();
      sendCommand({
        action: 'CONFIG',
        writeDelayMs: 80,
        readDelayMs: 1400
      });
    } else if (type === 'STARVATION') {
      sounds.playAlert();
      sendCommand({
        action: 'CONFIG',
        writeDelayMs: 1400,
        readDelayMs: 80
      });
    } else if (type === 'EQUILIBRIUM') {
      sounds.playChime();
      sendCommand({
        action: 'CONFIG',
        writeDelayMs: 350,
        readDelayMs: 350
      });
    } else if (type === 'BURST') {
      sounds.playChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      // Fire rapid writes
      for (let i = 0; i < 5; i++) {
        setTimeout(() => sendCommand({ action: 'STEP' }), i * 60);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-mono text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              INTERACTIVE CONCURRENCY CONTROL DECK
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Adjust thread velocity throttles &amp; observe realtime backpressure physics
            </p>
          </div>
        </div>

        {/* Play/Pause & Step Primary Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-sm ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 active:scale-95'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 active:scale-95'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE THREADS'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={!isPaused}
            title={isPaused ? 'Step single syscall' : 'Pause execution to step'}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100 shadow-sm active:scale-95'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>STEP 1x</span>
          </button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Smooth Velocity Throttles */}
        <div className="space-y-5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-800 font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Producer Write Throttle
              </span>
              <span className="text-emerald-700 font-mono font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {config.writeDelayMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono text-emerald-600 font-bold">Fast ⚡</span>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={config.writeDelayMs}
                onChange={handleWriteDelayChange}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="text-[11px] font-mono text-slate-400">Slow 🐌</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-800 font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Consumer Read Throttle
              </span>
              <span className="text-indigo-700 font-mono font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {config.readDelayMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono text-indigo-600 font-bold">Fast ⚡</span>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={config.readDelayMs}
                onChange={handleReadDelayChange}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <span className="text-[11px] font-mono text-slate-400">Slow 🐌</span>
            </div>
          </div>
        </div>

        {/* Column 2: Buffer Capacity & Stress Test Presets */}
        <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 font-mono">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-800 font-bold">
                Buffer Size: <span className="text-sky-600 font-normal">fcntl(F_SETPIPE_SZ)</span>
              </span>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                {currentCapacity} Slots ({currentCapacity * 4} KB)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((pages) => (
                <button
                  key={pages}
                  onClick={() => handleCapacityChange(pages)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    currentCapacity === pages
                      ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {pages}p
                </button>
              ))}
            </div>
          </div>

          {/* 4 Dramatic Stress Presets */}
          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              One-Click Stress Scenarios:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => triggerDramaPreset('BACKPRESSURE')}
                className="py-2 px-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-1.5 font-bold transition-all shadow-sm active:scale-95"
                title="Fast Producer + Slow Consumer -> Pipe jams with stacked capsules"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Fill (Jam Pipe)</span>
              </button>

              <button
                onClick={() => triggerDramaPreset('STARVATION')}
                className="py-2 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center justify-center gap-1.5 font-bold transition-all shadow-sm active:scale-95"
                title="Slow Producer + Fast Consumer -> Buffer empties to 0"
              >
                <Snowflake className="w-3.5 h-3.5 text-amber-500" />
                <span>Drain (Starve)</span>
              </button>

              <button
                onClick={() => triggerDramaPreset('EQUILIBRIUM')}
                className="py-2 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center gap-1.5 font-bold transition-all shadow-sm active:scale-95"
                title="Writer = Reader -> Smooth 50% flow"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Equilibrium</span>
              </button>

              <button
                onClick={() => triggerDramaPreset('BURST')}
                className="py-2 px-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1.5 font-bold transition-all shadow-sm active:scale-95"
                title="Inject high-velocity burst of capsules"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Inject Burst</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Workload Pipeline Presets */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 font-mono">
          <span className="text-xs text-slate-800 font-bold block mb-2.5">
            Active Linux Workload Pipeline:
          </span>

          <div className="space-y-2">
            {Object.values(SCENARIOS).map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  currentScenario === scen.id
                    ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    {currentScenario === scen.id && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    <span className="truncate">{scen.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {scen.description}
                  </div>
                </div>
                <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase border border-slate-200 font-bold shrink-0">
                  IPC
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
