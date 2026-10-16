import React, { useState, useMemo } from 'react';
import { PanelType, Component } from '../../types';
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
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { storageService } from '../../services/storageService';
import { PanelSizeImportModal } from './PanelSizeImportModal';

interface PanelTypesViewProps {
  panelTypes: PanelType[];
  components?: Component[];
  onSelectComponent?: (comp: Component) => void;
  onOpenAddComponent?: () => void;
  onRefreshData?: () => void;
}

export const PanelTypesView: React.FC<PanelTypesViewProps> = ({ 
  panelTypes, 
  components: propComponents,
  onSelectComponent,
  onOpenAddComponent,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'brand_enclosures' | 'iec_types'>('brand_enclosures');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [localComponents, setLocalComponents] = useState<Component[] | null>(null);

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
