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
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)]">
      {/* Title & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-100 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>KERNEL MEMORY MAP:</span>
            <span className="text-sky-600 font-semibold">struct pipe_inode_info::ring[]</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-800 font-bold">
            <span>head: {headPointer}</span>
            <span className="text-[10px] text-emerald-600 font-normal">(slot #{headSlot})</span>
          </div>

          <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg text-sky-800 font-bold">
            <span>tail: {tailPointer}</span>
            <span className="text-[10px] text-sky-600 font-normal">(slot #{tailSlot})</span>
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
                  ? 'ring-2 ring-sky-500 border-sky-500 shadow-md scale-105'
                  : isOverlap
                  ? 'border-amber-400 bg-amber-50/30'
                  : slot.isHead
                  ? 'border-emerald-400 bg-emerald-50/20 shadow-sm'
                  : slot.isTail
                  ? 'border-sky-400 bg-sky-50/20 shadow-sm'
                  : slot.isOccupied
                  ? 'border-sky-200 bg-sky-50/50 hover:border-sky-300'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 opacity-60'
              }`}
            >
              {/* Top Row: Slot Number */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-slate-700">
                  [{slot.index.toString().padStart(2, '0')}]
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  slot.isOccupied ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'text-slate-400'
                }`}>
                  {slot.isOccupied ? '4KB' : 'NIL'}
                </span>
              </div>

              {/* Middle Row: Content Payload snippet */}
              <div className="my-1 text-[10px] leading-tight">
                <span className="text-[9px] text-slate-400 block truncate">
                  {slot.pageData ? slot.pageData.hex : `0x${(0x7fff1000 + slot.index * 0x1000).toString(16)}`}
                </span>
                <span className={`mt-0.5 line-clamp-2 break-all text-[10px] font-semibold ${
                  slot.isOccupied ? 'text-slate-800' : 'text-slate-400 italic'
                }`}>
                  {slot.pageData ? slot.pageData.payload : '<EMPTY>'}
                </span>
              </div>

              {/* Bottom Row: Head / Tail Indicator */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] font-extrabold">
                {slot.isHead && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 rounded flex items-center gap-0.5">
                    ▼head
                  </span>
                )}
                {slot.isTail && (
                  <span className="bg-sky-100 text-sky-800 border border-sky-300 px-1 rounded flex items-center gap-0.5 ml-auto">
                    ▲tail
                  </span>
                )}
                {!slot.isHead && !slot.isTail && (
                  <span className="text-slate-300 text-[9px] font-normal">idle</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Detailed View */}
      {selectedSlot !== null && (
        <div className="mt-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200 mb-2">
            <span className="font-extrabold text-sky-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600" />
              Memory Slot Inspection: ring[{selectedSlot}]
            </span>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-slate-500 hover:text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-sky-200 text-xs font-bold"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Virtual Address</span>
              <code className="text-sky-700 font-bold text-xs">
                {slotArray[selectedSlot]?.pageData?.hex || `0x${(0x7fff1000 + selectedSlot * 0x1000).toString(16)}`}
              </code>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Allocation Status</span>
              <span className="font-bold text-slate-900">
                {slotArray[selectedSlot]?.isOccupied ? `Allocated 4096 Bytes (#${slotArray[selectedSlot]?.pageData?.pageId})` : 'Unallocated (Free Slot)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kernel Wait Queue Status</span>
              <span className="font-bold text-emerald-700">
                {slotArray[selectedSlot]?.isOccupied ? 'Ready for sys_read()' : 'Available for sys_write()'}
              </span>
            </div>
          </div>

          {slotArray[selectedSlot]?.pageData && (
            <div className="mt-2.5 pt-2 border-t border-sky-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payload Content</span>
              <div className="bg-white p-2.5 rounded-xl border border-sky-200 text-slate-800 font-semibold break-all text-xs">
                {slotArray[selectedSlot]?.pageData?.payload}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
