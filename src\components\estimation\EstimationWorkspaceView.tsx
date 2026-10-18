import React, { useState, useEffect, useMemo } from 'react';
import { 
  Project, 
  EstimatePanel, 
  Component, 
  PanelType,
} from '../../types';
import { Badge } from '../common/Badge';
import { AddFeederModal } from './AddFeederModal';
import { PanelFormModal } from './PanelFormModal';
import { PickAssemblyModal } from './PickAssemblyModal';
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
  Boxes,
  Wrench,
  Check,
  Sparkles,
  Sliders,
  RefreshCw,
  Scale
} from 'lucide-react';

interface EstimationWorkspaceViewProps {
  project: Project;
  panels: EstimatePanel[];
  components: Component[];
  panelTypes: PanelType[];
  onBackToProjects: () => void;
  onNavigateToQuotation: (project: Project) => void;
  onNavigateToBOM: (project: Project) => void;
  onNavigateToSLD?: (panelId?: number) => void;
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
  onNavigateToSLD,
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
  const [isPickAssemblyOpen, setIsPickAssemblyOpen] = useState(false);
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

  // Quick Busbar Inline Edit State
  const [isQuickEditBusbar, setIsQuickEditBusbar] = useState(false);
  const [busbarWidth, setBusbarWidth] = useState<number>(80);
  const [busbarThickness, setBusbarThickness] = useState<number>(10);
  const [busbarRuns, setBusbarRuns] = useState<number>(2);
  const [busbarPhases, setBusbarPhases] = useState<number>(4);
  const [busbarLength, setBusbarLength] = useState<number>(5.5);
  const [copperPrice, setCopperPrice] = useState<number>(42);
  const [copperDensity, setCopperDensity] = useState<number>(0.00896);
  const [labourHours, setLabourHours] = useState<number>(6);
  const [labourRate, setLabourRate] = useState<number>(85);
  const [labourCost, setLabourCost] = useState<number>(510);
  const [isManualLabour, setIsManualLabour] = useState<boolean>(false);
  const [hardwareCost, setHardwareCost] = useState<number>(0);

  useEffect(() => {
    if (activePanel) {
      setBusbarWidth(activePanel.busbarWidthMm || (activePanel.incomerRating >= 2500 ? 100 : activePanel.incomerRating >= 1600 ? 80 : 50));
      setBusbarThickness(activePanel.busbarThicknessMm || 10);
      setBusbarRuns(activePanel.busbarRunsPerPhase || (activePanel.incomerRating >= 3200 ? 4 : activePanel.incomerRating >= 2500 ? 3 : activePanel.incomerRating >= 1250 ? 2 : 1));
      setBusbarPhases(activePanel.busbarPhasesCount || 4);
      setBusbarLength(activePanel.busbarTotalLengthMeters || 5.5);
      setCopperPrice(activePanel.copperBaseRatePerKg || 42);
      setCopperDensity(
        activePanel.copperDensityKgDm3 
          ? (activePanel.copperDensityKgDm3 < 0.1 ? activePanel.copperDensityKgDm3 : Number((activePanel.copperDensityKgDm3 / 1000).toFixed(5))) 
          : 0.00896
      );
      setLabourHours(activePanel.busbarLabourHours || 6);
      setLabourRate(activePanel.busbarLabourRatePerHour || 85);
      setLabourCost(activePanel.busbarLabourCost || 510);
      setHardwareCost(activePanel.busbarHardwareCost || 0);
      setIsManualLabour(false);
    }
  }, [activePanel?.panelID, isQuickEditBusbar]);

  // Derived live quick busbar calculations
  const quickLiveCalc = useMemo(() => {
    const rawDensity = copperDensity || 0.00896;
    const density = rawDensity < 0.1 ? rawDensity : rawDensity / 1000;
    const singleBarKgM = Number((busbarWidth * busbarThickness * density).toFixed(4));
    const systemKgM = Number((singleBarKgM * busbarRuns * busbarPhases).toFixed(3));
    const totalWeight = Number((busbarLength * systemKgM).toFixed(2));
    const materialCost = Number((totalWeight * copperPrice).toFixed(2));
    const finalLabour = isManualLabour ? labourCost : Number((labourHours * labourRate).toFixed(2));
    const finalHardware = hardwareCost > 0 ? hardwareCost : Number((materialCost * 0.12).toFixed(2));
    const formulaTotal = Number((materialCost + finalLabour + finalHardware).toFixed(2));

    return {
      density,
      singleBarKgM,
      systemKgM,
      totalWeight,
      materialCost,
      finalLabour,
      finalHardware,
      formulaTotal,
    };
  }, [
    copperDensity,
    busbarWidth,
    busbarThickness,
    busbarRuns,
    busbarPhases,
    busbarLength,
    copperPrice,
    labourHours,
    labourRate,
    labourCost,
    isManualLabour,
    hardwareCost,
  ]);

  const handleSaveQuickBusbar = () => {
    if (!activePanel) return;
    const updated: EstimatePanel = {
      ...activePanel,
      busbarWidthMm: busbarWidth,
      busbarThicknessMm: busbarThickness,
      busbarRunsPerPhase: busbarRuns,
      busbarPhasesCount: busbarPhases,
      busbarTotalLengthMeters: busbarLength,
      copperCrossSectionMm2: busbarWidth * busbarThickness * busbarRuns,
      copperDensityKgDm3: copperDensity,
      copperWeightKg: quickLiveCalc.totalWeight,
      copperBaseRatePerKg: copperPrice,
      copperMaterialCost: quickLiveCalc.materialCost,
      busbarLabourHours: labourHours,
      busbarLabourRatePerHour: labourRate,
      busbarLabourCost: quickLiveCalc.finalLabour,
      busbarHardwareCost: quickLiveCalc.finalHardware,
      copperCost: quickLiveCalc.formulaTotal,
    };
    onUpdatePanel(updated);
    setIsQuickEditBusbar(false);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-800 font-bold text-sm">{project.projectCode}</span>
              <Badge variant="emerald" size="sm">{project.authority}</Badge>
              <Badge variant="purple" size="sm">{project.status}</Badge>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">{project.projectName}</h2>
            <p className="text-xs text-slate-500 font-sans">
              Client: <strong className="text-slate-800">{project.clientName}</strong> | Due: {project.dueDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {onNavigateToSLD && (
            <button
              onClick={() => onNavigateToSLD(activePanel?.panelID)}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
              title="Open Graphical SLD, 2D Panel GA Drawing, Door Facia & BOQ Studio"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full SLD & CAD Studio</span>
            </button>
          )}

          <button
            onClick={() => onNavigateToBOM(project)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-700" />
            <span>Project BOM</span>
          </button>

          <button
            onClick={() => onNavigateToQuotation(project)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-purple-700" />
            <span>Commercial Quotation</span>
          </button>
        </div>
      </div>

      {/* Project Financial Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Direct Panels</span>
          <span className="text-lg font-bold text-purple-800 flex items-center gap-1 mt-0.5">
            <Layers className="w-4 h-4" />
            {panels.length}
          </span>
          <span className="text-[10px] text-slate-400">Configured units</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Switchgear Breakers</span>
          <span className="text-lg font-bold text-cyan-800 mt-0.5 block">
            {totalEquipmentCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-slate-400">ACBs, MCCBs, MCBs</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Copper Busbars</span>
          <span className="text-lg font-bold text-amber-700 mt-0.5 block">
            {totalCopperCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-amber-800">{totalCopperKg} kg Cu</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Enclosures & Steel</span>
          <span className="text-lg font-bold text-blue-800 mt-0.5 block">
            {totalEnclosureCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-slate-400">Modular framework</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Assembly Labour</span>
          <span className="text-lg font-bold text-teal-800 mt-0.5 block">
            {totalLabourCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-teal-800">{totalLabourHours} hrs</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-xs">
          <span className="text-emerald-800 block text-[11px] font-semibold">Total Direct Cost</span>
          <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
            {totalProjectDirectCost.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
          </span>
          <span className="text-[10px] text-emerald-700">Raw factory cost</span>
        </div>
      </div>

      {/* Switchboard Panel Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {panels.map((p) => {
            const isSelected = p.panelID === (activePanel?.panelID);
            return (
              <button
                key={p.panelID}
                onClick={() => setSelectedPanelId(p.panelID)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                }`}
              >
                <span>{p.panelTag}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {p.incomerRating}A
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPickAssemblyOpen(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Pick fixed design panel (ATS, Capacitor Banks, Motor Starters) with ready final prices"
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pick Predefined Assembly</span>
          </button>

          <button
            onClick={() => {
              setPanelToEdit(null);
              setIsPanelModalOpen(true);
            }}
            className="bg-white hover:bg-slate-50 text-cyan-800 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-700" />
            <span>Add Custom Panel</span>
          </button>
        </div>
      </div>

      {/* Active Panel View */}
      {activePanel ? (
        <div className="space-y-4">
          {/* Active Panel Technical Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-cyan-800">{activePanel.panelTag}</span>
                  <Badge variant="blue" size="sm">{activePanel.panelTypeCode}</Badge>
                  <Badge variant="purple" size="sm">{activePanel.formOfSeparation}</Badge>
                  <Badge variant="cyan" size="sm">{activePanel.ipRating}</Badge>
                  <span className="text-slate-500 text-xs">
                    Cable Entry: <strong className="text-slate-800">{activePanel.cableEntry}</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{activePanel.panelName}</h3>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToSLD && (
                  <button
                    onClick={() => onNavigateToSLD(activePanel.panelID)}
                    className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                    title="Launch Single Line Diagram and 2D CAD Studio for this panel"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Design in SLD Studio</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setPanelToEdit(activePanel);
                    setIsPanelModalOpen(true);
                  }}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-2xs"
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
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
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
                <span className="text-slate-500 block text-[11px]">Incomer Rating</span>
                <span className="text-cyan-800 font-bold text-sm">{activePanel.incomerRating} Amps</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Short-Circuit (Icu/Icw)</span>
                <span className="text-slate-900 font-bold text-sm">{activePanel.shortCircuitRating} kA (1s)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Dimensions (H×W×D)</span>
                <span className="text-slate-900 font-bold text-xs">
                  {activePanel.enclosureHeight}×{activePanel.enclosureWidth}×{activePanel.enclosureDepth} mm
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Columns / Tiers</span>
                <span className="text-slate-900 font-bold text-sm">{activePanel.numberOfColumns} Columns</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Calculated Copper</span>
                <span className="text-amber-700 font-bold text-sm">{activePanel.copperWeightKg} kg Cu</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Assembly Hours</span>
                <span className="text-teal-800 font-bold text-sm">{activePanel.labourHours} hrs</span>
              </div>
            </div>

            {/* Active Panel Cost Breakdown Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Switchgear Breakers</span>
                <span className="font-bold text-cyan-800 text-xs">{activePanel.equipmentCost.toLocaleString()} AED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Copper Busbars</span>
                <span className="font-bold text-amber-700 text-xs">{activePanel.copperCost.toLocaleString()} AED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Enclosure Structure</span>
                <span className="font-bold text-blue-800 text-xs">{activePanel.enclosureCost.toLocaleString()} AED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Assembly Labour</span>
                <span className="font-bold text-teal-800 text-xs">{activePanel.labourCost.toLocaleString()} AED</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-emerald-800 font-semibold block">Total Panel Cost</span>
                <span className="font-bold text-emerald-800 text-sm">{activePanel.totalPanelCost.toLocaleString()} AED</span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Feeder Items, Copper Sizing, Enclosure, Labour */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('feeders')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'feeders'
                    ? 'border-cyan-600 text-cyan-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Circuit Feeders & Breakers ({activePanel.items.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('busbars')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'busbars'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Copper Busbar Sizing ({activePanel.copperWeightKg} kg)</span>
              </button>

              <button
                onClick={() => setActiveTab('enclosure')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'enclosure'
                    ? 'border-blue-600 text-blue-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Enclosure & Fabrication</span>
              </button>

              <button
                onClick={() => setActiveTab('labour')}
                className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'labour'
                    ? 'border-teal-600 text-teal-800'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
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
                  <span className="text-xs text-slate-500">
                    Circuits, incomer ACBs, outgoing MCCBs/MCBs, capacitors & metering:
                  </span>
                  <button
                    onClick={() => setIsAddFeederOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Circuit Feeder</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl bg-white overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
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
                    <tbody className="divide-y divide-slate-100">
                      {activePanel.items.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No circuit feeders configured in this panel yet. Click "Add Circuit Feeder" to select components from catalog.
                          </td>
                        </tr>
                      ) : (
                        activePanel.items.map((item) => (
                          <tr key={item.itemID} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-3 font-bold text-cyan-800 whitespace-nowrap">
                              {item.circuitTag}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900">{item.partNumber}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {item.manufacturerCode || 'OEM'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-700">
                              {item.description}
                              {item.supplierName && (
                                <span className="text-[10px] text-slate-400 block">
                                  Supplier: {item.supplierName}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                              {item.rating || '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-800">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-700 whitespace-nowrap">
                              {item.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                              {item.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => onDeleteItemFromPanel(activePanel.panelID, item.itemID)}
                                className="text-slate-400 hover:text-red-600 transition p-1"
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
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                        <tr>
                          <td colSpan={6} className="py-2 px-3 text-right text-slate-600">
                            Total Equipment & Circuit Items Cost:
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-700">
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

            {/* TAB 2: Copper Busbar Engineering & Fabrication */}
            {activeTab === 'busbars' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-300 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        Copper Busbar Sizing & Labour Provision
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        IEC 61439-1/2
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Formula: Total Length Used per Panel (m) × Density based on Dimensions (kg/meter) × Applied Copper Price (AED/kg) = Cost of Busbar + Labour Charges
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickEditBusbar(!isQuickEditBusbar)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                        isQuickEditBusbar
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isQuickEditBusbar ? 'Close Quick Edit' : 'Quick Adjust Busbar & Labour'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPanelToEdit(activePanel);
                        setIsPanelModalOpen(true);
                      }}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      title="Open full panel modal for detailed sizing and catalogue presets"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configure Busbar in Detail</span>
                    </button>
                  </div>
                </div>

                {/* Quick Inline Busbar Adjustment Panel */}
                {isQuickEditBusbar && (
                  <div className="bg-white border-2 border-amber-400 p-4 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-amber-600" />
                        Quick Adjust Busbar Calculation for {activePanel.panelTag}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700">
                        Live Preview: {quickLiveCalc.formulaTotal.toLocaleString()} AED ({quickLiveCalc.totalWeight} kg Cu)
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Quick Rating Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => { setBusbarWidth(40); setBusbarThickness(10); setBusbarRuns(1); }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition"
                      >
                        400A (40×10×1)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBusbarWidth(50); setBusbarThickness(10); setBusbarRuns(2); }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition"
                      >
                        800A (50×10×2)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBusbarWidth(80); setBusbarThickness(10); setBusbarRuns(2); }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition"
                      >
                        1600A (80×10×2)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBusbarWidth(100); setBusbarThickness(10); setBusbarRuns(2); }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition"
                      >
                        2500A (100×10×2)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBusbarWidth(100); setBusbarThickness(10); setBusbarRuns(3); }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition"
                      >
                        3200A (100×10×3)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBusbarWidth(100); setBusbarThickness(10); setBusbarRuns(4); }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded border border-slate-300 transition"
                      >
                        4000A (100×10×4)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total Length (m) *</label>
                        <input
                          type="number"
                          step={0.1}
                          min={0.1}
                          value={busbarLength}
                          onChange={(e) => setBusbarLength(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">Linear meters used</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Width (mm) *</label>
                        <input
                          type="number"
                          step={5}
                          min={10}
                          value={busbarWidth}
                          onChange={(e) => setBusbarWidth(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">e.g. 40, 50, 80, 100</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Thickness (mm) *</label>
                        <input
                          type="number"
                          step={1}
                          min={2}
                          value={busbarThickness}
                          onChange={(e) => setBusbarThickness(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">e.g. 5, 10 mm</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Runs/Phase *</label>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          value={busbarRuns}
                          onChange={(e) => setBusbarRuns(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">1 to 4 runs</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Conductors *</label>
                        <select
                          value={busbarPhases}
                          onChange={(e) => setBusbarPhases(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        >
                          <option value={4}>4 (3P+N)</option>
                          <option value={5}>5 (3P+N+PE)</option>
                          <option value={3}>3 (3P)</option>
                        </select>
                        <span className="text-[10px] text-slate-500">Conductors in run</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-700 font-bold">Copper Density (kg/meter) *</label>
                          {copperDensity !== 0.00896 && (
                            <button
                              type="button"
                              onClick={() => setCopperDensity(0.00896)}
                              className="text-[10px] text-cyan-700 underline font-semibold cursor-pointer"
                              title="Reset to 0.00896"
                            >
                              Reset 0.00896
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={copperDensity}
                          onChange={(e) => setCopperDensity(Number(e.target.value))}
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">Std: 0.00896 kg/m</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Applied Copper Price (AED/kg) *</label>
                        <input
                          type="number"
                          step={0.5}
                          value={copperPrice}
                          onChange={(e) => setCopperPrice(Number(e.target.value))}
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-amber-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">Manual market rate</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Labour Hours (hrs)</label>
                        <input
                          type="number"
                          step={0.5}
                          value={labourHours}
                          onChange={(e) => {
                            const hrs = Number(e.target.value);
                            setLabourHours(hrs);
                            if (!isManualLabour) {
                              setLabourCost(Number((hrs * labourRate).toFixed(2)));
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">Technician fabrication</span>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Labour Rate (AED/hr)</label>
                        <input
                          type="number"
                          step={5}
                          value={labourRate}
                          onChange={(e) => {
                            const rate = Number(e.target.value);
                            setLabourRate(rate);
                            if (!isManualLabour) {
                              setLabourCost(Number((labourHours * rate).toFixed(2)));
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">Standard: 85 AED/hr</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-800 font-bold">Labour Charges (AED) *</label>
                          {isManualLabour && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsManualLabour(false);
                                setLabourCost(Number((labourHours * labourRate).toFixed(2)));
                              }}
                              className="text-[10px] text-cyan-700 underline font-semibold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          step={10}
                          value={isManualLabour ? labourCost : quickLiveCalc.finalLabour}
                          onChange={(e) => {
                            setIsManualLabour(true);
                            setLabourCost(Number(e.target.value));
                          }}
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 block">
                          {isManualLabour ? 'Manual override applied' : `${labourHours} hrs × ${labourRate} AED/hr`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-slate-200 gap-2">
                      <div className="text-xs text-slate-600 space-x-3">
                        <span>Density: <strong className="text-amber-800 font-bold">{quickLiveCalc.systemKgM} kg/meter</strong></span>
                        <span>|</span>
                        <span>Weight: <strong className="text-amber-800 font-bold">{quickLiveCalc.totalWeight} kg</strong></span>
                        <span>|</span>
                        <span>Material: <strong className="text-amber-800 font-bold">{quickLiveCalc.materialCost.toLocaleString()} AED</strong></span>
                        <span>|</span>
                        <span>Labour: <strong className="text-teal-800 font-bold">{quickLiveCalc.finalLabour.toLocaleString()} AED</strong></span>
                        <span>|</span>
                        <span>Total: <strong className="text-emerald-800 font-bold text-sm">{quickLiveCalc.formulaTotal.toLocaleString()} AED</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsQuickEditBusbar(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveQuickBusbar}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Busbar Changes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Busbar Engineering Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card 1: Dimensions & Sizing */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-amber-800 font-bold block text-xs flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      1. Dimensions & Rating
                    </span>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Busbar Section:</span>
                        <span className="font-bold text-amber-800">
                          {activePanel.busbarRunsPerPhase || 2}x ({activePanel.busbarWidthMm || 80}x{activePanel.busbarThicknessMm || 10}) mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cross-Section:</span>
                        <span className="font-bold text-slate-900">
                          {activePanel.copperCrossSectionMm2 || ((activePanel.busbarWidthMm || 80) * (activePanel.busbarThicknessMm || 10) * (activePanel.busbarRunsPerPhase || 2))} mm²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Incomer Current:</span>
                        <span className="font-bold text-slate-900">{activePanel.incomerRating} Amps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Density:</span>
                        <span className="font-bold text-slate-900">{activePanel.busbarCurrentDensity || 1.5} A/mm²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Conductors:</span>
                        <span className="font-bold text-slate-900">{activePanel.busbarPhasesCount || 4} Conductors (3P+N)</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Physical Run & Weight */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-amber-800 font-bold block text-xs flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      2. Length & Copper Weight
                    </span>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Length Used:</span>
                        <span className="font-bold text-slate-900">{activePanel.busbarTotalLengthMeters || 5.5} meters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Copper Density:</span>
                        <span className="font-bold text-slate-900">
                          {activePanel.copperDensityKgDm3 
                            ? (activePanel.copperDensityKgDm3 < 0.1 ? activePanel.copperDensityKgDm3 : Number((activePanel.copperDensityKgDm3 / 1000).toFixed(5))) 
                            : 0.00896} kg/meter
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Single Bar Density:</span>
                        <span className="font-bold text-slate-900">
                          {((activePanel.busbarWidthMm || 80) * (activePanel.busbarThicknessMm || 10) * (activePanel.copperDensityKgDm3 ? (activePanel.copperDensityKgDm3 < 0.1 ? activePanel.copperDensityKgDm3 : activePanel.copperDensityKgDm3 / 1000) : 0.00896)).toFixed(4)} kg/meter
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">System Density:</span>
                        <span className="font-bold text-slate-900">
                          {(((activePanel.busbarWidthMm || 80) * (activePanel.busbarThicknessMm || 10) * (activePanel.copperDensityKgDm3 ? (activePanel.copperDensityKgDm3 < 0.1 ? activePanel.copperDensityKgDm3 : activePanel.copperDensityKgDm3 / 1000) : 0.00896)) * (activePanel.busbarRunsPerPhase || 2) * (activePanel.busbarPhasesCount || 4)).toFixed(3)} kg/meter
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-700 font-bold">Total Copper Weight:</span>
                        <span className="font-black text-amber-700">{activePanel.copperWeightKg} kg Cu</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Material Cost */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-amber-800 font-bold block text-xs flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5 text-amber-600" />
                      3. Applied Copper Cost
                    </span>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Applied Copper Price:</span>
                        <span className="font-bold text-amber-900">{activePanel.copperBaseRatePerKg || 42.0} AED/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Copper Material Cost:</span>
                        <span className="font-bold text-slate-900">
                          {(activePanel.copperMaterialCost || (activePanel.copperWeightKg * (activePanel.copperBaseRatePerKg || 42.0))).toLocaleString()} AED
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Formula Check:</span>
                        <span className="text-[10px] text-slate-500">
                          {activePanel.copperWeightKg} kg × {activePanel.copperBaseRatePerKg || 42.0} AED
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Purity Standard:</span>
                        <span className="font-bold text-slate-800">Cu-ETP 99.9%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Provision for Labour & Total */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-amber-800 font-bold block text-xs flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      4. Labour & Total Cost
                    </span>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Labour Hours:</span>
                        <span className="font-bold text-teal-800">{activePanel.busbarLabourHours || 6.0} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Labour Rate:</span>
                        <span className="font-bold text-slate-900">{activePanel.busbarLabourRatePerHour || 85.0} AED/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Labour Provision:</span>
                        <span className="font-bold text-teal-800">{(activePanel.busbarLabourCost || 510.0).toLocaleString()} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hardware & Sleeving:</span>
                        <span className="font-bold text-slate-900">{((activePanel.busbarHardwareCost || (activePanel.copperCost * 0.12))).toFixed(0)} AED</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-amber-800">
                        <span>Total Busbar Cost:</span>
                        <span className="text-sm font-extrabold">{activePanel.copperCost.toLocaleString()} AED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Formula Callout */}
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <Calculator className="w-3.5 h-3.5" />
                      Formula Step Calculation for {activePanel.panelTag}:
                    </span>
                    <p className="text-slate-300 text-[11px] font-sans">
                      [ {activePanel.busbarTotalLengthMeters || 5.5} m length ] × [ {(((activePanel.busbarWidthMm || 80) * (activePanel.busbarThicknessMm || 10) * (activePanel.copperDensityKgDm3 ? (activePanel.copperDensityKgDm3 < 0.1 ? activePanel.copperDensityKgDm3 : activePanel.copperDensityKgDm3 / 1000) : 0.00896)) * (activePanel.busbarRunsPerPhase || 2) * (activePanel.busbarPhasesCount || 4)).toFixed(3)} kg/meter system density ] = <strong>{activePanel.copperWeightKg} kg Cu</strong>
                      <span className="mx-2 text-slate-500">|</span>
                      [ {activePanel.copperWeightKg} kg × {activePanel.copperBaseRatePerKg || 42.0} AED/kg ] = <strong>{(activePanel.copperMaterialCost || (activePanel.copperWeightKg * (activePanel.copperBaseRatePerKg || 42.0))).toLocaleString()} AED Material</strong>
                      <span className="mx-2 text-slate-500">+</span>
                      <strong>{(activePanel.busbarLabourCost || 510.0).toLocaleString()} AED Labour Charges</strong>
                    </p>
                  </div>

                  <div className="text-right whitespace-nowrap bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Total Busbar Package</span>
                    <span className="text-amber-400 font-black text-sm">{activePanel.copperCost.toLocaleString()} AED</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Enclosure Fabrication & Brand Sizing */}
            {activeTab === 'enclosure' && (
              <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Enclosure Brand:</span>
                      <span className="font-bold text-xs text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                        {activePanel.enclosureBrand || 'Standard Modular System'}
                      </span>
                      {activePanel.enclosureModel && (
                        <span className="text-xs text-slate-600 font-sans font-medium">
                          ({activePanel.enclosureModel})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Part No: <strong className="text-slate-700">{activePanel.enclosurePartNumber || 'N/A'}</strong> |
                      Price Source:{' '}
                      {activePanel.isCustomEnclosurePrice ? (
                        <span className="text-amber-700 font-bold">Custom Negotiated Price Override</span>
                      ) : activePanel.enclosureSource === 'CATALOGUE' ? (
                        <span className="text-emerald-700 font-bold">Same as listed in Database</span>
                      ) : (
                        <span className="text-slate-700 font-bold">Standard Engineered Formula</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPanelToEdit(activePanel);
                        setIsPanelModalOpen(true);
                      }}
                      className="bg-white hover:bg-slate-50 text-blue-800 border border-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Select Different Brand / Size</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-blue-800 font-bold block text-xs">Cubicle Carcass Dimensions</span>
                    <div className="text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Height:</span>
                        <span className="font-bold text-slate-900">{activePanel.enclosureHeight} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Width:</span>
                        <span className="font-bold text-slate-900">{activePanel.enclosureWidth} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Depth:</span>
                        <span className="font-bold text-slate-900">{activePanel.enclosureDepth} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Columns / Tiers:</span>
                        <span className="font-bold text-slate-900">{activePanel.numberOfColumns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sheet Steel:</span>
                        <span className="font-bold text-slate-900">{activePanel.sheetMetalThickness || 2.0} mm Electro-galv</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-blue-800 font-bold block text-xs">Finishing & Protection</span>
                    <div className="text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Separation Form:</span>
                        <span className="font-bold text-purple-800">{activePanel.formOfSeparation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ingress Protection:</span>
                        <span className="font-bold text-cyan-800">{activePanel.ipRating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paint Finish:</span>
                        <span className="font-bold text-slate-900">RAL 7035 Powder (70µ)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plinth Base:</span>
                        <span className="font-bold text-slate-900">100 mm channel plinth</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800 font-bold block text-xs">Enclosure Valuation</span>
                      {activePanel.isCustomEnclosurePrice ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Custom Override</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Database Listed</span>
                      )}
                    </div>
                    <div className="text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Brand / OEM:</span>
                        <span className="font-bold text-slate-900">{activePanel.enclosureBrand || 'Alfanar / RR / ABB'}</span>
                      </div>
                      {activePanel.catalogueEnclosurePrice ? (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Database Listed Rate:</span>
                          <span className="font-bold text-slate-900">{activePanel.catalogueEnclosurePrice.toLocaleString()} AED</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cost Application:</span>
                        <span className="font-bold text-slate-900">
                          {activePanel.isCustomEnclosurePrice ? 'Custom Overridden' : 'Direct Database Price'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-blue-800 text-sm">
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
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Factory assembly, busbar fabrication, wiring, testing & engineering hours:</span>
                  <Badge variant="teal" size="md">{activePanel.labourHours} Hours Total</Badge>
                </div>

                <div className="border border-slate-200 rounded-xl bg-white overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Activity Code</th>
                        <th className="py-2 px-3">Labour Activity Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Allocated Hours</th>
                        <th className="py-2 px-3 text-right">Hourly Rate</th>
                        <th className="py-2 px-3 text-right">Total Labour Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activePanel.labourHoursDetail?.map((labour) => (
                        <tr key={labour.activityCode} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-cyan-800 font-bold">{labour.activityCode}</td>
                          <td className="py-2 px-3 text-slate-900">{labour.activityName}</td>
                          <td className="py-2 px-3 text-slate-500">{labour.category}</td>
                          <td className="py-2 px-3 text-right font-bold text-teal-800">{labour.hours} hrs</td>
                          <td className="py-2 px-3 text-right text-slate-500">{labour.ratePerHour} AED/hr</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{labour.totalCost.toLocaleString()} AED</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right text-slate-600">Total Assembly Labour:</td>
                        <td className="py-2 px-3 text-right text-teal-800">{activePanel.labourHours} hrs</td>
                        <td></td>
                        <td className="py-2 px-3 text-right text-teal-800">{activePanel.labourCost.toLocaleString()} AED</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
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
        components={components}
      />

      {/* Pick Predefined Assembly Modal */}
      <PickAssemblyModal
        isOpen={isPickAssemblyOpen}
        onClose={() => setIsPickAssemblyOpen(false)}
        projects={[project]}
        activeProject={project}
        onAssemblyPicked={(addedPanels) => {
          if (addedPanels.length > 0) {
            setSelectedPanelId(addedPanels[0].panelID);
            onAddPanel(addedPanels[0]);
          }
        }}
      />
    </div>
  );
};
