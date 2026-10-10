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
  ChevronRight, 
  ShieldCheck, 
  Calculator, 
  FolderGit2, 
  Receipt, 
  FileSpreadsheet, 
  ArrowRight,
  Zap,
  Sparkles,
  Sliders,
  Ruler
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
          className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono">Components</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {metrics.totalComponents}
          </div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{metrics.activeComponents} Active</span>
          </div>
        </div>

        {/* Card 2: Manufacturers */}
        <div 
          onClick={() => onNavigate('manufacturers')}
          className="bg-white border border-slate-200 hover:border-amber-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono">Manufacturers</span>
            <Factory className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {metrics.totalManufacturers}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            ABB, Schneider, Siemens...
          </div>
        </div>

        {/* Card 3: Suppliers */}
        <div 
          onClick={() => onNavigate('suppliers')}
          className="bg-white border border-slate-200 hover:border-emerald-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono">Suppliers</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {metrics.totalSuppliers}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Authorized vendors
          </div>
        </div>

        {/* Card 4: Current Price Records */}
        <div 
          onClick={() => onNavigate('prices')}
          className="bg-white border border-slate-200 hover:border-cyan-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono">Current Prices</span>
            <DollarSign className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-700">
            {metrics.currentPriceRecords}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Active supplier quotes
          </div>
        </div>

        {/* Card 5: Price History Records */}
        <div 
          onClick={() => onNavigate('prices')}
          className="bg-white border border-slate-200 hover:border-purple-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono">Price History</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-800">
            {metrics.historicalPriceRecords}
          </div>
          <div className="text-[11px] text-purple-700 font-mono mt-1">
            Historical log rows
          </div>
        </div>

        {/* Card 6: Database Engine */}
        <div 
          onClick={() => onNavigate('architecture')}
          className="bg-white border border-slate-200 hover:border-cyan-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono">SQL Engine</span>
            <FileCode className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            SQL Server
          </div>
          <div className="text-[11px] text-cyan-700 font-mono mt-1 flex items-center gap-1">
            <span>7 Schemas Ready</span>
          </div>
        </div>
      </div>

      {/* NEW: Professional LV Switchgear Engineering & SLD Studio Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded font-mono uppercase">
                ENGINEERING CORE WORKFLOW
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono">
                IEC 61439-1 / 61439-2
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-mono">
                SINGLE SOURCE OF TRUTH
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              <span>Full LV Switchgear Engineering & SLD Design Studio</span>
            </h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Convert raw SLD inputs and tender specifications into complete switchgear engineering: 
              <strong> SLD Auto-Generation → 2D Panel GA Drawing → Door Facia Mimic → ATS Interlocking Logic → Busbar Calculations → Control Wiring Schedules → Customer BOQ Schedule</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Natural Language / SLD Input
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                2D Panel GA & Dimensions
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Door Facia Mimic
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Safety & Compliance Check
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onNavigate('sld_studio')}
              className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Launch SLD Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Phase 2: Active Tender Estimation & Panel Engineering Pipeline Banner */}
      <div className="bg-linear-to-r from-cyan-50 via-white to-purple-50 border border-cyan-200 rounded-xl p-5 font-mono shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                ESTIMATION ENGINE ACTIVE
              </span>
              <span className="text-xs text-slate-500 font-mono">IEC 61439 Switchboard Sizing</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Active Switchgear Tender Pipeline & Multi-Panel Workspace
            </h3>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Live engineering calculations for Copper Busbars (ETP 99.9%), Sheet Metal Enclosures, Feeders & Commercial Quotations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Tender Volume</span>
              <span className="text-sm font-bold text-emerald-700">
                {totalPipelineAED.toLocaleString(undefined, { maximumFractionDigits: 0 })} AED
              </span>
            </div>

            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Switchboards</span>
              <span className="text-sm font-bold text-cyan-700">
                {totalPanelsCount} Panels
              </span>
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Launch Projects</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs">
          <button
            onClick={() => onNavigate('workspace')}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-slate-700 transition shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              <span>Panel Sizing Engine (Busbars & Labour)</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('bom')}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-slate-700 transition shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Consolidated BOM Generator</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('quotations')}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-slate-700 transition shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span>Commercial Quotations & Margin Markup</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Quick Component Price Lookup Tool */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-600" />
              <span>Quick Component Price & Lead Time Lookup</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Instantly find current net pricing by part number, rating (e.g. "1600A", "400A", "50 kvar") or OEM
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="e.g. 1SDA071018R1, 1600A, NSX400F, PM5350..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {quickSearch.trim() && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            {filteredQuickResults.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">No matching switchgear components found.</p>
            ) : (
              <div className="space-y-2">
                {filteredQuickResults.map((comp) => (
                  <div
                    key={comp.componentID}
                    onClick={() => onSelectComponent(comp)}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-cyan-800">{comp.partNumber}</span>
                      <span className="text-xs text-slate-800">{comp.componentName}</span>
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
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            {comp.currentPrice.currency} {comp.currentPrice.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            via {comp.currentPrice.supplierName} ({comp.currentPrice.leadTimeDays || 14}d lead)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 font-mono">Not Quoted</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
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
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Recent Price Changes & Historical Updates</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Preserving price records across supplier revisions (Never overwriting old costs)
              </p>
            </div>
            <button
              onClick={() => onNavigate('prices')}
              className="text-xs font-mono text-cyan-700 hover:text-cyan-800 font-medium flex items-center gap-1"
            >
              <span>View All Prices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-mono uppercase bg-slate-50">
                  <th className="py-2.5 px-3">Part Number & Item</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right">List Price</th>
                  <th className="py-2.5 px-3 text-right">Disc %</th>
                  <th className="py-2.5 px-3 text-right">Net Price</th>
                  <th className="py-2.5 px-3">Price Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {recentPrices.slice(0, 7).map((p) => (
                  <tr key={p.supplierPriceID} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{p.partNumber}</div>
                      <div className="text-[11px] text-slate-500 font-sans truncate max-w-xs">{p.componentName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-sans truncate max-w-[140px]">
                      {p.supplierName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {p.listPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                      {p.discountPercent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {p.currency} {p.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-amber-600" />
                <span>OEM Component Share</span>
              </span>
              <button 
                onClick={() => onNavigate('manufacturers')}
                className="text-[11px] text-cyan-700 font-mono font-medium hover:underline"
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
                    <div className="flex justify-between text-slate-700 font-mono mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        {mfg.manufacturerName}
                      </span>
                      <span className="text-slate-500">{count} items ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Phase 1 Scope Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>System & Data Security</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Single source of truth: master data, components catalog with electrical specs, supplier directory, and historical pricing engine.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => onNavigate('architecture')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-center font-medium transition-colors"
              >
                View SQL DDL
              </button>
              <button
                onClick={() => onOpenNewPrice()}
                className="p-2 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-cyan-800 text-center font-medium transition-colors"
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
