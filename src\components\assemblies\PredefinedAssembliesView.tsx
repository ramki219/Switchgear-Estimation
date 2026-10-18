import React, { useState, useMemo } from 'react';
import { 
  PredefinedAssembly, 
  AssemblyCategory, 
  Project, 
  EstimatePanel,
  Component 
} from '../../types';
import { storageService } from '../../services/storageService';
import { Badge } from '../common/Badge';
import { PickAssemblyModal } from '../estimation/PickAssemblyModal';
import { EditAssemblyModal } from './EditAssemblyModal';
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Cpu, 
  Box, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Sliders, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  Building2,
  Table,
  LayoutGrid,
  Info,
  RotateCcw,
  Edit3
} from 'lucide-react';

interface PredefinedAssembliesViewProps {
  projects: Project[];
  activeProject?: Project | null;
  components?: Component[];
  onSelectProject?: (project: Project) => void;
  onNavigateToWorkspace?: (project: Project) => void;
}

export const PredefinedAssembliesView: React.FC<PredefinedAssembliesViewProps> = ({
  projects,
  activeProject,
  components = [],
  onSelectProject,
  onNavigateToWorkspace,
}) => {
  const [assemblies, setAssemblies] = useState<PredefinedAssembly[]>(() => 
    storageService.getPredefinedAssemblies()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOEM, setSelectedOEM] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Simulation parameters for dynamic ready final price check
  const [simMarginPercent, setSimMarginPercent] = useState<number>(15);
  const [simOverheadPercent, setSimOverheadPercent] = useState<number>(8);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(false);

  // Pick Modal state
  const [isPickModalOpen, setIsPickModalOpen] = useState<boolean>(false);
  const [assemblyToPick, setAssemblyToPick] = useState<PredefinedAssembly | null>(null);

  // Edit Assembly state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [assemblyToEdit, setAssemblyToEdit] = useState<PredefinedAssembly | null>(null);

  // Detail Modal for BOM inspection
  const [inspectAssembly, setInspectAssembly] = useState<PredefinedAssembly | null>(null);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAssemblySaved = (updated: PredefinedAssembly) => {
    const fresh = storageService.getPredefinedAssemblies();
    setAssemblies(fresh);
    if (inspectAssembly && inspectAssembly.id === updated.id) {
      setInspectAssembly(updated);
    }
    showToast(`Assembly ${updated.code} - ${updated.name} updated! Ready Price: ${updated.readyFinalPrice.toLocaleString()} AED`);
  };

  // OEMs list
  const oemList = useMemo(() => {
    const set = new Set<string>();
    assemblies.forEach(a => {
      if (a.primaryOEM) set.add(a.primaryOEM);
    });
    return Array.from(set);
  }, [assemblies]);

  // Filter assemblies
  const filteredAssemblies = useMemo(() => {
    return assemblies.filter(a => {
      const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
      const matchOEM = selectedOEM === 'ALL' || a.primaryOEM === selectedOEM;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q ||
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.rating.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.authorityCompliance.some(auth => auth.toLowerCase().includes(q));
      return matchCat && matchOEM && matchQuery;
    });
  }, [assemblies, selectedCategory, selectedOEM, searchQuery]);

  // Aggregate Category Stats
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: assemblies.length };
    assemblies.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [assemblies]);

  // Price calculation helper (with simulation override support)
  const getComputedPrice = (assembly: PredefinedAssembly) => {
    if (!isSimulatorActive) {
      return {
        directCost: assembly.totalDirectCost,
        overheadPct: assembly.overheadPercent,
        marginPct: assembly.profitMarginPercent,
        readyPrice: assembly.readyFinalPrice,
      };
    }
    const directCost = assembly.totalDirectCost;
    const overhead = directCost * (simOverheadPercent / 100);
    const subtotal = directCost + overhead;
    const margin = subtotal * (simMarginPercent / 100);
    const readyPrice = Math.round(subtotal + margin);

    return {
      directCost,
      overheadPct: simOverheadPercent,
      marginPct: simMarginPercent,
      readyPrice,
    };
  };

  // Handle Pick into project
  const handleOpenPick = (assembly: PredefinedAssembly) => {
    setAssemblyToPick(assembly);
    setIsPickModalOpen(true);
  };

  const handleAssemblyPicked = (addedPanels: EstimatePanel[], targetProject: Project) => {
    showToast(`Successfully added ${addedPanels.length} panel(s) [${addedPanels.map(p => p.panelTag).join(', ')}] into project ${targetProject.projectCode}!`);
    if (onSelectProject) {
      onSelectProject(targetProject);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Assembly Code',
      'Assembly Name',
      'Category',
      'Rating',
      'Incomer Rating (A)',
      'Primary OEM',
      'Form of Separation',
      'IP Rating',
      'Enclosure Dimensions',
      'Equipment Cost (AED)',
      'Copper Cost (AED)',
      'Copper Weight (kg)',
      'Enclosure Cost (AED)',
      'Labour Cost (AED)',
      'Labour Hours',
      'Total Direct Cost (AED)',
      'Profit Margin (%)',
      'Ready Final Price (AED)',
      'Compliance'
    ];

    const rows = filteredAssemblies.map(a => {
      const calc = getComputedPrice(a);
      return [
        `"${a.code}"`,
        `"${a.name}"`,
        `"${a.category}"`,
        `"${a.rating}"`,
        a.incomerRating,
        `"${a.primaryOEM}"`,
        `"${a.formOfSeparation}"`,
        `"${a.ipRating}"`,
        `"${a.enclosureDimensions}"`,
        a.equipmentCost,
        a.copperCost,
        a.copperWeightKg,
        a.enclosureCost,
        a.labourCost,
        a.labourHours,
        calc.directCost,
        calc.marginPct,
        calc.readyPrice,
        `"${a.authorityCompliance.join(', ')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Predefined_Fixed_Assemblies_Price_List_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported predefined assemblies price list to CSV');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-emerald-100 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Predefined Standard Assemblies & Ready Final Prices
                </h1>
                <Badge variant="cyan" size="md">Fixed Design Library</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Standardized switchgear designs ready to quote immediately or pick directly into projects with pre-engineered BOMs, copper sizing, and factory labour.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setIsSimulatorActive(!isSimulatorActive)}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                isSimulatorActive
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Toggle Live Price Simulation by adjusting global target profit margins & overheads"
            >
              <Sliders className="w-4 h-4 text-amber-700" />
              <span>{isSimulatorActive ? 'Simulation Active' : 'Simulate Margins'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Price List (CSV)</span>
            </button>

            <button
              onClick={() => {
                const newTpl: PredefinedAssembly = {
                  id: `STD-CUSTOM-${Date.now()}`,
                  code: 'STD-CUSTOM-01',
                  name: 'New Custom Fixed Assembly',
                  category: 'ATS',
                  rating: '250A 4P',
                  description: 'Standard factory engineered switchgear panel assembly',
                  incomerRating: 250,
                  panelTypeCode: 'ATS',
                  ratedVoltage: 415,
                  shortCircuitRating: 36,
                  formOfSeparation: 'Form 2b',
                  ipRating: 'IP54',
                  enclosureDimensions: '1800 x 800 x 600 mm',
                  enclosureBrand: 'RR Global',
                  primaryOEM: 'ABB',
                  authorityCompliance: ['DEWA', 'ADDC'],
                  equipmentCost: 0,
                  copperCost: 1800,
                  enclosureCost: 2400,
                  labourCost: 1200,
                  labourHours: 14,
                  totalDirectCost: 5400,
                  overheadPercent: 8,
                  profitMarginPercent: 15,
                  readyFinalPrice: 6800,
                  copperWeightKg: 40,
                  enclosureHeight: 1800,
                  enclosureWidth: 800,
                  enclosureDepth: 600,
                  numberOfColumns: 1,
                  cableEntry: 'BOTTOM',
                  leadTimeWeeks: 4,
                  items: []
                };
                setAssemblyToEdit(newTpl);
                setIsEditModalOpen(true);
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>New Assembly</span>
            </button>

            <button
              onClick={() => {
                setAssemblyToPick(assemblies[0] || null);
                setIsPickModalOpen(true);
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Pick into Project</span>
            </button>
          </div>
        </div>

        {/* Live Simulator Strip (collapsible / toggleable) */}
        {isSimulatorActive && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Live Commercial Price Simulation:</span>
              <span className="text-amber-800 font-normal">
                Recalculating all ready final prices in real time based on your target margin.
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Overhead %:</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={simOverheadPercent}
                  onChange={(e) => setSimOverheadPercent(Number(e.target.value) || 0)}
                  className="w-16 p-1.5 bg-white border border-amber-300 rounded font-bold text-center text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600">Target Profit Margin %:</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={simMarginPercent}
                  onChange={(e) => setSimMarginPercent(Number(e.target.value) || 0)}
                  className="w-16 p-1.5 bg-white border border-amber-300 rounded font-bold text-center text-emerald-700"
                />
              </div>

              <button
                onClick={() => {
                  setSimMarginPercent(15);
                  setSimOverheadPercent(8);
                }}
                className="p-1.5 text-amber-800 hover:text-amber-950 flex items-center gap-1 underline text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards: Categories & Ready Price Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>ATS Changeover Panels</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {categoryCounts['ATS'] || 0} <span className="text-xs font-normal text-slate-500">models</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
            63A to 1600A 4P motorized
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Capacitor Banks (APFC)</span>
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {categoryCounts['CAPACITOR_BANK'] || 0} <span className="text-xs font-normal text-slate-500">models</span>
          </div>
          <span className="text-[11px] text-cyan-700 font-semibold mt-0.5 block">
            50 kvar to 300 kvar (7% detuned)
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Motor Starters / VFD</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {categoryCounts['MOTOR_STARTER'] || 0} <span className="text-xs font-normal text-slate-500">models</span>
          </div>
          <span className="text-[11px] text-purple-700 font-semibold mt-0.5 block">
            DOL, Star-Delta, VFD & Soft Start
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ready Price Coverage</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-800">
            6.5k - 132k <span className="text-xs font-normal text-slate-500">AED</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            DEWA / SEWA / ADDC Compliant
          </span>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 font-mono">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by model, incomer rating, kW, OEM (ABB, Schneider), or compliance (DEWA, SEWA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* OEM Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">OEM:</span>
            <select
              value={selectedOEM}
              onChange={(e) => setSelectedOEM(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-bold focus:outline-hidden"
            >
              <option value="ALL">All OEMs</option>
              {oemList.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid' ? 'bg-white text-cyan-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table' ? 'bg-white text-cyan-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Comparison Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
          {[
            { key: 'ALL', label: 'All Fixed Assemblies' },
            { key: 'METER_CABINET', label: 'Meter Cabinets (DEWA / SEWA / ADDC)' },
            { key: 'ATS', label: 'Automatic Transfer Switches (ATS)' },
            { key: 'CAPACITOR_BANK', label: 'Capacitor Banks (APFC)' },
            { key: 'MOTOR_STARTER', label: 'Motor Starter Panels (MCC)' },
            { key: 'SMDB', label: 'Sub-Main Distribution Boards (SMDB)' },
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === cat.key
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.key ? 'bg-cyan-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {categoryCounts[cat.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssemblies.map(assembly => {
            const pricing = getComputedPrice(assembly);
            return (
              <div
                key={assembly.id}
                className="bg-white border border-slate-200 hover:border-cyan-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group font-sans"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-800">
                          {assembly.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {assembly.panelTypeCode}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {assembly.primaryOEM}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-cyan-700 transition">
                        {assembly.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {assembly.description}
                      </p>
                    </div>
                  </div>

                  {/* Ready Final Price Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50/50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block">
                          Ready Final Price
                        </span>
                        <span className="text-xl font-mono font-bold text-emerald-800">
                          {pricing.readyPrice.toLocaleString()} <span className="text-xs font-normal">AED</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 block">
                          +{pricing.marginPct}% Margin
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                          Direct: {pricing.directCost.toLocaleString()} AED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs Grid */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rating:</span>
                      <strong className="text-slate-800">{assembly.rating}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Separation Form:</span>
                      <strong className="text-slate-800">{assembly.formOfSeparation}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Enclosure:</span>
                      <strong className="text-slate-800">{assembly.enclosureDimensions}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Protection:</span>
                      <strong className="text-slate-800">{assembly.ipRating} ({assembly.shortCircuitRating} kA)</strong>
                    </div>
                  </div>

                  {/* Cost Elements Breakdown */}
                  <div className="mt-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block">OEM Eq.</span>
                      <span className="font-bold text-slate-800">{assembly.equipmentCost.toLocaleString()}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-amber-800 block">Copper</span>
                      <span className="font-bold text-amber-800">{assembly.copperCost.toLocaleString()}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-blue-800 block">Encl.</span>
                      <span className="font-bold text-blue-800">{assembly.enclosureCost.toLocaleString()}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-teal-800 block">Labour</span>
                      <span className="font-bold text-teal-800">{assembly.labourCost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Authority Compliance Badges */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {assembly.authorityCompliance.map(auth => (
                      <span key={auth} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {auth}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectAssembly(assembly)}
                      className="text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1 p-1 text-xs"
                    >
                      <span>BOM ({assembly.items.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setAssemblyToEdit(assembly);
                        setIsEditModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-md transition flex items-center gap-1 border border-slate-200 cursor-pointer"
                      title="Edit assembly parameters & components list"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenPick(assembly)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pick into Project</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table Comparison View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Assembly & Model</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Rating / Size</th>
                  <th className="py-3 px-3">OEM</th>
                  <th className="py-3 px-3">Enclosure (H x W x D)</th>
                  <th className="py-3 px-3 text-right">Equipment (AED)</th>
                  <th className="py-3 px-3 text-right">Copper (AED)</th>
                  <th className="py-3 px-3 text-right">Enclosure (AED)</th>
                  <th className="py-3 px-3 text-right">Labour (AED)</th>
                  <th className="py-3 px-3 text-right">Direct Cost</th>
                  <th className="py-3 px-4 text-right">Ready Final Price</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssemblies.map(assembly => {
                  const pricing = getComputedPrice(assembly);
                  return (
                    <tr key={assembly.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-cyan-800 block">{assembly.code}</span>
                        <span className="text-[11px] text-slate-700 font-sans font-medium line-clamp-1">
                          {assembly.name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {assembly.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {assembly.rating}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {assembly.primaryOEM}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        {assembly.enclosureDimensions}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {assembly.equipmentCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-800">
                        {assembly.copperCost.toLocaleString()}
                        <span className="text-[9px] text-slate-400 block">{assembly.copperWeightKg}kg</span>
                      </td>
                      <td className="py-3 px-3 text-right text-blue-800">
                        {assembly.enclosureCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-teal-800">
                        {assembly.labourCost.toLocaleString()}
                        <span className="text-[9px] text-slate-400 block">{assembly.labourHours}h</span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-900">
                        {pricing.directCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-sm text-emerald-700 block">
                          {pricing.readyPrice.toLocaleString()} AED
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          +{pricing.marginPct}% margin
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setInspectAssembly(assembly)}
                            className="p-1.5 text-slate-400 hover:text-cyan-700 rounded transition cursor-pointer"
                            title="Inspect Bill of Materials"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setAssemblyToEdit(assembly);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-700 rounded transition cursor-pointer"
                            title="Edit assembly & components"
                          >
                            <Edit3 className="w-4 h-4 text-cyan-600" />
                          </button>
                          <button
                            onClick={() => handleOpenPick(assembly)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Pick</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAssemblies.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
          No predefined assemblies match the filter criteria.
        </div>
      )}

      {/* Pick Assembly Modal */}
      <PickAssemblyModal
        isOpen={isPickModalOpen}
        onClose={() => setIsPickModalOpen(false)}
        projects={projects}
        activeProject={activeProject}
        onAssemblyPicked={handleAssemblyPicked}
      />

      {/* Inspect BOM Modal */}
      {inspectAssembly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden font-sans">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-800">
                    {inspectAssembly.code}
                  </span>
                  <Badge variant="cyan" size="sm">Standard BOM Items</Badge>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {inspectAssembly.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectAssembly(null)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Ready Final Price</span>
                  <span className="text-lg font-bold text-emerald-800">
                    {inspectAssembly.readyFinalPrice.toLocaleString()} AED
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Direct Cost</span>
                  <span className="text-sm font-bold text-slate-800">
                    {inspectAssembly.totalDirectCost.toLocaleString()} AED
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="text-[11px] text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-2">Tag</th>
                      <th className="py-2 px-2">Description</th>
                      <th className="py-2 px-2">Part Number</th>
                      <th className="py-2 px-2">OEM</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2 text-right">Unit (AED)</th>
                      <th className="py-2 px-2 text-right">Total (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectAssembly.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-2 font-bold text-cyan-800">{item.circuitTag}</td>
                        <td className="py-2 px-2 font-sans text-slate-700">{item.description}</td>
                        <td className="py-2 px-2 text-slate-500">{item.partNumber}</td>
                        <td className="py-2 px-2 font-semibold text-emerald-700">{item.manufacturerCode}</td>
                        <td className="py-2 px-2 text-right">{item.quantity} {item.unit}</td>
                        <td className="py-2 px-2 text-right">{item.unitCost.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900">{item.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500">
                {inspectAssembly.items.length} items in fixed design
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = inspectAssembly;
                    setInspectAssembly(null);
                    setAssemblyToEdit(target);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Edit Components & Design</span>
                </button>
                <button
                  onClick={() => setInspectAssembly(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = inspectAssembly;
                    setInspectAssembly(null);
                    handleOpenPick(target);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
                >
                  Pick into Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Predefined Assembly Modal (Add/Edit Components from Master Catalog) */}
      <EditAssemblyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setAssemblyToEdit(null);
        }}
        assembly={assemblyToEdit}
        onSave={handleAssemblySaved}
        allComponents={components}
      />
    </div>
  );
};
