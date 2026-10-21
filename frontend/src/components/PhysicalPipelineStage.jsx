import React from 'react';
import { ProducerStation, ConsumerStation } from './StationCards';
import ReservoirChamber from './ReservoirChamber';
import PipeHighwayCanvas from './PipeHighwayCanvas';
import { ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

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
    <div className="bg-white border-2 border-black p-5 sm:p-7 shadow-[6px_6px_0px_0px_#000000] relative overflow-hidden">
      {/* Stage Header (No // and no blinking) */}
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b-2 border-black font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-display font-black uppercase tracking-wider text-black text-sm">
            PHYSICAL CONCURRENCY PIPELINE
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-neutral-600 font-bold">
          <span className="text-black">Process A (fd 1)</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-red-600 font-bold">Kernel Buffer (fs/pipe.c)</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-black">Process B (fd 0)</span>
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

      {/* Glass Pipe Highway Canvas */}
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

      {/* OS Explanation Banner (No jumping, high contrast red/black) */}
      <div className="mt-4 pt-4 border-t-2 border-black font-mono text-xs">
        <div className={`p-3.5 border-2 flex items-center gap-2.5 transition-colors ${
          isFull
            ? 'bg-red-50 border-red-600 text-red-900 shadow-[2px_2px_0px_0px_#dc2626]'
            : isEmpty
            ? 'bg-neutral-100 border-black text-black shadow-[2px_2px_0px_0px_#000]'
            : 'bg-neutral-50 border-black text-black shadow-[2px_2px_0px_0px_#000]'
        }`}>
          {isFull ? (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          ) : isEmpty ? (
            <AlertTriangle className="w-5 h-5 text-black shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          )}

          <div className="truncate">
            {isFull ? (
              <span>
                <strong className="font-bold uppercase">Backpressure Active:</strong> Buffer is full ({pageCount}/{capacity} slots). Writer thread is suspended in <code className="bg-black text-white px-1.5 py-0.5 font-bold">wr_wait</code> to prevent memory explosion.
              </span>
            ) : isEmpty ? (
              <span>
                <strong className="font-bold uppercase">Starvation Active:</strong> Buffer is empty. Reader thread is suspended in <code className="bg-black text-white px-1.5 py-0.5 font-bold">rd_wait</code> until writer pushes new data.
              </span>
            ) : (
              <span>
                <strong className="font-bold uppercase">Equilibrium Flow:</strong> Both processes streaming in coordination through circular memory ring.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
