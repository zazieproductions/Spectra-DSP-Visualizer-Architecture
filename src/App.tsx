import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Visualizer } from './components/Visualizer';
import { NodeEditor } from './components/NodeEditor';
import { Inspector } from './components/Inspector';
import { BottomTimeline } from './components/BottomTimeline';
import { CodeConsole } from './components/CodeConsole';
import { useStore } from './store/useStore';

export default function App() {
  // Prevent default context menu for full app feel
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-spectra-bg">
      <CodeConsole />
      
      {/* Top Section */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Top Half: 3D Visualizer */}
          <div className="h-1/2 w-full">
            <Visualizer />
          </div>
          
          {/* Bottom Half: Node Editor */}
          <div className="h-1/2 w-full border border-spectra-border rounded-md overflow-hidden relative box-glow-green">
             <NodeEditor />
          </div>
        </div>

        <Inspector />
      </div>

      {/* Bottom Section */}
      <BottomTimeline />
    </div>
  );
}
