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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by part number, component name, quotation reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
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
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
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
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Price Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
        <div>
          Found <span className="text-slate-100 font-semibold">{filteredPrices.length}</span> price records 
          {selectedStatus === 'CURRENT' && ' (Current active rates)'}
          {selectedStatus === 'ARCHIVED' && ' (Historical archived rates)'}
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Price Sheet (.CSV)</span>
        </button>
      </div>

      {/* Price Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono uppercase bg-slate-950/60">
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
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedPrices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-mono">
                    No price records matching current criteria.
                  </td>
                </tr>
              ) : (
                paginatedPrices.map((p) => {
                  const comp = components.find(c => c.componentID === p.componentID);
                  return (
                    <tr 
                      key={p.supplierPriceID} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        p.isCurrent ? '' : 'opacity-75'
                      }`}
                    >
                      {/* Part Number & Item */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-cyan-400">{p.partNumber}</div>
                        <div className="text-[11px] text-slate-400 font-sans truncate max-w-xs">
                          {p.componentName}
                        </div>
                        {p.manufacturerName && (
                          <span className="text-[10px] text-purple-300">
                            OEM: {p.manufacturerName}
                          </span>
                        )}
                      </td>

                      {/* Supplier & Ref */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 font-sans truncate max-w-[150px]">
                          {p.supplierName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ref: {p.quotationReference || '-'}
                        </div>
                      </td>

                      {/* List Price */}
                      <td className="py-3 px-4 text-right text-slate-400">
                        {p.currency} {p.listPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-4 text-right text-amber-400">
                        {p.discountPercent.toFixed(1)}%
                      </td>

                      {/* Net Price (Computed Column) */}
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold text-xs ${p.isCurrent ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {p.currency} {p.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Min Qty: {p.minimumQuantity}
                        </span>
                      </td>

                      {/* Lead Time */}
                      <td className="py-3 px-4 text-slate-300">
                        <span>{p.leadTimeDays || 14} Days</span>
                      </td>

                      {/* Effective Date & Validity */}
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        <div>From: {p.priceDate}</div>
                        <div>
                          {p.validUntil ? `Until: ${p.validUntil}` : <span className="text-emerald-400/80">Active</span>}
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 rounded transition-colors"
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
