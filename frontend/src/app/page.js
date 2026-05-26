'use client';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Terminal, Database, Code, Network, FileCode2, List, Download } from 'lucide-react';

export default function CompilerDashboard() {
  const [code, setCode] = useState('int a = 5;\nfloat b = 3.14;\n\nif(a < 10) {\n    b = b + a;\n}\n');
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('AST'); // AST, SYMBOL, TAC, ASSEMBLY

  const [visibleNodes, setVisibleNodes] = useState([]);
  const [visibleEdges, setVisibleEdges] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    if (output && output.ast && activeTab === 'AST') {
      const allNodes = output.ast.nodes;
      const allEdges = output.ast.edges;
      
      setVisibleNodes([]);
      setVisibleEdges([]);

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < allNodes.length) {
          setVisibleNodes(prev => [...prev, allNodes[currentIndex]]);
          
          // Add any edges that connect to this new node
          const newEdges = allEdges.filter(e => e.target === allNodes[currentIndex].id || e.source === allNodes[currentIndex].id);
          setVisibleEdges(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const uniqueNewEdges = newEdges.filter(e => !existingIds.has(e.id));
            return [...prev, ...uniqueNewEdges];
          });
          
          currentIndex++;
          
          if (rfInstance) {
            window.requestAnimationFrame(() => {
                rfInstance.fitView({ duration: 300, padding: 0.2 });
            });
          }
        } else {
          clearInterval(interval);
        }
      }, 300); // 300ms delay between each node appearing

      return () => clearInterval(interval);
    }
  }, [output, activeTab, rfInstance]);

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setOutput(data.parsed);
      } else {
        alert('Compilation failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error during compilation.');
    }
    setIsCompiling(false);
  };

  const handleDownload = () => {
    if (!output || !output.assembly) return;
    const asmCode = output.assembly.join('\n');
    const blob = new Blob([asmCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'target_code.asm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#161b22]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <FileCode2 size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Mini-Compiler<span className="text-violet-500">.js</span></h1>
        </div>
        
        <div className="flex space-x-4">
            <button 
                onClick={handleDownload}
                disabled={!output}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
                <Download size={18} />
                <span>Download .asm</span>
            </button>
            <button 
                onClick={handleCompile}
                disabled={isCompiling}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
                <Play size={18} fill="currentColor" />
                <span>{isCompiling ? 'Compiling...' : 'Compile Code'}</span>
            </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Editor */}
        <section className="w-1/3 border-r border-gray-800 flex flex-col bg-[#0d1117]">
          <div className="h-12 border-b border-gray-800 flex items-center px-4 bg-[#161b22]">
            <Code size={16} className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">source.mc</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="c"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                padding: { top: 16 }
              }}
            />
          </div>
        </section>

        {/* Right Panel: Visualizer */}
        <section className="w-2/3 flex flex-col">
          {/* Tabs */}
          <div className="h-12 border-b border-gray-800 flex bg-[#161b22]">
            {[
              { id: 'AST', icon: Network, label: 'AST Graph' },
              { id: 'TOKENS', icon: List, label: 'Token Stream' },
              { id: 'SYMBOL', icon: Database, label: 'Symbol Table' },
              { id: 'TAC', icon: Code, label: 'Three-Address Code' },
              { id: 'ASSEMBLY', icon: Terminal, label: 'Target Code' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 border-r border-gray-800 transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[#0d1117] text-violet-400 border-b-2 border-b-violet-500' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 relative bg-[#0a0c10] overflow-hidden">
            {!output ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col space-y-4">
                <Network size={48} className="opacity-20" />
                <p>Click Compile to visualize the compilation process</p>
              </div>
            ) : (
              <>
                <style dangerouslySetInnerHTML={{__html: `
                  .react-flow__controls-button {
                      background-color: #161b22 !important;
                      fill: white !important;
                      border-bottom: 1px solid #374151 !important;
                  }
                  .react-flow__controls-button:hover {
                      background-color: #2d3748 !important;
                  }
                `}} />
                {activeTab === 'AST' && (
                  <ReactFlow 
                    nodes={visibleNodes} 
                    edges={visibleEdges}
                    onInit={setRfInstance}
                    fitView
                    className="bg-[#0a0c10]"
                  >
                    <Background color="#2d3748" gap={16} size={1} />
                    <Controls />
                    <MiniMap 
                        nodeColor="#8b5cf6" 
                        style={{ backgroundColor: '#161b22', border: '1px solid #374151' }}
                        maskColor="rgba(10, 12, 16, 0.7)"
                    />
                  </ReactFlow>
                )}

                {activeTab === 'TOKENS' && (
                  <div className="p-8 h-full overflow-y-auto">
                    <div className="border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-[#161b22] text-xs uppercase text-gray-400">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Token ID</th>
                            <th className="px-6 py-4 font-semibold">Lexeme</th>
                            <th className="px-6 py-4 font-semibold">Token Type</th>
                            <th className="px-6 py-4 font-semibold">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {output.tokens && output.tokens.map((tok, i) => (
                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 text-gray-500 font-mono">#{tok.id}</td>
                              <td className="px-6 py-4 font-mono text-blue-400">"{tok.lexeme}"</td>
                              <td className="px-6 py-4 font-mono text-emerald-400">&lt;{tok.type}&gt;</td>
                              <td className="px-6 py-4 text-gray-400 text-xs">Ln {tok.line}, Col {tok.col}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'SYMBOL' && (
                  <div className="p-8 h-full overflow-y-auto">
                    <div className="border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-[#161b22] text-xs uppercase text-gray-400">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Variable</th>
                            <th className="px-6 py-4 font-semibold">Data Type</th>
                            <th className="px-6 py-4 font-semibold">Scope Lvl</th>
                            <th className="px-6 py-4 font-semibold">Memory Addr</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {output.symbolTable.map((sym, i) => (
                            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-mono text-emerald-400">{sym.name}</td>
                              <td className="px-6 py-4 font-mono text-violet-400">{sym.type}</td>
                              <td className="px-6 py-4">{sym.scope}</td>
                              <td className="px-6 py-4 font-mono">0x00{sym.mem}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'TAC' && (
                  <div className="p-8 h-full overflow-y-auto font-mono text-sm">
                    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-2xl">
                      {output.tac.map((line, i) => (
                        <div key={i} className="py-1 flex items-center">
                          <span className="text-gray-500 w-8 select-none">{i+1}</span>
                          <span className={`${line.includes('goto') || line.includes(':') ? 'text-amber-400' : 'text-gray-300'}`}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ASSEMBLY' && (
                  <div className="p-8 h-full overflow-y-auto font-mono text-sm">
                    <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-6 shadow-2xl ring-1 ring-inset ring-white/10">
                      {output.assembly.map((line, i) => {
                        let color = 'text-gray-300';
                        if (line.includes('LOAD') || line.includes('STORE')) color = 'text-blue-400';
                        if (line.includes('ADD') || line.includes('CMP')) color = 'text-emerald-400';
                        if (line.includes('JMP') || line.includes('JEQ')) color = 'text-pink-400';
                        if (line.includes(':')) color = 'text-amber-400';
                        
                        return (
                          <div key={i} className={`py-1 flex items-center ${color}`}>
                            {line}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
