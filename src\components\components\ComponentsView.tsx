import React, { useState, useMemo } from 'react';
import { 
  Component, 
  ComponentCategory, 
  Manufacturer 
} from '../../types';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  DollarSign, 
  History, 
  SlidersHorizontal, 
  Download,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface ComponentsViewProps {
  components: Component[];
  categories: ComponentCategory[];
  manufacturers: Manufacturer[];
  onSelectComponent: (comp: Component) => void;
  onOpenAddComponent: () => void;
  onOpenEditComponent: (comp: Component) => void;
  onDeleteComponent: (componentId: number) => void;
  onOpenPriceHistory: (comp: Component) => void;
  onOpenRevisePrice: (comp: Component) => void;
  onExportCSV: () => void;
  onOpenImport: () => void;
}

export const ComponentsView: React.FC<ComponentsViewProps> = ({
  components,
  categories,
  manufacturers,
  onSelectComponent,
  onOpenAddComponent,
  onOpenEditComponent,
  onDeleteComponent,
  onOpenPriceHistory,
  onOpenRevisePrice,
  onExportCSV,
  onOpenImport,
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPoles, setSelectedPoles] = useState<string>('ALL');
  const [minBreakingCapacity, setMinBreakingCapacity] = useState<string>('ALL');
  const [minCurrent, setMinCurrent] = useState<string>('');
  const [maxCurrent, setMaxCurrent] = useState<string>('');
  const [selectedIP, setSelectedIP] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter Logic
  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      // 1. Text Search (Part Number, Code, Model, Name, Description)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match = 
          comp.partNumber.toLowerCase().includes(term) ||
          comp.componentCode.toLowerCase().includes(term) ||
          comp.componentName.toLowerCase().includes(term) ||
          (comp.model && comp.model.toLowerCase().includes(term)) ||
          (comp.description && comp.description.toLowerCase().includes(term));
        if (!match) return false;
      }

      // 2. Manufacturer
      if (selectedManufacturer !== 'ALL' && comp.manufacturerID !== Number(selectedManufacturer)) {
        return false;
      }

      // 3. Category
      if (selectedCategory !== 'ALL' && comp.categoryID !== Number(selectedCategory)) {
        return false;
      }

      // 4. Poles
      if (selectedPoles !== 'ALL' && comp.poles !== Number(selectedPoles)) {
        return false;
      }

      // 5. Min Breaking Capacity (Icu)
      if (minBreakingCapacity !== 'ALL' && (!comp.breakingCapacity || comp.breakingCapacity < Number(minBreakingCapacity))) {
        return false;
      }

      // 6. Current Range (Min / Max)
      if (minCurrent !== '' && (!comp.ratedCurrent || comp.ratedCurrent < Number(minCurrent))) {
        return false;
      }
      if (maxCurrent !== '' && (!comp.ratedCurrent || comp.ratedCurrent > Number(maxCurrent))) {
        return false;
      }

      // 7. IP Rating
      if (selectedIP !== 'ALL' && comp.ipRating !== selectedIP) {
        return false;
      }

      // 8. Status
      if (selectedStatus === 'ACTIVE' && !comp.isActive) return false;
      if (selectedStatus === 'INACTIVE' && comp.isActive) return false;

      return true;
    });
  }, [
    components, 
    searchTerm, 
    selectedManufacturer, 
    selectedCategory, 
    selectedPoles, 
    minBreakingCapacity, 
    minCurrent, 
    maxCurrent, 
    selectedIP, 
    selectedStatus
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedManufacturer('ALL');
    setSelectedCategory('ALL');
    setSelectedPoles('ALL');
    setMinBreakingCapacity('ALL');
    setMinCurrent('');
    setMaxCurrent('');
    setSelectedIP('ALL');
    setSelectedStatus('ALL');
  };

  const totalPages = Math.ceil(filteredComponents.length / pageSize) || 1;
  const paginatedComponents = filteredComponents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search part number, model, component name, code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-600"
            />
          </div>

          {/* Quick Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Manufacturer dropdown */}
            <select
              value={selectedManufacturer}
              onChange={(e) => {
                setSelectedManufacturer(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All OEMs</option>
              {manufacturers.map((m) => (
                <option key={m.manufacturerID} value={m.manufacturerID}>
                  {m.manufacturerName}
                </option>
              ))}
            </select>

            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium border transition-colors shadow-2xs ${
                showAdvancedFilters
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Specs Filter</span>
            </button>

            {/* Quick Enclosure / Panel Sizes Toggle */}
            <button
              onClick={() => {
                if (selectedCategory === '11') {
                  setSelectedCategory('ALL');
                } else {
                  setSelectedCategory('11');
                }
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-2xs ${
                selectedCategory === '11'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
              title="Filter by brand panel enclosures (Alfanar, RR, ABB, Schneider, Siemens, Rittal)"
            >
              <span>Panel Sizes & Enclosures</span>
            </button>

            {/* Import Excel / CSV button */}
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
              title="Import master switchgear components from Excel (.xlsx, .xls) or CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Import Excel / CSV</span>
            </button>

            {/* Add component button */}
            <button
              onClick={onOpenAddComponent}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Technical Specs Filter Bar */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono animate-in fade-in-50 duration-150">
            {/* Poles */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Poles</label>
              <select
                value={selectedPoles}
                onChange={(e) => setSelectedPoles(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:border-cyan-600"
              >
                <option value="ALL">All Poles</option>
                <option value="1">1 Pole (1P)</option>
                <option value="2">2 Poles (2P)</option>
                <option value="3">3 Poles (3P)</option>
                <option value="4">4 Poles (4P)</option>
              </select>
            </div>

            {/* Breaking Capacity */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Min Breaking (kA)</label>
              <select
                value={minBreakingCapacity}
                onChange={(e) => setMinBreakingCapacity(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:border-cyan-600"
              >
                <option value="ALL">Any Icu</option>
                <option value="10">≥ 10 kA</option>
                <option value="25">≥ 25 kA</option>
                <option value="36">≥ 36 kA</option>
                <option value="50">≥ 50 kA</option>
                <option value="66">≥ 66 kA</option>
              </select>
            </div>

            {/* Min Current */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Min Current (A)</label>
              <input
                type="number"
                placeholder="Min A"
                value={minCurrent}
                onChange={(e) => setMinCurrent(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:border-cyan-600"
              />
            </div>

            {/* Max Current */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Max Current (A)</label>
              <input
                type="number"
                placeholder="Max A"
                value={maxCurrent}
                onChange={(e) => setMaxCurrent(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:border-cyan-600"
              />
            </div>

            {/* IP Rating */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">IP Rating</label>
              <select
                value={selectedIP}
                onChange={(e) => setSelectedIP(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:border-cyan-600"
              >
                <option value="ALL">Any IP</option>
                <option value="IP20">IP20</option>
                <option value="IP30">IP30</option>
                <option value="IP40">IP40</option>
                <option value="IP54">IP54</option>
                <option value="IP65">IP65</option>
              </select>
            </div>

            {/* Status & Reset */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Status</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:border-cyan-600"
                >
                  <option value="ALL">All</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <button
                  onClick={handleResetFilters}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title="Clear all filters"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-mono">
        <div>
          Showing <span className="text-slate-900 font-semibold">{filteredComponents.length}</span> components found
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-mono text-xs transition-colors font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import (.XLSX / .CSV)</span>
          </button>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-mono text-xs transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog (.CSV)</span>
          </button>
        </div>
      </div>

      {/* High-density Engineering Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-mono uppercase bg-slate-50">
                <th className="py-3 px-4">Part Number & Code</th>
                <th className="py-3 px-4">Component & Description</th>
                <th className="py-3 px-4">OEM & Category</th>
                <th className="py-3 px-4">Ratings (In / Ue / Icu)</th>
                <th className="py-3 px-4 text-right">Current Net Buying Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedComponents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No components match the active filters.
                  </td>
                </tr>
              ) : (
                paginatedComponents.map((c) => (
                  <tr key={c.componentID} className="hover:bg-slate-50/70 transition-colors">
                    {/* Part No & Code */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-cyan-800 text-xs">{c.partNumber}</div>
                      <div className="text-[10px] text-slate-500">{c.componentCode}</div>
                    </td>

                    {/* Name & Model */}
                    <td className="py-3 px-4 max-w-xs">
                      <div 
                        onClick={() => onSelectComponent(c)}
                        className="font-medium text-slate-900 hover:text-cyan-700 cursor-pointer truncate"
                      >
                        {c.componentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {c.model || c.description || '-'}
                      </div>
                    </td>

                    {/* OEM & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="purple">{c.manufacturerCode || c.manufacturerName}</Badge>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {c.categoryName}
                        </span>
                      </div>
                    </td>

                    {/* Electrical Ratings Badges or Enclosure Dimensions */}
                    <td className="py-3 px-4 font-mono">
                      {c.categoryID === 11 || c.isEnclosureSize || c.enclosureHeight ? (
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="blue">
                              {c.enclosureHeight || 2100}H × {c.enclosureWidth || 2400}W × {c.enclosureDepth || 800}D mm
                            </Badge>
                            {c.columns && <Badge variant="purple">{c.columns} Col{c.columns > 1 ? 's' : ''}</Badge>}
                            {c.ratedCurrent && <Badge variant="info">{c.ratedCurrent}A</Badge>}
                          </div>
                          <div className="text-[10px] text-slate-600 mt-1">
                            {c.formOfSeparation || 'Form 2b'} • {c.ipRating || 'IP42'} • {c.mountingType || 'Floor Standing'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.ratedCurrent && (
                              <Badge variant="info">{c.ratedCurrent}A</Badge>
                            )}
                            {c.ratedVoltage && (
                              <Badge variant="default">{c.ratedVoltage}V</Badge>
                            )}
                            {c.poles && (
                              <Badge variant="default">{c.poles}P</Badge>
                            )}
                            {c.breakingCapacity && (
                              <Badge variant="warning">{c.breakingCapacity}kA</Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {c.iecStandard || 'IEC 60947-2'} • {c.ipRating || 'IP20'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Current Net Buying Rate */}
                    <td className="py-3 px-4 text-right font-mono">
                      {c.currentPrice ? (
                        <div>
                          <div className="font-bold text-emerald-700 text-xs">
                            {c.currentPrice.currency} {c.currentPrice.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            List: {c.currentPrice.listPrice.toLocaleString()} (-{c.currentPrice.discountPercent}%)
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px] ml-auto">
                            {c.currentPrice.supplierName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-700 text-[11px]">Unquoted</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {c.isActive ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="danger">INACTIVE</Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Specs */}
                        <button
                          onClick={() => onSelectComponent(c)}
                          className="p-1.5 text-slate-400 hover:text-cyan-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Technical Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Price History */}
                        <button
                          onClick={() => onOpenPriceHistory(c)}
                          className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Price History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Revise Price */}
                        <button
                          onClick={() => onOpenRevisePrice(c)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                          title="Revise / Add Supplier Price"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Component */}
                        <button
                          onClick={() => onOpenEditComponent(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Component Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteComponent(c.componentID)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          title="Delete Component"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs font-mono bg-slate-50">
          <div className="text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-700 shadow-2xs"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-700 shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
