import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserSpaceProcesses from './components/UserSpaceProcesses';
import KernelPipeConduit from './components/KernelPipeConduit';
import RingBufferRack from './components/RingBufferRack';
import WaitQueueInspector from './components/WaitQueueInspector';
import LinuxControlConsole from './components/LinuxControlConsole';
import KernelDmesgLog from './components/KernelDmesgLog';
import { useKernelTelemetry } from './hooks/useKernelTelemetry';
import { Cpu, Shield } from 'lucide-react';

export default function App() {
  const { telemetry, isConnected, isMockMode, sendCommand } = useKernelTelemetry();
  const [showLogs, setShowLogs] = useState(true);

  // Default to lightmode as requested, persist in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kpipe-theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('kpipe-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`${theme} min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 bg-light-grid dark:bg-dark-grid dark:scanlines flex flex-col justify-between transition-colors duration-200`}>
      {/* Top Banner / HUD Header */}
      <div className="max-w-[1600px] w-full mx-auto p-3 sm:p-5 flex-1">
        <Header
          telemetry={telemetry}
          isConnected={isConnected}
          isMockMode={isMockMode}
          showLogs={showLogs}
          onToggleLogs={() => setShowLogs(prev => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Master Observability Stack */}
        <main className="space-y-4">
          {/* Layer 1: Linux User Space Processes (Process A Producer & Process B Consumer) */}
          <section aria-label="User Space Processes">
            <UserSpaceProcesses
              producer={telemetry.producer}
              consumer={telemetry.consumer}
              fillPercentage={telemetry.fillPercentage}
              pageCount={telemetry.pageCount}
              capacity={telemetry.capacity}
            />
          </section>

          {/* Layer 2: Kernel Syscall Data Conduits (Crossing User/Kernel Space Boundary) */}
          <section aria-label="Kernel Syscall Gateway Conduits">
            <KernelPipeConduit
              producer={telemetry.producer}
              consumer={telemetry.consumer}
              headPointer={telemetry.headPointer}
              tailPointer={telemetry.tailPointer}
              pageCount={telemetry.pageCount}
              capacity={telemetry.capacity}
            />
          </section>

          {/* Layer 3: Kernel Space struct pipe_inode_info Ring Buffer */}
          <section aria-label="Kernel Ring Buffer Memory Rack">
            <RingBufferRack
              capacity={telemetry.capacity}
              pageCount={telemetry.pageCount}
              fillPercentage={telemetry.fillPercentage}
              headPointer={telemetry.headPointer}
              tailPointer={telemetry.tailPointer}
              pages={telemetry.pages}
            />
          </section>

          {/* Layer 4: Kernel Wait Queues & Mutex State Inspector */}
          <section aria-label="Kernel Wait Queue Inspector">
            <WaitQueueInspector
              waitQueues={telemetry.waitQueues}
              producer={telemetry.producer}
              consumer={telemetry.consumer}
              mutexLocked={telemetry.mutexLocked}
              pageCount={telemetry.pageCount}
              capacity={telemetry.capacity}
            />
          </section>

          {/* Layer 5: Linux Syscall Control Console */}
          <section aria-label="Syscall Controls and Scenario Presets">
            <LinuxControlConsole
              telemetry={telemetry}
              sendCommand={sendCommand}
            />
          </section>

          {/* Layer 6: Kernel Dmesg Ring Log Terminal */}
          {showLogs && (
            <section aria-label="Kernel dmesg Ring Logs">
              <KernelDmesgLog
                logs={telemetry.dmesgLogs}
                onClose={() => setShowLogs(false)}
              />
            </section>
          )}
        </main>
      </div>

      {/* Linux Kernel Footer Notes */}
      <footer className="mt-8 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-[#06080d] py-4 px-4 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sky-600 dark:text-cyan-400 font-bold">K-PIPE</span>
            <span>•</span>
            <span>Linux Kernel IPC &amp; Producer-Consumer Concurrency Visualizer</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" /> PAGE_SIZE: 4096 B
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> PIPE_DEF_BUFFERS: 16
            </span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-300">
              Source: <code className="text-sky-600 dark:text-cyan-300">linux/fs/pipe.c</code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
