import React from 'react';
import { Terminal, Zap, AlertCircle, CheckCircle2, RotateCw, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function ProducerStation({ producer, pageCount, capacity }) {
  const isRunning = producer.state === 'TASK_RUNNING';

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 bg-white flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ${
        isRunning
          ? 'border-emerald-300 shadow-[0_8px_25px_-6px_rgba(16,185,129,0.15)]'
          : 'border-rose-300 shadow-[0_8px_25px_-6px_rgba(244,63,94,0.15)] bg-rose-50/20'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Animated Rotating Core */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isRunning ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 block w-fit">
                Producer Node
              </span>
              <h3 className="font-mono font-extrabold text-sm sm:text-base text-slate-900 mt-1 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">{producer.name}</span>
              </h3>
            </div>
          </div>

          {/* PID Pill */}
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 font-bold shrink-0">
            PID {producer.pid}
          </span>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Throughput</span>
            <span className="text-base font-extrabold text-emerald-600">{producer.rateKbPerSec || 0} <span className="text-xs font-normal text-slate-400">KB/s</span></span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">CPU Core</span>
            <span className="text-base font-extrabold text-slate-700">{producer.cpuLoad?.toFixed(1) || '14.2'}%</span>
          </div>
        </div>

        {/* Syscall Banner */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-400 text-[11px]">Syscall:</span>
            <code className="text-emerald-700 font-semibold text-[11px] truncate">
              {producer.syscall || 'sys_write(pipefd[1])'}
            </code>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
            fd: 1
          </span>
        </div>
      </div>

      {/* Fixed Height Status Row (Zero Layout Shift) */}
      <div className="h-9 mt-3">
        {isRunning ? (
          <div className="h-full px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-mono font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="truncate">TASK_RUNNING (Active Writing to Pipe)</span>
          </div>
        ) : (
          <div className="h-full px-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-[11px] font-mono font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-bounce" />
            <span className="truncate">
              BLOCKED: Buffer Full ({pageCount}/{capacity})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConsumerStation({ consumer, pageCount, capacity }) {
  const isRunning = consumer.state === 'TASK_RUNNING';

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 bg-white flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ${
        isRunning
          ? 'border-indigo-300 shadow-[0_8px_25px_-6px_rgba(99,102,241,0.15)]'
          : 'border-amber-300 shadow-[0_8px_25px_-6px_rgba(245,158,11,0.15)] bg-amber-50/20'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Animated Rotating Turbine */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isRunning ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 block w-fit">
                Consumer Node
              </span>
              <h3 className="font-mono font-extrabold text-sm sm:text-base text-slate-900 mt-1 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">{consumer.name}</span>
              </h3>
            </div>
          </div>

          {/* PID Pill */}
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 font-bold shrink-0">
            PID {consumer.pid}
          </span>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Throughput</span>
            <span className="text-base font-extrabold text-indigo-600">{consumer.rateKbPerSec || 0} <span className="text-xs font-normal text-slate-400">KB/s</span></span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">CPU Core</span>
            <span className="text-base font-extrabold text-slate-700">{consumer.cpuLoad?.toFixed(1) || '11.8'}%</span>
          </div>
        </div>

        {/* Syscall Banner */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-400 text-[11px]">Syscall:</span>
            <code className="text-indigo-700 font-semibold text-[11px] truncate">
              {consumer.syscall || 'sys_read(pipefd[0])'}
            </code>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
            fd: 0
          </span>
        </div>
      </div>

      {/* Fixed Height Status Row (Zero Layout Shift) */}
      <div className="h-9 mt-3">
        {isRunning ? (
          <div className="h-full px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 text-[11px] font-mono font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="truncate">TASK_RUNNING (Active Reading from Pipe)</span>
          </div>
        ) : (
          <div className="h-full px-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-mono font-semibold flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-bounce" />
            <span className="truncate">
              STARVATION: Buffer Empty (0/{capacity})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
