import React, { useState } from 'react';
import { Database, HardDrive, ArrowDown, ArrowUp, Cpu, Info, CheckCircle2 } from 'lucide-react';

export default function RingBufferRack({ capacity, pageCount, fillPercentage, headPointer, tailPointer, pages }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const headSlot = headPointer % capacity;
  const tailSlot = tailPointer % capacity;

  // Build array of all slots from 0 to capacity - 1
  const slotArray = Array.from({ length: capacity }, (_, i) => {
    const pageData = pages?.find(p => p.slot === i);
    const isOccupied = Boolean(pageData);
    const isHead = i === headSlot;
    const isTail = i === tailSlot;

    return {
      index: i,
      pageData,
      isOccupied,
      isHead,
      isTail
    };
  });

  const totalBytes = pageCount * 4096;
  const maxBytes = capacity * 4096;

  return (
    <div className="hud-card p-4 bg-[#0a0e17] border border-cyan-500/20 relative">
      {/* Rack Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>KERNEL MEMORY RING:</span>
            <span className="text-cyan-400 font-normal">struct pipe_inode_info::ring[]</span>
          </h2>
        </div>

        {/* Pointer Legend & Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-300">
            <span className="font-bold">head:</span>
            <span>{headPointer}</span>
            <span className="text-[10px] text-emerald-400/80">(slot #{headSlot})</span>
          </div>

          <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/40 px-2 py-0.5 rounded text-cyan-300">
            <span className="font-bold">tail:</span>
            <span>{tailPointer}</span>
            <span className="text-[10px] text-cyan-400/80">(slot #{tailSlot})</span>
          </div>

          <div className="text-slate-400 text-xs">
            <span>Usage: </span>
            <strong className="text-white">{pageCount}</strong>
            <span className="text-slate-500"> / </span>
            <span className="text-slate-300">{capacity} pages</span>
            <span className="text-slate-500"> ({((totalBytes / 1024)).toFixed(0)} KB / {((maxBytes / 1024)).toFixed(0)} KB)</span>
          </div>
        </div>
      </div>

      {/* Fill Percentage Gauge Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
          <span>Pipe Backpressure Threshold</span>
          <span className={`font-semibold ${fillPercentage >= 100 ? 'text-amber-400' : fillPercentage > 75 ? 'text-cyan-300' : 'text-emerald-400'}`}>
            {fillPercentage.toFixed(1)}% {fillPercentage >= 100 ? '• RING FULL (BACKPRESSURE ACTIVE)' : ''}
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#101625] rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              fillPercentage >= 100
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_rgba(255,179,0,0.5)]'
                : fillPercentage > 75
                ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                : 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-cyan-500'
            }`}
            style={{ width: `${Math.min(100, fillPercentage)}%` }}
          />
        </div>
      </div>

      {/* Segmented Ring Memory Rack Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 font-mono">
        {slotArray.map((slot) => {
          const isSelected = selectedSlot === slot.index;
          const isOverlap = slot.isHead && slot.isTail;

          return (
            <div
              key={slot.index}
              onClick={() => setSelectedSlot(slot.index === selectedSlot ? null : slot.index)}
              className={`memory-slot p-2 cursor-pointer flex flex-col justify-between min-h-[96px] ${
                slot.isOccupied ? 'occupied' : 'opacity-65'
              } ${
                isOverlap
                  ? 'head-tail-overlap'
                  : slot.isHead
                  ? 'head-active'
                  : slot.isTail
                  ? 'tail-active'
                  : ''
              } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
            >
              {/* Top Row: Slot Index & Page State */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">
                  [{slot.index.toString().padStart(2, '0')}]
                </span>
                <span className={`text-[10px] px-1 py-0.2 rounded ${slot.isOccupied ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/30' : 'text-slate-600'}`}>
                  {slot.isOccupied ? '4KB' : 'NULL'}
                </span>
              </div>

              {/* Middle Row: Memory Hex Address & Content Preview */}
              <div className="my-1 text-[10px] leading-tight">
                <div className="text-slate-500 truncate text-[9px]">
                  {slot.pageData ? slot.pageData.hex : `0x${(0x7fff1000 + slot.index * 0x1000).toString(16)}`}
                </div>
                <div className={`mt-1 line-clamp-2 break-all text-[10px] ${slot.isOccupied ? 'text-slate-200' : 'text-slate-700 italic'}`}>
                  {slot.pageData ? slot.pageData.payload : '<PAGE_FREE>'}
                </div>
              </div>

              {/* Bottom Row: Head / Tail Pointer Flags */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                {slot.isHead && (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/50 px-1 rounded flex items-center gap-0.5 font-bold">
                    <span>▼head</span>
                  </span>
                )}
                {slot.isTail && (
                  <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/50 px-1 rounded flex items-center gap-0.5 font-bold ml-auto">
                    <span>▲tail</span>
                  </span>
                )}
                {!slot.isHead && !slot.isTail && (
                  <span className="text-slate-700 text-[9px]">slot ready</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot Detailed Inspection Drawer (if slot selected) */}
      {selectedSlot !== null && (
        <div className="mt-4 p-3 bg-[#111726] border border-cyan-500/40 rounded-lg font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Inspection: struct pipe_buffer ring[{selectedSlot}]
            </span>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 text-[10px]"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Kernel Page Address:</span>
              <code className="text-cyan-400 text-xs">
                {slotArray[selectedSlot]?.pageData?.hex || `0x${(0x7fff1000 + selectedSlot * 0x1000).toString(16)}`}
              </code>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Page ID &amp; Offset:</span>
              <span>{slotArray[selectedSlot]?.pageData?.pageId ? `#${slotArray[selectedSlot].pageData.pageId} (len: 4096B)` : 'Unallocated (len: 0B)'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Wait-Queue Sync Condition:</span>
              <span className="text-emerald-400 text-[11px]">
                {slotArray[selectedSlot]?.isOccupied ? 'Ready for pipe_read()' : 'Available for pipe_write()'}
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase mb-1">Payload Content Snippet:</span>
            <div className="bg-[#090d16] p-2 rounded border border-slate-800 text-slate-200 text-xs break-all">
              {slotArray[selectedSlot]?.pageData?.payload || 'No active buffer page mapped in this slot.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
