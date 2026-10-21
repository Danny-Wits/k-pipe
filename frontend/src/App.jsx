import React, { useState } from 'react';
import Header from './components/Header';
import StoryMode from './components/StoryMode';
import PhysicalPipelineStage from './components/PhysicalPipelineStage';
import ControlDeck from './components/ControlDeck';
import BufferSlotMatrix from './components/BufferSlotMatrix';
import { useKernelTelemetry } from './hooks/useKernelTelemetry';
import { Cpu, Shield, BookOpen, Sparkles, ArrowLeft } from 'lucide-react';
import { sounds } from './audio/SoundEffects';

export default function App() {
  const { telemetry, isConnected, isMockMode, sendCommand } = useKernelTelemetry();
  const [activeChapter, setActiveChapter] = useState(1);

  const handleSelectChapter = (chapterId) => {
    setActiveChapter(chapterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-sky-500 selection:text-white antialiased font-sans">
      <div className="max-w-[1450px] w-full mx-auto p-3 sm:p-6 flex-1 space-y-6">
        {/* Header Bar */}
        <Header
          telemetry={telemetry}
          isConnected={isConnected}
          isMockMode={isMockMode}
          activeChapter={activeChapter}
          onSelectChapter={handleSelectChapter}
        />

        {/* ─── CHAPTERS 1, 2, 3: THE STORY WALKTHROUGH ─── */}
        {activeChapter < 4 ? (
          <main className="space-y-6">
            <StoryMode
              currentChapter={activeChapter}
              onSelectChapter={handleSelectChapter}
              onLaunchFullSim={() => handleSelectChapter(4)}
            />

            {/* Quick Skip Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs shadow-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Already know the theory? Skip directly to hands-on experimentation.</span>
              </div>
              <button
                onClick={() => {
                  sounds.playChime();
                  handleSelectChapter(4);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                <span>Jump to Full Simulator ⚡</span>
              </button>
            </div>
          </main>
        ) : (
          /* ─── CHAPTER 4: THE FULL LIVE ENGINE LAB ─── */
          <main className="space-y-6 animate-in fade-in duration-300">
            {/* Lab Mode Top Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(2,132,199,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
              <div>
                <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-1">
                  <span>CHAPTER 04 // FINAL DESTINATION</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  THE LIVE KERNEL CONCURRENCY ENGINE
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full physical pipe simulation, real-time memory ring buffer &amp; velocity throttles
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  handleSelectChapter(1);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs font-bold uppercase flex items-center gap-2 transition-all shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Review Story Walkthrough</span>
              </button>
            </div>

            {/* 1. Physical Glass Pipe Simulation */}
            <section aria-label="Physical Pipeline Simulation">
              <PhysicalPipelineStage
                producer={telemetry.producer}
                consumer={telemetry.consumer}
                pageCount={telemetry.pageCount}
                capacity={telemetry.capacity}
                fillPercentage={telemetry.fillPercentage}
                headPointer={telemetry.headPointer}
                tailPointer={telemetry.tailPointer}
                pages={telemetry.pages}
                config={telemetry.config}
              />
            </section>

            {/* 2. Interactive Tactile Control Deck */}
            <section aria-label="Control Deck">
              <ControlDeck
                telemetry={telemetry}
                sendCommand={sendCommand}
              />
            </section>

            {/* 3. Detailed Kernel Memory Buffer Matrix */}
            <section aria-label="Memory Slot Matrix">
              <BufferSlotMatrix
                capacity={telemetry.capacity}
                pageCount={telemetry.pageCount}
                headPointer={telemetry.headPointer}
                tailPointer={telemetry.tailPointer}
                pages={telemetry.pages}
              />
            </section>
          </main>
        )}
      </div>

      {/* Linux Kernel Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white py-5 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-[1450px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sky-600 font-bold">🐧 K-PIPE</span>
            <span>•</span>
            <span className="text-slate-700 font-semibold">Linux Kernel Anonymous Pipe &amp; Concurrency Engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Cpu className="w-3.5 h-3.5 text-sky-600" /> PAGE_SIZE: 4096 B
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> PIPE_DEF_BUFFERS: 16
            </span>
            <span>•</span>
            <span className="text-slate-600">
              Implementation: <code className="text-sky-700 font-bold">linux/fs/pipe.c</code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
