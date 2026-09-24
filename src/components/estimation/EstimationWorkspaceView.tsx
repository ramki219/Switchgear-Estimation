import React, { useState } from 'react';
import { 
  Project, 
  EstimatePanel, 
  EstimateItem, 
  Component, 
  PanelType,
  CableEntryType
} from '../../types';
import { Badge } from '../common/Badge';
import { AddFeederModal } from './AddFeederModal';
import { PanelFormModal } from './PanelFormModal';
import { 
  Calculator, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  FileSpreadsheet, 
  ArrowLeft, 
  Cpu, 
  Zap, 
  Box, 
  Wrench, 
  CheckCircle2, 
  Info, 
  Sparkles,
  DollarSign,
  Ruler,
  ShieldAlert
} from 'lucide-react';

interface EstimationWorkspaceViewProps {
  project: Project;
  panels: EstimatePanel[];
  components: Component[];
  panelTypes: PanelType[];
  onBackToProjects: () => void;
  onNavigateToQuotation: (project: Project) => void;
  onNavigateToBOM: (project: Project) => void;
  onAddPanel: (panelData: any) => void;
  onUpdatePanel: (panel: EstimatePanel) => void;
  onDeletePanel: (panelId: number) => void;
  onAddItemToPanel: (panelId: number, itemData: any) => void;
  onDeleteItemFromPanel: (panelId: number, itemId: number) => void;
}

export const EstimationWorkspaceView: React.FC<EstimationWorkspaceViewProps> = ({
  project,
  panels,
  components,
  panelTypes,
  onBackToProjects,
  onNavigateToQuotation,
  onNavigateToBOM,
  onAddPanel,
  onUpdatePanel,
  onDeletePanel,
  onAddItemToPanel,
  onDeleteItemFromPanel,
}) => {
  const [selectedPanelId, setSelectedPanelId] = useState<number>(
    panels.length > 0 ? panels[0].panelID : 0
  );
  const [activeTab, setActiveTab] = useState<'feeders' | 'busbars' | 'enclosure' | 'labour'>('feeders');
  
  // Modals
  const [isAddFeederOpen, setIsAddFeederOpen] = useState(false);
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [panelToEdit, setPanelToEdit] = useState<EstimatePanel | null>(null);

  // Active panel
  const activePanel = panels.find(p => p.panelID === selectedPanelId) || panels[0];

  // Project Grand Totals
  const totalEquipmentCost = panels.reduce((sum, p) => sum + p.equipmentCost, 0);
  const totalCopperCost = panels.reduce((sum, p) => sum + p.copperCost, 0);
  const totalCopperKg = panels.reduce((sum, p) => sum + p.copperWeightKg, 0);
  const totalEnclosureCost = panels.reduce((sum, p) => sum + p.enclosureCost, 0);
  const totalLabourCost = panels.reduce((sum, p) => sum + p.labourCost, 0);
  const totalLabourHours = panels.reduce((sum, p) => sum + p.labourHours, 0);
  const totalProjectDirectCost = totalEquipmentCost + totalCopperCost + totalEnclosureCost + totalLabourCost;

  return (
    <div className="space-y-5 font-mono">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-sm">{project.projectCode}</span>
              <Badge variant="emerald" size="sm">{project.authority}</Badge>
              <Badge variant="purple" size="sm">{project.status}</Badge>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">{project.projectName}</h2>
            <p className="text-xs text-slate-400 font-sans">
              Client: <strong className="text-slate-200">{project.clientName}</strong> | Due: {project.dueDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onNavigateToBOM(project)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Project BOM</span>
          </button>

          <button
            onClick={() => onNavigateToQuotation(project)}
            className="bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/60 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Commercial Quotation</span>
          </button>
        </div>
      </div>

      {/* Project Financial Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
          <span className="text-slate-400 block text-[11px]">Direct Panels</span>
          <span className="text-lg font-bold text-purple-400 flex items-center gap-1 mt-0.5">
            <Layers className="w-4 h-4" />
            {panels.length}
          </span>
          <span className="text-[10px] text-slate-500">Configured units</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
          <span className="text-slate-400 block text-[11px]">Switchgear Breakers</span>
          <span className="text-lg font-bold text-cyan-400 mt-0.5 block">
            {totalEquipmentCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-slate-500">ACBs, MCCBs, MCBs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
          <span className="text-slate-400 block text-[11px]">Copper Busbars</span>
          <span className="text-lg font-bold text-amber-400 mt-0.5 block">
            {totalCopperCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-amber-300/80">{totalCopperKg} kg Cu</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
          <span className="text-slate-400 block text-[11px]">Enclosures & Steel</span>
          <span className="text-lg font-bold text-blue-400 mt-0.5 block">
            {totalEnclosureCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-slate-500">Modular framework</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
          <span className="text-slate-400 block text-[11px]">Assembly Labour</span>
          <span className="text-lg font-bold text-teal-400 mt-0.5 block">
            {totalLabourCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-teal-300/80">{totalLabourHours} hrs</span>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded">
          <span className="text-emerald-300 block text-[11px] font-semibold">Total Direct Cost</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
            {totalProjectDirectCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-emerald-300/70">Raw factory cost</span>
        </div>
      </div>

      {/* Switchboard Panel Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {panels.map((p) => {
            const isSelected = p.panelID === (activePanel?.panelID);
            return (
              <button
                key={p.panelID}
                onClick={() => setSelectedPanelId(p.panelID)}
                className={`px-3 py-2 rounded text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-600 text-slate-950 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{p.panelTag}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-950 text-slate-400'
                }`}>
                  {p.incomerRating}A
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setPanelToEdit(null);
            setIsPanelModalOpen(true);
          }}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Panel</span>
        </button>
      </div>

      {/* Active Panel View */}
      {activePanel ? (
        <div className="space-y-4">
          {/* Active Panel Technical Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-cyan-400">{activePanel.panelTag}</span>
                  <Badge variant="blue" size="sm">{activePanel.panelTypeCode}</Badge>
                  <Badge variant="purple" size="sm">{activePanel.formOfSeparation}</Badge>
                  <Badge variant="cyan" size="sm">{activePanel.ipRating}</Badge>
                  <span className="text-slate-400 text-xs">
                    Cable Entry: <strong className="text-slate-200">{activePanel.cableEntry}</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 mt-1">{activePanel.panelName}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPanelToEdit(activePanel);
                    setIsPanelModalOpen(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Panel</span>
                </button>
                {panels.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete panel ${activePanel.panelTag}?`)) {
                        onDeletePanel(activePanel.panelID);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition"
                    title="Delete panel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Active Panel Technical Parameters & Dimensions */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs pt-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Incomer Rating</span>
                <span className="text-cyan-400 font-bold text-sm">{activePanel.incomerRating} Amps</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Short-Circuit (Icu/Icw)</span>
                <span className="text-slate-200 font-bold text-sm">{activePanel.shortCircuitRating} kA (1s)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Dimensions (H×W×D)</span>
                <span className="text-slate-200 font-bold text-xs">
                  {activePanel.enclosureHeight}×{activePanel.enclosureWidth}×{activePanel.enclosureDepth} mm
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Columns / Tiers</span>
                <span className="text-slate-200 font-bold text-sm">{activePanel.numberOfColumns} Columns</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Calculated Copper</span>
                <span className="text-amber-400 font-bold text-sm">{activePanel.copperWeightKg} kg Cu</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assembly Hours</span>
                <span className="text-teal-400 font-bold text-sm">{activePanel.labourHours} hrs</span>
              </div>
            </div>

            {/* Active Panel Cost Breakdown Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-950 p-2.5 rounded">
              <div>
                <span className="text-[10px] text-slate-400 block">Switchgear Breakers</span>
                <span className="font-bold text-cyan-400 text-xs">{activePanel.equipmentCost.toLocaleString()} AED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Copper Busbars</span>
                <span className="font-bold text-amber-400 text-xs">{activePanel.copperCost.toLocaleString()} AED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Enclosure Structure</span>
                <span className="font-bold text-blue-400 text-xs">{activePanel.enclosureCost.toLocaleString()} AED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Assembly Labour</span>
                <span className="font-bold text-teal-400 text-xs">{activePanel.labourCost.toLocaleString()} AED</span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] text-emerald-400 font-semibold block">Total Panel Cost</span>
                <span className="font-bold text-emerald-400 text-sm">{activePanel.totalPanelCost.toLocaleString()} AED</span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Feeder Items, Copper Sizing, Enclosure, Labour */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('feeders')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'feeders'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Circuit Feeders & Breakers ({activePanel.items.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('busbars')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'busbars'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Copper Busbar Sizing ({activePanel.copperWeightKg} kg)</span>
              </button>

              <button
                onClick={() => setActiveTab('enclosure')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'enclosure'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Enclosure & Fabrication</span>
              </button>

              <button
                onClick={() => setActiveTab('labour')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'labour'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Activity-based Labour ({activePanel.labourHours} hrs)</span>
              </button>
            </div>

            {/* TAB 1: Feeder & Breaker Items */}
            {activeTab === 'feeders' && (
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    Circuits, incomer ACBs, outgoing MCCBs/MCBs, capacitors & metering:
                  </span>
                  <button
                    onClick={() => setIsAddFeederOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Circuit Feeder</span>
                  </button>
                </div>

                <div className="border border-slate-800 rounded bg-slate-950 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Circuit Tag</th>
                        <th className="py-2.5 px-3">Part Number & OEM</th>
                        <th className="py-2.5 px-3">Equipment Description</th>
                        <th className="py-2.5 px-3">Rating</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Net Cost</th>
                        <th className="py-2.5 px-3 text-right">Extended Cost</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activePanel.items.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            No circuit feeders configured in this panel yet. Click "Add Circuit Feeder" to select components from catalog.
                          </td>
                        </tr>
                      ) : (
                        activePanel.items.map((item) => (
                          <tr key={item.itemID} className="hover:bg-slate-900/60 transition">
                            <td className="py-2 px-3 font-bold text-cyan-400 whitespace-nowrap">
                              {item.circuitTag}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-100">{item.partNumber}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {item.manufacturerCode || 'OEM'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              {item.description}
                              {item.supplierName && (
                                <span className="text-[10px] text-slate-500 block">
                                  Supplier: {item.supplierName}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                              {item.rating || '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-200">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-300 whitespace-nowrap">
                              {item.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                              {item.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => onDeleteItemFromPanel(activePanel.panelID, item.itemID)}
                                className="text-slate-500 hover:text-red-400 transition p-1"
                                title="Remove circuit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {activePanel.items.length > 0 && (
                      <tfoot className="bg-slate-900 border-t border-slate-800 font-bold">
                        <tr>
                          <td colSpan={6} className="py-2 px-3 text-right text-slate-400">
                            Total Equipment & Circuit Items Cost:
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-400">
                            {activePanel.equipmentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Copper Busbar Engineering */}
            {activeTab === 'busbars' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Electrolytic Grade ETP Copper (Cu-ETP 99.9% purity) Sizing per IEC 61439-1/2:
                  </div>
                  <Badge variant="amber" size="md">
                    {activePanel.copperWeightKg} kg Copper Total
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-amber-400 font-bold block text-xs">1. Busbar Sizing Parameters</span>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Incomer Current (In):</span>
                        <span className="font-bold">{activePanel.incomerRating} Amps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Density:</span>
                        <span className="font-bold">{activePanel.busbarCurrentDensity || 1.5} A/mm²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cross-Section (Phase):</span>
                        <span className="font-bold text-amber-400">{activePanel.copperCrossSectionMm2} mm²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Neutral Sizing:</span>
                        <span className="font-bold">100% (Harmonics rated)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Earth Busbar (PE):</span>
                        <span className="font-bold">50% Phase Section</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-amber-400 font-bold block text-xs">2. Physical Run & Weight</span>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Horizontal Run:</span>
                        <span className="font-bold">{((activePanel.enclosureWidth / 1000) * 1.15).toFixed(2)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vertical Droppers:</span>
                        <span className="font-bold">{(activePanel.numberOfColumns * 1.4).toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Copper Density:</span>
                        <span className="font-bold">8.92 g/cm³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Calculated Weight:</span>
                        <span className="font-bold text-amber-400">{activePanel.copperWeightKg} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-amber-400 font-bold block text-xs">3. Cost Sizing Breakdown</span>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Copper Base Rate:</span>
                        <span className="font-bold">{activePanel.copperBaseRatePerKg || 42.0} AED/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Raw Copper Cost:</span>
                        <span className="font-bold">{(activePanel.copperWeightKg * (activePanel.copperBaseRatePerKg || 42.0)).toLocaleString()} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SMC Supports & Sleeving:</span>
                        <span className="font-bold">{((activePanel.copperCost || 0) * 0.12).toFixed(0)} AED</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-amber-400">
                        <span>Total Busbar Cost:</span>
                        <span>{activePanel.copperCost.toLocaleString()} AED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Enclosure Fabrication */}
            {activeTab === 'enclosure' && (
              <div className="p-4 space-y-4">
                <div className="text-xs text-slate-400">
                  Sheet metal enclosure, CNC fabrication, Form separation barriers, powder coating & accessories:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-blue-400 font-bold block text-xs">Cubicle Carcass Dimensions</span>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Height:</span>
                        <span className="font-bold">{activePanel.enclosureHeight} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Width:</span>
                        <span className="font-bold">{activePanel.enclosureWidth} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Depth:</span>
                        <span className="font-bold">{activePanel.enclosureDepth} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Columns / Tiers:</span>
                        <span className="font-bold">{activePanel.numberOfColumns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sheet Steel:</span>
                        <span className="font-bold">{activePanel.sheetMetalThickness || 2.0} mm Electro-galv</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-blue-400 font-bold block text-xs">Finishing & Protection</span>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Separation Form:</span>
                        <span className="font-bold text-purple-400">{activePanel.formOfSeparation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ingress Protection:</span>
                        <span className="font-bold text-cyan-400">{activePanel.ipRating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paint Finish:</span>
                        <span className="font-bold">RAL 7035 Powder (70µ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plinth Base:</span>
                        <span className="font-bold">100 mm channel plinth</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-blue-400 font-bold block text-xs">Enclosure Valuation</span>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Raw Steel Material:</span>
                        <span className="font-bold">{(activePanel.enclosureCost * 0.55).toFixed(0)} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CNC Cutting & Bending:</span>
                        <span className="font-bold">{(activePanel.enclosureCost * 0.25).toFixed(0)} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Powder Coating & Locks:</span>
                        <span className="font-bold">{(activePanel.enclosureCost * 0.20).toFixed(0)} AED</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-blue-400">
                        <span>Total Enclosure Cost:</span>
                        <span>{activePanel.enclosureCost.toLocaleString()} AED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Labour & Fabrication Hours */}
            {activeTab === 'labour' && (
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Factory assembly, busbar fabrication, wiring, testing & engineering hours:</span>
                  <Badge variant="teal" size="md">{activePanel.labourHours} Hours Total</Badge>
                </div>

                <div className="border border-slate-800 rounded bg-slate-950 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Activity Code</th>
                        <th className="py-2 px-3">Labour Activity Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Allocated Hours</th>
                        <th className="py-2 px-3 text-right">Hourly Rate</th>
                        <th className="py-2 px-3 text-right">Total Labour Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activePanel.labourHoursDetail?.map((labour) => (
                        <tr key={labour.activityCode} className="hover:bg-slate-900/60">
                          <td className="py-2 px-3 text-cyan-400 font-bold">{labour.activityCode}</td>
                          <td className="py-2 px-3 text-slate-200">{labour.activityName}</td>
                          <td className="py-2 px-3 text-slate-400">{labour.category}</td>
                          <td className="py-2 px-3 text-right font-bold text-teal-400">{labour.hours} hrs</td>
                          <td className="py-2 px-3 text-right text-slate-400">{labour.ratePerHour} AED/hr</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-200">{labour.totalCost.toLocaleString()} AED</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 border-t border-slate-800 font-bold">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right text-slate-400">Total Assembly Labour:</td>
                        <td className="py-2 px-3 text-right text-teal-400">{activePanel.labourHours} hrs</td>
                        <td></td>
                        <td className="py-2 px-3 text-right text-teal-400">{activePanel.labourCost.toLocaleString()} AED</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-500">
          No panels currently configured in this project. Click "+ Add Panel" above to create the first switchboard.
        </div>
      )}

      {/* Add Feeder / Breaker Modal */}
      {activePanel && (
        <AddFeederModal
          isOpen={isAddFeederOpen}
          onClose={() => setIsAddFeederOpen(false)}
          onAddItem={(itemData) => onAddItemToPanel(activePanel.panelID, itemData)}
          components={components}
          panelTag={activePanel.panelTag}
        />
      )}

      {/* Panel Configuration Modal */}
      <PanelFormModal
        isOpen={isPanelModalOpen}
        onClose={() => {
          setIsPanelModalOpen(false);
          setPanelToEdit(null);
        }}
        onSave={(data) => {
          if (data.panelID) {
            onUpdatePanel(data);
          } else {
            onAddPanel(data);
          }
          setIsPanelModalOpen(false);
          setPanelToEdit(null);
        }}
        panelToEdit={panelToEdit}
        projectID={project.projectID}
        panelTypes={panelTypes}
      />
    </div>
  );
};
