import React, { useState } from 'react';
import { 
  Cpu, 
  Factory, 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  History, 
  TrendingUp, 
  ArrowUpRight, 
  Search, 
  FileCode, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Calculator,
  FolderGit2,
  Receipt,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { Component, SupplierPrice, Manufacturer, DashboardMetrics, Project } from '../../types';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  recentPrices: SupplierPrice[];
  components: Component[];
  manufacturers: Manufacturer[];
  projects?: Project[];
  onNavigate: (view: any) => void;
  onSelectComponent: (comp: Component) => void;
  onOpenNewPrice: (componentId?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentPrices,
  components,
  manufacturers,
  projects = [],
  onNavigate,
  onSelectComponent,
  onOpenNewPrice,
}) => {
  const [quickSearch, setQuickSearch] = useState('');

  const totalPipelineAED = projects.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
  const totalPanelsCount = projects.reduce((sum, p) => sum + (p.panelsCount || 0), 0);

  const filteredQuickResults = quickSearch.trim()
    ? components.filter(c => 
        c.componentName.toLowerCase().includes(quickSearch.toLowerCase()) ||
        c.partNumber.toLowerCase().includes(quickSearch.toLowerCase()) ||
        (c.model && c.model.toLowerCase().includes(quickSearch.toLowerCase())) ||
        (c.ratedCurrent && `${c.ratedCurrent}A`.toLowerCase().includes(quickSearch.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Components */}
        <div 
          onClick={() => onNavigate('components')}
          className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-900/80 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Components</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {metrics.totalComponents}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{metrics.activeComponents} Active</span>
          </div>
        </div>

        {/* Card 2: Manufacturers */}
        <div 
          onClick={() => onNavigate('manufacturers')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-900/80 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Manufacturers</span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {metrics.totalManufacturers}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            ABB, Schneider, Siemens...
          </div>
        </div>

        {/* Card 3: Suppliers */}
        <div 
          onClick={() => onNavigate('suppliers')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-900/80 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Suppliers</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {metrics.totalSuppliers}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Authorized vendors
          </div>
        </div>

        {/* Card 4: Current Price Records */}
        <div 
          onClick={() => onNavigate('prices')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-900/80 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Current Prices</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {metrics.currentPriceRecords}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Active supplier quotes
          </div>
        </div>

        {/* Card 5: Price History Records */}
        <div 
          onClick={() => onNavigate('prices')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-900/80 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Price History</span>
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {metrics.historicalPriceRecords}
          </div>
          <div className="text-[11px] text-purple-400 font-mono mt-1">
            Historical log rows
          </div>
        </div>

        {/* Card 6: Database Engine */}
        <div 
          onClick={() => onNavigate('architecture')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-lg cursor-pointer transition-all hover:bg-slate-900/80 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">SQL Engine</span>
            <FileCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            SQL Server
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1 flex items-center gap-1">
            <span>7 Schemas Ready</span>
          </div>
        </div>
      </div>

      {/* Phase 2: Active Tender Estimation & Panel Engineering Pipeline Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/50 border border-cyan-800/60 rounded-lg p-5 font-mono">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                PHASE 2 ESTIMATION ENGINE ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">IEC 61439 Switchboard Sizing</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Active Switchgear Tender Pipeline & Multi-Panel Workspace
            </h3>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Live engineering calculations for Copper Busbars (ETP 99.9%), Sheet Metal Enclosures, Feeders & Commercial Quotations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-slate-800 px-4 py-2 rounded text-right">
              <span className="text-[10px] text-slate-400 block">Tender Volume</span>
              <span className="text-sm font-bold text-emerald-400">
                {totalPipelineAED.toLocaleString(undefined, { maximumFractionDigits: 0 })} AED
              </span>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 px-4 py-2 rounded text-right">
              <span className="text-[10px] text-slate-400 block">Switchboards</span>
              <span className="text-sm font-bold text-cyan-400">
                {totalPanelsCount} Panels
              </span>
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Launch Projects</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onNavigate('workspace')}
            className="p-2.5 bg-slate-950/60 hover:bg-slate-800/60 rounded border border-slate-800 flex items-center justify-between text-slate-300 transition"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Panel Sizing Engine (Busbars & Labour)</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => onNavigate('bom')}
            className="p-2.5 bg-slate-950/60 hover:bg-slate-800/60 rounded border border-slate-800 flex items-center justify-between text-slate-300 transition"
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>Consolidated BOM Generator</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => onNavigate('quotations')}
            className="p-2.5 bg-slate-950/60 hover:bg-slate-800/60 rounded border border-slate-800 flex items-center justify-between text-slate-300 transition"
          >
            <span className="flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-purple-400" />
              <span>Commercial Quotations & Margin Markup</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Quick Component Price Lookup Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Quick Component Price & Lead Time Lookup</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Instantly find current net pricing by part number, rating (e.g. "1600A", "400A", "50 kvar") or OEM
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="e.g. 1SDA071018R1, 1600A, NSX400F, PM5350..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {quickSearch.trim() && (
          <div className="mt-3 border-t border-slate-800 pt-3">
            {filteredQuickResults.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">No matching switchgear components found.</p>
            ) : (
              <div className="space-y-2">
                {filteredQuickResults.map((comp) => (
                  <div
                    key={comp.componentID}
                    onClick={() => onSelectComponent(comp)}
                    className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-cyan-400">{comp.partNumber}</span>
                      <span className="text-xs text-slate-200">{comp.componentName}</span>
                      <Badge variant="purple">{comp.manufacturerCode}</Badge>
                      {comp.ratedCurrent && (
                        <Badge variant="info">{comp.ratedCurrent}A</Badge>
                      )}
                      {comp.breakingCapacity && (
                        <Badge variant="warning">{comp.breakingCapacity}kA</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {comp.currentPrice ? (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {comp.currentPrice.currency} {comp.currentPrice.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            via {comp.currentPrice.supplierName} ({comp.currentPrice.leadTimeDays || 14}d lead)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400/80 font-mono">Not Quoted</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Recent Price Revisions & OEM Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Price Changes Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Recent Price Changes & Historical Updates</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Preserving price records across supplier revisions (Never overwriting old costs)
              </p>
            </div>
            <button
              onClick={() => onNavigate('prices')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Prices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-mono uppercase bg-slate-950/40">
                  <th className="py-2.5 px-3">Part Number & Item</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right">List Price</th>
                  <th className="py-2.5 px-3 text-right">Disc %</th>
                  <th className="py-2.5 px-3 text-right">Net Price</th>
                  <th className="py-2.5 px-3">Price Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentPrices.slice(0, 7).map((p) => (
                  <tr key={p.supplierPriceID} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{p.partNumber}</div>
                      <div className="text-[11px] text-slate-400 font-sans truncate max-w-xs">{p.componentName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[140px]">
                      {p.supplierName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {p.listPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400/90">
                      {p.discountPercent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {p.currency} {p.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {p.priceDate}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.isCurrent ? (
                        <Badge variant="success" size="sm">CURRENT</Badge>
                      ) : (
                        <Badge variant="default" size="sm">ARCHIVED</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OEM Breakdown & Architecture Highlights (1 col) */}
        <div className="space-y-6">
          {/* OEM Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-amber-400" />
                <span>OEM Component Share</span>
              </span>
              <button 
                onClick={() => onNavigate('manufacturers')}
                className="text-[11px] text-cyan-400 font-mono hover:underline"
              >
                Manage
              </button>
            </h3>
            
            <div className="space-y-2.5">
              {manufacturers.slice(0, 6).map((mfg) => {
                const count = components.filter(c => c.manufacturerID === mfg.manufacturerID).length;
                const percentage = Math.round((count / (components.length || 1)) * 100);
                return (
                  <div key={mfg.manufacturerID} className="text-xs">
                    <div className="flex justify-between text-slate-300 font-mono mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        {mfg.manufacturerName}
                      </span>
                      <span className="text-slate-400">{count} items ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Phase 1 Scope Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Phase 1 Architecture Status</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Phase 1 establishes the single source of truth: master data, components catalog with electrical specs, supplier directory, and historical pricing engine.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => onNavigate('architecture')}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-slate-300 text-center transition-colors"
              >
                View SQL DDL
              </button>
              <button
                onClick={() => onOpenNewPrice()}
                className="p-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 rounded text-cyan-300 text-center transition-colors"
              >
                + Revise Price
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
