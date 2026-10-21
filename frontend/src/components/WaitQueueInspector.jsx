import React from 'react';
import { Clock, CheckCircle, Moon } from 'lucide-react';

export default function WaitQueueInspector({ waitQueues, producer, consumer, mutexLocked }) {
  const isWriterSleeping = waitQueues?.wrWaitCount > 0 || producer.state === 'TASK_INTERRUPTIBLE';
  const isReaderSleeping = waitQueues?.rdWaitCount > 0 || consumer.state === 'TASK_INTERRUPTIBLE';

  return (
    <div className="hud-card p-4 bg-white dark:bg-[#0a0e18] border border-slate-200 dark:border-cyan-500/20 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>KERNEL WAIT QUEUE DISPATCH:</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">wait_queue_head_t</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 dark:text-slate-400">Lock:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 border ${
              mutexLocked
                ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/70 dark:border-rose-500/50 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/70 dark:border-emerald-500/50 dark:text-emerald-300'
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
              ? 'bg-amber-50/60 dark:bg-[#18121a] border-amber-300 dark:border-amber-500/60 shadow-sm'
              : 'bg-slate-50 dark:bg-[#0f1422] border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">pipe-&gt;wr_wait</span>
              <span className="text-[10px] text-slate-500">(write wait queue)</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-bold border ${
                isWriterSleeping
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/40 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800'
              }`}
            >
              {isWriterSleeping ? '1 TASK SLEEPING' : '0 TASKS (IDLE)'}
            </span>
          </div>

          {/* Condition Predicate */}
          <div className="p-2 rounded bg-white dark:bg-[#090c14] border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 mb-2">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Kernel Sleep Predicate:</span>
            <code className="text-amber-700 dark:text-amber-300 font-bold">
              while (pipe-&gt;head - pipe-&gt;tail &gt;= max_usage)
            </code>
          </div>

          {/* Enqueued Task Status */}
          {isWriterSleeping ? (
            <div className="flex items-center gap-2 p-2 rounded bg-amber-100/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs">
              <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold">PID {producer.pid} ({producer.name})</span>
                <span className="block text-[10px] text-amber-700 dark:text-amber-300/80 font-medium">
                  Suspended in TASK_INTERRUPTIBLE until slot frees
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <span>Queue empty: Writer is actively dispatching syscalls.</span>
            </div>
          )}

          <div className="mt-2 text-[10px] text-slate-500">
            Woken by: <span className="text-sky-600 dark:text-cyan-400 font-medium">wake_up_interruptible_sync_poll(&amp;pipe-&gt;wr_wait)</span> inside <code className="text-slate-600 dark:text-slate-400">pipe_read()</code>
          </div>
        </div>

        {/* Read Wait Queue: pipe->rd_wait */}
        <div
          className={`p-3.5 rounded-lg border font-mono transition-all duration-300 ${
            isReaderSleeping
              ? 'bg-amber-50/60 dark:bg-[#18121a] border-amber-300 dark:border-amber-500/60 shadow-sm'
              : 'bg-slate-50 dark:bg-[#0f1422] border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-sky-700 dark:text-cyan-300">pipe-&gt;rd_wait</span>
              <span className="text-[10px] text-slate-500">(read wait queue)</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-bold border ${
                isReaderSleeping
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500/40 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800'
              }`}
            >
              {isReaderSleeping ? '1 TASK SLEEPING' : '0 TASKS (IDLE)'}
            </span>
          </div>

          {/* Condition Predicate */}
          <div className="p-2 rounded bg-white dark:bg-[#090c14] border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 mb-2">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Kernel Sleep Predicate:</span>
            <code className="text-sky-700 dark:text-cyan-300 font-bold">
              while (pipe-&gt;head == pipe-&gt;tail)
            </code>
          </div>

          {/* Enqueued Task Status */}
          {isReaderSleeping ? (
            <div className="flex items-center gap-2 p-2 rounded bg-amber-100/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs">
              <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold">PID {consumer.pid} ({consumer.name})</span>
                <span className="block text-[10px] text-amber-700 dark:text-amber-300/80 font-medium">
                  Suspended in TASK_INTERRUPTIBLE until new page arrives
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
              <span>Queue empty: Reader is actively consuming buffer pages.</span>
            </div>
          )}

          <div className="mt-2 text-[10px] text-slate-500">
            Woken by: <span className="text-emerald-600 dark:text-emerald-400 font-medium">wake_up_interruptible_sync_poll(&amp;pipe-&gt;rd_wait)</span> inside <code className="text-slate-600 dark:text-slate-400">pipe_write()</code>
          </div>
        </div>
      </div>
    </div>
  );
}
