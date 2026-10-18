import React from 'react';
import { Plus, Download, RefreshCw, Database, DollarSign, ShieldCheck, User, Building2, LogOut, FileText } from 'lucide-react';
import { NavView } from './Sidebar';
import { CompanyTenant, SaaSUser } from '../../types';

interface HeaderProps {
  currentView: NavView;
  currentUser?: SaaSUser | null;
  currentCompany?: CompanyTenant;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onOpenAddComponent: () => void;
  onOpenAddPrice: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
  onOpenArchitecture: () => void;
  onOpenDocumentation?: () => void;
  onNavigateToClientApprovals?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentUser,
  currentCompany,
  onOpenAuthModal,
  onLogout,
  onOpenAddComponent,
  onOpenAddPrice,
  onResetData,
  onExportCSV,
  onOpenArchitecture,
  onOpenDocumentation,
  onNavigateToClientApprovals,
}) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Sales & Estimation Intelligence Dashboard',
      subtitle: 'Complete commercial workflow: RFQ received → Costing → Quotation submitted → Follow-up → PO booked → Handover & Profitability',
    },
    po_register: {
      title: 'Purchase Order Booking & Verification Register',
      subtitle: 'Customer PO registration, verified value entry ex-VAT, 5% VAT, variance vs quoted price & immutable audit history',
    },
    follow_ups: {
      title: 'Commercial Follow-Up & Client Action Center',
      subtitle: 'Track interactions, consultant review approvals, overdue tender follow-ups, and scheduled reminders',
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
    production: {
      title: 'Production Handover & Procurement Floor',
      subtitle: 'Approved BOM conversion, workshop job cards, fabrication tracking, shortage reports & material requisitions',
    },
    saas_billing: {
      title: 'SaaS Subscription Plans & Licensing',
      subtitle: 'Multi-tenant cloud licensing for UAE switchgear manufacturers, project quotas & plan upgrades in AED',
    },
    company_settings: {
      title: 'Company Profile, UAE TRN & Costing Settings',
      subtitle: 'Trade license details, 15-digit FTA VAT TRN, costing formulas (Markup vs Margin), UAE VAT & engineering team roles',
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
    predefined_assemblies: {
      title: 'Predefined Assemblies & Ready Final Prices',
      subtitle: 'Fixed design ATS, Capacitor Banks (APFC), Motor Starter panels & SMDBs with ready final prices and 1-click project picking',
    },
    labour_rates: {
      title: 'Labour & Fabrication Rates',
      subtitle: 'Activity-based hourly costing for copper busbar fabrication, wiring, assembly & testing',
    },
    client_approvals: {
      title: 'Client Companies & User Login Approvals',
      subtitle: 'Verified client directory, trade licenses, approval workflows, and Firebase user access management',
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
  const isPlatformAdmin = (currentUser as any)?.role === 'ADMIN' || (currentUser as any)?.saasRole === 'PLATFORM_ADMIN';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
      <div>
        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-xs text-slate-500 font-mono">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick Client & Approval Counter Pill (Platform Admin Only) */}
        {isPlatformAdmin && onNavigateToClientApprovals && (
          <button
            onClick={onNavigateToClientApprovals}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer border ${
              currentView === 'client_approvals'
                ? 'bg-cyan-700 text-white border-cyan-800'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
            title="Check how many clients are registered and manage login approvals"
          >
            <Building2 className={`w-3.5 h-3.5 ${currentView === 'client_approvals' ? 'text-white' : 'text-emerald-700'}`} />
            <span className="hidden sm:inline">Clients &amp; Approvals</span>
          </button>
        )}

        {/* User Authentication & Tenant Isolation Badge */}
        {onOpenAuthModal && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={isPlatformAdmin ? onOpenAuthModal : undefined}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs transition shadow-2xs font-mono"
              title="Active Authenticated Tenant Session"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left font-sans leading-tight hidden lg:block">
                <div className="text-[11px] font-bold text-slate-900 truncate max-w-[140px]">
                  {currentUser?.fullName || 'User'}
                </div>
                <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                  <span className="text-cyan-800 font-semibold">{currentCompany?.companyCode || 'TENANT'}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">{currentCompany?.plan || 'TRIAL'}</span>
                </div>
              </div>
              {isPlatformAdmin && (
                <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded font-bold ml-1 font-mono">
                  Switch
                </span>
              )}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Log out and return to Login Screen"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-mono text-[11px]">Logout</span>
              </button>
            )}
          </div>
        )}

        {/* Project Manual & PDF Architecture button (Platform Admin Only) */}
        {isPlatformAdmin && onOpenDocumentation && (
          <button
            onClick={onOpenDocumentation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border border-blue-500 rounded-md transition-all shadow-2xs"
            title="Open Project Architecture Manual & Download Official PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Project PDF Manual</span>
          </button>
        )}

        {/* SQL Architecture shortcut (Platform Admin Only) */}
        {isPlatformAdmin && (
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-md transition-colors"
            title="View SQL Server Scripts & EF Core Architecture"
          >
            <Database className="w-3.5 h-3.5 text-cyan-700" />
            <span>SQL Scripts</span>
          </button>
        )}

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

        {/* Reset Data (Platform Admin Only) */}
        {isPlatformAdmin && (
          <button
            onClick={onResetData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            title="Reset to Initial Seed Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
