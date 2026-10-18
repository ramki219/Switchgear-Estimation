import React, { useState, useMemo } from 'react';
import { PanelType, Component, Project, PredefinedAssembly, EstimatePanel } from '../../types';
import { 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Box, 
  Tag, 
  DollarSign, 
  Building2, 
  Ruler, 
  Search,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  Zap,
  Sparkles,
  ArrowRight,
  Info,
  Edit3
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { storageService } from '../../services/storageService';
import { PanelSizeImportModal } from './PanelSizeImportModal';
import { PickAssemblyModal } from '../estimation/PickAssemblyModal';
import { EditAssemblyModal } from '../assemblies/EditAssemblyModal';

interface PanelTypesViewProps {
  panelTypes: PanelType[];
  components?: Component[];
  projects?: Project[];
  onSelectComponent?: (comp: Component) => void;
  onOpenAddComponent?: () => void;
  onRefreshData?: () => void;
  onNavigateToAssemblies?: () => void;
}

export const PanelTypesView: React.FC<PanelTypesViewProps> = ({ 
  panelTypes, 
  components: propComponents,
  projects = [],
  onSelectComponent,
  onOpenAddComponent,
  onRefreshData,
  onNavigateToAssemblies,
}) => {
  const [activeTab, setActiveTab] = useState<'brand_enclosures' | 'iec_types' | 'predefined_assemblies'>('brand_enclosures');
  const [predefinedCategory, setPredefinedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [selectedAssemblyForPick, setSelectedAssemblyForPick] = useState<PredefinedAssembly | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [assemblyToEdit, setAssemblyToEdit] = useState<PredefinedAssembly | null>(null);
  const [localComponents, setLocalComponents] = useState<Component[] | null>(null);
  const [predefinedList, setPredefinedList] = useState<PredefinedAssembly[]>(() => 
    storageService.getPredefinedAssemblies()
  );

  const predefinedAssemblies = predefinedList;

  const allComponents = useMemo(() => {
    if (localComponents && localComponents.length > 0) return localComponents;
    if (propComponents && propComponents.length > 0) return propComponents;
    return storageService.getComponents();
  }, [propComponents, localComponents]);

  const enclosureComponents = useMemo(() => {
    return allComponents.filter(c => 
      c.categoryID === 11 || 
      c.isEnclosureSize || 
      c.componentCode.startsWith('CMP-ENC-') ||
      c.categoryName?.toLowerCase().includes('enclosure')
    );
  }, [allComponents]);

  const filteredEnclosures = useMemo(() => {
    return enclosureComponents.filter(e => {
      if (selectedBrand !== 'ALL') {
        const matchesBrand = 
          e.manufacturerCode?.toUpperCase() === selectedBrand ||
          e.manufacturerName?.toUpperCase().includes(selectedBrand);
        if (!matchesBrand) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches = 
          e.componentName.toLowerCase().includes(q) ||
          e.partNumber.toLowerCase().includes(q) ||
          e.model?.toLowerCase().includes(q) ||
          `${e.enclosureHeight}x${e.enclosureWidth}`.includes(q) ||
          `${e.ratedCurrent}a`.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [enclosureComponents, selectedBrand, searchTerm]);

  return (
    <div className="space-y-4 font-mono">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-600" />
            <span>Switchgear Panel Sizes & Assemblies (IEC 61439-1/2)</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Pre-configured brand enclosure sizes from Alfanar, RR, ABB, Schneider, Siemens & Rittal with exact database listed prices.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('brand_enclosures')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'brand_enclosures'
                  ? 'bg-white text-cyan-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Brand Enclosures & Prices ({enclosureComponents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('iec_types')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'iec_types'
                  ? 'bg-white text-indigo-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>IEC Standard Types ({panelTypes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('predefined_assemblies')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'predefined_assemblies'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Predefined Assemblies ({predefinedAssemblies.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            title="Import brand panel enclosure sizes with database prices from Excel (.xlsx) or CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Panel Sizes (Excel / CSV)</span>
          </button>

          {onOpenAddComponent && (
            <button
              onClick={onOpenAddComponent}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Panel Size</span>
            </button>
          )}
        </div>
      </div>

      {/* Predefined Assemblies Quick Action Row */}
      <div className="bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-200/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Predefined Assemblies & Fixed Designs</span>
              <Badge variant="emerald" size="sm">Ready Final Prices</Badge>
            </div>
            <p className="text-[11px] text-slate-600 font-sans mt-0.5">
              Standard fixed design panels with ready final prices: ATS Panels (63A-1600A), Capacitor Banks (50-300 kvar), Starter Panels (DOL, Star-Delta, VFD).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('predefined_assemblies')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              activeTab === 'predefined_assemblies'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <span>View Ready Prices ({predefinedAssemblies.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TAB 1: Brand Enclosures & Database Prices */}
      {activeTab === 'brand_enclosures' && (
        <div className="space-y-4">
          {/* Brand Filter Pills & Search */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 mr-1">Brand Filter:</span>
                {[
                  { code: 'ALL', label: 'All Brands' },
                  { code: 'ALFANAR', label: 'Alfanar' },
                  { code: 'RR', label: 'RR Global / Switchgear' },
                  { code: 'ABB', label: 'ABB' },
                  { code: 'SCHNEIDER', label: 'Schneider Electric' },
                  { code: 'SIEMENS', label: 'Siemens' },
                  { code: 'RITTAL', label: 'Rittal' },
                ].map((b) => (
                  <button
                    key={b.code}
                    onClick={() => setSelectedBrand(b.code)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedBrand === b.code
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by rating, size, model..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder:text-slate-400 text-xs focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>
                Showing <strong>{filteredEnclosures.length}</strong> brand panel enclosure sizes prepared in catalog
              </span>
              <span className="text-emerald-700 font-bold">
                ✓ All prices reflect active database supplier quotation rates
              </span>
            </div>
          </div>

          {/* Grid of Brand Enclosure Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnclosures.map((enc) => {
              const netRate = enc.currentPrice?.netPrice || 0;
              const listRate = enc.currentPrice?.listPrice || 0;
              const discount = enc.currentPrice?.discountPercent || 0;
              return (
                <div
                  key={enc.componentID}
                  className="bg-white border border-slate-200 hover:border-cyan-500 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md group"
                >
                  <div>
                    {/* Brand & Part Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                        {enc.manufacturerCode || enc.manufacturerName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="purple">{enc.ipRating || 'IP42'}</Badge>
                        <Badge variant="emerald">{enc.formOfSeparation || 'Form 2b'}</Badge>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition">
                      {enc.componentName}
                    </h4>
                    <p className="text-xs text-slate-500 font-sans mt-1 line-clamp-2">
                      {enc.description}
                    </p>

                    {/* Dimensions & Technical Parameters */}
                    <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dimensions (H × W × D):</span>
                        </span>
                        <strong className="text-slate-900">
                          {enc.enclosureHeight} × {enc.enclosureWidth} × {enc.enclosureDepth} mm
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Columns / Tiers:</span>
                        <strong className="text-slate-900">{enc.columns || 1} Cubicles</strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Incomer Capacity:</span>
                        <strong className="text-blue-800">{enc.ratedCurrent} Amps</strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">Mounting:</span>
                        <span className="text-slate-800">{enc.mountingType || 'Floor Standing'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Database Price & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                        Database Listed Rate
                      </span>
                      <div className="text-base font-bold text-emerald-700">
                        {netRate.toLocaleString()} <span className="text-xs font-normal">AED</span>
                      </div>
                      {listRate > netRate && (
                        <div className="text-[10px] text-slate-400">
                          List: {listRate.toLocaleString()} AED (-{discount}%)
                        </div>
                      )}
                    </div>

                    {onSelectComponent && (
                      <button
                        onClick={() => onSelectComponent(enc)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-cyan-600 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1"
                      >
                        <span>View Specs</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Standard IEC Types */}
      {activeTab === 'iec_types' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {panelTypes.map((pt) => (
            <div
              key={pt.panelTypeID}
              className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    {pt.panelTypeCode}
                  </span>
                  <Badge variant="success">IEC COMPLIANT</Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">{pt.panelTypeName}</h4>
                <p className="text-xs text-slate-600 font-mono mt-1 leading-relaxed">
                  {pt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Default Separation:</span>
                  <Badge variant="warning">{pt.defaultFormOfSeparation}</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Default Protection:</span>
                  <Badge variant="info">{pt.defaultIPRating}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Predefined Standard Assemblies & Ready Final Prices */}
      {activeTab === 'predefined_assemblies' && (
        <div className="space-y-4">
          {/* Subheader & Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filter Category:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {[
                    { key: 'ALL', label: 'All Fixed Designs' },
                    { key: 'METER_CABINET', label: 'Meter Cabinets (DEWA/ADDC)' },
                    { key: 'ATS', label: 'ATS Changeovers' },
                    { key: 'CAPACITOR_BANK', label: 'Capacitor Banks (APFC)' },
                    { key: 'MOTOR_STARTER', label: 'Starter Panels (MCC)' },
                    { key: 'SMDB', label: 'SMDB Boards' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setPredefinedCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition ${
                        predefinedCategory === cat.key
                          ? 'bg-cyan-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {onNavigateToAssemblies && (
                <button
                  onClick={onNavigateToAssemblies}
                  className="px-3 py-1 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-bold hover:bg-cyan-100 transition flex items-center gap-1 shrink-0"
                >
                  <span>Open Full Assemblies Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grid of Assemblies with Ready Final Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedAssemblies
              .filter(a => predefinedCategory === 'ALL' || a.category === predefinedCategory)
              .map(assembly => (
                <div
                  key={assembly.id}
                  className="bg-white border border-slate-200 hover:border-cyan-300 rounded-xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between font-mono"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-cyan-800">{assembly.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {assembly.panelTypeCode}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {assembly.primaryOEM}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 font-sans">{assembly.name}</h4>
                        <p className="text-[11px] text-slate-500 font-sans line-clamp-2 mt-0.5">{assembly.description}</p>
                      </div>
                    </div>

                    {/* Ready Final Price Box */}
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Ready Final Price</span>
                        <span className="text-base font-bold text-emerald-800">
                          {assembly.readyFinalPrice.toLocaleString()} AED
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-600">
                        <div>Direct: {assembly.totalDirectCost.toLocaleString()} AED</div>
                        <span className="text-emerald-700 font-bold">+{assembly.profitMarginPercent}% Margin</span>
                      </div>
                    </div>

                    {/* Specs strip */}
                    <div className="mt-2.5 p-2 rounded bg-slate-50 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <strong className="text-slate-800">{assembly.rating}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Enclosure:</span>
                        <span>{assembly.enclosureDimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protection:</span>
                        <span>{assembly.formOfSeparation} | {assembly.ipRating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {assembly.items.length} BOM Items
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setAssemblyToEdit(assembly);
                          setIsEditModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Edit assembly & components list"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAssemblyForPick(assembly);
                          setIsPickModalOpen(true);
                        }}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pick into Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit Predefined Assembly Modal */}
      <EditAssemblyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setAssemblyToEdit(null);
        }}
        assembly={assemblyToEdit}
        onSave={(updated) => {
          const fresh = storageService.getPredefinedAssemblies();
          setPredefinedList(fresh);
          if (onRefreshData) onRefreshData();
        }}
        allComponents={allComponents}
      />

      {/* Pick Assembly Modal */}
      <PickAssemblyModal
        isOpen={isPickModalOpen}
        onClose={() => setIsPickModalOpen(false)}
        projects={projects}
        onAssemblyPicked={(added, prj) => {
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* Brand Panel Sizes Excel / CSV Bulk Import Modal */}
      <PanelSizeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        manufacturers={storageService.getManufacturers()}
        panelTypes={panelTypes}
        suppliers={storageService.getSuppliers()}
        existingComponents={allComponents}
        onImportSuccess={() => {
          const fresh = storageService.getComponents();
          setLocalComponents(fresh);
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
};
