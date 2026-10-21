import React from 'react';
import { ArrowDown, ArrowUp, Cpu, Binary, Layers } from 'lucide-react';

export default function KernelPipeConduit({ producer, consumer, headPointer, tailPointer, pageCount, capacity }) {
  const isProducerWriting = producer.state === 'TASK_RUNNING' && producer.rateKbPerSec > 0;
  const isConsumerReading = consumer.state === 'TASK_RUNNING' && consumer.rateKbPerSec > 0;

  const currentWriteSlot = headPointer % capacity;
  const currentReadSlot = tailPointer % capacity;

  return (
    <div className="relative py-3 px-4 my-1">
      {/* Syscall Transition Boundary Marker */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-cyan-500/30" />
        </div>
        <div className="relative flex items-center gap-2 bg-[#080b12] px-4 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-cyan-300 font-semibold">
            SYSCALL GATEWAY [ring0 ⇋ ring3: sysenter / sysexit]
          </span>
        </div>
      </div>

      {/* Dual Conduits Grid (Ingress / Egress) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* INGRESS CONDUIT: Process A -> Kernel Ring Buffer */}
        <div className="bg-[#0b0f1a]/80 p-3 rounded-lg border border-slate-800 flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[11px] font-mono mb-2">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              INGRESS DATA BUS (write)
            </span>
            <span className="text-slate-400">Target Slot: <strong className="text-emerald-300">#{currentWriteSlot}</strong></span>
          </div>

          {/* SVG Conduit Track */}
          <div className="relative w-full h-14 bg-[#07090f] rounded-md border border-slate-800/80 overflow-hidden flex items-center px-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00e676_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Glowing Pipe Line */}
            <div className="relative w-full flex items-center justify-between z-10">
              {/* Process A Source */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                <span>cat</span>
                <span className="text-slate-400">➔</span>
              </div>

              {/* Animated Flow Track */}
              <div className="relative flex-1 mx-3 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                {isProducerWriting ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-full animate-[conduitFlowRight_1s_linear_infinite]" />
                ) : (
                  <div className="absolute inset-0 bg-amber-500/20" />
                )}
              </div>

              {/* Floating Data Page Packet */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[10px] transition-all duration-300 ${
                  isProducerWriting
                    ? 'bg-emerald-900/40 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(0,230,118,0.3)] animate-pulse'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400'
                }`}
              >
                <Layers className="w-3 h-3 text-emerald-400" />
                <span>4KB Page</span>
                <span className="text-[9px] text-emerald-300/80">copy_from_user()</span>
              </div>

              {/* Kernel Slot Target */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30 ml-3">
                <span className="text-slate-400">➔</span>
                <span>ring[{currentWriteSlot}]</span>
              </div>
            </div>
          </div>
        </div>

        {/* EGRESS CONDUIT: Kernel Ring Buffer -> Process B */}
        <div className="bg-[#0b0f1a]/80 p-3 rounded-lg border border-slate-800 flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-[11px] font-mono mb-2">
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              EGRESS DATA BUS (read)
            </span>
            <span className="text-slate-400">Source Slot: <strong className="text-cyan-300">#{currentReadSlot}</strong></span>
          </div>

          {/* SVG Conduit Track */}
          <div className="relative w-full h-14 bg-[#07090f] rounded-md border border-slate-800/80 overflow-hidden flex items-center px-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Glowing Pipe Line */}
            <div className="relative w-full flex items-center justify-between z-10">
              {/* Kernel Slot Source */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30">
                <span>ring[{currentReadSlot}]</span>
                <span className="text-slate-400">➔</span>
              </div>

              {/* Animated Flow Track */}
              <div className="relative flex-1 mx-3 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                {isConsumerReading ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full animate-[conduitFlowRight_1s_linear_infinite]" />
                ) : (
                  <div className="absolute inset-0 bg-amber-500/20" />
                )}
              </div>

              {/* Floating Data Page Packet */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[10px] transition-all duration-300 ${
                  isConsumerReading
                    ? 'bg-cyan-900/40 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.3)] animate-pulse'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400'
                }`}
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>4KB Page</span>
                <span className="text-[9px] text-cyan-300/80">copy_to_user()</span>
              </div>

              {/* Process B Destination */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30 ml-3">
                <span className="text-slate-400">➔</span>
                <span>grep</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
