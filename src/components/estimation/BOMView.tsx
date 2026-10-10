import React, { useState, useMemo } from 'react';
import { Project, ConsolidatedBOMItem } from '../../types';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Download, 
  ArrowLeft 
} from 'lucide-react';
import { exportBOMToCSV } from '../../services/exportService';

interface BOMViewProps {
  project: Project;
  bomItems: ConsolidatedBOMItem[];
  onBackToEstimation: () => void;
  onNavigateToQuotation: () => void;
}

export const BOMView: React.FC<BOMViewProps> = ({
  project,
  bomItems,
  onBackToEstimation,
  onNavigateToQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categories present in this BOM
  const categories = useMemo(() => {
    const set = new Set<string>();
    bomItems.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [bomItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return bomItems.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch = !searchTerm ||
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [bomItems, selectedCategory, searchTerm]);

  // Totals
  const totalBOMCost = useMemo(() => {
    return bomItems.reduce((sum, item) => sum + item.extendedCost, 0);
  }, [bomItems]);

  const totalQuantityUnits = useMemo(() => {
    return bomItems.reduce((sum, item) => sum + item.totalQuantity, 0);
  }, [bomItems]);

  return (
    <div className="space-y-5 font-mono">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEstimation}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Back to Estimation"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-800 font-bold text-sm">{project.projectCode}</span>
              <Badge variant="purple" size="sm">CONSOLIDATED BOM</Badge>
              <span className="text-xs text-slate-500 font-sans">{project.projectName}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Consolidated Switchgear Bill of Materials (BOM)
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Aggregated procurement quantities across all project switchboards for purchasing & supplier RFQs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBOMToCSV(project.projectCode, bomItems)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export BOM (CSV)</span>
          </button>

          <button
            onClick={onNavigateToQuotation}
            className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span>Proceed to Quotation</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Unique Part Numbers</span>
          <span className="text-2xl font-bold text-cyan-800 mt-1 block">{bomItems.length}</span>
          <span className="text-[10px] text-slate-400">Catalog items required</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Total Units / Quantities</span>
          <span className="text-2xl font-bold text-purple-800 mt-1 block">{totalQuantityUnits}</span>
          <span className="text-[10px] text-slate-400">Total physical devices</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Total Equipment Procurement Value</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {totalBOMCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal">AED</span>
          </span>
          <span className="text-[10px] text-slate-400">Net supplier purchase budget</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px]">Switchboards Included</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {project.panelsCount || 0} Panels
          </span>
          <span className="text-[10px] text-slate-400">MDB, SMDB, APFC, MCC</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search part number, description, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-cyan-600"
          >
            <option value="ALL">All Categories ({bomItems.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 text-[11px] self-center">
          Showing {filteredItems.length} of {bomItems.length} procurement lines
        </span>
      </div>

      {/* Consolidated BOM Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Item #</th>
                <th className="py-2.5 px-3">Part Number</th>
                <th className="py-2.5 px-3">Equipment Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">OEM</th>
                <th className="py-2.5 px-3 text-right">Total Qty</th>
                <th className="py-2.5 px-3 text-right">Net Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Extended Cost</th>
                <th className="py-2.5 px-3">Used In Panels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No components found in the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-slate-400 text-[11px]">{index + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {item.partNumber}
                    </td>
                    <td className="py-2 px-3 text-slate-700 max-w-md">
                      {item.description}
                    </td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <Badge variant="blue" size="sm">{item.manufacturer}</Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-800 whitespace-nowrap">
                      {item.totalQuantity} {item.unit}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 whitespace-nowrap">
                      {item.unitRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                      {item.extendedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.usedInPanels.map((p) => (
                          <Badge key={p} variant="purple" size="sm">{p}</Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right text-slate-600">
                    Total Consolidated BOM Value:
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-800">
                    {totalQuantityUnits} Units
                  </td>
                  <td></td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">
                    {totalBOMCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
