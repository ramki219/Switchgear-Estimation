import React, { useState, useMemo } from 'react';
import { PredefinedAssembly, AssemblyCategory, Project, EstimatePanel } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  X, 
  Search, 
  Check, 
  Layers, 
  Zap, 
  Box, 
  Clock, 
  Tag, 
  ArrowRight, 
  Sliders, 
  Info,
  DollarSign,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PickAssemblyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProject?: Project | null;
  onAssemblyPicked: (panels: EstimatePanel[], targetProject: Project) => void;
}

export const PickAssemblyModal: React.FC<PickAssemblyModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProject,
  onAssemblyPicked,
}) => {
  const [assemblies] = useState<PredefinedAssembly[]>(() => storageService.getPredefinedAssemblies());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssembly, setSelectedAssembly] = useState<PredefinedAssembly | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<number>(
    activeProject ? activeProject.projectID : (projects[0]?.projectID || 0)
  );
  const [customTag, setCustomTag] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showItemDetails, setShowItemDetails] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sync default target project if activeProject changes
  React.useEffect(() => {
    if (activeProject) {
      setTargetProjectId(activeProject.projectID);
    } else if (projects.length > 0 && !targetProjectId) {
      setTargetProjectId(projects[0].projectID);
    }
  }, [activeProject, projects]);

  // When assembly is selected, auto-fill custom tag
  const handleSelectAssembly = (assembly: PredefinedAssembly) => {
    setSelectedAssembly(assembly);
    setCustomTag(assembly.code);
  };

  // Filter assemblies
  const filteredAssemblies = useMemo(() => {
    return assemblies.filter(a => {
      const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || 
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.rating.toLowerCase().includes(q) ||
        a.primaryOEM.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [assemblies, selectedCategory, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: assemblies.length };
    assemblies.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [assemblies]);

  const handlePick = () => {
    if (!selectedAssembly || !targetProjectId) return;
    const project = projects.find(p => p.projectID === targetProjectId);
    if (!project) return;

    const added = storageService.pickAssemblyIntoProject(
      selectedAssembly,
      targetProjectId,
      customTag.trim() || selectedAssembly.code,
      quantity
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onAssemblyPicked(added, project);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Pick Predefined Assembly into Project
                </h2>
                <Badge variant="cyan" size="sm">Fixed Design Library</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Select standardized ATS, APFC Capacitor Banks, or Motor Starter panels with pre-calculated ready final prices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Assemblies Browser */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white">
            
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by rating, rating kW, incomer A, OEM, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                {[
                  { key: 'ALL', label: 'All Panels' },
                  { key: 'METER_CABINET', label: 'Meter Cabinets (DEWA/ADDC)' },
                  { key: 'ATS', label: 'ATS Changeovers' },
                  { key: 'CAPACITOR_BANK', label: 'Capacitor Banks (APFC)' },
                  { key: 'MOTOR_STARTER', label: 'Starter Panels / VFD' },
                  { key: 'SMDB', label: 'SMDB Boards' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedCategory === cat.key
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.key ? 'bg-cyan-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {categoryCounts[cat.key] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Assemblies List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
              {filteredAssemblies.map(assembly => {
                const isSelected = selectedAssembly?.id === assembly.id;
                return (
                  <div
                    key={assembly.id}
                    onClick={() => handleSelectAssembly(assembly)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-cyan-50/70 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-mono text-cyan-800">
                            {assembly.code}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {assembly.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {assembly.primaryOEM}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 mt-1">
                          {assembly.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {assembly.description}
                        </p>
                      </div>

                      {/* Ready Final Price */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Ready Price</span>
                        <span className="text-sm font-bold font-mono text-emerald-700">
                          {assembly.readyFinalPrice.toLocaleString()} <span className="text-[10px] font-normal">AED</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Cost: {assembly.totalDirectCost.toLocaleString()} AED
                        </span>
                      </div>
                    </div>

                    {/* Quick Specs Strip */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>Rating: <strong className="text-slate-700">{assembly.rating}</strong></span>
                        <span>Form: <strong className="text-slate-700">{assembly.formOfSeparation}</strong></span>
                        <span>IP: <strong className="text-slate-700">{assembly.ipRating}</strong></span>
                      </div>
                      <span className="text-cyan-700 font-medium">
                        {assembly.items.length} BOM components
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredAssemblies.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  No predefined assemblies matching the filter criteria.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Assembly Details & Import Target */}
          <div className="lg:col-span-5 flex flex-col h-full bg-slate-50/70 overflow-hidden">
            {selectedAssembly ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header details */}
                <div className="p-5 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-700">
                      SELECTED FIXED DESIGN
                    </span>
                    <Badge variant="emerald" size="sm">
                      {selectedAssembly.primaryOEM} Compliant
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {selectedAssembly.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Rating: <span className="text-slate-800 font-bold">{selectedAssembly.rating}</span> | Voltage: {selectedAssembly.ratedVoltage}V | {selectedAssembly.shortCircuitRating} kA
                  </p>

                  {/* Ready Final Price Highlight Box */}
                  <div className="mt-3.5 p-3 rounded-xl bg-linear-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        Pre-Engineered Ready Final Price
                      </span>
                      <span className="text-xl font-mono font-bold text-emerald-800">
                        {selectedAssembly.readyFinalPrice.toLocaleString()} <span className="text-xs font-normal">AED</span>
                      </span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-600">
                      <div>Direct Cost: <strong className="text-slate-900">{selectedAssembly.totalDirectCost.toLocaleString()} AED</strong></div>
                      <div>Target Margin: <strong className="text-emerald-700">{selectedAssembly.profitMarginPercent}%</strong></div>
                    </div>
                  </div>
                </div>

                {/* Scrollable specs & configuration */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Cost Elements Breakdown */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Cost Breakdown (Factory AED)</span>
                      <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Equipment (OEM)</span>
                        <strong className="text-slate-800">{selectedAssembly.equipmentCost.toLocaleString()} AED</strong>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Copper Busbars</span>
                        <strong className="text-amber-800">{selectedAssembly.copperCost.toLocaleString()} AED</strong>
                        <span className="text-[9px] text-slate-400 block">{selectedAssembly.copperWeightKg} kg Cu</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Enclosure Framework</span>
                        <strong className="text-blue-800">{selectedAssembly.enclosureCost.toLocaleString()} AED</strong>
                        <span className="text-[9px] text-slate-400 block">{selectedAssembly.enclosureDimensions}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Assembly Labour</span>
                        <strong className="text-teal-800">{selectedAssembly.labourCost.toLocaleString()} AED</strong>
                        <span className="text-[9px] text-slate-400 block">{selectedAssembly.labourHours} hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Included BOM Items Accordion */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowItemDetails(!showItemDetails)}
                      className="w-full px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span className="flex items-center gap-1.5 font-mono">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Standard Included BOM Items ({selectedAssembly.items.length})
                      </span>
                      {showItemDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showItemDetails && (
                      <div className="p-3 divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs font-mono">
                        {selectedAssembly.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-cyan-800 text-[11px]">{item.circuitTag}</span>
                                <span className="text-[10px] text-slate-400">{item.partNumber}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 font-sans">{item.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[11px] font-bold text-slate-800">
                                {item.quantity} {item.unit}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {item.totalCost.toLocaleString()} AED
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Picker & Tagging Form */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-600" />
                      Import Target Details
                    </h4>

                    {/* Target Project Dropdown */}
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        Select Project to Pick Into
                      </label>
                      <select
                        value={targetProjectId}
                        onChange={(e) => setTargetProjectId(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
                      >
                        {projects.map(p => (
                          <option key={p.projectID} value={p.projectID}>
                            {p.projectCode} - {p.projectName} ({p.clientName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Tag & Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">
                          Panel Tag in Project
                        </label>
                        <input
                          type="text"
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          placeholder="e.g. ATS-01"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-cyan-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-500">
                    Total Order Addition:{' '}
                    <strong className="text-emerald-700">
                      {(selectedAssembly.readyFinalPrice * quantity).toLocaleString()} AED
                    </strong>
                  </div>

                  <button
                    onClick={handlePick}
                    disabled={isSuccess}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Panel Added!</span>
                      </>
                    ) : (
                      <>
                        <span>Add Assembly to Project</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
                <Box className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">No assembly selected</p>
                <p className="text-[11px] mt-1 text-slate-400 max-w-xs">
                  Click any standard fixed design on the left (ATS, Capacitor Bank, Starter Panel) to preview pricing and pick it into your active tender.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
