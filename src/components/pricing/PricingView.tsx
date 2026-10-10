import React, { useState, useMemo } from 'react';
import { 
  SupplierPrice, 
  Component, 
  Manufacturer, 
  Supplier 
} from '../../types';
import { 
  Search, 
  Plus, 
  History, 
  Download, 
  ArrowUpRight, 
  Filter, 
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PricingViewProps {
  prices: SupplierPrice[];
  components: Component[];
  manufacturers: Manufacturer[];
  suppliers: Supplier[];
  onOpenNewPrice: (componentId?: number) => void;
  onOpenPriceHistory: (comp: Component) => void;
  onExportCSV: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  prices,
  components,
  manufacturers,
  suppliers,
  onOpenNewPrice,
  onOpenPriceHistory,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'CURRENT' | 'ARCHIVED'>('CURRENT');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      // 1. Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match = 
          (p.partNumber && p.partNumber.toLowerCase().includes(term)) ||
          (p.componentName && p.componentName.toLowerCase().includes(term)) ||
          (p.supplierPartNumber && p.supplierPartNumber.toLowerCase().includes(term)) ||
          (p.quotationReference && p.quotationReference.toLowerCase().includes(term));
        if (!match) return false;
      }

      // 2. Supplier filter
      if (selectedSupplier !== 'ALL' && p.supplierID !== Number(selectedSupplier)) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus === 'CURRENT' && !p.isCurrent) return false;
      if (selectedStatus === 'ARCHIVED' && p.isCurrent) return false;

      // 4. Currency filter
      if (selectedCurrency !== 'ALL' && p.currency !== selectedCurrency) {
        return false;
      }

      return true;
    });
  }, [prices, searchTerm, selectedSupplier, selectedStatus, selectedCurrency]);

  const totalPages = Math.ceil(filteredPrices.length / pageSize) || 1;
  const paginatedPrices = filteredPrices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by part number, component name, quotation reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-600"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status toggle */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-600 font-mono"
            >
              <option value="CURRENT">Current Active Quotes</option>
              <option value="ARCHIVED">Archived Historical Logs</option>
              <option value="ALL">All Price Records</option>
            </select>

            {/* Supplier filter */}
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.supplierID} value={s.supplierID}>
                  {s.supplierName}
                </option>
              ))}
            </select>

            {/* Currency filter */}
            <select
              value={selectedCurrency}
              onChange={(e) => {
                setSelectedCurrency(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-600 font-mono"
            >
              <option value="ALL">All Currencies</option>
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SAR">SAR</option>
            </select>

            {/* Add Price */}
            <button
              onClick={() => onOpenNewPrice()}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Price Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-mono">
        <div>
          Found <span className="text-slate-900 font-semibold">{filteredPrices.length}</span> price records 
          {selectedStatus === 'CURRENT' && ' (Current active rates)'}
          {selectedStatus === 'ARCHIVED' && ' (Historical archived rates)'}
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-mono text-xs font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Price Sheet (.CSV)</span>
        </button>
      </div>

      {/* Price Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-600 font-mono uppercase bg-slate-50">
                <th className="py-3 px-4">Part Number & Item</th>
                <th className="py-3 px-4">Supplier & Ref</th>
                <th className="py-3 px-4 text-right">List Price</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Net Buying Price</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4">Effective / Valid</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedPrices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono">
                    No price records matching current criteria.
                  </td>
                </tr>
              ) : (
                paginatedPrices.map((p) => {
                  const comp = components.find(c => c.componentID === p.componentID);
                  return (
                    <tr 
                      key={p.supplierPriceID} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        p.isCurrent ? '' : 'opacity-75'
                      }`}
                    >
                      {/* Part Number & Item */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-cyan-800 text-xs">{p.partNumber}</div>
                        <div className="text-[11px] text-slate-600 font-sans truncate max-w-xs">
                          {p.componentName}
                        </div>
                        {p.manufacturerName && (
                          <span className="text-[10px] text-purple-700">
                            OEM: {p.manufacturerName}
                          </span>
                        )}
                      </td>

                      {/* Supplier & Ref */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 font-sans truncate max-w-[150px]">
                          {p.supplierName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Ref: {p.quotationReference || '-'}
                        </div>
                      </td>

                      {/* List Price */}
                      <td className="py-3 px-4 text-right text-slate-600">
                        {p.currency} {p.listPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-4 text-right text-amber-700 font-semibold">
                        {p.discountPercent.toFixed(1)}%
                      </td>

                      {/* Net Price (Computed Column) */}
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold text-xs ${p.isCurrent ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {p.currency} {p.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Min Qty: {p.minimumQuantity}
                        </span>
                      </td>

                      {/* Lead Time */}
                      <td className="py-3 px-4 text-slate-700">
                        <span>{p.leadTimeDays || 14} Days</span>
                      </td>

                      {/* Effective Date & Validity */}
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        <div>From: {p.priceDate}</div>
                        <div>
                          {p.validUntil ? `Until: ${p.validUntil}` : <span className="text-emerald-700 font-medium">Active</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {p.isCurrent ? (
                          <Badge variant="success">CURRENT</Badge>
                        ) : (
                          <Badge variant="default">ARCHIVED</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => comp && onOpenPriceHistory(comp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-purple-800 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                        >
                          <History className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs font-mono bg-slate-50">
          <div className="text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-slate-700 transition"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-slate-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
