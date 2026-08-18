import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function CodeConsole() {
  const { consoleActive, setConsoleActive } = useStore();
  const [text, setText] = useState('');
  const [glitching, setGlitching] = useState(false);
  
  const codeSnippet = `
// SPECTRA GLSL KERNEL COMPILER
uniform float time;
uniform vec2 resolution;
uniform sampler2D audioData;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Fetch DSP buffer
    float fft = texture(audioData, vec2(uv.x, 0.0)).r;
    float wave = texture(audioData, vec2(uv.x, 0.5)).r;
    
    // Non-linear space folding
    uv.y += sin(uv.x * 10.0 + time) * 0.1 * fft;
    uv.x += cos(uv.y * 8.0 - time * 0.5) * wave;
    
    // Chromatic aberration
    float r = texture(audioData, uv + vec2(0.01 * fft, 0.0)).r;
    float g = texture(audioData, uv).g;
    float b = texture(audioData, uv - vec2(0.01 * wave, 0.0)).b;
    
    vec3 color = vec3(r, g, b) * vec3(1.0, 0.2, 1.0); // Magenta shift
    
    // Scanline & Vignette
    color *= sin(gl_FragCoord.y * 2.0) * 0.1 + 0.9;
    color *= 1.0 - distance(uv, vec2(0.5));
    
    fragColor = vec4(color, 1.0);
}
`.trim();

  useEffect(() => {
    if (!consoleActive) return;
    
    let index = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore meta keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') {
        setConsoleActive(false);
        return;
      }
      
      if (e.key === 'Enter') {
        // Trigger compile glitch
        setGlitching(true);
        setTimeout(() => {
          setGlitching(false);
          setConsoleActive(false);
          setText('');
        }, 500);
        return;
      }

      // Add characters from snippet
      const charsToAdd = Math.floor(Math.random() * 3) + 2;
      const nextStr = codeSnippet.substring(0, index + charsToAdd);
      setText(nextStr);
      index += charsToAdd;
      
      if (index >= codeSnippet.length) {
        index = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [consoleActive, setConsoleActive]);

  if (!consoleActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
      {glitching && (
        <div className="absolute inset-0 bg-white mix-blend-difference opacity-50 animate-pulse pointer-events-none z-50" />
      )}
      
      <div className="w-full max-w-4xl h-full max-h-[80vh] bg-[#0a0a0a] border border-spectra-cyan rounded-md shadow-[0_0_30px_rgba(0,255,255,0.2)] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="h-8 bg-spectra-cyan/20 border-b border-spectra-cyan flex items-center px-4 justify-between">
          <span className="text-spectra-cyan text-xs font-bold tracking-widest glow-cyan">SYS.COMPILER_TERMINAL</span>
          <span className="text-spectra-text text-xs">PRESS [ENTER] TO COMPILE // [ESC] TO ABORT</span>
        </div>
        
        {/* Body */}
        <div className="flex-1 p-6 overflow-auto font-mono text-sm text-spectra-green whitespace-pre-wrap scanline relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
          {text}
          <span className="inline-block w-2 h-4 bg-spectra-green ml-1 animate-pulse" />
        </div>
        
        {/* Overlay text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 pointer-events-none select-none">
          GLSL
        </div>
      </div>
    </div>
  );
}
