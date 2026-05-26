'use client';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Terminal, Database, Code, Network, FileCode2, List, Download, Sun, Moon } from 'lucide-react';

export default function CompilerDashboard() {
  const [code, setCode] = useState('int a = 5;\nfloat b = 3.14;\n\nif(a < 10) {\n    b = b + a;\n}\n');
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('AST'); // AST, SYMBOL, TAC, ASSEMBLY
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    <div className={`h-screen w-screen flex flex-col font-mono selection:bg-[#facc15] selection:text-black overflow-hidden p-6 gap-6 transition-all duration-300 ${
      isDarkMode ? 'bg-[#0f0f12] text-white' : 'bg-[#f3f0e8] text-black'
    }`}>
      {/* Revamped Header: Cockpit Control Panel */}
      <header className={`flex-none border-4 border-black p-4 flex items-center justify-between transition-all duration-300 shadow-[6px_6px_0px_#000000] ${
        isDarkMode 
          ? 'bg-[#1e1e24] text-white' 
          : 'bg-[#ffffff] text-black'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 border-3 border-black bg-[#facc15] flex items-center justify-center shadow-[2px_2px_0px_#000000] translate-x-[-2px] translate-y-[-2px]">
            <FileCode2 size={22} className="text-black stroke-[3]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">
              MINI-COMPILER<span className={`${isDarkMode ? 'text-white' : 'text-black'} ml-1`}>.JS</span>
            </h1>
            <span className={`text-[10px] font-bold mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ACADEMIC PIPELINE PLATFORM</span>
          </div>
        </div>

        {/* Compiler Status / Engine Indicators */}
        <div className="hidden lg:flex items-center space-x-3 text-[10px] font-black uppercase">
          <div className="bg-[#00f0ff] text-black border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] tracking-wider translate-x-[-1px] translate-y-[-1px]">
            LANG: C-SUBSET
          </div>
          <div className="bg-[#ff79c6] text-black border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] tracking-wider translate-x-[-1px] translate-y-[-1px]">
            PARSER: BISON LALR(1)
          </div>
          <div className="bg-[#ffb86c] text-black border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000] tracking-wider translate-x-[-1px] translate-y-[-1px]">
            LEXER: FLEX 2.6
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center justify-center p-2 border-3 border-black font-bold uppercase transition-all duration-300 shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
                  isDarkMode 
                    ? 'bg-[#a78bfa] text-black hover:bg-[#b59eff]' 
                    : 'bg-[#ffffff] text-black hover:bg-[#faf9f6]'
                }`}
                title="Toggle Theme"
            >
                {isDarkMode ? <Sun size={16} className="stroke-[3]" /> : <Moon size={16} className="stroke-[3]" />}
            </button>
            <button 
                onClick={handleDownload}
                disabled={!output}
                className="flex items-center space-x-2 bg-[#ff79c6] hover:bg-[#ff92df] text-black border-3 border-black px-4 py-2 font-bold text-xs uppercase shadow-[3px_3px_0px_#000000] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:translate-none disabled:shadow-[3px_3px_0px_#000000]"
            >
                <Download size={14} className="stroke-[3]" />
                <span>Download .asm</span>
            </button>
            <button 
                onClick={handleCompile}
                disabled={isCompiling}
                className="flex items-center space-x-2 bg-[#50fa7b] hover:bg-[#6eff8c] text-black border-3 border-black px-4 py-2 font-bold text-xs uppercase shadow-[3px_3px_0px_#000000] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:translate-none disabled:shadow-[3px_3px_0px_#000000]"
            >
                <Play size={14} fill="currentColor" className="stroke-[3]" />
                <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
            </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden gap-6">
        
        {/* Left Panel: Editor */}
        <section className={`w-1/3 border-4 border-black flex flex-col shadow-[6px_6px_0px_#000000] overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#ffffff]'
        }`}>
          <div className={`h-12 border-b-4 border-black flex items-center px-4 justify-between flex-none transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#1e1e24] text-white' 
              : 'bg-[#faf9f6] text-black'
          }`}>
            <div className="flex items-center">
              <Code size={16} className={`mr-2 stroke-[3] ${isDarkMode ? 'text-white' : 'text-black'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">source.mc</span>
            </div>
            <div className="flex space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-black"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-black"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black"></span>
            </div>
          </div>
          <div className={`flex-1 relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#f5f3ee]'}`}>
            <Editor
              height="100%"
              defaultLanguage="c"
              theme={isDarkMode ? 'brutalistDarkTheme' : 'brutalistLightTheme'}
              value={code}
              onChange={(val) => setCode(val)}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('brutalistLightTheme', {
                  base: 'vs',
                  inherit: true,
                  rules: [
                    { token: 'keyword', foreground: 'be185d', fontStyle: 'bold' },
                    { token: 'identifier', foreground: '0f172a' },
                    { token: 'number', foreground: '15803d' },
                    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                    { token: 'string', foreground: '1d4ed8' },
                  ],
                  colors: {
                    'editor.background': '#f5f3ee',
                    'editorCursor.foreground': '#000000',
                    'editor.lineHighlightBackground': '#ebe8e1',
                    'editorLineNumber.foreground': '#9ca3af',
                    'editorLineNumber.activeForeground': '#000000',
                  }
                });
                monaco.editor.defineTheme('brutalistDarkTheme', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    { token: 'keyword', foreground: 'facc15', fontStyle: 'bold' },
                    { token: 'identifier', foreground: '00f0ff' },
                    { token: 'number', foreground: '39ff14' },
                    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                    { token: 'string', foreground: 'ff79c6' },
                  ],
                  colors: {
                    'editor.background': '#1e1e24',
                    'editorCursor.foreground': '#facc15',
                    'editor.lineHighlightBackground': '#282830',
                    'editorLineNumber.foreground': '#6272a4',
                    'editorLineNumber.activeForeground': '#facc15',
                  }
                });
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto'
                },
                automaticLayout: true
              }}
            />
          </div>
        </section>

        {/* Right Panel: Visualizer */}
        <section className={`w-2/3 border-4 border-black flex flex-col shadow-[6px_6px_0px_#000000] overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#ffffff]'
        }`}>
          {/* Tabs */}
          <div className={`border-b-4 border-black flex flex-wrap flex-none transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#1e1e24]' 
              : 'bg-[#faf9f6]'
          }`}>
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
                className={`flex items-center space-x-2 px-5 py-3 border-r-4 border-black font-bold uppercase text-[10px] tracking-wider transition-all select-none ${
                  activeTab === tab.id 
                    ? 'bg-[#facc15] text-black font-black' 
                    : isDarkMode 
                      ? 'text-[#f8f8f2] hover:bg-[#1e1e24] hover:text-[#facc15]'
                      : 'text-black hover:bg-[#f3f0e8] hover:text-black'
                }`}
              >
                <tab.icon size={13} className={activeTab === tab.id ? 'stroke-[3]' : ''} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={`flex-1 relative overflow-hidden transition-all duration-300 ${
            isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#ffffff]'
          }`}>
            {!output ? (
              <div className={`absolute inset-0 flex items-center justify-center flex-col space-y-4 font-bold uppercase text-center p-6 transition-all duration-300 ${
                isDarkMode ? 'bg-[#1e1e24] text-white' : 'bg-[#ffffff] text-black'
              }`}>
                <Network size={54} className="animate-pulse text-[#be185d] stroke-[2.5]" />
                <p className="bg-[#facc15] text-black px-6 py-3 border-3 border-black shadow-[4px_4px_0px_#000000]">
                  Click Compile to execute compilation pipeline
                </p>
              </div>
            ) : (
              <>
                <style dangerouslySetInnerHTML={{__html: `
                  .react-flow__controls {
                      border: 3px solid #000000 !important;
                      box-shadow: 4px 4px 0px #000000 !important;
                      border-radius: 0px !important;
                      overflow: hidden;
                  }
                  .react-flow__controls-button {
                      background-color: ${isDarkMode ? '#1e1e24' : '#ffffff'} !important;
                      fill: ${isDarkMode ? '#f8f8f2' : '#000000'} !important;
                      border: none !important;
                      border-bottom: 3px solid #000000 !important;
                      border-radius: 0px !important;
                  }
                  .react-flow__controls-button:last-child {
                      border-bottom: none !important;
                  }
                  .react-flow__controls-button:hover {
                      background-color: #facc15 !important;
                      fill: #000000 !important;
                  }
                  .react-flow__minimap {
                      border: 3px solid #000000 !important;
                      box-shadow: 4px 4px 0px #000000 !important;
                      border-radius: 0px !important;
                  }
                  .react-flow__minimap-mask {
                      fill: ${isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.08)'} !important;
                      stroke: #ff79c6 !important;
                      stroke-width: 3px !important;
                  }
                  /* Neo-Brutalist Scrollbars */
                  ::-webkit-scrollbar {
                      width: 14px;
                      height: 14px;
                  }
                  ::-webkit-scrollbar-track {
                      background: ${isDarkMode ? '#1e1e24' : '#f3f0e8'};
                      border-left: 3px solid #000000;
                      border-top: 3px solid #000000;
                  }
                  ::-webkit-scrollbar-thumb {
                      background: #facc15;
                      border: 3px solid #000000;
                  }
                  ::-webkit-scrollbar-thumb:hover {
                      background: #ff79c6;
                  }
                  ::-webkit-scrollbar-corner {
                      background: ${isDarkMode ? '#1e1e24' : '#f3f0e8'};
                      border-left: 3px solid #000000;
                      border-top: 3px solid #000000;
                  }
                `}} />
                {activeTab === 'AST' && (
                  <ReactFlow 
                    nodes={visibleNodes} 
                    edges={visibleEdges}
                    onInit={setRfInstance}
                    fitView
                    className={isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#ffffff]'}
                    proOptions={{ hideAttribution: true }}
                  >
                    <Background color={isDarkMode ? '#44475a' : '#cbd5e1'} gap={20} size={2} />
                    <Controls showInteractive={false} />
                    <MiniMap 
                        nodeColor="#facc15" 
                        style={{ 
                            backgroundColor: isDarkMode ? '#1e1e24' : '#ffffff', 
                            border: '3px solid #000000', 
                            borderRadius: '0px',
                            boxShadow: '3px 3px 0px #000000'
                        }}
                        maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.08)'}
                    />
                  </ReactFlow>
                )}

                {activeTab === 'TOKENS' && (
                  <div className="absolute inset-0 p-8 flex flex-col justify-start">
                    <div className={`w-full max-h-full border-4 border-black shadow-[6px_6px_0px_#000000] overflow-y-auto transition-all duration-300 ${
                      isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#f5f3ee]'
                    }`}>
                      <table className={`w-full text-left text-sm transition-colors duration-300 ${isDarkMode ? 'text-[#f8f8f2]' : 'text-black'}`}>
                        <thead className="bg-[#facc15] text-black text-xs uppercase font-black border-b-4 border-black sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 border-r-3 border-black">Token ID</th>
                            <th className="px-6 py-4 border-r-3 border-black">Lexeme</th>
                            <th className="px-6 py-4 border-r-3 border-black">Token Type</th>
                            <th className="px-6 py-4">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-3 divide-black">
                          {output.tokens && output.tokens.map((tok, i) => {
                            let lexemeColor = isDarkMode ? 'text-[#f8f8f2]' : 'text-black';
                            if (tok.type === 'KEYWORD') lexemeColor = isDarkMode ? 'text-[#facc15] font-bold' : 'text-[#be185d] font-bold';
                            else if (tok.type === 'IDENTIFIER') lexemeColor = isDarkMode ? 'text-[#00f0ff]' : 'text-[#0369a1]';
                            else if (tok.type === 'OPERATOR') lexemeColor = isDarkMode ? 'text-[#ff79c6]' : 'text-[#b45309]';
                            else if (tok.type === 'NUMBER') lexemeColor = isDarkMode ? 'text-[#39ff14]' : 'text-[#15803d]';
                            
                            return (
                              <tr key={i} className={`transition-colors duration-300 ${
                                isDarkMode 
                                  ? 'bg-[#121215] hover:bg-[#1e1e24]' 
                                  : 'bg-white hover:bg-[#fef9c3]'
                              }`}>
                                <td className={`px-6 py-4 font-bold font-mono border-r-3 border-black ${
                                  isDarkMode ? 'text-[#ff79c6]' : 'text-[#be185d]'
                                }`}>#{tok.id}</td>
                                <td className={`px-6 py-4 font-mono border-r-3 border-black ${lexemeColor}`}>"{tok.lexeme}"</td>
                                <td className={`px-6 py-4 font-bold font-mono border-r-3 border-black ${
                                  isDarkMode ? 'text-[#50fa7b]' : 'text-[#15803d]'
                                }`}>&lt;{tok.type}&gt;</td>
                                <td className={`px-6 py-4 font-mono text-xs ${isDarkMode ? 'text-[#bd93f9]' : 'text-gray-600'}`}>Ln {tok.line}, Col {tok.col}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'SYMBOL' && (
                  <div className="absolute inset-0 p-8 flex flex-col justify-start">
                    <div className={`w-full max-h-full border-4 border-black shadow-[6px_6px_0px_#000000] overflow-y-auto transition-all duration-300 ${
                      isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#f5f3ee]'
                    }`}>
                      <table className={`w-full text-left text-sm transition-colors duration-300 ${isDarkMode ? 'text-[#f8f8f2]' : 'text-black'}`}>
                        <thead className="bg-[#facc15] text-black text-xs uppercase font-black border-b-4 border-black sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 border-r-3 border-black">Variable</th>
                            <th className="px-6 py-4 border-r-3 border-black">Data Type</th>
                            <th className="px-6 py-4 border-r-3 border-black">Scope Lvl</th>
                            <th className="px-6 py-4">Memory Addr</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-3 divide-black">
                          {output.symbolTable.map((sym, i) => (
                            <tr key={i} className={`transition-colors duration-300 ${
                              isDarkMode 
                                ? 'bg-[#121215] hover:bg-[#1e1e24]' 
                                : 'bg-white hover:bg-[#fef9c3]'
                            }`}>
                              <td className={`px-6 py-4 font-mono border-r-3 border-black ${
                                isDarkMode ? 'text-[#00f0ff]' : 'text-[#0369a1]'
                              } font-bold`}>{sym.name}</td>
                              <td className={`px-6 py-4 font-mono border-r-3 border-black ${
                                isDarkMode ? 'text-[#facc15]' : 'text-[#be185d]'
                              } font-bold`}>{sym.type}</td>
                              <td className={`px-6 py-4 font-bold border-r-3 border-black ${
                                isDarkMode ? 'text-white' : 'text-black'
                              }`}>{sym.scope}</td>
                              <td className={`px-6 py-4 font-mono ${
                                isDarkMode ? 'text-[#39ff14]' : 'text-[#15803d]'
                              } font-bold`}>0x00{sym.mem}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'TAC' && (
                  <div className="absolute inset-0 p-8 font-mono text-sm flex flex-col justify-start">
                    <div className={`w-full max-h-full border-4 border-black p-6 shadow-[6px_6px_0px_#000000] overflow-y-auto transition-all duration-300 ${
                      isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#f5f3ee]'
                    }`}>
                      {output.tac.map((line, i) => (
                        <div key={i} className={`py-1 flex items-center border-b last:border-b-0 transition-colors duration-300 ${
                          isDarkMode ? 'border-[#1e1e24] text-[#f8f8f2]' : 'border-gray-300 text-black'
                        }`}>
                          <span className={`w-8 select-none font-bold ${isDarkMode ? 'text-[#6272a4]' : 'text-gray-500'}`}>{i+1}</span>
                          <span className={`${line.includes('goto') || line.includes(':') ? (isDarkMode ? 'text-[#ff79c6] font-bold' : 'text-[#be185d] font-bold') : ''}`}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ASSEMBLY' && (
                  <div className="absolute inset-0 p-8 font-mono text-sm flex flex-col justify-start">
                    <div className={`w-full max-h-full border-4 border-black p-6 shadow-[6px_6px_0px_#000000] overflow-y-auto transition-all duration-300 ${
                      isDarkMode ? 'bg-[#1e1e24]' : 'bg-[#f5f3ee]'
                    }`}>
                      {output.assembly.map((line, i) => {
                        let color = isDarkMode ? 'text-[#f8f8f2]' : 'text-black';
                        if (line.includes('LOAD') || line.includes('STORE')) color = isDarkMode ? 'text-[#00f0ff] font-bold' : 'text-[#0369a1] font-bold';
                        if (line.includes('ADD') || line.includes('CMP')) color = isDarkMode ? 'text-[#39ff14] font-bold' : 'text-[#15803d] font-bold';
                        if (line.includes('JMP') || line.includes('JEQ')) color = isDarkMode ? 'text-[#ff79c6] font-bold' : 'text-[#be185d] font-bold';
                        if (line.includes(':')) color = isDarkMode ? 'text-[#facc15] font-bold' : 'text-[#b45309] font-bold';
                        
                        return (
                          <div key={i} className={`py-1 flex items-center border-b last:border-b-0 transition-all duration-300 ${color} ${
                            isDarkMode ? 'border-[#1e1e24]' : 'border-gray-300'
                          }`}>
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
