import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Activity, Power, Settings2, Terminal, Cpu } from 'lucide-react';
import { engine } from '../lib/audioEngine';

export function Sidebar() {
  const { isPlaying, togglePlay, setConsoleActive, consoleActive, cpuLoad } = useStore();
  const [logs, setLogs] = useState<string[]>(['SYSTEM INITIALIZED', 'AWAITING DSP...']);

  useEffect(() => {
    const interval = setInterval(() => {
      useStore.getState().setCpuLoad(10 + Math.random() * 15 + (isPlaying ? 20 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (!engine.initialized) {
      engine.init();
      setLogs(l => [...l, 'AUDIO CONTEXT CREATED', 'SAMPLE RATE: 44100Hz']);
    }
    
    if (isPlaying) {
      engine.stopSynth();
      setLogs(l => [...l, 'DSP ENGINE STOPPED']);
    } else {
      engine.startSynth();
      setLogs(l => [...l, 'DSP ENGINE STARTED', 'ROUTING: OSC -> VCF -> MASTER']);
    }
    togglePlay();
  };

  return (
    <div className="w-64 h-full bg-spectra-panel border-r border-spectra-border flex flex-col p-4 gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-spectra-border pb-4">
        <div className="w-8 h-8 rounded-full border-2 border-spectra-magenta flex items-center justify-center box-glow-magenta">
          <Activity className="w-4 h-4 text-spectra-magenta" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white glow-magenta">SPECTRA</h1>
          <p className="text-[10px] text-spectra-text">v2.0.4 // EXPERIMENTAL</p>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleTogglePlay}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-md font-bold tracking-wider transition-all duration-300",
            isPlaying 
              ? "bg-spectra-green/20 text-spectra-green border border-spectra-green box-glow-green" 
              : "bg-spectra-border text-spectra-text border border-transparent hover:border-spectra-text"
          )}
        >
          <Power className="w-5 h-5" />
          {isPlaying ? 'DSP ACTIVE' : 'INIT DSP'}
        </button>

        <button 
          onClick={() => setConsoleActive(!consoleActive)}
          className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-md font-bold text-sm transition-all duration-300",
            consoleActive
              ? "bg-spectra-cyan/20 text-spectra-cyan border border-spectra-cyan glow-cyan"
              : "bg-spectra-bg border border-spectra-border text-spectra-text hover:text-white"
          )}
        >
          <Terminal className="w-4 h-4" />
          {consoleActive ? 'CLOSE TERMINAL' : 'OPEN TERMINAL'}
        </button>
      </div>

      {/* Diagnostics */}
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-spectra-text"><Cpu className="w-3 h-3"/> CPU LOAD</span>
          <span className={cn("font-bold", cpuLoad > 40 ? "text-red-500" : "text-spectra-green glow-green")}>
            {cpuLoad.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-1 bg-spectra-bg rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", cpuLoad > 40 ? "bg-red-500" : "bg-spectra-green")}
            style={{ width: `${Math.min(100, cpuLoad)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-spectra-text">DSP JITTER</span>
          <span className="text-spectra-magenta font-mono">{(Math.random() * 2).toFixed(2)}ms</span>
        </div>
      </div>

      {/* System Log */}
      <div className="h-32 bg-spectra-bg border border-spectra-border rounded-md p-2 overflow-y-auto font-mono text-[10px] text-spectra-text flex flex-col gap-1 scanline">
        {logs.map((log, i) => (
          <div key={i} className="opacity-80 hover:opacity-100">{`> ${log}`}</div>
        ))}
      </div>

    </div>
  );
}
