import React, { useState } from 'react';
import { Volume2, VolumeX, GitBranch } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

export default function Header({
  telemetry,
  isConnected,
  isMockMode,
  activeChapter,
  onSelectChapter
}) {
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
  };

  const isFullSim = activeChapter === 4;

  return (
    <header className="bg-white border-2 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Bold Monogram Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_#e11d48] shrink-0">
            K
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight text-black leading-none">
              K-PIPE
            </h1>
            <p className="font-mono text-xs text-neutral-500 font-bold mt-1 tracking-wider uppercase">
              Linux Concurrency Engine
            </p>
          </div>
        </div>

        {/* Center: Tactile Mode Switcher */}
        <div className="flex items-center border-2 border-black p-1 bg-neutral-100 shadow-[2px_2px_0px_0px_#000000] self-start sm:self-center">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectChapter(1);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              !isFullSim
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Story Walkthrough
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectChapter(4);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
              isFullSim
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Interactive Lab
          </button>
        </div>

        {/* Right: Audio & Source Controls */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-bold uppercase transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 ${
              isMuted
                ? 'bg-neutral-100 text-neutral-500 hover:text-black'
                : 'bg-black text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-400" />}
            <span>{isMuted ? 'MUTE' : 'AUDIO'}</span>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/Danny-Wits/k-pipe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-black font-bold uppercase shadow-[2px_2px_0px_0px_#000000] transition-all"
            title="GitHub Repository"
          >
            <GitBranch className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">REPO</span>
          </a>
        </div>
      </div>
    </header>
  );
}
