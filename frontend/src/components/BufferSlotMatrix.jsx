import React, { useState } from 'react';
import { Database, Info, Layers } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

export default function BufferSlotMatrix({
  capacity = 16,
  pageCount = 6,
  headPointer = 6,
  tailPointer = 0,
  pages = []
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const headSlot = headPointer % capacity;
  const tailSlot = tailPointer % capacity;

  const slotArray = Array.from({ length: capacity }, (_, i) => {
    const pageData = pages?.find((p) => p.slot === i);
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

  const handleSelectSlot = (idx) => {
    sounds.playClick();
    setSelectedSlot(selectedSlot === idx ? null : idx);
  };

  return (
    <div className="bg-[#0b1021] rounded-3xl border-2 border-slate-800 p-5 sm:p-6 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.6)]">
      {/* Title & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-800 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>KERNEL MEMORY MAP:</span>
            <span className="text-sky-400 font-semibold">struct pipe_inode_info::ring[]</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700 px-2.5 py-1 rounded-lg text-emerald-300 font-bold">
            <span>head: {headPointer}</span>
            <span className="text-[10px] text-emerald-400 font-normal">(slot #{headSlot})</span>
          </div>

          <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-700 px-2.5 py-1 rounded-lg text-sky-300 font-bold">
            <span>tail: {tailPointer}</span>
            <span className="text-[10px] text-sky-400 font-normal">(slot #{tailSlot})</span>
          </div>

          <span className="text-slate-400 text-xs font-semibold">
            {pageCount} of {capacity} active slots
          </span>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 font-mono">
        {slotArray.map((slot) => {
          const isSelected = selectedSlot === slot.index;
          const isOverlap = slot.isHead && slot.isTail;

          return (
            <div
              key={slot.index}
              onClick={() => handleSelectSlot(slot.index)}
              className={`p-2.5 rounded-xl border-2 cursor-pointer flex flex-col justify-between min-h-[92px] transition-all ${
                isSelected
                  ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/90 shadow-[0_0_12px_rgba(56,189,248,0.4)] scale-105'
                  : isOverlap
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                  : slot.isHead
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-sm'
                  : slot.isTail
                  ? 'border-sky-500 bg-sky-950/30 shadow-sm'
                  : slot.isOccupied
                  ? 'border-sky-800/80 bg-sky-950/20 hover:border-sky-600'
                  : 'border-slate-800 bg-[#070b14] hover:border-slate-700 opacity-60'
              }`}
            >
              {/* Top Row: Slot Number */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-slate-300">
                  [{slot.index.toString().padStart(2, '0')}]
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  slot.isOccupied ? 'bg-sky-950/80 text-sky-300 border border-sky-700' : 'text-slate-600'
                }`}>
                  {slot.isOccupied ? '4KB' : 'NIL'}
                </span>
              </div>

              {/* Middle Row: Content Payload snippet */}
              <div className="my-1 text-[10px] leading-tight">
                <span className="text-[9px] text-slate-500 block truncate">
                  {slot.pageData ? slot.pageData.hex : `0x${(0x7fff1000 + slot.index * 0x1000).toString(16)}`}
                </span>
                <span className={`mt-0.5 line-clamp-2 break-all text-[10px] font-semibold ${
                  slot.isOccupied ? 'text-slate-200' : 'text-slate-600 italic'
                }`}>
                  {slot.pageData ? slot.pageData.payload : '<EMPTY>'}
                </span>
              </div>

              {/* Bottom Row: Head / Tail Indicator */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-extrabold">
                {slot.isHead && (
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700 px-1 rounded flex items-center gap-0.5">
                    ▼head
                  </span>
                )}
                {slot.isTail && (
                  <span className="bg-sky-950/80 text-sky-300 border border-sky-700 px-1 rounded flex items-center gap-0.5 ml-auto">
                    ▲tail
                  </span>
                )}
                {!slot.isHead && !slot.isTail && (
                  <span className="text-slate-600 text-[9px] font-normal">idle</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Detailed View */}
      {selectedSlot !== null && (
        <div className="mt-4 p-4 rounded-2xl bg-[#070b14] border-2 border-sky-800/80 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-extrabold text-sky-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              Memory Slot Inspection: ring[{selectedSlot}]
            </span>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-slate-400 hover:text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700 text-xs font-bold transition-all"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Virtual Address</span>
              <code className="text-sky-400 font-bold text-xs">
                {slotArray[selectedSlot]?.pageData?.hex || `0x${(0x7fff1000 + selectedSlot * 0x1000).toString(16)}`}
              </code>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Allocation Status</span>
              <span className="font-bold text-white">
                {slotArray[selectedSlot]?.isOccupied ? `Allocated 4096 Bytes (#${slotArray[selectedSlot]?.pageData?.pageId})` : 'Unallocated (Free Slot)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Kernel Wait Queue Status</span>
              <span className="font-bold text-emerald-400">
                {slotArray[selectedSlot]?.isOccupied ? 'Ready for sys_read()' : 'Available for sys_write()'}
              </span>
            </div>
          </div>

          {slotArray[selectedSlot]?.pageData && (
            <div className="mt-2.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Payload Content</span>
              <div className="bg-[#0b1021] p-2.5 rounded-xl border border-slate-800 text-slate-200 font-semibold break-all text-xs">
                {slotArray[selectedSlot]?.pageData?.payload}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
