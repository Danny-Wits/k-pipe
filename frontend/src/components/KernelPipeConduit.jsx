import React from 'react';
import { Layers } from 'lucide-react';

export default function KernelPipeConduit({ producer, consumer, headPointer, tailPointer, capacity }) {
  const isProducerWriting = producer.state === 'TASK_RUNNING' && producer.rateKbPerSec > 0;
  const isConsumerReading = consumer.state === 'TASK_RUNNING' && consumer.rateKbPerSec > 0;

  const currentWriteSlot = headPointer % capacity;
  const currentReadSlot = tailPointer % capacity;

  return (
    <div className="relative py-2 px-1 sm:px-4 my-1">
      {/* Syscall Transition Boundary Marker */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-sky-400/40 dark:border-cyan-500/30" />
        </div>
        <div className="relative flex items-center gap-2 bg-white dark:bg-[#080b12] px-4 py-1 rounded-full border border-sky-300 dark:border-cyan-500/30 shadow-sm dark:shadow-[0_0_12px_rgba(0,229,255,0.1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-cyan-400 animate-ping" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-sky-700 dark:text-cyan-300 font-bold">
            SYSCALL GATEWAY [ring0 ⇋ ring3: sysenter / sysexit]
          </span>
        </div>
      </div>

      {/* Dual Conduits Grid (Ingress / Egress) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* INGRESS CONDUIT: Process A -> Kernel Ring Buffer */}
        <div className="bg-white/80 dark:bg-[#0b0f1a]/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center shadow-sm transition-colors">
          <div className="flex items-center justify-between w-full text-[11px] font-mono mb-2">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              INGRESS DATA BUS (sys_write)
            </span>
            <span className="text-slate-500 dark:text-slate-400">Target Slot: <strong className="text-emerald-700 dark:text-emerald-300 font-bold">#{currentWriteSlot}</strong></span>
          </div>

          {/* SVG Conduit Track */}
          <div className="relative w-full h-14 bg-slate-100 dark:bg-[#07090f] rounded-md border border-slate-200 dark:border-slate-800/80 overflow-hidden flex items-center px-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Glowing Pipe Line */}
            <div className="relative w-full flex items-center justify-between z-10">
              {/* Process A Source */}
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-500/30">
                <span>cat</span>
                <span className="text-slate-400">➔</span>
              </div>

              {/* Animated Flow Track */}
              <div className="relative flex-1 mx-3 h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                {isProducerWriting ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-full animate-[conduitFlowRight_1s_linear_infinite]" />
                ) : (
                  <div className="absolute inset-0 bg-amber-400/20" />
                )}
              </div>

              {/* Floating Data Page Packet */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[10px] transition-all duration-300 shadow-sm ${
                  isProducerWriting
                    ? 'bg-white dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 animate-pulse font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>4KB Page</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-300/80 font-normal">copy_from_user()</span>
              </div>

              {/* Kernel Slot Target */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-sky-800 dark:text-cyan-300 bg-sky-50 dark:bg-cyan-950/40 px-2 py-1 rounded border border-sky-300 dark:border-cyan-500/30 ml-3 font-semibold">
                <span className="text-slate-400">➔</span>
                <span>ring[{currentWriteSlot}]</span>
              </div>
            </div>
          </div>
        </div>

        {/* EGRESS CONDUIT: Kernel Ring Buffer -> Process B */}
        <div className="bg-white/80 dark:bg-[#0b0f1a]/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center shadow-sm transition-colors">
          <div className="flex items-center justify-between w-full text-[11px] font-mono mb-2">
            <span className="text-sky-700 dark:text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              EGRESS DATA BUS (sys_read)
            </span>
            <span className="text-slate-500 dark:text-slate-400">Source Slot: <strong className="text-sky-700 dark:text-cyan-300 font-bold">#{currentReadSlot}</strong></span>
          </div>

          {/* SVG Conduit Track */}
          <div className="relative w-full h-14 bg-slate-100 dark:bg-[#07090f] rounded-md border border-slate-200 dark:border-slate-800/80 overflow-hidden flex items-center px-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Glowing Pipe Line */}
            <div className="relative w-full flex items-center justify-between z-10">
              {/* Kernel Slot Source */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-sky-800 dark:text-cyan-300 bg-sky-50 dark:bg-cyan-950/40 px-2 py-1 rounded border border-sky-300 dark:border-cyan-500/30 font-semibold">
                <span>ring[{currentReadSlot}]</span>
                <span className="text-slate-400">➔</span>
              </div>

              {/* Animated Flow Track */}
              <div className="relative flex-1 mx-3 h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                {isConsumerReading ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent w-full animate-[conduitFlowRight_1s_linear_infinite]" />
                ) : (
                  <div className="absolute inset-0 bg-amber-400/20" />
                )}
              </div>

              {/* Floating Data Page Packet */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[10px] transition-all duration-300 shadow-sm ${
                  isConsumerReading
                    ? 'bg-white dark:bg-cyan-900/40 border-sky-500 text-sky-800 dark:text-cyan-200 animate-pulse font-bold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                <span>4KB Page</span>
                <span className="text-[9px] text-sky-600 dark:text-cyan-300/80 font-normal">copy_to_user()</span>
              </div>

              {/* Process B Destination */}
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-sky-800 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/40 px-2 py-1 rounded border border-sky-300 dark:border-cyan-500/30 ml-3">
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
