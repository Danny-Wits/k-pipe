import React, { useState } from 'react';
import Header from './components/Header';
import StoryMode from './components/StoryMode';
import PhysicalPipelineStage from './components/PhysicalPipelineStage';
import ControlDeck from './components/ControlDeck';
import BufferSlotMatrix from './components/BufferSlotMatrix';
import { useKernelTelemetry } from './hooks/useKernelTelemetry';
import { Cpu, Shield, Terminal, ArrowLeft } from 'lucide-react';
import { sounds } from './audio/SoundEffects';

export default function App() {
  const { telemetry, isConnected, isMockMode, sendCommand } = useKernelTelemetry();
  const [activeChapter, setActiveChapter] = useState(1);

  const handleSelectChapter = (chapterId) => {
    setActiveChapter(chapterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-red-600 selection:text-white antialiased font-sans">
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
            <div className="p-4 bg-white border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs shadow-[4px_4px_0px_0px_#000000]">
              <div className="flex items-center gap-2 text-neutral-700">
                <Terminal className="w-4 h-4 text-red-600 shrink-0" />
                <span>Already know the theory? Skip directly to hands-on experimentation.</span>
              </div>
              <button
                onClick={() => {
                  sounds.playChime();
                  handleSelectChapter(4);
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-mono font-bold uppercase text-xs tracking-wider flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#e11d48] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <span>Jump to Simulator Lab</span>
              </button>
            </div>
          </main>
        ) : (
          /* ─── CHAPTER 4: THE FULL LIVE ENGINE LAB ─── */
          <main className="space-y-6 animate-in fade-in duration-200">
            {/* Lab Mode Top Banner (No //) */}
            <div className="p-5 bg-black text-white border-2 border-black shadow-[6px_6px_0px_0px_#e11d48] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
              <div>
                <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                  CHAPTER 4: INTERACTIVE LAB ENGINE
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  LIVE KERNEL CONCURRENCY ENGINE
                </h2>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Physical pipe simulation, circular memory ring buffer and velocity throttles
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  handleSelectChapter(1);
                }}
                className="px-4 py-2.5 bg-white text-black hover:bg-neutral-100 border-2 border-black text-xs font-bold uppercase flex items-center gap-2 transition-all shrink-0 shadow-[2px_2px_0px_0px_#000000]"
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
      <footer className="mt-10 border-t-2 border-black bg-white py-6 px-4 text-center text-xs text-neutral-600 font-mono">
        <div className="max-w-[1450px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-black">
            <span>K-PIPE</span>
            <span>•</span>
            <span className="text-neutral-700">Linux Kernel Anonymous Pipe Concurrency Engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600">
            <span className="font-bold text-black">
              PAGE_SIZE: 4096 BYTES
            </span>
            <span>•</span>
            <span className="font-bold text-black">
              PIPE_DEF_BUFFERS: 16
            </span>
            <span>•</span>
            <span>
              Source: <code className="text-red-600 font-bold">fs/pipe.c</code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
