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
  History, 
  Calculator, 
  Receipt, 
  FileSpreadsheet, 
  FolderGit2, 
  Briefcase,
  Zap
} from 'lucide-react';

export type NavView = 
  | 'dashboard' 
  | 'sld_studio'
  | 'bureau'
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
  const getNavClass = (view: NavView) => {
    return currentView === view
      ? 'bg-cyan-50 text-cyan-900 font-semibold border-l-2 border-cyan-600 shadow-2xs'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold font-mono text-xs shadow-xs">
          LV
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            LV ESTIMATOR
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
              PRO
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-mono">Switchgear Estimation ERP</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
        {/* Core */}
        <div>
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-600" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Model A: Outsourced Bidding Bureau Hub */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Bidding Bureau</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold">Model A</span>
          </div>
          <button
            onClick={() => onSelectView('bureau')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('bureau')}`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-cyan-600" />
              <span>Tender Bidding Portal</span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold">
              Live
            </span>
          </button>
        </div>

        {/* Engineering & SLD Studio */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
            <span>Engineering & Design</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded font-bold">IEC 61439</span>
          </div>
          <button
            onClick={() => onSelectView('sld_studio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('sld_studio')}`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-cyan-600" />
              <span className="font-semibold">SLD & CAD Studio</span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              Full Suite
            </span>
          </button>
        </div>

        {/* Estimation & Sizing Engine */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Estimation Engine
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('projects')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('projects')}`}
            >
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-cyan-600" />
                <span>Projects & RFQs</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {projectCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('workspace')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('workspace')}`}
            >
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>Panel Sizing Engine</span>
            </button>

            <button
              onClick={() => onSelectView('bom')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('bom')}`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Bill of Materials (BOM)</span>
            </button>

            <button
              onClick={() => onSelectView('quotations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('quotations')}`}
            >
              <Receipt className="w-4 h-4 text-purple-600" />
              <span>Commercial Quotations</span>
            </button>
          </div>
        </div>

        {/* Master Data */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Master Data & Catalog
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('components')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('components')}`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Components Catalog</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {componentCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('prices')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('prices')}`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Supplier Price History</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {priceCount}
              </span>
            </button>

            <button
              onClick={() => onSelectView('manufacturers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('manufacturers')}`}
            >
              <Factory className="w-4 h-4 text-amber-600" />
              <span>Manufacturers (OEMs)</span>
            </button>

            <button
              onClick={() => onSelectView('suppliers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('suppliers')}`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Suppliers</span>
            </button>

            <button
              onClick={() => onSelectView('panel_types')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('panel_types')}`}
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Panel Types</span>
            </button>
          </div>
        </div>

        {/* Costing & Architecture */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Engineering & System
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectView('labour_rates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('labour_rates')}`}
            >
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Labour Rates</span>
            </button>

            <button
              onClick={() => onSelectView('architecture')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('architecture')}`}
            >
              <Database className="w-4 h-4 text-cyan-600" />
              <span>SQL & Cloud API</span>
            </button>

            <button
              onClick={() => onSelectView('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left font-medium transition-colors ${getNavClass('audit')}`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User / Session footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-slate-600 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-[10px]">
              PE
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-[11px]">Lead Estimator</div>
              <div className="text-[10px] text-slate-500 font-mono">IEC 61439 Bureau</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected"></span>
        </div>
      </div>
    </aside>
  );
};
