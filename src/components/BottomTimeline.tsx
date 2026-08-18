import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { engine } from '../lib/audioEngine';

export function BottomTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const specCanvas = specRef.current;
    if (!canvas || !specCanvas) return;

    const ctx = canvas.getContext('2d');
    const specCtx = specCanvas.getContext('2d');
    if (!ctx || !specCtx) return;

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      if (!engine.analyzer || !isPlaying) {
        // Draw idle state
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/2);
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
        return;
      }

      engine.updateData();
      const timeData = engine.getTimeData();
      const freqData = engine.getFreqData();

      // --- Oscilloscope ---
      ctx.fillStyle = 'rgba(5, 5, 5, 0.3)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#39ff14'; // Toxic green
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / timeData.length;
      let x = 0;

      for (let i = 0; i < timeData.length; i++) {
        const v = timeData[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // --- Spectrum Analyzer (Bars) ---
      specCtx.fillStyle = '#050505';
      specCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);
      
      const barWidth = (specCanvas.width / freqData.length) * 2.5;
      let barHeight;
      let specX = 0;

      for(let i = 0; i < freqData.length; i++) {
        barHeight = freqData[i] / 255 * specCanvas.height;
        
        // Gradient color from magenta to cyan based on frequency
        const r = 255 - (i * 2);
        const g = 0;
        const b = 255;

        specCtx.fillStyle = `rgb(${r},${g},${b})`;
        specCtx.fillRect(specX, specCanvas.height - barHeight, barWidth, barHeight);

        specX += barWidth + 1;
      }
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div className="h-48 w-full bg-spectra-panel border-t border-spectra-border flex p-4 gap-4">
      {/* Oscilloscope */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="text-[10px] text-spectra-green tracking-widest font-bold">TIME DOMAIN // OSCILLOSCOPE</div>
        <div className="flex-1 bg-spectra-bg rounded border border-spectra-border relative overflow-hidden">
          <div className="absolute inset-0 scanline pointer-events-none z-10 opacity-50" />
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
            width={800} 
            height={200}
          />
        </div>
      </div>

      {/* Spectrum */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="text-[10px] text-spectra-magenta tracking-widest font-bold">FREQUENCY // SPECTRUM</div>
        <div className="flex-1 bg-spectra-bg rounded border border-spectra-border relative overflow-hidden">
          <canvas 
            ref={specRef} 
            className="w-full h-full"
            width={800} 
            height={200}
          />
        </div>
      </div>

      {/* VU Meters */}
      <div className="w-32 flex flex-col gap-2">
         <div className="text-[10px] text-spectra-text tracking-widest font-bold text-center">MASTER OUT</div>
         <div className="flex-1 flex justify-center gap-2 bg-spectra-bg rounded border border-spectra-border p-2">
            {[1, 2].map((channel) => (
              <div key={channel} className="w-4 h-full bg-black rounded-sm relative overflow-hidden flex flex-col justify-end">
                {/* Simulated VU Meter */}
                <div 
                  className="w-full bg-gradient-to-t from-spectra-green via-yellow-400 to-red-500 transition-all duration-75"
                  style={{ 
                    height: isPlaying ? `${Math.random() * 40 + 40}%` : '5%',
                    opacity: isPlaying ? 1 : 0.3
                  }}
                />
                <div className="absolute top-0 w-full h-full flex flex-col justify-between py-1 pointer-events-none">
                  {[...Array(10)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black/50" />)}
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
