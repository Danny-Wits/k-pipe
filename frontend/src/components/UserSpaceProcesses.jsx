import React from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Terminal, CheckCircle2, Zap } from 'lucide-react';

export default function UserSpaceProcesses({ producer, consumer, pageCount, capacity }) {
  const isProducerRunning = producer.state === 'TASK_RUNNING';
  const isConsumerRunning = consumer.state === 'TASK_RUNNING';

  return (
    <div className="hud-card p-4 bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-cyan-500/20 relative overflow-hidden transition-colors">
      {/* User Space Boundary Label */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-600 dark:bg-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-sky-700 dark:text-cyan-400 font-bold">
            Linux User Space (Ring 3)
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>IPC Mechanism:</span>
          <span className="text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#161f30] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-semibold">
            UNIX Anonymous Pipe (|)
          </span>
        </div>
      </div>

      {/* Grid of Two Processes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Process A: Producer */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
            isProducerRunning
              ? 'bg-white dark:bg-[#101726] border-emerald-400 dark:border-emerald-500/40 shadow-sm dark:shadow-[0_0_15px_rgba(0,230,118,0.06)]'
              : 'bg-amber-50/40 dark:bg-[#15141b] border-amber-400 dark:border-amber-500/40 shadow-sm dark:shadow-[0_0_15px_rgba(255,179,0,0.06)]'
          }`}
        >
          <div>
            {/* Header with Title and State */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-500/30 dark:text-emerald-400">
                    PROCESS A
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">PRODUCER</span>
                </div>
                <h3 className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{producer.name}</span>
                </h3>
              </div>

              {/* Linux Task State Badge */}
              <div
                className={`font-mono text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 tracking-wider border shrink-0 ${
                  isProducerRunning
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40'
                    : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/40'
                }`}
              >
                <span className={`led-dot ${isProducerRunning ? 'led-green pulse-fast' : 'led-amber pulse-slow'}`} />
                <span>{producer.state}</span>
              </div>
            </div>

            {/* Process Metadata Grid */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-[#0b0e17] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">PID</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{producer.pid}</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0b0e17] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">CPU Load</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{producer.cpuLoad?.toFixed(1) || '14.2'}%</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0b0e17] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Write Rate</span>
                <span className="text-sky-600 dark:text-cyan-400 font-bold">{producer.rateKbPerSec || 0} KB/s</span>
              </div>
            </div>

            {/* Syscall Banner */}
            <div className="mt-3 p-2 rounded bg-slate-50 dark:bg-[#070a12] border border-slate-200 dark:border-slate-800/90 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Syscall:</span>
                <code className="text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] truncate">
                  {producer.syscall || 'write(pipefd[1], buf, 4096)'}
                </code>
              </div>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 shrink-0 ml-2 border border-slate-300 dark:border-slate-800 font-semibold">
                fd: 1 (out)
              </span>
            </div>
          </div>

          {/* PERMANENT FIXED-HEIGHT STATUS SLOT (Zero Layout Shifting) */}
          <div className="h-9 mt-2.5">
            {isProducerRunning ? (
              <div className="h-full px-2.5 rounded border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Active I/O: writing to pipefd[1] (flow nominal)</span>
              </div>
            ) : (
              <div className="h-full px-2.5 rounded border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                <span className="truncate font-semibold">
                  Backpressure: sleeping in wr_wait (buffer full {pageCount}/{capacity})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Process B: Consumer */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
            isConsumerRunning
              ? 'bg-white dark:bg-[#101726] border-sky-400 dark:border-cyan-500/40 shadow-sm dark:shadow-[0_0_15px_rgba(0,229,255,0.06)]'
              : 'bg-amber-50/40 dark:bg-[#15141b] border-amber-400 dark:border-amber-500/40 shadow-sm dark:shadow-[0_0_15px_rgba(255,179,0,0.06)]'
          }`}
        >
          <div>
            {/* Header with Title and State */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 dark:bg-cyan-950/60 dark:border-cyan-500/30 dark:text-cyan-400">
                    PROCESS B
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">CONSUMER</span>
                </div>
                <h3 className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
                  <span className="truncate">{consumer.name}</span>
                </h3>
              </div>

              {/* Linux Task State Badge */}
              <div
                className={`font-mono text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 tracking-wider border shrink-0 ${
                  isConsumerRunning
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40'
                    : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/40'
                }`}
              >
                <span className={`led-dot ${isConsumerRunning ? 'led-green pulse-fast' : 'led-amber pulse-slow'}`} />
                <span>{consumer.state}</span>
              </div>
            </div>

            {/* Process Metadata Grid */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-[#0b0e17] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">PID</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{consumer.pid}</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0b0e17] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">CPU Load</span>
                <span className="text-sky-600 dark:text-cyan-400 font-bold">{consumer.cpuLoad?.toFixed(1) || '9.8'}%</span>
              </div>
              <div className="bg-slate-50 dark:bg-[#0b0e17] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Read Rate</span>
                <span className="text-sky-600 dark:text-cyan-400 font-bold">{consumer.rateKbPerSec || 0} KB/s</span>
              </div>
            </div>

            {/* Syscall Banner */}
            <div className="mt-3 p-2 rounded bg-slate-50 dark:bg-[#070a12] border border-slate-200 dark:border-slate-800/90 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Syscall:</span>
                <code className="text-sky-700 dark:text-cyan-300 font-semibold text-[11px] truncate">
                  {consumer.syscall || 'read(pipefd[0], buf, 4096)'}
                </code>
              </div>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 shrink-0 ml-2 border border-slate-300 dark:border-slate-800 font-semibold">
                fd: 0 (in)
              </span>
            </div>
          </div>

          {/* PERMANENT FIXED-HEIGHT STATUS SLOT (Zero Layout Shifting) */}
          <div className="h-9 mt-2.5">
            {isConsumerRunning ? (
              <div className="h-full px-2.5 rounded border border-sky-200 dark:border-sky-800/40 bg-sky-50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="truncate">Active I/O: reading from pipefd[0] (flow nominal)</span>
              </div>
            ) : (
              <div className="h-full px-2.5 rounded border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                <span className="truncate font-semibold">
                  Starvation: sleeping in rd_wait (buffer empty 0/{capacity})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
