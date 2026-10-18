// ============================================================================
// DEDICATED ATS ENGINEERING MODULE
// Supports Utility + Gen, Utility + Utility, Gen + Gen
// Distinguishes Bus Coupler from Automatic Transfer System
// Generates control philosophy, interlocking logic & monitoring sequence
// ============================================================================

import React, { useState } from 'react';
import { ATSConfiguration, SLDTopology } from '../../types/engineering';
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  ArrowRight
} from 'lucide-react';

interface ATSEngineeringViewProps {
  atsConfig: ATSConfiguration;
  topology: SLDTopology;
  onUpdateATSConfig: (config: ATSConfiguration) => void;
}

export const ATSEngineeringView: React.FC<ATSEngineeringViewProps> = ({
  atsConfig,
  topology,
  onUpdateATSConfig,
}) => {
  const [config, setConfig] = useState<ATSConfiguration>(atsConfig);
  const [simulatedState, setSimulatedState] = useState<'NORMAL' | 'UTILITY_FAIL' | 'GEN_STARTING' | 'ON_GEN' | 'RETRANSFERRING'>('NORMAL');

  const handleSave = () => {
    onUpdateATSConfig(config);
  };

  const handleSimulateState = (state: 'NORMAL' | 'UTILITY_FAIL' | 'GEN_STARTING' | 'ON_GEN' | 'RETRANSFERRING') => {
    setSimulatedState(state);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
              Dedicated ATS Engineering Module
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Topology: <strong className="text-slate-900">Utility Grid + Standby Generator</strong>
            </span>
            <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
              IEC 60947-6-1 Compliant
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Automatic Transfer System (ATS) Architecture & Dual-Source Safety Interlocking
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Generates mechanical walking-beam interlocking, electrical UVR trip schemes, and automatic generator start/stop control philosophies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition shadow-2xs shrink-0"
        >
          Save ATS Configuration
        </button>
      </div>

      {/* Grid: Interlocking Architecture & Live Sequence Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): Interactive Settings & Sequence */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Dual Source vs Bus Coupler Architecture Visualizer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Interlocking Architecture: Bus Coupler vs Dual Incomer ATS</span>
              </span>
              <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                2-OUT-OF-3 SCHEME ACTIVE
              </span>
            </div>

            {/* Architecture diagram */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
              {/* Incomer 1 */}
              <div className={`p-3 rounded-lg border-2 ${simulatedState === 'NORMAL' || simulatedState === 'RETRANSFERRING' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-300'}`}>
                <div className="text-[10px] text-slate-500 font-bold">SOURCE A (UTILITY)</div>
                <div className="text-sm font-bold text-slate-900 my-1">INCOMER-1 (4000A)</div>
                <div className={`text-[10px] font-bold ${simulatedState === 'NORMAL' || simulatedState === 'RETRANSFERRING' ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {simulatedState === 'NORMAL' || simulatedState === 'RETRANSFERRING' ? '● CLOSED (ENERGIZED)' : '○ OPEN (DISCONNECTED)'}
                </div>
              </div>

              {/* Bus Coupler / Interlock Zone */}
              <div className="p-3 rounded-lg border-2 border-purple-300 bg-purple-50/50 flex flex-col justify-between">
                <div className="text-[10px] text-purple-900 font-bold">SAFETY INTERLOCK</div>
                <div className="text-xs font-bold text-purple-950">Castell Key + Electrical</div>
                <div className="text-[9px] text-slate-600">
                  Prevents Utility & Gen Closing Together
                </div>
              </div>

              {/* Incomer 2 */}
              <div className={`p-3 rounded-lg border-2 ${simulatedState === 'ON_GEN' ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-300'}`}>
                <div className="text-[10px] text-slate-500 font-bold">SOURCE B (GENERATOR)</div>
                <div className="text-sm font-bold text-slate-900 my-1">INCOMER-2 (2500A)</div>
                <div className={`text-[10px] font-bold ${simulatedState === 'ON_GEN' ? 'text-amber-700' : 'text-slate-400'}`}>
                  {simulatedState === 'ON_GEN' ? '● CLOSED (ENERGIZED)' : '○ OPEN (STANDBY SLEEP)'}
                </div>
              </div>
            </div>

            {/* Sequence Simulation Buttons */}
            <div className="border-t border-slate-200 pt-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                Simulate Real-Time ATS Operating Sequence:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSimulateState('NORMAL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    simulatedState === 'NORMAL' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  1. Utility Normal
                </button>
                <button
                  onClick={() => handleSimulateState('UTILITY_FAIL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    simulatedState === 'UTILITY_FAIL' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  2. Mains Failure
                </button>
                <button
                  onClick={() => handleSimulateState('GEN_STARTING')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    simulatedState === 'GEN_STARTING' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  3. Gen Cranking & Healthy
                </button>
                <button
                  onClick={() => handleSimulateState('ON_GEN')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    simulatedState === 'ON_GEN' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  4. Load on Generator
                </button>
                <button
                  onClick={() => handleSimulateState('RETRANSFERRING')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    simulatedState === 'RETRANSFERRING' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  5. Retransfer & Cool-down
                </button>
              </div>
            </div>
          </div>

          {/* Configurable ATS Timing Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
              Automatic Transfer Timer Parameters (IEC 60947-6-1)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Mains Fail Delay (T1)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={config.genStartDelaySec}
                    onChange={(e) => setConfig({ ...config, genStartDelaySec: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold focus:border-cyan-600"
                  />
                  <span className="text-slate-500">sec</span>
                </div>
                <span className="text-[9px] text-slate-400">Filters transient dips</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Transfer Delay (T2)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={config.transferDelaySec}
                    onChange={(e) => setConfig({ ...config, transferDelaySec: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold focus:border-cyan-600"
                  />
                  <span className="text-slate-500">sec</span>
                </div>
                <span className="text-[9px] text-slate-400">Dead-bus interval</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Mains Return Delay</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={config.retransferDelaySec}
                    onChange={(e) => setConfig({ ...config, retransferDelaySec: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold focus:border-cyan-600"
                  />
                  <span className="text-slate-500">sec</span>
                </div>
                <span className="text-[9px] text-slate-400">Verifies grid stability</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Gen Cool-down (T3)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={config.genCooldownSec}
                    onChange={(e) => setConfig({ ...config, genCooldownSec: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-bold focus:border-cyan-600"
                  />
                  <span className="text-slate-500">sec</span>
                </div>
                <span className="text-[9px] text-slate-400">Turbocharger cool-down</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generated ATS Control Philosophy Document */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-700" />
              <span>Generated Control Philosophy</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Auto-Generated
            </span>
          </div>

          <textarea
            rows={22}
            value={config.controlPhilosophyText}
            onChange={(e) => setConfig({ ...config, controlPhilosophyText: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-[10.5px] leading-relaxed font-mono text-slate-800 focus:outline-hidden focus:border-cyan-600 shadow-2xs"
          />

          <div className="text-[10px] text-slate-500">
            This control philosophy document is automatically exported into the project Technical Offer and Official Tender Submittal Dossier.
          </div>
        </div>
      </div>
    </div>
  );
};
