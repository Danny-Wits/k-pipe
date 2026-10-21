import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export default function KernelDmesgLog({ logs, onClose }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="hud-card p-4 bg-white dark:bg-[#090d16] border border-slate-200 dark:border-cyan-500/20 font-mono text-xs shadow-sm transition-colors">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <span className="font-bold text-slate-900 dark:text-slate-200">
            KERNEL RING BUFFER LOGS: <span className="text-sky-600 dark:text-cyan-400 font-normal">dmesg -w / trace_pipe</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
          <span>fs/pipe.c kprobes active</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold"
            >
              Hide ✕
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Output Window */}
      <div
        ref={scrollRef}
        className="h-44 overflow-y-auto space-y-1 p-2.5 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 text-[11px] leading-relaxed shadow-inner"
      >
        {logs && logs.length > 0 ? (
          logs.map((log, index) => {
            const isBackpressure = log.msg.includes('BACKPRESSURE') || log.msg.includes('wr_wait') || log.msg.includes('FULL');
            const isStarvation = log.msg.includes('rd_wait') || log.msg.includes('EMPTY');
            const isWakeup = log.msg.includes('wake_up');

            let textColor = 'text-slate-300';
            if (isBackpressure) textColor = 'text-amber-400 font-semibold';
            else if (isStarvation) textColor = 'text-cyan-400 font-semibold';
            else if (isWakeup) textColor = 'text-emerald-400 font-semibold';

            return (
              <div key={log.id || index} className="flex items-start gap-2">
                <span className="text-slate-500 select-none">[{log.time || '0.000000'}]</span>
                <span className="text-cyan-400/90 shrink-0">[{log.src || 'fs/pipe.c'}]</span>
                <span className={textColor}>{log.msg}</span>
              </div>
            );
          })
        ) : (
          <div className="text-slate-500 italic">No kernel dmesg messages logged yet.</div>
        )}
      </div>
    </div>
  );
}
