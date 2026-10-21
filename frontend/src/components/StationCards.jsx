import React from 'react';
import { Terminal, AlertCircle, RotateCw, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function ProducerStation({ producer, pageCount, capacity }) {
  const isRunning = producer.state === 'TASK_RUNNING';

  return (
    <div
      className={`relative p-5 border-2 border-black bg-white flex flex-col justify-between shadow-[4px_4px_0px_0px_#000000] ${
        isRunning ? '' : 'bg-red-50'
      }`}
    >
      <div>
        {/* Top Header (Clean, bold, no useless micro-badges) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 border-2 border-black flex items-center justify-center ${
              isRunning ? 'bg-black text-white' : 'bg-red-600 text-white'
            }`}>
              <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                Producer Node
              </span>
              <h3 className="font-display font-black text-base text-black flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-none">{producer.name}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-neutral-50 border-2 border-black font-mono">
          <div>
            <span className="text-xs uppercase font-bold text-neutral-500 block">Throughput</span>
            <span className="text-lg font-black text-black">
              {producer.rateKbPerSec || 0} <span className="text-xs font-normal text-neutral-500">KB/s</span>
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-neutral-500 block">CPU Core</span>
            <span className="text-lg font-black text-black">
              {producer.cpuLoad?.toFixed(1) || '14.2'}%
            </span>
          </div>
        </div>

        {/* Syscall Banner */}
        <div className="flex items-center justify-between p-2.5 bg-neutral-100 border-2 border-black text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <ArrowDownRight className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
            <span className="text-neutral-500 text-xs font-bold">Syscall:</span>
            <code className="text-black font-bold text-xs truncate">
              {producer.syscall || 'sys_write(pipefd[1])'}
            </code>
          </div>
        </div>
      </div>

      {/* Fixed Height Status Row (Zero Layout Shift, No Blinking) */}
      <div className="h-10 mt-3">
        {isRunning ? (
          <div className="h-full px-3 border-2 border-black bg-white text-black text-xs font-mono font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-600 inline-block" />
            <span className="truncate">TASK_RUNNING (Writing to Pipe)</span>
          </div>
        ) : (
          <div className="h-full px-3 border-2 border-red-600 bg-red-600 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span className="truncate">
              SLEEPING (Buffer Full {pageCount}/{capacity})
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
      className={`relative p-5 border-2 border-black bg-white flex flex-col justify-between shadow-[4px_4px_0px_0px_#000000] ${
        isRunning ? '' : 'bg-neutral-50'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 border-2 border-black flex items-center justify-center ${
              isRunning ? 'bg-black text-white' : 'bg-neutral-200 text-black'
            }`}>
              <RotateCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                Consumer Node
              </span>
              <h3 className="font-display font-black text-base text-black flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-none">{consumer.name}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-neutral-50 border-2 border-black font-mono">
          <div>
            <span className="text-xs uppercase font-bold text-neutral-500 block">Throughput</span>
            <span className="text-lg font-black text-black">
              {consumer.rateKbPerSec || 0} <span className="text-xs font-normal text-neutral-500">KB/s</span>
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-neutral-500 block">CPU Core</span>
            <span className="text-lg font-black text-black">
              {consumer.cpuLoad?.toFixed(1) || '11.8'}%
            </span>
          </div>
        </div>

        {/* Syscall Banner */}
        <div className="flex items-center justify-between p-2.5 bg-neutral-100 border-2 border-black text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
            <span className="text-neutral-500 text-xs font-bold">Syscall:</span>
            <code className="text-black font-bold text-xs truncate">
              {consumer.syscall || 'sys_read(pipefd[0])'}
            </code>
          </div>
        </div>
      </div>

      {/* Fixed Height Status Row (Zero Layout Shift, No Blinking) */}
      <div className="h-10 mt-3">
        {isRunning ? (
          <div className="h-full px-3 border-2 border-black bg-white text-black text-xs font-mono font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-black inline-block" />
            <span className="truncate">TASK_RUNNING (Reading from Pipe)</span>
          </div>
        ) : (
          <div className="h-full px-3 border-2 border-black bg-neutral-100 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
            <AlertCircle className="w-4 h-4 text-black shrink-0" />
            <span className="truncate">
              STARVATION: Buffer Empty (0/{capacity})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
