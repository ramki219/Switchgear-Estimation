// ============================================================================
// CONTROL WIRING & TERMINAL SCHEDULE VIEW
// Displays control circuits, fuses, wire numbering, and terminal block schedules
// ============================================================================

import React, { useState } from 'react';
import { SLDTopology } from '../../types/engineering';
import { ControlWiringEngine } from '../../services/controlWiringEngine';
import { 
  FileCode, 
  Layers, 
  Download, 
  Search, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ControlWiringViewProps {
  topology: SLDTopology;
}

export const ControlWiringView: React.FC<ControlWiringViewProps> = ({
  topology,
}) => {
  const [activeTab, setActiveTab] = useState<'circuits' | 'terminals'>('circuits');
  const [searchTerm, setSearchTerm] = useState('');
  const [tbFilter, setTbFilter] = useState<'ALL' | 'TB01' | 'TB02'>('ALL');

  const { controlCircuits, terminalSchedule } = ControlWiringEngine.generateControlAndTerminals(topology);

  const filteredCircuits = controlCircuits.filter(c => 
    !searchTerm ||
    c.circuitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.functionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.terminalBlock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTerminals = terminalSchedule.filter(t => {
    const matchTB = tbFilter === 'ALL' || t.terminalBlock === tbFilter;
    const matchSearch = !searchTerm ||
      t.wireNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.signalDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationDevice.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTB && matchSearch;
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 uppercase">
              Control Wiring & Terminals
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Panel: <strong className="text-slate-900">{topology.panelTag}</strong>
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Secondary Control Circuits, Protection Loops & Terminal Schedules
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Wire numbering, fuse specifications, CT secondary circuits, and field interface terminal blocks TB01/TB02.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs shrink-0">
          <button
            onClick={() => setActiveTab('circuits')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'circuits' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Control Circuits ({controlCircuits.length})
          </button>
          <button
            onClick={() => setActiveTab('terminals')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'terminals' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminal Schedule ({terminalSchedule.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search wire number, circuit ID, device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 focus:outline-hidden focus:border-cyan-600"
            />
          </div>

          {activeTab === 'terminals' && (
            <select
              value={tbFilter}
              onChange={(e) => setTbFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:border-cyan-600"
            >
              <option value="ALL">All Terminal Blocks</option>
              <option value="TB01">TB01 (Incomer 1 & Metering)</option>
              <option value="TB02">TB02 (Interlocking & Generator)</option>
            </select>
          )}
        </div>

        <span className="text-slate-500 text-[11px]">
          Showing {activeTab === 'circuits' ? filteredCircuits.length : filteredTerminals.length} scheduled records
        </span>
      </div>

      {/* Tab 1: Control Circuits Table */}
      {activeTab === 'circuits' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Circuit ID</th>
                  <th className="py-2.5 px-3">Function & Purpose</th>
                  <th className="py-2.5 px-3">Supply Voltage</th>
                  <th className="py-2.5 px-3">Fuse Rating</th>
                  <th className="py-2.5 px-3">TB Group</th>
                  <th className="py-2.5 px-3">Wire Codes</th>
                  <th className="py-2.5 px-3">Apparatus & Relays Involved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCircuits.map(c => (
                  <tr key={c.circuitId} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-cyan-800 whitespace-nowrap">{c.circuitId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.functionName}</td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{c.sourceVoltage}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {c.fuseRatingA > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                          {c.fuseRatingA}A Fuse
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px]">
                          NO FUSE (CT Loop)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-purple-800 whitespace-nowrap">{c.terminalBlock}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {c.wireNumbers.map(w => (
                          <span key={w} className="px-1 py-0.2 bg-slate-100 rounded text-slate-800 border border-slate-200 text-[9px]">
                            {w}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{c.devicesInvolved.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Terminal Schedule Table */}
      {activeTab === 'terminals' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">TB Block</th>
                  <th className="py-2.5 px-3">Terminal #</th>
                  <th className="py-2.5 px-3">Wire Code</th>
                  <th className="py-2.5 px-3">Signal Description</th>
                  <th className="py-2.5 px-3">Source Device</th>
                  <th className="py-2.5 px-3">Destination Device</th>
                  <th className="py-2.5 px-3">Size (mm²)</th>
                  <th className="py-2.5 px-3">Wire Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTerminals.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 font-bold text-purple-800 whitespace-nowrap">{t.terminalBlock}</td>
                    <td className="py-2 px-3 font-bold text-slate-800 text-center">{t.terminalNumber}</td>
                    <td className="py-2 px-3 font-bold text-cyan-800 whitespace-nowrap">{t.wireNumber}</td>
                    <td className="py-2 px-3 text-slate-900 font-medium">{t.signalDescription}</td>
                    <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{t.sourceDevice}</td>
                    <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{t.destinationDevice}</td>
                    <td className="py-2 px-3 text-slate-800 font-bold whitespace-nowrap">{t.wireSizeMm2} mm²</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-800">
                        {t.wireColor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
