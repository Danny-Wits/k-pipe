import React from 'react';
import { ProducerStation, ConsumerStation } from './StationCards';
import ReservoirChamber from './ReservoirChamber';
import PipeHighwayCanvas from './PipeHighwayCanvas';
import { ArrowRight, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function PhysicalPipelineStage({
  producer,
  consumer,
  pageCount,
  capacity,
  fillPercentage,
  headPointer,
  tailPointer,
  pages,
  config
}) {
  const isWriterRunning = producer.state === 'TASK_RUNNING';
  const isReaderRunning = consumer.state === 'TASK_RUNNING';
  const isFull = pageCount >= capacity;
  const isEmpty = pageCount <= 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] relative overflow-hidden">
      {/* Stage Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
          <span className="font-extrabold uppercase tracking-wider text-slate-900">
            Physical Linux IPC Pipe Simulation (ring0 ⇋ ring3)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-400 font-semibold">
          <span>Process A (fd 1)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-sky-600">Kernel Pipe Buffer</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <span>Process B (fd 0)</span>
        </div>
      </div>

      {/* 3-Station Physical Pipeline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center relative">
        {/* Station A: Producer (Writer) */}
        <div className="lg:col-span-4 z-10">
          <ProducerStation
            producer={producer}
            pageCount={pageCount}
            capacity={capacity}
          />
        </div>

        {/* Center: Central Glass Bounded Buffer Reservoir */}
        <div className="lg:col-span-4 z-10 flex justify-center">
          <ReservoirChamber
            pageCount={pageCount}
            capacity={capacity}
            fillPercentage={fillPercentage}
            headPointer={headPointer}
            tailPointer={tailPointer}
            pages={pages}
          />
        </div>

        {/* Station B: Consumer (Reader) */}
        <div className="lg:col-span-4 z-10">
          <ConsumerStation
            consumer={consumer}
            pageCount={pageCount}
            capacity={capacity}
          />
        </div>
      </div>

      {/* Glass Pipe Highway Canvas (Spans across the 3 stations on desktop) */}
      <div className="hidden lg:block -mt-10 mb-2 relative z-0">
        <PipeHighwayCanvas
          isWriterRunning={isWriterRunning}
          isReaderRunning={isReaderRunning}
          writeDelayMs={config?.writeDelayMs || 300}
          readDelayMs={config?.readDelayMs || 450}
          pageCount={pageCount}
          capacity={capacity}
          fillPercentage={fillPercentage}
        />
      </div>

      {/* OS Explanation Banner (Fixed Height, No Jumping) */}
      <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-xs">
        <div className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-colors ${
          isFull
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : isEmpty
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
        }`}>
          {isFull ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : isEmpty ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          )}

          <div className="truncate">
            {isFull ? (
              <span>
                <strong className="font-extrabold uppercase">Kernel Backpressure Engaged:</strong> Pipe buffer is full ({pageCount}/{capacity} slots). Writer thread suspended in <code className="bg-white/80 px-1 py-0.2 rounded border border-rose-200 font-bold">wr_wait</code> to prevent OOM.
              </span>
            ) : isEmpty ? (
              <span>
                <strong className="font-extrabold uppercase">Kernel Starvation Active:</strong> Pipe buffer is empty. Reader thread suspended in <code className="bg-white/80 px-1 py-0.2 rounded border border-amber-200 font-bold">rd_wait</code> until writer emits new pages.
              </span>
            ) : (
              <span>
                <strong className="font-extrabold uppercase">Nominal Operating State:</strong> Both processes running in harmony. Mutex serializes 4KB memory page transfers with zero blocking.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
