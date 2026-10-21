import React from 'react';
import { Play, Pause, StepForward, Sliders, Flame, Snowflake, Zap, Check } from 'lucide-react';
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
      for (let i = 0; i < 5; i++) {
        setTimeout(() => sendCommand({ action: 'STEP' }), i * 60);
      }
    }
  };

  return (
    <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b-2 border-black gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center border-2 border-black">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-black text-base text-black uppercase tracking-tight">
              CONCURRENCY CONTROL DECK
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              Adjust thread velocity throttles and observe backpressure
            </p>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
              isPaused
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE THREADS'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={!isPaused}
            title={isPaused ? 'Step single syscall' : 'Pause execution to step'}
            className={`flex items-center gap-1.5 px-3.5 py-2 border-2 border-black font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_0px_#000] ${
              isPaused
                ? 'bg-white text-black hover:bg-neutral-100 active:translate-x-0.5 active:translate-y-0.5'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>STEP 1x</span>
          </button>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Column 1: Smooth Velocity Throttles */}
        <div className="space-y-5 bg-neutral-50 p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-black font-bold uppercase">
                Producer Write Throttle
              </span>
              <span className="text-black font-bold bg-white px-2 py-0.5 border border-black">
                {config.writeDelayMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-black font-bold">Fast</span>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={config.writeDelayMs}
                onChange={handleWriteDelayChange}
                className="w-full"
              />
              <span className="text-xs text-neutral-500">Slow</span>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-black font-bold uppercase">
                Consumer Read Throttle
              </span>
              <span className="text-black font-bold bg-white px-2 py-0.5 border border-black">
                {config.readDelayMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-black font-bold">Fast</span>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={config.readDelayMs}
                onChange={handleReadDelayChange}
                className="w-full"
              />
              <span className="text-xs text-neutral-500">Slow</span>
            </div>
          </div>
        </div>

        {/* Column 2: Capacity & Stress Presets */}
        <div className="space-y-4 bg-neutral-50 p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-black font-bold uppercase">
                Buffer Size: F_SETPIPE_SZ
              </span>
              <span className="text-xs font-bold text-black bg-white px-2 py-0.5 border border-black">
                {currentCapacity} Pages ({currentCapacity * 4} KB)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((pages) => (
                <button
                  key={pages}
                  onClick={() => handleCapacityChange(pages)}
                  className={`py-2 px-2 text-xs font-bold border-2 border-black uppercase transition-all ${
                    currentCapacity === pages
                      ? 'bg-black text-white shadow-[2px_2px_0px_0px_#e11d48]'
                      : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  {pages}p
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black">
            <span className="text-xs uppercase font-bold text-neutral-600 block mb-2">
              Stress Test Presets:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => triggerDramaPreset('BACKPRESSURE')}
                className="py-2 px-2 bg-white hover:bg-red-50 text-red-600 border-2 border-black flex items-center justify-center gap-1.5 font-bold transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 uppercase"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Fill (Jam)</span>
              </button>

              <button
                onClick={() => triggerDramaPreset('STARVATION')}
                className="py-2 px-2 bg-white hover:bg-neutral-100 text-black border-2 border-black flex items-center justify-center gap-1.5 font-bold transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 uppercase"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Drain (Dry)</span>
              </button>

              <button
                onClick={() => triggerDramaPreset('EQUILIBRIUM')}
                className="py-2 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-black flex items-center justify-center gap-1.5 font-bold transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 uppercase"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>Equilibrium</span>
              </button>

              <button
                onClick={() => triggerDramaPreset('BURST')}
                className="py-2 px-2 bg-black text-white hover:bg-neutral-800 border-2 border-black flex items-center justify-center gap-1.5 font-bold transition-all shadow-[2px_2px_0px_0px_#e11d48] active:translate-x-0.5 active:translate-y-0.5 uppercase"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Burst Influx</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Workload Pipeline Presets */}
        <div className="bg-neutral-50 p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs text-black font-bold uppercase block mb-2.5">
            Workload Pipeline Scenario:
          </span>

          <div className="space-y-2">
            {Object.values(SCENARIOS).map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`w-full text-left p-3 border-2 border-black text-xs transition-all flex items-center justify-between ${
                  currentScenario === scen.id
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#e11d48]'
                    : 'bg-white text-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-bold flex items-center gap-1.5 uppercase">
                    {currentScenario === scen.id && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <span className="truncate">{scen.name}</span>
                  </div>
                  <div className={`text-xs mt-0.5 truncate ${currentScenario === scen.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {scen.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
