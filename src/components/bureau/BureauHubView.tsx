import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  Layers, 
  DollarSign, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Calculator,
  Search,
  Sparkles
} from 'lucide-react';
import { 
  Project, 
  EstimatePanel, 
  Quotation, 
  BureauClient, 
  Manufacturer, 
} from '../../types';
import { storageService } from '../../services/storageService';
import { BureauClientModal } from './BureauClientModal';
import { TenderDossierModal } from './TenderDossierModal';

interface BureauHubViewProps {
  projects: Project[];
  panels: EstimatePanel[];
  quotations: Quotation[];
  manufacturers: Manufacturer[];
  onOpenProject: (project: Project) => void;
  onRefreshData: () => void;
}

export const BureauHubView: React.FC<BureauHubViewProps> = ({
  projects,
  panels,
  quotations,
  manufacturers,
  onOpenProject,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'clients' | 've_matrix' | 'copper_simulator'>('pipeline');
  
  // Clients state
  const [clients, setClients] = useState<BureauClient[]>(() => storageService.getBureauClients());
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<BureauClient | null>(null);

  // Dossier Modal state
  const [selectedProjectForDossier, setSelectedProjectForDossier] = useState<Project | null>(null);

  // Filters for Pipeline
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Value Engineering selection
  const [selectedProjectID, setSelectedProjectID] = useState<number>(projects[0]?.projectID || 1);
  const [selectedPanelID, setSelectedPanelID] = useState<number>(panels[0]?.panelID || 101);

  // Copper Simulator State
  const [simulatedCopperRate, setSimulatedCopperRate] = useState<number>(45.0);
  const [copperScrapFactor, setCopperScrapFactor] = useState<number>(10.0);
  const [ambientTemp, setAmbientTemp] = useState<number>(45);

  const reloadClients = () => {
    setClients(storageService.getBureauClients());
  };

  const handleSaveClient = (clientData: any) => {
    if (clientData.clientID) {
      storageService.updateBureauClient(clientData);
    } else {
      storageService.addBureauClient(clientData);
    }
    setIsClientModalOpen(false);
    setClientToEdit(null);
    reloadClients();
    onRefreshData();
  };

  const handleDeleteClient = (clientID: number) => {
    if (confirm('Are you sure you want to delete this contractor client?')) {
      storageService.deleteBureauClient(clientID);
      reloadClients();
    }
  };

  // Compute Active Pipeline Metrics
  const totalPipelineValue = projects.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
  const totalCopperTonnage = panels.reduce((sum, p) => sum + p.copperWeightKg, 0);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (clientFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.clientName.toLowerCase().includes(clientFilter.toLowerCase());
  });

  // Active panel for Value Engineering
  const veProject = projects.find(p => p.projectID === selectedProjectID) || projects[0];
  const vePanels = panels.filter(p => p.projectID === selectedProjectID);
  const vePanel = vePanels.find(p => p.panelID === selectedPanelID) || vePanels[0] || panels[0];
  const veClient = clients.find(c => c.companyName.toLowerCase().includes(veProject?.clientName.toLowerCase()));
  const veOptions = vePanel ? storageService.calculateValueEngineering(vePanel, veClient) : [];

  // Copper simulation math
  const baselineCopperRate = 42.0;
  const tempDeratingMultiplier = ambientTemp >= 50 ? 1.15 : ambientTemp >= 45 ? 1.08 : 1.0;
  const effectiveCopperWeight = totalCopperTonnage * (1 + copperScrapFactor / 100) * tempDeratingMultiplier;
  const baselineCopperTotal = totalCopperTonnage * baselineCopperRate;
  const simulatedCopperTotal = effectiveCopperWeight * simulatedCopperRate;
  const copperVariance = simulatedCopperTotal - baselineCopperTotal;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Executive Bureau Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-mono font-semibold uppercase">
                Model A Production Portal
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-semibold">
                Tender Bidding Bureau
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-600" />
              <span>Switchgear Estimation & Tender Bidding Bureau</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1 max-w-2xl leading-relaxed">
              Commercial turn-key estimation service for switchgear panel builders, contractors, and OEMs. Manage confidential brand discounts, side-by-side value engineering, and IEC 61439 tender submittals.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono shrink-0">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Panel Builder Clients</div>
              <div className="text-lg font-bold text-cyan-700">{clients.length}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Tenders in Pipeline</div>
              <div className="text-lg font-bold text-slate-900">{projects.length}</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Tender Value (AED)</div>
              <div className="text-lg font-bold text-emerald-700">
                {(totalPipelineValue / 1000).toFixed(0)}k
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Copper Demand</div>
              <div className="text-lg font-bold text-amber-700">
                {totalCopperTonnage.toFixed(0)} kg
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Clean Segmented Control */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 mt-6 pt-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'pipeline'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tender Pipeline ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Contractor Clients & OEM Agreements ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ve_matrix')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 've_matrix'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-OEM Value Engineering</span>
          </button>

          <button
            onClick={() => setActiveTab('copper_simulator')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'copper_simulator'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Copper Volatility & LME Risk</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TENDER PIPELINE */}
      {/* ============================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tenders, contractors, or codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-600"
                />
              </div>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-cyan-600"
              >
                <option value="ALL">All Clients ({clients.length})</option>
                {clients.map(c => (
                  <option key={c.clientID} value={c.companyName}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-500">
              Showing {filteredProjects.length} of {projects.length} tenders
            </div>
          </div>

          {/* Tender Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((p) => {
              const projectPanels = panels.filter(panel => panel.projectID === p.projectID);

              return (
                <div 
                  key={p.projectID}
                  className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-xl p-5 flex flex-col justify-between transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-cyan-800 border border-slate-200 font-bold">
                        {p.projectCode}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.authority}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                        {p.projectName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{p.clientName}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Switchboards</span>
                        <span className="font-semibold text-slate-800">{projectPanels.length} Panels</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Due Date</span>
                        <span className="font-semibold text-slate-700">{p.dueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Direct Cost</span>
                        <span className="text-slate-700">{p.currency} {((p.totalCost || 0) / 1000).toFixed(1)}k</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Tender Offer</span>
                        <span className="font-bold text-emerald-700">{p.currency} {((p.sellingPrice || 0) / 1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                      <span>Status: <strong className="text-slate-800">{p.status}</strong></span>
                      <span>Margin: <strong className="text-purple-700">15.0%</strong></span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                    <button
                      onClick={() => onOpenProject(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-medium transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Open Workspace</span>
                    </button>

                    <button
                      onClick={() => setSelectedProjectForDossier(p)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-mono transition-colors font-medium shadow-2xs"
                      title="Generate Official Tender Submittal Dossier"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CONTRACTOR CLIENTS & OEM DISCOUNTS */}
      {/* ============================================================== */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-600" />
                <span>Registered Contractor & Panel Builder Clients</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Store client-specific OEM discount agreements (ABB, Schneider, Siemens, Eaton) so pricing automatically reflects their negotiated multipliers.
              </p>
            </div>

            <button
              onClick={() => {
                setClientToEdit(null);
                setIsClientModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-mono font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Contractor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {clients.map((c) => (
              <div key={c.clientID} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-cyan-800 border border-slate-200 font-bold">
                      {c.clientCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{c.companyName}</h3>
                    <div className="text-slate-500 text-[11px]">{c.contactPerson} • {c.email}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setClientToEdit(c);
                        setIsClientModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-cyan-700 rounded hover:bg-slate-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(c.clientID)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Agreed OEM Discount Badges */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-between">
                    <span>Confidential OEM Discount Agreements</span>
                    <span className="text-emerald-700 font-bold">Net Multipliers</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {c.oemDiscounts.map(d => (
                      <div key={d.manufacturerCode} className="flex justify-between bg-white px-2.5 py-1 rounded border border-slate-200">
                        <span className="text-slate-700 font-medium">{d.manufacturerCode}</span>
                        <span className="text-emerald-700 font-bold">{d.standardDiscountPercent}% off</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 uppercase">Target Margin</span>
                    <span className="font-bold text-purple-700 text-xs">{c.targetMarginPercent}%</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 uppercase">Overhead</span>
                    <span className="font-bold text-slate-800 text-xs">{c.defaultOverheadPercent}%</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="block text-slate-500 uppercase">Warranty</span>
                    <span className="font-bold text-slate-800 text-xs">{c.defaultWarrantyMonths} Mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MULTI-OEM VALUE ENGINEERING MATRIX */}
      {/* ============================================================== */}
      {activeTab === 've_matrix' && (
        <div className="space-y-6">
          {/* Target Panel Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono shadow-xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Multi-Brand Value Engineering Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">
                Compare side-by-side BOM costs for the same panel to advise contractor on optimal bidding strategy.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Select Tender</label>
                <select
                  value={selectedProjectID}
                  onChange={(e) => {
                    const pid = Number(e.target.value);
                    setSelectedProjectID(pid);
                    const prjPanels = panels.filter(p => p.projectID === pid);
                    if (prjPanels.length > 0) setSelectedPanelID(prjPanels[0].panelID);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-cyan-600"
                >
                  {projects.map(p => (
                    <option key={p.projectID} value={p.projectID}>{p.projectCode} - {p.projectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Select Switchboard</label>
                <select
                  value={selectedPanelID}
                  onChange={(e) => setSelectedPanelID(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-cyan-600"
                >
                  {vePanels.map(p => (
                    <option key={p.panelID} value={p.panelID}>{p.panelTag} ({p.incomerRating}A {p.formOfSeparation})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Side-by-side Options Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {veOptions.map((opt, index) => {
              const baseline = veOptions[0].sellingPrice;
              const delta = opt.sellingPrice - baseline;
              const deltaPct = ((delta / baseline) * 100).toFixed(1);

              return (
                <div 
                  key={opt.oemCode}
                  className={`bg-white border rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs ${
                    index === 0 
                      ? 'border-cyan-500 ring-1 ring-cyan-500/30 bg-cyan-50/10' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                        OPTION {index + 1}
                      </span>
                      {index === 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                          BASELINE SPEC
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          Number(deltaPct) < 0 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {delta < 0 ? `${deltaPct}% Saving` : `+${deltaPct}%`}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{opt.oemName}</h3>
                      <div className="text-[11px] text-slate-500 mt-1">Lead Time: {opt.leadTimeWeeks} Weeks</div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Equipment Cost:</span>
                        <span className="text-slate-800 font-medium">AED {opt.equipmentCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Copper Busbars:</span>
                        <span className="text-slate-800 font-medium">AED {opt.copperCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Enclosure & Metal:</span>
                        <span className="text-slate-800 font-medium">AED {opt.enclosureCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Labour & Testing:</span>
                        <span className="text-slate-800 font-medium">AED {opt.labourCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                        <span>Direct Cost:</span>
                        <span>AED {opt.totalDirectCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Final Bid Offer */}
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                      <div className="text-[10px] text-emerald-800 uppercase font-semibold">Tender Selling Price</div>
                      <div className="text-base font-bold text-emerald-800 mt-0.5">
                        AED {opt.sellingPrice.toLocaleString()}
                      </div>
                      {delta !== 0 && (
                        <div className="text-[10px] text-slate-600 mt-1">
                          Difference: <strong className={delta < 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {delta < 0 ? '-' : '+'}AED {Math.abs(delta).toLocaleString()}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Technical Compliance */}
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Compliance Score:</span>
                        <span className="font-bold text-cyan-700">{opt.technicalComplianceRating}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic leading-snug">
                        {opt.complianceNotes}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: COPPER VOLATILITY & LME RISK SIMULATOR */}
      {/* ============================================================== */}
      {activeTab === 'copper_simulator' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  LME Copper Busbar Market Volatility & Margin Sensitivity Engine
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Copper represents 20% - 35% of an LV switchboard's direct cost. Simulate price spikes during tender validity (30-90 days) to prevent margin erosion.
              </p>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs bg-slate-50 p-5 rounded-xl border border-slate-200">
              {/* Copper Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">Simulated Copper Rate:</span>
                  <span className="font-bold text-amber-700 text-sm">{simulatedCopperRate.toFixed(1)} AED / kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="0.5"
                  value={simulatedCopperRate}
                  onChange={(e) => setSimulatedCopperRate(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>30 AED (Market Low)</span>
                  <span>Baseline: 42 AED</span>
                  <span>70 AED (Surge)</span>
                </div>
              </div>

              {/* Scrap Factor Slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">Punching & Bending Scrap:</span>
                  <span className="font-bold text-cyan-700 text-sm">+{copperScrapFactor}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={copperScrapFactor}
                  onChange={(e) => setCopperScrapFactor(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5% (CNC Shear)</span>
                  <span>10% (Standard)</span>
                  <span>20% (Complex Form 4b)</span>
                </div>
              </div>

              {/* Ambient Temperature Derating */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">Site Ambient Temperature:</span>
                  <span className="font-bold text-rose-700 text-sm">{ambientTemp} °C</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="55"
                  step="5"
                  value={ambientTemp}
                  onChange={(e) => setAmbientTemp(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>35°C (Standard IEC)</span>
                  <span>45°C (GCC Indoor)</span>
                  <span>50°C (Outdoor Substation)</span>
                </div>
              </div>
            </div>

            {/* Financial Impact Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Total Copper Tonnage</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{effectiveCopperWeight.toFixed(1)} kg</div>
                <div className="text-[10px] text-slate-400 mt-1">Across {panels.length} switchboards</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Baseline Copper Budget</div>
                <div className="text-lg font-bold text-slate-800 mt-1">AED {baselineCopperTotal.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">Calculated @ 42.0 AED/kg</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Simulated Copper Cost</div>
                <div className="text-lg font-bold text-amber-700 mt-1">AED {Math.round(simulatedCopperTotal).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">With {ambientTemp}°C derating</div>
              </div>

              <div className={`p-4 rounded-xl border ${
                copperVariance > 0 
                  ? 'bg-rose-50 border-rose-200' 
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="text-[10px] text-slate-500 uppercase">Tender Profit Impact</div>
                <div className={`text-lg font-bold mt-1 ${copperVariance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {copperVariance > 0 ? '-' : '+'}AED {Math.abs(Math.round(copperVariance)).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  {copperVariance > 0 ? 'Profit margin erosion' : 'Cost saving surplus'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client Contractor Add/Edit */}
      <BureauClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
        manufacturers={manufacturers}
      />

      {/* Modal: Official Tender Submittal Dossier */}
      {selectedProjectForDossier && (
        <TenderDossierModal
          isOpen={true}
          onClose={() => setSelectedProjectForDossier(null)}
          project={selectedProjectForDossier}
          panels={panels.filter(p => p.projectID === selectedProjectForDossier.projectID)}
          quotation={quotations.find(q => q.projectID === selectedProjectForDossier.projectID)}
          client={clients.find(c => c.companyName.toLowerCase() === selectedProjectForDossier.clientName.toLowerCase())}
        />
      )}

    </div>
  );
};
