// ============================================================================
// PANEL GA DRAWING COMPONENT (2D Switchgear Assembly & Section Divisions)
// Shows proportional section dimensions, doors, compartments, plinth, gland plates
// ============================================================================

import React, { useState } from 'react';
import { PanelGAData, PanelColumnLayout } from '../../types/engineering';
import { 
  Box, 
  Layers, 
  Ruler, 
  ShieldCheck, 
  Maximize2, 
  Info,
  Download,
  AlertTriangle
} from 'lucide-react';

interface PanelGADrawingProps {
  gaData: PanelGAData;
  onSelectColumn?: (col: PanelColumnLayout) => void;
}

export const PanelGADrawing: React.FC<PanelGADrawingProps> = ({
  gaData,
  onSelectColumn,
}) => {
  const [selectedColNumber, setSelectedColNumber] = useState<number | null>(null);

  const handleColumnClick = (col: PanelColumnLayout) => {
    setSelectedColNumber(col.columnNumber);
    if (onSelectColumn) onSelectColumn(col);
  };

  const selectedCol = gaData.columns.find(c => c.columnNumber === selectedColNumber);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner with Physical Dimensions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 uppercase">
              2D Switchboard GA Architecture
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Form of Separation: <strong className="text-slate-900">{gaData.formOfSeparation}</strong>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              {gaData.ipRating}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            {gaData.panelTag} General Arrangement & Dimensional Elevation
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Auto-calculated modular sections, busbar droppers, breaker compartments, and bottom cable entry chambers.
          </p>
        </div>

        {/* Overall Dimension Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Overall Width</span>
            <span className="text-sm font-bold text-slate-900">{gaData.totalWidthMm} mm</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Total Height</span>
            <span className="text-sm font-bold text-slate-900">{gaData.totalHeightMm} mm</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Depth</span>
            <span className="text-sm font-bold text-slate-900">{gaData.totalDepthMm} mm</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Columns</span>
            <span className="text-sm font-bold text-cyan-800">{gaData.columns.length} Tiers</span>
          </div>
        </div>
      </div>

      {/* 2D CAD Elevation Drawing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawing Canvas (3 Columns) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 overflow-x-auto shadow-xs">
          <div className="min-w-[850px] pb-4">
            {/* Top Dimension Annotation Line */}
            <div className="flex justify-between items-center px-10 mb-2 text-[10px] font-bold text-slate-500 border-b border-dashed border-slate-300 pb-1">
              <span>◄ 0 mm</span>
              <span>OVERALL ENCLOSURE WIDTH: {gaData.totalWidthMm} mm (± 2.0 mm)</span>
              <span>{gaData.totalWidthMm} mm ►</span>
            </div>

            {/* Lifting Lugs (Hooks) */}
            <div className="flex justify-around px-8 mb-1">
              {gaData.columns.map((col, idx) => (
                <div key={idx} className="flex justify-center" style={{ width: `${(col.widthMm / gaData.totalWidthMm) * 100}%` }}>
                  <div className="w-6 h-3 rounded-t-full border-2 border-slate-700 bg-slate-200 flex items-center justify-center">
                    <div className="w-2 h-1 rounded-full bg-slate-600"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Switchboard Cubicles Assembly */}
            <div className="border-4 border-slate-800 bg-slate-100 rounded-lg overflow-hidden flex shadow-lg">
              {gaData.columns.map((col) => {
                const isSelected = selectedColNumber === col.columnNumber;
                const colWidthPct = (col.widthMm / gaData.totalWidthMm) * 100;

                return (
                  <div
                    key={col.columnNumber}
                    onClick={() => handleColumnClick(col)}
                    style={{ width: `${colWidthPct}%` }}
                    className={`border-r-2 last:border-r-0 border-slate-800 flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected ? 'ring-3 ring-cyan-500 bg-cyan-50/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Column Header Label */}
                    <div className="bg-slate-800 text-white p-2 text-center text-[10px] font-bold truncate">
                      {col.designation}
                    </div>

                    {/* Compartment Stacks */}
                    <div className="flex-1 flex flex-col p-1.5 space-y-1.5 min-h-[440px]">
                      {col.compartments.map((comp) => {
                        let bgColor = 'bg-white';
                        let borderColor = 'border-slate-300';
                        let badgeColor = 'bg-slate-100 text-slate-700';

                        if (comp.type === 'METERING') {
                          bgColor = 'bg-blue-50/50';
                          borderColor = 'border-blue-300';
                          badgeColor = 'bg-blue-100 text-blue-800';
                        } else if (comp.type === 'BREAKER') {
                          bgColor = 'bg-white';
                          borderColor = 'border-slate-400';
                          badgeColor = 'bg-cyan-100 text-cyan-800';
                        } else if (comp.type === 'CABLE') {
                          bgColor = 'bg-amber-50/40';
                          borderColor = 'border-amber-300';
                          badgeColor = 'bg-amber-100 text-amber-800';
                        } else if (comp.type === 'CONTROL') {
                          bgColor = 'bg-purple-50/40';
                          borderColor = 'border-purple-300';
                          badgeColor = 'bg-purple-100 text-purple-800';
                        }

                        return (
                          <div
                            key={comp.id}
                            style={{ flexGrow: comp.heightMm }}
                            className={`${bgColor} border ${borderColor} rounded-md p-2 flex flex-col justify-between shadow-2xs relative overflow-hidden`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${badgeColor} uppercase tracking-wider`}>
                                {comp.type}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">{comp.heightMm} mm</span>
                            </div>

                            <div className="my-1">
                              <div className="text-[10px] font-bold text-slate-800 leading-tight">
                                {comp.name}
                              </div>
                              {comp.equipmentDescription && (
                                <p className="text-[8.5px] text-slate-500 font-sans line-clamp-2 mt-0.5 leading-snug">
                                  {comp.equipmentDescription}
                                </p>
                              )}
                            </div>

                            {/* Tags badges */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {comp.componentTags.map(tag => (
                                <span key={tag} className="text-[8px] font-mono px-1 py-0.2 bg-slate-100 border border-slate-300 rounded text-slate-700">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Column Width Footer */}
                    <div className="bg-slate-200 border-t border-slate-400 text-center py-1 text-[9px] font-bold text-slate-700">
                      W: {col.widthMm} mm
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Base Plinth Channel */}
            <div className="bg-slate-900 border-2 border-slate-950 text-slate-400 py-1.5 px-4 text-center text-[10px] font-bold flex justify-between items-center rounded-b-md mt-0.5">
              <span>BASE CHANNEL PLINTH</span>
              <span>HEIGHT: {gaData.plinthHeightMm} mm • 2.5mm COLD FORMED STEEL CHANNEL • POWDER COATED BLACK</span>
              <span>EARTHING GROUNDING STUD M10</span>
            </div>

            {/* Engineering Disclaimer */}
            <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[10px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>PRELIMINARY ENGINEERING GA:</strong> Dimensions are calculated from manufacturer frame standards and IEC 61439 Form 4B separation rules. Final workshop fabrication drawings must verify site cable entry coordinates.
              </span>
            </div>
          </div>
        </div>

        {/* Section Column Inspector (1 Column) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-cyan-600" />
              <span>Section Dimensions Inspector</span>
            </span>
          </div>

          {selectedCol ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Selected Tier</span>
                <span className="font-bold text-slate-900 text-sm">{selectedCol.designation}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">Width</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedCol.widthMm} mm</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">Height</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedCol.heightMm} mm</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase">Depth</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedCol.depthMm} mm</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Compartments in this Section ({selectedCol.compartments.length}):
                </span>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {selectedCol.compartments.map(comp => (
                    <div key={comp.id} className="p-2 bg-white rounded border border-slate-200 text-[10px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{comp.name}</span>
                        <span className="text-cyan-700">{comp.heightMm} mm</span>
                      </div>
                      <div className="text-slate-500 text-[9px] mt-0.5">{comp.equipmentDescription}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manufacturing Construction Notes */}
              <div className="pt-2 border-t border-slate-200 text-[10px] space-y-1 text-slate-600">
                <div>• Frame Material: 2.0mm Electro-Galvanized Steel</div>
                <div>• Finish: RAL 7035 Powder Coated (80 µm)</div>
                <div>• Door Gaskets: Seamless Neoprene Foam</div>
                <div>• Earth Bonding: Copper braid from door to frame</div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p>Click on any vertical column section in the GA drawing to inspect its internal compartmentalization.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
