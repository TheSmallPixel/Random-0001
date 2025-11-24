'use client';

import { useState } from 'react';
import { Upload, Target, BarChart3, Download } from 'lucide-react';
import dynamic from 'next/dynamic';

const BaseViewer3D = dynamic(() => import('../components/BaseViewer3D'), {
  ssr: false,
});

export default function Home() {
  const [base, setBase] = useState<any>(null);
  const [raidResults, setRaidResults] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importText, setImportText] = useState('');

  const handleImport = async () => {
    if (!importText.trim()) return;
    
    setLoading(true);
    setEvaluation(null);
    setRaidResults(null);
    
    try {
      console.log('Starting import...');
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: importText,
          type: 'fortify-compact',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Import result:', result);
      
      if (result.success) {
        console.log('Base imported successfully:', {
          dimensions: result.base.dimensions,
          lootRooms: result.base.lootRooms?.length,
          hasGrid: !!result.base.grid,
          name: result.base.name
        });
        setBase(result.base);
        
        // Don't auto-evaluate to avoid hanging
        setLoading(false);
      } else {
        console.error('Import failed:', result.error);
        alert('Import failed: ' + result.error);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!base) {
      alert('Please import a base first');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Starting simulation...');
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base, method: 'rockets' }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Simulation result:', result);
      
      if (result.success) {
        setRaidResults(result.results);
        console.log('Raid results:', result.results);
      } else {
        console.error('Simulation failed:', result.error);
        alert('Simulation failed: ' + result.error);
      }
    } catch (error: any) {
      console.error('Simulation error:', error);
      alert('Simulation error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (baseData?: any) => {
    const targetBase = baseData || base;
    if (!targetBase) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base: targetBase }),
      });
      
      const result = await response.json();
      console.log('Evaluation result:', result);
      
      if (result.success) {
        setEvaluation(result.evaluation);
      } else {
        console.error('Evaluation failed:', result.error);
        alert('Evaluation failed: ' + result.error);
      }
    } catch (error: any) {
      console.error('Evaluation error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-white">🎯 Rust Base Raid Simulator</h1>
          <p className="text-slate-400 mt-1">Analyze and optimize your Rust base defenses</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Import & Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Import Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Import Base</h2>
              </div>
              
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste Fortify compact format here..."
                className="w-full h-32 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              
              <button
                onClick={handleImport}
                disabled={loading || !importText.trim()}
                className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : 'Import Base'}
              </button>
            </div>

            {/* Actions Card */}
            {base && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">Actions</h2>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleEvaluate()}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-medium rounded-md transition-colors"
                  >
                    📊 Evaluate Base
                  </button>
                  
                  <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white font-medium rounded-md transition-colors"
                  >
                    🚀 Simulate Raid
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Card */}
            {evaluation && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Base Stats</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Quick metrics (run simulation for raid costs)
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Overall Score</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {(evaluation?.overallScore ?? 0).toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>🛡️ Loot Protection</span>
                      <span className="italic">Run simulation →</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">👁️ PVP Visibility</span>
                      <span className="text-white font-medium">{(evaluation?.pvpVisibility ?? 0).toFixed(1)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">⚡ Upkeep Efficiency</span>
                      <span className="text-white font-medium">{(evaluation?.upkeepEfficiency ?? 0).toFixed(1)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">🏛️ Multi-TC</span>
                      <span className="text-white font-medium">{(evaluation?.multiTCScore ?? 0).toFixed(1)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400">🛏️ Multi-Bed</span>
                      <span className="text-white font-medium">{(evaluation?.multiBedScore ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raid Results Card */}
            {raidResults && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">Raid Results</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Optimal Cost</span>
                    <span className="text-2xl font-bold text-red-400">
                      {raidResults?.minCost ?? 0} 💥
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Average Cost</span>
                    <span className="text-white">{(raidResults?.avgCost ?? 0).toFixed(0)} sulfur</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Loot Rooms</span>
                    <span className="text-white">{raidResults?.paths?.length ?? 0}</span>
                  </div>
                  
                  {raidResults?.bestTarget && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Best Target</p>
                      <p className="text-white">
                        ({raidResults.bestTarget.lootRoom?.position?.x ?? 0}, {raidResults.bestTarget.lootRoom?.position?.y ?? 0}, {raidResults.bestTarget.lootRoom?.position?.z ?? 0})
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Value: {raidResults.bestTarget.lootRoom?.value ?? 0}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - 3D Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 h-[calc(100vh-200px)]">
              {base ? (
                <div className="w-full h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">3D Base View</h2>
                    {base.name && (
                      <span className="text-slate-400 text-sm">{base.name}</span>
                    )}
                  </div>
                  <BaseViewer3D 
                    base={base} 
                    raidPath={raidResults?.bestTarget?.path}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Import a base to visualize it in 3D</p>
                    <p className="text-sm mt-2">Paste Fortify compact format on the left</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
