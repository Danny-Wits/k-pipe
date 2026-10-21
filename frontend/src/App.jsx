import React from 'react';
import Header from './components/Header';
import PhysicalPipelineStage from './components/PhysicalPipelineStage';
import ControlDeck from './components/ControlDeck';
import BufferSlotMatrix from './components/BufferSlotMatrix';
import { useKernelTelemetry } from './hooks/useKernelTelemetry';
import { Cpu, Shield, ExternalLink } from 'lucide-react';

export default function App() {
  const { telemetry, isConnected, isMockMode, sendCommand } = useKernelTelemetry();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between selection:bg-sky-500 selection:text-white antialiased font-sans">
      <div className="max-w-[1450px] w-full mx-auto p-3 sm:p-6 flex-1 space-y-6">
        {/* Header Bar */}
        <Header
          telemetry={telemetry}
          isConnected={isConnected}
          isMockMode={isMockMode}
        />

        {/* Primary Simulation: Physical Pipeline Stage */}
        <main className="space-y-6">
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

          {/* Interactive Concurrency Controls */}
          <section aria-label="Control Deck">
            <ControlDeck
              telemetry={telemetry}
              sendCommand={sendCommand}
            />
          </section>

          {/* Detailed Kernel Memory Buffer Matrix */}
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
