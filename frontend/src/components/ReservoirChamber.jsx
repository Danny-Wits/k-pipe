import React from 'react';
import { Database } from 'lucide-react';

export default function ReservoirChamber({
  pageCount = 6,
  capacity = 16,
  fillPercentage = 37.5,
  headPointer = 6,
  tailPointer = 0,
  pages = []
}) {
  const isFull = pageCount >= capacity;
  const isEmpty = pageCount <= 0;

  // Liquid color based on state (High contrast red/black)
  let liquidColor = 'from-rose-500 to-red-600';
  let badgeColor = 'bg-black text-white';
  let statusText = 'Normal Flow Equilibrium';

  if (isFull) {
    liquidColor = 'from-red-600 to-rose-700';
    badgeColor = 'bg-red-600 text-white';
    statusText = 'BACKPRESSURE: BUFFER 100% FULL';
  } else if (isEmpty) {
    liquidColor = 'from-neutral-300 to-neutral-400';
    badgeColor = 'bg-neutral-200 text-black';
    statusText = 'STARVATION: BUFFER EMPTY';
  }

  const totalBytes = pageCount * 4096;
  const maxBytes = capacity * 4096;

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none font-mono">
      {/* Reservoir Glass Vessel Container */}
      <div className="relative flex flex-col items-center">
        {/* Vessel Cap Collar */}
        <div className="w-24 h-3 bg-black rounded-t-sm border-2 border-black flex items-center justify-center">
          <div className="w-10 h-1 bg-white/40 rounded-full" />
        </div>

        {/* Cylindrical Glass Tube */}
        <div className="relative w-36 sm:w-40 h-44 sm:h-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col justify-end p-1">
          {/* Internal Volumetric Scale Marks */}
          <div className="absolute top-2 left-2 flex flex-col justify-between h-40 text-xs font-bold text-neutral-400 pointer-events-none z-20">
            <span>{capacity}p</span>
            <span>{(capacity * 0.75).toFixed(0)}p</span>
            <span>{(capacity * 0.5).toFixed(0)}p</span>
            <span>{(capacity * 0.25).toFixed(0)}p</span>
            <span>0p</span>
          </div>

          {/* Liquid Plasma Fill Column */}
          <div
            className={`w-full bg-gradient-to-t ${liquidColor} transition-all duration-500 relative overflow-hidden`}
            style={{ height: `${Math.max(4, Math.min(100, fillPercentage))}%` }}
          >
            <div className="absolute -top-3 left-0 right-0 h-6 bg-white/30 rounded-[50%]" />
          </div>

          {/* Floating Slot Count Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <div className="px-3 py-2 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Buffer Load
              </span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-2xl sm:text-3xl font-display font-black text-black">
                  {pageCount}
                </span>
                <span className="text-xs text-neutral-500 font-bold">
                  / {capacity}
                </span>
              </div>
              <span className="text-xs font-bold text-black uppercase">
                {fillPercentage.toFixed(0)}% full
              </span>
            </div>
          </div>
        </div>

        {/* Vessel Base Collar */}
        <div className="w-28 h-3.5 bg-black rounded-b-sm border-2 border-black flex items-center justify-center">
          <div className="w-16 h-1 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* Reservoir Telemetry Card */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
          <Database className="w-3.5 h-3.5 text-red-600" />
          <span>BOUNDED BUFFER CHAMBER</span>
        </div>

        {/* Status Pill (No blinking) */}
        <div className={`mt-1.5 px-3 py-1 border-2 border-black text-xs font-bold uppercase ${badgeColor} shadow-[2px_2px_0px_0px_#000]`}>
          {statusText}
        </div>

        <div className="mt-1 text-xs text-neutral-600 font-bold">
          <span>{((totalBytes / 1024)).toFixed(0)} KB</span>
          <span className="text-neutral-400"> / </span>
          <span>{((maxBytes / 1024)).toFixed(0)} KB ALLOCATED</span>
        </div>
      </div>
    </div>
  );
}
