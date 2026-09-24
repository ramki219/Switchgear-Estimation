import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Factory, 
  Truck, 
  DollarSign, 
  Layers, 
  Clock, 
  Database, 
  FileText, 
  History, 
  Calculator, 
  FolderKanban, 
  Receipt, 
  FileSpreadsheet, 
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FolderGit2
} from 'lucide-react';

export type NavView = 
  | 'dashboard' 
  | 'projects'
  | 'workspace'
  | 'bom'
  | 'quotations'
  | 'components' 
  | 'manufacturers' 
  | 'suppliers' 
  | 'prices' 
  | 'panel_types' 
  | 'labour_rates' 
  | 'architecture' 
  | 'audit';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  componentCount: number;
  priceCount: number;
  projectCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  componentCount,
  priceCount,
  projectCount = 3,
}) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shadow-xs">
          LV
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
            LV ESTIMATOR
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
              PHASE 2
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono">Switchgear Estimation ERP</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
        {/* Core */}
        <div>
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Phase 2 Estimation & Costing Engine */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Estimation Engine</span>
            <span className="text-[9px] px-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">Phase 2</span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectView('projects')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'projects'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>Projects & RFQs</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {projectCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('workspace')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'workspace'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Panel Sizing Engine</span>
            </button>

            <button
              onClick={() => onSelectView('bom')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'bom'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Bill of Materials (BOM)</span>
            </button>

            <button
              onClick={() => onSelectView('quotations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'quotations'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4 text-purple-400" />
              <span>Commercial Quotations</span>
            </button>
          </div>
        </div>

        {/* Master Data */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Master Data & Catalog
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectView('components')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'components'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Components Catalog</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {componentCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('prices')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'prices'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Supplier Price History</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {priceCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('manufacturers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'manufacturers'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Factory className="w-4 h-4 text-amber-400" />
              <span>Manufacturers (OEMs)</span>
            </button>

            <button
              onClick={() => onSelectView('suppliers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'suppliers'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Suppliers</span>
            </button>

            <button
              onClick={() => onSelectView('panel_types')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'panel_types'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Panel Types</span>
            </button>
          </div>
        </div>

        {/* Costing */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Costing & Architecture
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectView('labour_rates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'labour_rates'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Labour & Assembly Rates</span>
            </button>

            <button
              onClick={() => onSelectView('architecture')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'architecture'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>SQL Server & EF Core</span>
            </button>

            <button
              onClick={() => onSelectView('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${
                currentView === 'audit'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Phase 2 Engine Online</span>
        </div>
        <div className="text-slate-400">IEC 61439 Sizing & Quotations</div>
      </div>
    </aside>
  );
};
