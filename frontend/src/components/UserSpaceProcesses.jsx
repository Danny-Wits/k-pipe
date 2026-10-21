import React from 'react';
import { Play, Pause, AlertCircle, ArrowUpRight, ArrowDownRight, HardDrive, Cpu, Terminal, Zap } from 'lucide-react';

export default function UserSpaceProcesses({ producer, consumer, fillPercentage, pageCount, capacity }) {
  const isProducerRunning = producer.state === 'TASK_RUNNING';
  const isConsumerRunning = consumer.state === 'TASK_RUNNING';

  return (
    <div className="hud-card p-4 bg-[#0c101a] border border-cyan-500/20 relative overflow-hidden">
      {/* User Space Boundary Label */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
            Linux User Space (Ring 3)
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span>IPC Mechanism:</span>
          <span className="text-slate-200 bg-[#161f30] px-2 py-0.5 rounded border border-slate-700/60">
            UNIX Anonymous Pipe (|)
          </span>
        </div>
      </div>

      {/* Grid of Two Processes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Process A: Producer */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all duration-300 ${
            isProducerRunning
              ? 'bg-[#101726] border-emerald-500/40 shadow-[0_0_15px_rgba(0,230,118,0.06)]'
              : 'bg-[#15141b] border-amber-500/40 shadow-[0_0_15px_rgba(255,179,0,0.06)]'
          }`}
        >
          {/* Header with Title and State */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  PROCESS A
                </span>
                <span className="font-mono text-xs text-slate-400">PRODUCER</span>
              </div>
              <h3 className="font-mono font-bold text-sm sm:text-base text-slate-100 mt-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="truncate">{producer.name}</span>
              </h3>
            </div>

            {/* Linux Task State Badge */}
            <div
              className={`font-mono text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 tracking-wider ${
                isProducerRunning
                  ? 'badge-running text-emerald-400'
                  : 'badge-interruptible text-amber-400'
              }`}
            >
              <span className={`led-dot ${isProducerRunning ? 'led-green pulse-fast' : 'led-amber pulse-slow'}`} />
              <span>{producer.state}</span>
            </div>
          </div>

          {/* Process Metadata Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-[#0b0e17] p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">PID</span>
              <span className="text-slate-200 font-semibold">{producer.pid}</span>
            </div>
            <div className="bg-[#0b0e17] p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">CPU Load</span>
              <span className="text-emerald-400 font-semibold">{producer.cpuLoad?.toFixed(1) || '14.2'}%</span>
            </div>
            <div className="bg-[#0b0e17] p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Write Rate</span>
              <span className="text-cyan-400 font-semibold">{producer.rateKbPerSec || 0} KB/s</span>
            </div>
          </div>

          {/* Syscall Banner */}
          <div className="mt-3 p-2 rounded bg-[#070a12] border border-slate-800/90 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">Syscall:</span>
              <code className="text-emerald-300 font-medium text-[11px] truncate">
                {producer.syscall || 'write(pipefd[1], buf, 4096)'}
              </code>
            </div>
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 shrink-0 ml-2 border border-slate-800">
              fd: 1 (out)
            </span>
          </div>

          {/* Backpressure indicator note */}
          {!isProducerRunning && (
            <div className="mt-2 text-[11px] font-mono text-amber-400 flex items-center gap-1 bg-amber-950/20 p-1.5 rounded border border-amber-900/40">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Backpressure: sleeping in wr_wait (buffer full {pageCount}/{capacity})</span>
            </div>
          )}
        </div>

        {/* Process B: Consumer */}
        <div
          className={`relative p-3.5 rounded-lg border transition-all duration-300 ${
            isConsumerRunning
              ? 'bg-[#101726] border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.06)]'
              : 'bg-[#15141b] border-amber-500/40 shadow-[0_0_15px_rgba(255,179,0,0.06)]'
          }`}
        >
          {/* Header with Title and State */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  PROCESS B
                </span>
                <span className="font-mono text-xs text-slate-400">CONSUMER</span>
              </div>
              <h3 className="font-mono font-bold text-sm sm:text-base text-slate-100 mt-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="truncate">{consumer.name}</span>
              </h3>
            </div>

            {/* Linux Task State Badge */}
            <div
              className={`font-mono text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 tracking-wider ${
                isConsumerRunning
                  ? 'badge-running text-emerald-400'
                  : 'badge-interruptible text-amber-400'
              }`}
            >
              <span className={`led-dot ${isConsumerRunning ? 'led-green pulse-fast' : 'led-amber pulse-slow'}`} />
              <span>{consumer.state}</span>
            </div>
          </div>

          {/* Process Metadata Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-[#0b0e17] p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">PID</span>
              <span className="text-slate-200 font-semibold">{consumer.pid}</span>
            </div>
            <div className="bg-[#0b0e17] p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">CPU Load</span>
              <span className="text-cyan-400 font-semibold">{consumer.cpuLoad?.toFixed(1) || '9.8'}%</span>
            </div>
            <div className="bg-[#0b0e17] p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Read Rate</span>
              <span className="text-cyan-400 font-semibold">{consumer.rateKbPerSec || 0} KB/s</span>
            </div>
          </div>

          {/* Syscall Banner */}
          <div className="mt-3 p-2 rounded bg-[#070a12] border border-slate-800/90 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400 text-[11px]">Syscall:</span>
              <code className="text-cyan-300 font-medium text-[11px] truncate">
                {consumer.syscall || 'read(pipefd[0], buf, 4096)'}
              </code>
            </div>
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 shrink-0 ml-2 border border-slate-800">
              fd: 0 (in)
            </span>
          </div>

          {/* Starvation indicator note */}
          {!isConsumerRunning && (
            <div className="mt-2 text-[11px] font-mono text-amber-400 flex items-center gap-1 bg-amber-950/20 p-1.5 rounded border border-amber-900/40">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Starvation: sleeping in rd_wait (buffer empty 0/{capacity})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
