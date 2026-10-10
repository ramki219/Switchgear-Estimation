// ============================================================================
// FRONT FACIA & DOOR LAYOUT GENERATOR (Realistic Switchboard Door Mimic)
// Displays handles, meters, phase lamps, switches, and ATS status indicators
// Directly driven by Single Line Diagram tags
// ============================================================================

import React, { useState } from 'react';
import { FaciaLayoutData, FaciaComponent, SLDTopology } from '../../types/engineering';
import { 
  Sliders, 
  Activity, 
  Power, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

interface FaciaGeneratorViewProps {
  faciaData: FaciaLayoutData;
  topology: SLDTopology;
}

export const FaciaGeneratorView: React.FC<FaciaGeneratorViewProps> = ({
  faciaData,
  topology,
}) => {
  const [selectedComponent, setSelectedComponent] = useState<FaciaComponent | null>(null);

  // Group facia components by column
  const cols = Array.from({ length: faciaData.columnsCount }, (_, i) => i + 1);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 uppercase">
              Front Facia & Door Mimic Elevation
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Panel: <strong className="text-slate-900">{faciaData.panelTag}</strong>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Live SLD Tag Binding
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Switchboard Front Door Equipment & Operator Controls
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Arrangement of breaker operating mechanisms, digital power meters, phase lamps, selector switches, and ATS annunciators.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span className="text-slate-600">ON (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-slate-600">OFF (Green)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">Trip (Amber)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-slate-900 rounded-sm"></span>
            <span className="text-slate-600">Digital Meter</span>
          </div>
        </div>
      </div>

      {/* Main Facia Elevation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawing Door Array (3 Columns) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 overflow-x-auto shadow-xs">
          <div className="min-w-[850px] pb-4">
            
            {/* Top Nameplate Bar */}
            <div className="bg-slate-900 text-slate-100 p-2 text-center text-xs font-bold rounded-t-lg tracking-wider flex justify-between items-center px-6">
              <span>SWITCHGEAR IDENTIFICATION: {topology.panelTag}</span>
              <span className="text-cyan-400">415V 3PH+N 50Hz • FORM 4B TYPE 6 • IP54</span>
              <span>RATED SHORT-CIRCUIT: 65kA (1s)</span>
            </div>

            {/* Switchboard Doors Assembly */}
            <div className="border-4 border-slate-700 bg-slate-200 rounded-b-lg flex shadow-xl overflow-hidden min-h-[480px]">
              {cols.map((colNum) => {
                const colComponents = faciaData.components.filter(c => c.columnNumber === colNum);
                const isInc1Col = colNum === 1;
                const isBCCol = colNum === 2;
                const isInc2Col = colNum === 3;

                return (
                  <div 
                    key={colNum}
                    className="flex-1 border-r-2 last:border-r-0 border-slate-600 bg-slate-100 flex flex-col justify-between relative p-2"
                  >
                    {/* Column Door Title */}
                    <div className="text-center pb-2 border-b border-slate-300">
                      <span className="text-[10px] font-bold text-slate-700 uppercase">
                        {isInc1Col ? 'Section 1: Incomer 1' : isBCCol ? 'Section 2: Bus Coupler' : isInc2Col ? 'Section 3: Generator Incomer' : `Section ${colNum}: Outgoings`}
                      </span>
                    </div>

                    {/* Door Surface with Controls */}
                    <div className="flex-1 py-3 flex flex-col justify-around space-y-4">
                      {/* Top Metering Compartment Zone */}
                      {(isInc1Col || isInc2Col) && (
                        <div className="bg-white border-2 border-slate-300 rounded p-3 shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold border-b pb-1">
                            <span>METERING & INSTRUMENTS</span>
                            <span className="text-cyan-700">{isInc1Col ? 'M01' : 'M02'}</span>
                          </div>

                          {/* Phase Lamps R, Y, B */}
                          <div className="flex justify-around items-center py-1">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-4 h-4 rounded-full bg-red-600 border border-slate-700 shadow-sm animate-pulse"></div>
                              <span className="text-[7.5px] font-bold text-slate-600">L1 (R)</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-4 h-4 rounded-full bg-yellow-500 border border-slate-700 shadow-sm animate-pulse"></div>
                              <span className="text-[7.5px] font-bold text-slate-600">L2 (Y)</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-4 h-4 rounded-full bg-blue-600 border border-slate-700 shadow-sm animate-pulse"></div>
                              <span className="text-[7.5px] font-bold text-slate-600">L3 (B)</span>
                            </div>
                          </div>

                          {/* Digital Multifunction Meter LCD Screen */}
                          <div 
                            onClick={() => setSelectedComponent(colComponents.find(c => c.type === 'DIGITAL_METER') || null)}
                            className="bg-slate-900 border-2 border-slate-800 rounded p-2 text-cyan-400 font-mono text-[9px] cursor-pointer hover:border-cyan-400 transition"
                          >
                            <div className="flex justify-between text-[7px] text-slate-400 border-b border-slate-700 pb-0.5">
                              <span>ABB M4M 20</span>
                              <span>415.2 V • 50.0 Hz</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold my-1 text-emerald-400">
                              <span>P: {isInc1Col ? '1,840 kW' : '0.0 kW'}</span>
                              <span>PF: 0.88</span>
                            </div>
                            <div className="text-[8px] text-slate-400 flex justify-between">
                              <span>IL1: {isInc1Col ? '2,840A' : '0A'}</span>
                              <span>THD: 2.1%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bus Coupler Control Section */}
                      {isBCCol && (
                        <div className="bg-purple-50/50 border-2 border-purple-200 rounded p-2.5 text-center space-y-2">
                          <span className="text-[9px] font-bold text-purple-900 uppercase block">
                            2-OUT-OF-3 INTERLOCK STATUS
                          </span>
                          <div className="grid grid-cols-2 gap-1 text-[8px] font-bold">
                            <div className="bg-white p-1 rounded border border-purple-300 text-emerald-700">
                              UTIL: CLOSED
                            </div>
                            <div className="bg-white p-1 rounded border border-purple-300 text-rose-700">
                              GEN: OPEN
                            </div>
                          </div>
                          <div className="p-1 bg-purple-100 rounded text-[8px] font-bold text-purple-800">
                            CASTELL KEY: TRAPPED (SAFE)
                          </div>
                        </div>
                      )}

                      {/* Breaker Operating Zone */}
                      <div className="space-y-3">
                        {colComponents.filter(c => c.type === 'ACB_HANDLE').map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => setSelectedComponent(c)}
                            className="bg-white border-2 border-slate-400 rounded-lg p-3 text-center shadow-xs cursor-pointer hover:border-cyan-600 transition"
                          >
                            <div className="text-[10px] font-bold text-slate-900 border-b pb-1">
                              {c.label}
                            </div>

                            {/* Status Lamps ON/OFF/TRIP */}
                            <div className="flex justify-around items-center py-2">
                              <div className="flex flex-col items-center gap-0.5">
                                <div className={`w-3.5 h-3.5 rounded-full ${c.state === 'CLOSED' ? 'bg-red-600 shadow-md' : 'bg-red-200'}`}></div>
                                <span className="text-[7px] text-slate-500 font-bold">ON</span>
                              </div>
                              <div className="flex flex-col items-center gap-0.5">
                                <div className={`w-3.5 h-3.5 rounded-full ${c.state === 'OPEN' ? 'bg-emerald-600 shadow-md' : 'bg-emerald-200'}`}></div>
                                <span className="text-[7px] text-slate-500 font-bold">OFF</span>
                              </div>
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-200"></div>
                                <span className="text-[7px] text-slate-500 font-bold">TRIP</span>
                              </div>
                            </div>

                            {/* Drawout Escutcheon Handle Graphic */}
                            <div className="w-24 h-16 mx-auto bg-slate-800 rounded border-2 border-slate-600 p-1.5 flex flex-col justify-between text-white">
                              <div className="flex justify-between text-[7px] text-slate-300">
                                <span>TEST</span>
                                <span className="text-emerald-400 font-bold">CONNECTED</span>
                              </div>
                              <div className="w-12 h-3 mx-auto bg-slate-600 rounded-xs flex items-center justify-center">
                                <span className="text-[6px]">PUSH ON</span>
                              </div>
                              <div className="text-[7px] text-slate-400">RACKING INLET</div>
                            </div>

                            {/* Acrylic Nameplate */}
                            <div className="mt-2 bg-slate-900 text-white text-[8px] font-bold py-0.5 px-2 rounded-xs tracking-wider inline-block">
                              {c.tag}
                            </div>
                          </div>
                        ))}

                        {/* Outgoing MCCB Handles Grid */}
                        <div className="space-y-1.5">
                          {colComponents.filter(c => c.type === 'MCCB_HANDLE').map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => setSelectedComponent(c)}
                              className="bg-white border border-slate-300 rounded p-1.5 flex items-center justify-between shadow-2xs cursor-pointer hover:border-cyan-600 transition"
                            >
                              <div className="flex items-center gap-2">
                                {/* Rotary Handle Circle */}
                                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-white text-[8px] font-bold">
                                  |
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-[9px]">{c.tag}</div>
                                  <div className="text-[8px] text-slate-500">{c.label}</div>
                                </div>
                              </div>

                              <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                ON
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Door Lock Handle */}
                    <div className="py-1 border-t border-slate-300 flex justify-end px-2">
                      <div className="w-3 h-8 bg-slate-800 rounded-xs flex items-center justify-center text-[7px] text-slate-400">
                        •
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Base Plinth */}
            <div className="bg-slate-900 text-slate-400 text-center py-2 font-bold text-[10px] rounded-b-lg">
              100mm BASE CHANNEL PLINTH • REMOVABLE GLAND PLATES
            </div>
          </div>
        </div>

        {/* Right Facia Component Inspector (1 Column) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-600" />
              <span>Door Component Details</span>
            </span>
          </div>

          {selectedComponent ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Selected Element</span>
                <span className="font-bold text-slate-900 text-sm">{selectedComponent.label}</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Component Tag:</span>
                  <span className="font-bold text-cyan-800">{selectedComponent.tag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier / Section:</span>
                  <span className="font-bold text-slate-800">Column {selectedComponent.columnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device Type:</span>
                  <span className="font-bold text-slate-800">{selectedComponent.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current State:</span>
                  <span className="font-bold text-emerald-700">ACTIVE / NORMAL</span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-[10px] space-y-1 text-slate-600">
                <span className="font-bold text-slate-800 block text-[11px] mb-1">Installation Standard:</span>
                <div>• Front door cut-out: Standard 96x96 mm (Meters) or 22mm (Lamps)</div>
                <div>• Protection Degree: IP54 with neoprene gasket seal</div>
                <div>• Inscription: White engraved lettering on black acrylic background</div>
                <div>• Interlock: Door cannot be opened while breaker is in CLOSED position</div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p>Click on any meter, breaker handle, or indicator lamp on the door elevation to view its exact mounting coordinates and wiring specifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
