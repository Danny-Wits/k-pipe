import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Moon, Zap, UserCheck, AlertOctagon, HelpCircle } from 'lucide-react';

export default function WaitQueueInspector({ waitQueues, producer, consumer, mutexLocked, pageCount, capacity }) {
  const isWriterSleeping = waitQueues?.wrWaitCount > 0 || producer.state === 'TASK_INTERRUPTIBLE';
  const isReaderSleeping = waitQueues?.rdWaitCount > 0 || consumer.state === 'TASK_INTERRUPTIBLE';

  return (
    <div className="hud-card p-4 bg-[#0a0e18] border border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h2 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>KERNEL WAIT QUEUE DISPATCH:</span>
            <span className="text-amber-400 font-normal">wait_queue_head_t</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Lock:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
              mutexLocked
                ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
                : 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
            }`}
          >
            {mutexLocked ? 'pipe->mutex ACQUIRED' : 'pipe->mutex FREE'}
          </span>
        </div>
      </div>

      {/* Grid: Write Wait Queue & Read Wait Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Write Wait Queue: pipe->wr_wait */}
        <div
          className={`p-3.5 rounded-lg border font-mono transition-all duration-300 ${
            isWriterSleeping
              ? 'bg-[#18121a] border-amber-500/60 shadow-[0_0_15px_rgba(255,179,0,0.1)]'
              : 'bg-[#0f1422] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300">pipe-&gt;wr_wait</span>
              <span className="text-[10px] text-slate-500">(write wait queue)</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                isWriterSleeping
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {isWriterSleeping ? '1 TASK SLEEPING' : '0 TASKS (IDLE)'}
            </span>
          </div>

          {/* Condition Predicate */}
          <div className="p-2 rounded bg-[#090c14] border border-slate-800/80 text-[11px] text-slate-300 mb-2">
            <span className="text-slate-500 block text-[10px] uppercase">Kernel Sleep Predicate:</span>
            <code className="text-amber-300 font-semibold">
              while (pipe-&gt;head - pipe-&gt;tail &gt;= max_usage)
            </code>
          </div>

          {/* Enqueued Task Status */}
          {isWriterSleeping ? (
            <div className="flex items-center gap-2 p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs">
              <Moon className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold">PID {producer.pid} ({producer.name})</span>
                <span className="block text-[10px] text-amber-300/80">
                  Suspended in TASK_INTERRUPTIBLE until slot frees
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/40 border border-slate-800/60 text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Queue empty: Writer is actively dispatching syscalls.</span>
            </div>
          )}

          <div className="mt-2 text-[10px] text-slate-500">
            Woken by: <span className="text-cyan-400">wake_up_interruptible_sync_poll(&amp;pipe-&gt;wr_wait)</span> inside <code className="text-slate-400">pipe_read()</code>
          </div>
        </div>

        {/* Read Wait Queue: pipe->rd_wait */}
        <div
          className={`p-3.5 rounded-lg border font-mono transition-all duration-300 ${
            isReaderSleeping
              ? 'bg-[#18121a] border-amber-500/60 shadow-[0_0_15px_rgba(255,179,0,0.1)]'
              : 'bg-[#0f1422] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-cyan-300">pipe-&gt;rd_wait</span>
              <span className="text-[10px] text-slate-500">(read wait queue)</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                isReaderSleeping
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {isReaderSleeping ? '1 TASK SLEEPING' : '0 TASKS (IDLE)'}
            </span>
          </div>

          {/* Condition Predicate */}
          <div className="p-2 rounded bg-[#090c14] border border-slate-800/80 text-[11px] text-slate-300 mb-2">
            <span className="text-slate-500 block text-[10px] uppercase">Kernel Sleep Predicate:</span>
            <code className="text-cyan-300 font-semibold">
              while (pipe-&gt;head == pipe-&gt;tail)
            </code>
          </div>

          {/* Enqueued Task Status */}
          {isReaderSleeping ? (
            <div className="flex items-center gap-2 p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs">
              <Moon className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold">PID {consumer.pid} ({consumer.name})</span>
                <span className="block text-[10px] text-amber-300/80">
                  Suspended in TASK_INTERRUPTIBLE until new page arrives
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/40 border border-slate-800/60 text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Queue empty: Reader is actively consuming buffer pages.</span>
            </div>
          )}

          <div className="mt-2 text-[10px] text-slate-500">
            Woken by: <span className="text-emerald-400">wake_up_interruptible_sync_poll(&amp;pipe-&gt;rd_wait)</span> inside <code className="text-slate-400">pipe_write()</code>
          </div>
        </div>
      </div>
    </div>
  );
}
