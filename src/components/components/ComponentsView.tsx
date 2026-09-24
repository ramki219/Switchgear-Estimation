import React, { useState, useMemo } from 'react';
import { 
  Component, 
  ComponentCategory, 
  Manufacturer 
} from '../../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  DollarSign, 
  History, 
  SlidersHorizontal, 
  Download,
  XCircle,
  Zap,
  CheckCircle2,
  AlertCircle
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

      // 2. Manufacturer Filter
      if (selectedManufacturer !== 'ALL' && comp.manufacturerID !== Number(selectedManufacturer)) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'ALL' && comp.categoryID !== Number(selectedCategory)) {
        return false;
      }

      // 4. Poles Filter
      if (selectedPoles !== 'ALL' && comp.poles !== Number(selectedPoles)) {
        return false;
      }

      // 5. Breaking Capacity Filter
      if (minBreakingCapacity !== 'ALL') {
        const threshold = Number(minBreakingCapacity);
        if (!comp.breakingCapacity || comp.breakingCapacity < threshold) {
          return false;
        }
      }

      // 6. Current Range Filter
      if (minCurrent !== '' && (!comp.ratedCurrent || comp.ratedCurrent < Number(minCurrent))) {
        return false;
      }
      if (maxCurrent !== '' && (!comp.ratedCurrent || comp.ratedCurrent > Number(maxCurrent))) {
        return false;
      }

      // 7. IP Rating Filter
      if (selectedIP !== 'ALL' && comp.ipRating !== selectedIP) {
        return false;
      }

      // 8. Status Filter
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
    selectedStatus,
  ]);

  // Reset Filters
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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search part number, model, component name, code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-medium border transition-colors ${
                showAdvancedFilters
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Specs Filter</span>
            </button>

            {/* Add component button */}
            <button
              onClick={onOpenAddComponent}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Technical Specs Filter Bar */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono animate-in fade-in-50 duration-150">
            {/* Poles */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Poles</label>
              <select
                value={selectedPoles}
                onChange={(e) => setSelectedPoles(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
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
              <label className="text-[10px] text-slate-400 block mb-1">Min Breaking (kA)</label>
              <select
                value={minBreakingCapacity}
                onChange={(e) => setMinBreakingCapacity(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
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
              <label className="text-[10px] text-slate-400 block mb-1">Min Current (A)</label>
              <input
                type="number"
                placeholder="Min A"
                value={minCurrent}
                onChange={(e) => setMinCurrent(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>

            {/* Max Current */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Max Current (A)</label>
              <input
                type="number"
                placeholder="Max A"
                value={maxCurrent}
                onChange={(e) => setMaxCurrent(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>

            {/* IP Rating */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">IP Rating</label>
              <select
                value={selectedIP}
                onChange={(e) => setSelectedIP(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
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
              <label className="text-[10px] text-slate-400 block mb-1">Status</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200"
                >
                  <option value="ALL">All</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <button
                  onClick={handleResetFilters}
                  className="p-1 text-slate-400 hover:text-slate-200"
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
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
        <div>
          Showing <span className="text-slate-100 font-semibold">{filteredComponents.length}</span> components found
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog (.CSV)</span>
          </button>
        </div>
      </div>

      {/* High-density Engineering Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono uppercase bg-slate-950/60">
                <th className="py-3 px-4">Part Number & Code</th>
                <th className="py-3 px-4">Component & Description</th>
                <th className="py-3 px-4">OEM & Category</th>
                <th className="py-3 px-4">Ratings (In / Ue / Icu)</th>
                <th className="py-3 px-4 text-right">Current Net Buying Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedComponents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No components match the active filters.
                  </td>
                </tr>
              ) : (
                paginatedComponents.map((c) => (
                  <tr key={c.componentID} className="hover:bg-slate-800/40 transition-colors">
                    {/* Part No & Code */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-cyan-400 text-xs">{c.partNumber}</div>
                      <div className="text-[10px] text-slate-400">{c.componentCode}</div>
                    </td>

                    {/* Name & Model */}
                    <td className="py-3 px-4 max-w-xs">
                      <div 
                        onClick={() => onSelectComponent(c)}
                        className="font-medium text-slate-100 hover:text-cyan-300 cursor-pointer truncate"
                      >
                        {c.componentName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {c.model || c.description || '-'}
                      </div>
                    </td>

                    {/* OEM & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="purple">{c.manufacturerCode || c.manufacturerName}</Badge>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {c.categoryName}
                        </span>
                      </div>
                    </td>

                    {/* Electrical Ratings Badges */}
                    <td className="py-3 px-4 font-mono">
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
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {c.iecStandard || 'IEC 60947-2'} • {c.ipRating || 'IP20'}
                      </div>
                    </td>

                    {/* Current Net Buying Rate */}
                    <td className="py-3 px-4 text-right font-mono">
                      {c.currentPrice ? (
                        <div>
                          <div className="font-bold text-emerald-400 text-xs">
                            {c.currentPrice.currency} {c.currentPrice.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            List: {c.currentPrice.listPrice.toLocaleString()} (-{c.currentPrice.discountPercent}%)
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px] ml-auto">
                            {c.currentPrice.supplierName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-400/80 text-[11px]">Unquoted</span>
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
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                          title="View Technical Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Price History */}
                        <button
                          onClick={() => onOpenPriceHistory(c)}
                          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition-colors"
                          title="View Price History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Revise Price */}
                        <button
                          onClick={() => onOpenRevisePrice(c)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          title="Revise / Add Supplier Price"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Component */}
                        <button
                          onClick={() => onOpenEditComponent(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit Component Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteComponent(c.componentID)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs font-mono bg-slate-950/40">
          <div className="text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-300"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
