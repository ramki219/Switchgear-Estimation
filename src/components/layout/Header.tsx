import React from 'react';
import { Plus, Download, RefreshCw, Database, DollarSign } from 'lucide-react';
import { NavView } from './Sidebar';

interface HeaderProps {
  currentView: NavView;
  onOpenAddComponent: () => void;
  onOpenAddPrice: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenAddComponent,
  onOpenAddPrice,
  onResetData,
  onExportCSV,
  onOpenArchitecture,
}) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Estimation Operations Dashboard',
      subtitle: 'Overview of switchgear component catalog, active price records, tenders & panel estimations',
    },
    sld_studio: {
      title: 'LV Switchgear Engineering & SLD Design Studio',
      subtitle: 'IEC 61439-1/2 SLD auto-generation, 2D panel GA drawing, door facia mimic, ATS interlocking & customer BOQ',
    },
    bureau: {
      title: 'Tender Bidding Bureau (Model A Production Portal)',
      subtitle: 'Outsourced tendering service, contractor OEM discount agreements, multi-brand value engineering & copper risk simulator',
    },
    projects: {
      title: 'Tender Projects & RFQs',
      subtitle: 'Client enquiries, utility authority standards (DEWA/SEWA/ADDC/Kahramaa), tender submission deadlines & status',
    },
    workspace: {
      title: 'Panel Estimation & Sizing Workspace',
      subtitle: 'Multi-panel switchboard engineering, circuit feeders, automated copper busbar calculation & sheet metal fabrication',
    },
    bom: {
      title: 'Consolidated Bill of Materials (BOM)',
      subtitle: 'Automated procurement bill of materials aggregated across all switchboards with live purchasing rates',
    },
    quotations: {
      title: 'Commercial Quotations & Proposal Generator',
      subtitle: 'Direct manufacturing costs, overhead %, margin markup, GCC VAT calculation & formal client proposals',
    },
    components: {
      title: 'Component Master Catalog',
      subtitle: 'Air circuit breakers, MCCBs, MCBs, contactors, APFC capacitors & switchboard equipment',
    },
    manufacturers: {
      title: 'Switchgear Manufacturers (OEMs)',
      subtitle: 'ABB, Schneider, Siemens, Eaton, Hager, RTR Energia, Lovato & certified OEMs',
    },
    suppliers: {
      title: 'Supplier & Vendor Directory',
      subtitle: 'Authorized distributors, trading partners, commercial terms and currencies',
    },
    prices: {
      title: 'Pricing Database & History',
      subtitle: 'Strict historical price preservation - track list prices, discounts, net rates and revisions',
    },
    panel_types: {
      title: 'Panel Types & Standard Assemblies',
      subtitle: 'MDB, SMDB, DB, MCC, APFC & ATS panel configurations per IEC 61439',
    },
    labour_rates: {
      title: 'Labour & Fabrication Rates',
      subtitle: 'Activity-based hourly costing for copper busbar fabrication, wiring, assembly & testing',
    },
    architecture: {
      title: 'SQL Server & Backend Architecture',
      subtitle: 'DDL schemas, EF Core models, Stored Procedures, C# REST Controllers & deployment guides',
    },
    audit: {
      title: 'System Audit Trail',
      subtitle: 'Immutable record of master data changes, price revisions and engineering updates',
    },
  };

  const current = titles[currentView] || { title: 'LV Switchgear Estimator', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
      <div>
        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-xs text-slate-500 font-mono">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* SQL Architecture shortcut */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-md transition-colors"
          title="View SQL Server Scripts & EF Core Architecture"
        >
          <Database className="w-3.5 h-3.5 text-cyan-700" />
          <span>SQL Scripts</span>
        </button>

        {/* Quick Add Component */}
        <button
          onClick={onOpenAddComponent}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Add Component</span>
        </button>

        {/* Quick Revise Price */}
        <button
          onClick={onOpenAddPrice}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors shadow-2xs"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>New Price Entry</span>
        </button>

        {/* CSV Export */}
        <button
          onClick={onExportCSV}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
          title="Export Active View to CSV"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Reset Data */}
        <button
          onClick={onResetData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
          title="Reset to Initial Seed Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
