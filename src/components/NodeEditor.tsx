import React, { useState, useRef, useEffect } from 'react';
import { useStore, NodeData } from '../store/useStore';
import { cn } from '../lib/utils';
import { Settings2, Zap, Waves, Volume2, Clock } from 'lucide-react';

const icons = {
  SYNTH: Waves,
  LFO: Zap,
  FILTER: Settings2,
  DELAY: Clock,
  OUT: Volume2,
};

const colors = {
  SYNTH: 'text-spectra-cyan border-spectra-cyan',
  LFO: 'text-spectra-magenta border-spectra-magenta',
  FILTER: 'text-spectra-green border-spectra-green',
  DELAY: 'text-yellow-400 border-yellow-400',
  OUT: 'text-white border-white',
};

export function NodeEditor() {
  const { nodes, connections, updateNodePos, removeConnection } = useStore();
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    setDraggingNode(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNode || !editorRef.current) return;
    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 60; // offset for center
    const y = e.clientY - rect.top - 30;
    updateNodePos(draggingNode, Math.max(0, x), Math.max(0, y));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingNode(null);
    }
  };

  // Helper to get port coordinates
  const getPortPos = (nodeId: string, isInput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x + (isInput ? 0 : 120),
      y: node.y + 30
    };
  };

  return (
    <div 
      ref={editorRef}
      className="w-full h-full bg-spectra-bg relative overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="absolute top-2 left-2 text-[10px] text-spectra-text tracking-widest font-bold z-10">
        PATCHBAY // ROUTING
      </div>

      {/* Connections (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {connections.map(conn => {
          const from = getPortPos(conn.from, false);
          const to = getPortPos(conn.to, true);
          
          // Bezier curve magic
          const dx = Math.abs(to.x - from.x) * 0.5;
          const path = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
          
          return (
            <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={() => removeConnection(conn.id)}>
              {/* Invisible wider path for easier clicking */}
              <path d={path} stroke="transparent" strokeWidth="15" fill="none" />
              <path 
                d={path} 
                stroke={conn.type === 'AUDIO' ? '#ff00ff' : '#39ff14'} 
                strokeWidth="3" 
                fill="none" 
                className={conn.type === 'AUDIO' ? 'drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]' : 'drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]'}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const Icon = icons[node.type];
        const colorClass = colors[node.type];
        
        return (
          <div
            key={node.id}
            className={cn(
              "absolute w-[120px] h-[60px] bg-spectra-panel border rounded-md flex flex-col shadow-lg z-10 cursor-grab active:cursor-grabbing",
              colorClass,
              draggingNode === node.id ? "opacity-90 scale-105" : ""
            )}
            style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
            onPointerDown={(e) => handlePointerDown(e, node.id)}
          >
            <div className="h-6 border-b border-inherit bg-black/50 flex items-center px-2 gap-2 text-[10px] font-bold rounded-t-md">
              <Icon className="w-3 h-3" />
              {node.type}
            </div>
            <div className="flex-1 relative">
              {/* Input Port */}
              {node.type !== 'SYNTH' && node.type !== 'LFO' && (
                <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border-2 border-inherit pointer-events-auto" />
              )}
              {/* Output Port */}
              {node.type !== 'OUT' && (
                <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border-2 border-inherit pointer-events-auto" />
              )}
              
              <div className="w-full h-full flex items-center justify-center text-[9px] text-spectra-text opacity-50">
                {node.id}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
