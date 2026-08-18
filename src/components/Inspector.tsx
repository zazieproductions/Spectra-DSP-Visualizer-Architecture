import React from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Settings } from 'lucide-react';

export function Inspector() {
  const { visualizerMode, setVisualizerMode } = useStore();
  const modes = ['CUBE', 'HELIX', 'TERRAIN', 'RINGS'] as const;

  return (
    <div className="w-64 h-full bg-spectra-panel border-l border-spectra-border p-4 flex flex-col gap-6">
      
      <div className="flex items-center gap-2 text-spectra-text border-b border-spectra-border pb-2">
        <Settings className="w-4 h-4" />
        <span className="text-xs font-bold tracking-widest">INSPECTOR</span>
      </div>

      {/* Visualizer Mode Select */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-spectra-cyan font-bold tracking-widest">RENDER ENGINE</span>
        <div className="grid grid-cols-2 gap-2">
          {modes.map(mode => (
            <button
              key={mode}
              onClick={() => setVisualizerMode(mode)}
              className={cn(
                "text-[10px] py-2 rounded-sm border transition-all",
                visualizerMode === mode 
                  ? "bg-spectra-cyan/20 text-spectra-cyan border-spectra-cyan glow-cyan" 
                  : "bg-spectra-bg text-spectra-text border-spectra-border hover:border-spectra-text"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Modulation Matrix (Visual fake for now) */}
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-[10px] text-spectra-magenta font-bold tracking-widest">MOD MATRIX</span>
        <div className="flex-1 bg-spectra-bg border border-spectra-border rounded-sm p-2 grid grid-cols-5 grid-rows-5 gap-1">
          {/* Header row */}
          <div className="bg-transparent" />
          {['LFO1', 'LFO2', 'ENV', 'RND'].map(l => (
            <div key={l} className="text-[8px] text-spectra-text flex items-center justify-center -rotate-45">{l}</div>
          ))}
          
          {/* Matrix rows */}
          {['CUTOFF', 'RES', 'PITCH', 'DELAY'].map((dest, i) => (
            <React.Fragment key={dest}>
              <div className="text-[8px] text-spectra-text flex items-center justify-end pr-1">{dest}</div>
              {[0, 1, 2, 3].map(j => {
                const isActive = (i === 0 && j === 0) || (i === 2 && j === 1);
                return (
                  <div 
                    key={`${i}-${j}`} 
                    className={cn(
                      "w-full h-full rounded-sm border cursor-pointer transition-all",
                      isActive 
                        ? "bg-spectra-green border-spectra-green box-glow-green" 
                        : "bg-black border-[#333] hover:border-spectra-text"
                    )}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] text-white font-bold tracking-widest">MACRO CONTROLS</span>
        {[
          { label: 'DRIVE', color: 'bg-spectra-magenta' },
          { label: 'SPACE', color: 'bg-spectra-cyan' },
          { label: 'CHAOS', color: 'bg-spectra-green' },
        ].map(param => (
          <div key={param.label} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-spectra-text">
              <span>{param.label}</span>
              <span>{(Math.random() * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-spectra-bg rounded-full overflow-hidden border border-spectra-border">
              <div className={cn("h-full", param.color)} style={{ width: `${Math.random() * 60 + 20}%` }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
