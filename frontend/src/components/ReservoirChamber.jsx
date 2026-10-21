import React from 'react';
import { Database, AlertTriangle, ShieldCheck, Waves } from 'lucide-react';

/**
 * The Central Bounded Buffer "Reservoir Chamber":
 * - Transparent cylindrical glass vessel with undulating fluid level
 * - Floating memory slot orbs inside
 * - Crisp capacity gauges and live pressure status
 */
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

  // Fluid wave colors based on fill state
  let liquidColor = 'from-sky-400 via-cyan-500 to-blue-600';
  let badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
  let statusText = 'Normal Flow Equilibrium';

  if (isFull) {
    liquidColor = 'from-rose-500 via-rose-600 to-red-700';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse';
    statusText = 'BACKPRESSURE: BUFFER 100% FULL';
  } else if (isEmpty) {
    liquidColor = 'from-slate-300 via-slate-400 to-slate-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
    statusText = 'STARVATION: BUFFER 0% EMPTY';
  } else if (fillPercentage > 75) {
    liquidColor = 'from-amber-400 via-amber-500 to-orange-600';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
    statusText = 'High Buffer Load (>75%)';
  }

  const totalBytes = pageCount * 4096;
  const maxBytes = capacity * 4096;

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      {/* Reservoir Glass Vessel Container */}
      <div className="relative flex flex-col items-center">
        {/* Vessel Cap Collar */}
        <div className="w-24 h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-t-md border-t border-x border-slate-300 shadow-sm flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-400/60 rounded-full" />
        </div>

        {/* Cylindrical Glass Tube */}
        <div className="relative w-36 sm:w-40 h-44 sm:h-48 rounded-2xl bg-gradient-to-b from-white via-sky-50/20 to-slate-50 border-2 border-slate-200/90 shadow-[0_12px_30px_-8px_rgba(2,132,199,0.12),inset_0_0_15px_rgba(255,255,255,0.9)] overflow-hidden flex flex-col justify-end p-1">
          {/* Internal Volumetric Scale Marks */}
          <div className="absolute top-2 left-2 flex flex-col justify-between h-40 text-[9px] font-mono text-slate-400 pointer-events-none z-20">
            <span>{capacity}p</span>
            <span>{(capacity * 0.75).toFixed(0)}p</span>
            <span>{(capacity * 0.5).toFixed(0)}p</span>
            <span>{(capacity * 0.25).toFixed(0)}p</span>
            <span>0p</span>
          </div>

          {/* Liquid Plasma Fill Column with Wave */}
          <div
            className={`w-full rounded-b-xl bg-gradient-to-t ${liquidColor} transition-all duration-500 relative overflow-hidden shadow-inner`}
            style={{ height: `${Math.max(4, Math.min(100, fillPercentage))}%` }}
          >
            {/* Top undulating wave crest */}
            <div className="absolute -top-3 left-0 right-0 h-6 bg-white/20 rounded-[50%] blur-[1px] animate-[pulse_2s_infinite_alternate]" />

            {/* Glowing floating bubbles / orbs */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent animate-[pulse_1.5s_infinite]" />
          </div>

          {/* Floating Slot Count Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Buffer Load
              </span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {pageCount}
                </span>
                <span className="text-sm font-mono text-slate-400 font-semibold">
                  / {capacity}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                {fillPercentage.toFixed(0)}% full
              </span>
            </div>
          </div>

          {/* Specular Glass Reflection Gleam (Left vertical stripe) */}
          <div className="absolute top-0 bottom-0 left-2 w-3 bg-gradient-to-r from-white/70 to-transparent pointer-events-none z-20 rounded-l-xl" />
          <div className="absolute top-0 bottom-0 right-2 w-1.5 bg-gradient-to-l from-white/50 to-transparent pointer-events-none z-20 rounded-r-xl" />
        </div>

        {/* Vessel Base Collar */}
        <div className="w-28 h-3.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-b-md border-b border-x border-slate-300 shadow-sm flex items-center justify-center">
          <div className="w-16 h-1 bg-slate-400/60 rounded-full" />
        </div>
      </div>

      {/* Reservoir Telemetry Card */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
          <Database className="w-3.5 h-3.5 text-sky-600" />
          <span>BOUNDED BUFFER CHAMBER</span>
        </div>

        {/* Status Pill */}
        <div className={`mt-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-semibold ${badgeColor} transition-all`}>
          {statusText}
        </div>

        <div className="mt-1 text-[11px] font-mono text-slate-400">
          <span>{((totalBytes / 1024)).toFixed(0)} KB</span>
          <span className="text-slate-300"> / </span>
          <span>{((maxBytes / 1024)).toFixed(0)} KB allocated</span>
        </div>
      </div>
    </div>
  );
}
