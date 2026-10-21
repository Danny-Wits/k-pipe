import React, { useState } from 'react';
import { Database, Info, ArrowDown, ArrowUp, X } from 'lucide-react';
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
    <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000]">
      {/* Title & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b-2 border-black gap-2 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
            <span>KERNEL MEMORY MAP:</span>
            <span className="text-red-600 font-bold">struct pipe_inode_info::ring[]</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="bg-white border-2 border-black px-2.5 py-1 text-black font-bold shadow-[2px_2px_0px_0px_#000]">
            <span>HEAD: {headPointer} (SLOT #{headSlot})</span>
          </div>

          <div className="bg-white border-2 border-black px-2.5 py-1 text-black font-bold shadow-[2px_2px_0px_0px_#000]">
            <span>TAIL: {tailPointer} (SLOT #{tailSlot})</span>
          </div>

          <span className="text-neutral-600 text-xs font-bold uppercase">
            {pageCount} of {capacity} active slots
          </span>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 font-mono">
        {slotArray.map((slot) => {
          const isSelected = selectedSlot === slot.index;

          return (
            <div
              key={slot.index}
              onClick={() => handleSelectSlot(slot.index)}
              className={`p-3 border-2 cursor-pointer flex flex-col justify-between min-h-[96px] transition-all ${
                isSelected
                  ? 'border-black bg-neutral-100 shadow-[4px_4px_0px_0px_#e11d48] scale-105'
                  : slot.isOccupied
                  ? 'border-black bg-white shadow-[2px_2px_0px_0px_#000000] hover:bg-neutral-50'
                  : 'border-dashed border-neutral-300 bg-neutral-50 text-neutral-400'
              }`}
            >
              {/* Top Row: Slot Number */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black">
                  [{slot.index.toString().padStart(2, '0')}]
                </span>
                <span className={`text-xs font-bold ${
                  slot.isOccupied ? 'text-red-600' : 'text-neutral-400'
                }`}>
                  {slot.isOccupied ? '4KB' : 'EMPTY'}
                </span>
              </div>

              {/* Middle Row: Content Payload snippet */}
              <div className="my-1 text-xs leading-tight">
                <span className="text-[10px] text-neutral-500 block truncate">
                  {slot.pageData ? slot.pageData.hex : `0x${(0x7fff1000 + slot.index * 0x1000).toString(16)}`}
                </span>
                <span className={`mt-0.5 line-clamp-2 break-all text-xs font-bold ${
                  slot.isOccupied ? 'text-black' : 'text-neutral-400 italic'
                }`}>
                  {slot.pageData ? slot.pageData.payload : '<EMPTY>'}
                </span>
              </div>

              {/* Bottom Row: Head / Tail Indicator */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-xs font-bold">
                {slot.isHead && (
                  <span className="bg-emerald-600 text-white px-1 text-[10px] uppercase flex items-center gap-0.5">
                    <ArrowDown className="w-2.5 h-2.5" />
                    <span>HEAD</span>
                  </span>
                )}
                {slot.isTail && (
                  <span className="bg-black text-white px-1 text-[10px] uppercase flex items-center gap-0.5 ml-auto">
                    <ArrowUp className="w-2.5 h-2.5" />
                    <span>TAIL</span>
                  </span>
                )}
                {!slot.isHead && !slot.isTail && (
                  <span className="text-neutral-400 text-[10px] uppercase">IDLE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Detailed View */}
      {selectedSlot !== null && (
        <div className="mt-4 p-5 bg-neutral-50 border-2 border-black font-mono text-xs shadow-[4px_4px_0px_0px_#000] animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-3">
            <span className="font-bold text-black text-sm flex items-center gap-2 uppercase">
              <Info className="w-4 h-4 text-red-600" />
              Memory Slot Inspection: ring[{selectedSlot}]
            </span>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-black bg-white hover:bg-neutral-100 px-3 py-1 border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
            >
              <span>CLOSE</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block">Virtual Address</span>
              <code className="text-red-600 font-bold text-sm">
                {slotArray[selectedSlot]?.pageData?.hex || `0x${(0x7fff1000 + selectedSlot * 0x1000).toString(16)}`}
              </code>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block">Allocation Status</span>
              <span className="font-bold text-black">
                {slotArray[selectedSlot]?.isOccupied ? `Allocated 4096 Bytes (#${slotArray[selectedSlot]?.pageData?.pageId})` : 'Unallocated (Free Slot)'}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-neutral-500 block">Kernel Wait Queue Status</span>
              <span className="font-bold text-emerald-700">
                {slotArray[selectedSlot]?.isOccupied ? 'Ready for sys_read()' : 'Available for sys_write()'}
              </span>
            </div>
          </div>

          {slotArray[selectedSlot]?.pageData && (
            <div className="mt-3 pt-3 border-t-2 border-black">
              <span className="text-xs uppercase font-bold text-neutral-500 block mb-1">Payload Content</span>
              <div className="bg-white p-3 border-2 border-black text-black font-bold break-all text-xs">
                {slotArray[selectedSlot]?.pageData?.payload}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
