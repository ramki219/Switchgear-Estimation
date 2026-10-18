import React, { useState, useMemo } from 'react';
import { 
  Quotation, 
  PurchaseOrder, 
  Project, 
  FollowUpActivity, 
  CommercialFilters, 
  Component, 
  SupplierPrice, 
  Manufacturer 
} from '../../types';
import { 
  calculateCommercialKPIs, 
  filterQuotations, 
  filterPurchaseOrders,
  buildCommercialFunnel, 
  buildMonthlyTrends, 
  calculateSalespersonPerformance, 
  calculateEstimatorPerformance, 
  calculateCustomerProfitability 
} from '../../services/commercialAnalytics';
import { Badge } from '../common/Badge';
import { SalespersonPerformanceView } from './SalespersonPerformanceView';
import { EstimatorPerformanceView } from './EstimatorPerformanceView';
import { QuotationRegisterView } from './QuotationRegisterView';
import { POBookingView } from './POBookingView';
import { FollowUpCenterView } from './FollowUpCenterView';
import { ProfitabilityAnalyticsView } from './ProfitabilityAnalyticsView';
import { NewFollowUpModal } from './NewFollowUpModal';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Receipt, 
  FileCheck, 
  PhoneCall, 
  TrendingUp, 
  Cpu, 
  Filter, 
  RotateCcw, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Search, 
  Sparkles,
  Layers,
  Building2,
  RefreshCw,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';

export type CommercialSubTab = 
  | 'OVERVIEW' 
  | 'SALESPEOPLE' 
  | 'ESTIMATORS' 
  | 'QUOTATION_REGISTER' 
  | 'PO_REGISTER' 
  | 'FOLLOW_UPS' 
  | 'PROFITABILITY' 
  | 'CATALOG_OVERVIEW';

interface CommercialDashboardViewProps {
  quotations: Quotation[];
  orders: PurchaseOrder[];
  projects: Project[];
  followUps: FollowUpActivity[];
  components: Component[];
  prices: SupplierPrice[];
  manufacturers: Manufacturer[];
  onSavePO: (po: Omit<PurchaseOrder, 'poID' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => void;
  onUpdatePO: (po: PurchaseOrder) => void;
  onVerifyPO: (poID: number, verifiedBy: string) => void;
  onRejectPO: (poID: number, reason: string) => void;
  onCancelPO: (poID: number, reason: string) => void;
  onDeletePO?: (poID: number) => void;
  onClearAllPOs?: () => void;
  onResetCommercialPipeline?: () => void;
  onLoadDemoData?: () => void;
  onSaveFollowUp: (activity: Omit<FollowUpActivity, 'id' | 'createdAt'>) => void;
  onNavigateToEstimationWorkspace?: (project: Project) => void;
  onOpenQuotation?: (quotation: Quotation) => void;
  onSelectComponent?: (comp: Component) => void;
  onOpenNewPrice?: () => void;
}

export const CommercialDashboardView: React.FC<CommercialDashboardViewProps> = ({
  quotations,
  orders,
  projects,
  followUps,
  components,
  prices,
  manufacturers,
  onSavePO,
  onUpdatePO,
  onVerifyPO,
  onRejectPO,
  onCancelPO,
  onDeletePO,
  onClearAllPOs,
  onResetCommercialPipeline,
  onLoadDemoData,
  onSaveFollowUp,
  onNavigateToEstimationWorkspace,
  onOpenQuotation,
  onSelectComponent,
  onOpenNewPrice,
}) => {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<CommercialSubTab>('OVERVIEW');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Commercial Filters State
  const initialFilters: CommercialFilters = {
    dateRange: 'ALL',
    salesperson: 'ALL',
    estimator: 'ALL',
    customer: 'ALL',
    quotationStatus: 'ALL',
    orderStatus: 'ALL',
    projectCategory: 'ALL',
    searchQuery: '',
  };

  const [filters, setFilters] = useState<CommercialFilters>(initialFilters);

  // Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedQuoteForFollowUp, setSelectedQuoteForFollowUp] = useState<Quotation | null>(null);

  // Extract unique filter dropdown values
  const uniqueSalespeople = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach((q) => { if (q.salesperson) set.add(q.salesperson); });
    return Array.from(set);
  }, [quotations]);

  const uniqueEstimators = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach((q) => { if (q.estimator) set.add(q.estimator); });
    return Array.from(set);
  }, [quotations]);

  const uniqueCustomers = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach((q) => { if (q.clientName) set.add(q.clientName); });
    return Array.from(set);
  }, [quotations]);

  // Compute Filtered Datasets
  const filteredQuotes = useMemo(() => {
    return filterQuotations(quotations, orders, projects, filters);
  }, [quotations, orders, projects, filters]);

  const filteredOrders = useMemo(() => {
    return filterPurchaseOrders(orders, filteredQuotes, filters);
  }, [orders, filteredQuotes, filters]);

  // KPI Computations
  const kpis = useMemo(() => {
    return calculateCommercialKPIs(filteredQuotes, filteredOrders, followUps);
  }, [filteredQuotes, filteredOrders, followUps]);

  // Funnel & Monthly Trends
  const funnelStages = useMemo(() => {
    return buildCommercialFunnel(filteredQuotes, filteredOrders);
  }, [filteredQuotes, filteredOrders]);

  const monthlyTrends = useMemo(() => {
    return buildMonthlyTrends(filteredQuotes, filteredOrders);
  }, [filteredQuotes, filteredOrders]);

  // Salesperson & Estimator Performance Breakdowns
  const salespersonPerf = useMemo(() => {
    return calculateSalespersonPerformance(filteredQuotes, filteredOrders, followUps);
  }, [filteredQuotes, filteredOrders, followUps]);

  const estimatorPerf = useMemo(() => {
    return calculateEstimatorPerformance(filteredQuotes, filteredOrders);
  }, [filteredQuotes, filteredOrders]);

  // Customer Profitability
  const customerProfitability = useMemo(() => {
    return calculateCustomerProfitability(filteredQuotes, filteredOrders, projects);
  }, [filteredQuotes, filteredOrders, projects]);

  // Reset Filters
  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  // Export Filtered Intelligence Report to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Executive KPIs Sheet
    const kpiData = [
      ['Metric', 'Value', 'Unit / Currency'],
      ['Total RFQs Received', kpis.totalRfqsReceived, 'Tenders'],
      ['Total Quotations Prepared', kpis.totalQuotationsPrepared, 'Quotations'],
      ['Total Quotations Submitted', kpis.totalQuotationsSubmitted, 'Quotations'],
      ['Unique Quotation Opportunities', kpis.uniqueQuotationOpportunities, 'Projects'],
      ['Total Quoted Value', kpis.totalQuotedValueAed, 'AED'],
      ['Average Quotation Value', kpis.averageQuotationValueAed, 'AED'],
      ['Quotations Awaiting Submission', kpis.quotationsAwaitingSubmission, 'Quotations'],
      ['Quotations Awaiting Customer Response', kpis.quotationsAwaitingCustomerResponse, 'Quotations'],
      ['Quotations Requiring Follow-Up', kpis.quotationsRequiringFollowUp, 'Quotations'],
      ['Overdue Follow-Ups', kpis.overdueFollowUps, 'Quotations'],
      ['Number of Orders Won', kpis.ordersWon, 'Purchase Orders'],
      ['Unique Opportunities Converted to Orders', kpis.uniqueOpportunitiesConverted, 'Projects'],
      ['Total Verified PO Value', kpis.totalVerifiedPoValueAed, 'AED (Ex-VAT)'],
      ['Quoted Value Won Orders', kpis.quotedValueWonAed, 'AED'],
      ['Quotation-to-Order Hit Rate (Count)', `${kpis.conversionRateByCountPercent}%`, '%'],
      ['Quotation-to-Order Conversion Rate (Value)', `${kpis.conversionRateByValuePercent}%`, '%'],
      ['Total Open Pipeline Value', kpis.totalOpenPipelineValueAed, 'AED'],
      ['Total Lost Quotation Value', kpis.totalLostQuotationValueAed, 'AED'],
      ['Average Order Value', kpis.averageOrderValueAed, 'AED'],
      ['Draft POs Pending Verification', kpis.ordersPendingVerificationCount, 'Orders'],
      ['Draft PO Value Pending Verification', kpis.ordersPendingVerificationValueAed, 'AED'],
      ['Variance between Quoted & Verified PO Value', kpis.quotedToPoVarianceAed, 'AED'],
      ['Variance %', `${kpis.quotedToPoVariancePercent}%`, '%'],
    ];
    const wsKPI = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKPI, 'Executive KPIs');

    // 2. Quotation Register Sheet
    const quoteData = filteredQuotes.map((q) => ({
      'Quotation Number': q.quotationNumber,
      'Revision': q.revisionNumber || 'R0',
      'Date': q.quotationDate,
      'Project Code': q.projectCode,
      'Project Name': q.projectName,
      'Client Name': q.clientName,
      'Salesperson': q.salesperson || 'Unassigned',
      'Estimator': q.estimator || 'Unassigned',
      'Quoted Subtotal (AED)': q.subtotalBeforeTax,
      'VAT Amount (AED)': q.taxAmount,
      'Grand Total (AED)': q.grandTotal,
      'Status': q.status,
      'Linked PO Number': q.linkedPoNumber || 'None',
      'Verified PO Value (AED)': q.verifiedPoValue || 0,
      'Next Follow-Up': q.nextFollowUpDate || 'None',
    }));
    const wsQuotes = XLSX.utils.json_to_sheet(quoteData);
    XLSX.utils.book_append_sheet(wb, wsQuotes, 'Quotation Pipeline');

    // 3. Purchase Orders Sheet
    const poData = filteredOrders.map((o) => ({
      'PO Number': o.poNumber,
      'PO Date': o.poReceivedDate,
      'Project Name': o.projectName,
      'Client Name': o.clientName,
      'Salesperson': o.salesperson,
      'Estimator': o.estimator || '',
      'PO Value Ex-VAT (AED)': o.poValueExVat,
      'VAT 5% (AED)': o.vatAmount,
      'PO Value Inc-VAT (AED)': o.poValueIncVat,
      'Status': o.status,
      'Quotation Ref': o.quotationNumber,
      'Partial PO': o.isPartialPO ? 'YES' : 'NO',
      'Verified By': o.verifiedBy || 'Pending',
      'Remarks': o.remarks || '',
    }));
    const wsPOs = XLSX.utils.json_to_sheet(poData);
    XLSX.utils.book_append_sheet(wb, wsPOs, 'Purchase Orders');

    // Save File
    XLSX.writeFile(wb, `LV_Switchgear_Commercial_Intelligence_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. ENTERPRISE HEADER & COMMERCIAL WORKFLOW BREADCRUMB */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold tracking-wider">
                ERP Management Intelligence
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Refreshed at {lastRefreshed}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>Sales & Estimation Intelligence</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-mono font-semibold">
                AED Live
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Real-time commercial control connecting incoming tenders, engineering estimates, submitted bids, verified customer purchase orders, and factory production handover.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onResetCommercialPipeline && (orders.length > 0 || kpis.totalQuotationsSubmitted > 0) && (
              <button
                onClick={onResetCommercialPipeline}
                className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Reset commercial pipeline to clean unquoted real state"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Real Pipeline (0 POs)</span>
              </button>
            )}

            {onLoadDemoData && orders.length === 0 && kpis.totalQuotationsSubmitted === 0 && (
              <button
                onClick={onLoadDemoData}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Load sample won orders and POs for evaluating analytics charts"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Load Demo Showcase</span>
              </button>
            )}

            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
              title="Refresh commercial metrics"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to Excel</span>
            </button>
          </div>
        </div>

        {/* Commercial Pipeline Governance Status Banner */}
        {kpis.totalQuotationsSubmitted === 0 && (
          <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
              <div>
                <span className="font-bold text-blue-950">
                  Current Pipeline Status: 0 Quotations Quoted to Customers ({kpis.totalRfqsReceived} RFQs in Estimation)
                </span>
                <span className="text-blue-700 block sm:inline sm:ml-1 text-[11px]">
                  • In strict switchgear commercial governance, Purchase Orders can only exist for submitted/accepted quotations. All PO metrics and conversion rates correctly reflect 0.
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-bold shrink-0">
              0 Active POs (Clean Register)
            </span>
          </div>
        )}

        {/* Commercial Workflow Stage Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Commercial Workflow Pipeline:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-[11px] font-mono text-slate-600">
            {[
              { label: '1. RFQ Received', active: true, count: kpis.totalRfqsReceived },
              { label: '2. Costing Prepared', active: true, count: kpis.totalQuotationsPrepared },
              { label: '3. Bid Submitted', active: true, count: kpis.totalQuotationsSubmitted },
              { label: '4. Active Follow-Up', active: true, count: kpis.quotationsRequiringFollowUp },
              { label: '5. PO Inward', active: true, count: filteredOrders.length },
              { label: '6. PO Value Verified', active: true, count: kpis.ordersWon },
              { label: '7. Handover to Shop', active: true, count: kpis.ordersWon },
              { label: '8. Profitability Realized', active: true, count: customerProfitability.length },
            ].map((step, idx) => (
              <div 
                key={step.label}
                className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center flex flex-col justify-between"
              >
                <span className="text-[10px] text-slate-500 truncate block font-medium">{step.label}</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5">{step.count} Items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ENTERPRISE FILTER BAR */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-slate-900">Commercial Intelligence Filters</span>
            {(filters.dateRange !== 'ALL' || filters.salesperson !== 'ALL' || filters.estimator !== 'ALL' || filters.customer !== 'ALL' || filters.quotationStatus !== 'ALL' || filters.orderStatus !== 'ALL' || filters.projectCategory !== 'ALL' || filters.searchQuery) && (
              <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.2 rounded-full font-bold">
                Active Filter Applied
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search quote, project, client..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* 1. Date Range */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Period</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today (16 Oct)</option>
              <option value="THIS_MONTH">This Month (Oct 2026)</option>
              <option value="THIS_QUARTER">This Quarter (Q4 2026)</option>
              <option value="THIS_YEAR">This Year (2026)</option>
            </select>
          </div>

          {/* 2. Salesperson */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Salesperson</label>
            <select
              value={filters.salesperson}
              onChange={(e) => setFilters(prev => ({ ...prev, salesperson: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Sales Reps</option>
              {uniqueSalespeople.map((name) => (
                <option key={name} value={name}>{name.split(' (')[0]}</option>
              ))}
            </select>
          </div>

          {/* 3. Estimator */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Estimator</label>
            <select
              value={filters.estimator}
              onChange={(e) => setFilters(prev => ({ ...prev, estimator: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Estimators</option>
              {uniqueEstimators.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* 4. Customer */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Client / Contractor</label>
            <select
              value={filters.customer}
              onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Clients</option>
              {uniqueCustomers.map((cust) => (
                <option key={cust} value={cust}>{cust}</option>
              ))}
            </select>
          </div>

          {/* 5. Quotation Status */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Quote Status</label>
            <select
              value={filters.quotationStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, quotationStatus: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT (In Estimation)</option>
              <option value="SUBMITTED">SUBMITTED (Pending Client)</option>
              <option value="ACCEPTED">ACCEPTED (Won PO)</option>
              <option value="REJECTED">REJECTED (Lost)</option>
              <option value="REVISED">REVISED (New Rev)</option>
            </select>
          </div>

          {/* 6. Order Status */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">PO Status</label>
            <select
              value={filters.orderStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, orderStatus: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Orders</option>
              <option value="VERIFIED">VERIFIED Booked Orders</option>
              <option value="DRAFT">DRAFT (Pending Review)</option>
              <option value="NO_PO">Without PO (Open)</option>
            </select>
          </div>

          {/* 7. Authority / Sector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Authority / Sector</label>
            <select
              value={filters.projectCategory}
              onChange={(e) => setFilters(prev => ({ ...prev, projectCategory: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="DEWA">DEWA Approved</option>
              <option value="ADDC">ADDC / AADC</option>
              <option value="SEWA">SEWA (Sharjah)</option>
              <option value="COMMERCIAL">Commercial Towers</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="INDUSTRIAL">Industrial / Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SUB-TAB DRILL-DOWN NAVIGATION */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 font-mono text-xs">
        {[
          { id: 'OVERVIEW', label: 'Executive Intelligence', icon: LayoutDashboard },
          { id: 'SALESPEOPLE', label: 'Salesperson Performance', icon: Users },
          { id: 'ESTIMATORS', label: 'Estimator Performance', icon: Calculator },
          { id: 'QUOTATION_REGISTER', label: `Quotation Pipeline (${filteredQuotes.length})`, icon: Receipt },
          { id: 'PO_REGISTER', label: `PO Booking Register (${filteredOrders.length})`, icon: FileCheck },
          { id: 'FOLLOW_UPS', label: `Follow-Up Center (${kpis.quotationsRequiringFollowUp})`, icon: PhoneCall },
          { id: 'PROFITABILITY', label: 'Customer Profitability', icon: TrendingUp },
          { id: 'CATALOG_OVERVIEW', label: 'Components & Sizing Master', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CommercialSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 4. ACTIVE SUB-VIEW RENDER */}
      {/* ============================================================== */}

      {/* ---------------- Tab 1: Executive Intelligence Overview ---------------- */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* SECTION A: QUOTATION KPIS (10 CARDS) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-700" />
                <span>Quotation & Pipeline KPIs (10 Metrics)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Calculated dynamically from {filteredQuotes.length} quotations
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Card 1: Total RFQs Received */}
              <div 
                onClick={() => setActiveTab('QUOTATION_REGISTER')}
                className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>1. RFQs Received</span>
                  <span className="text-emerald-700 font-bold text-[10px]">+{kpis.prevPeriodTrends.rfqsChange}%</span>
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{kpis.totalRfqsReceived}</div>
                <span className="text-[10px] text-slate-400 font-mono">Tenders registered</span>
              </div>

              {/* Card 2: Quotations Prepared */}
              <div 
                onClick={() => setActiveTab('ESTIMATORS')}
                className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>2. Quotes Prepared</span>
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{kpis.totalQuotationsPrepared}</div>
                <span className="text-[10px] text-slate-400 font-mono">Costings completed</span>
              </div>

              {/* Card 3: Quotations Submitted */}
              <div 
                onClick={() => setActiveTab('QUOTATION_REGISTER')}
                className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>3. Bids Submitted</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{kpis.totalQuotationsSubmitted}</div>
                <span className="text-[10px] text-slate-400 font-mono">Dispatched to clients</span>
              </div>

              {/* Card 4: Unique Opportunities */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>4. Unique Projects</span>
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{kpis.uniqueQuotationOpportunities}</div>
                <span className="text-[10px] text-slate-400 font-mono">Distinct commercial jobs</span>
              </div>

              {/* Card 5: Total Quoted Value (AED) */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>5. Total Quoted Value</span>
                  <span className="text-emerald-700 font-bold text-[10px]">+{kpis.prevPeriodTrends.totalQuotedValueChange}%</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {kpis.totalQuotedValueAed.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">All revisions & packages</span>
              </div>

              {/* Card 6: Average Quotation Value */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>6. Avg Quote Size</span>
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {kpis.averageQuotationValueAed.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Per commercial quotation</span>
              </div>

              {/* Card 7: Awaiting Submission */}
              <div 
                onClick={() => setFilters(prev => ({ ...prev, quotationStatus: 'DRAFT' }))}
                className="bg-white border border-slate-200 hover:border-amber-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>7. Awaiting Submission</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-700">{kpis.quotationsAwaitingSubmission}</div>
                <span className="text-[10px] text-slate-400 font-mono">Draft in estimation</span>
              </div>

              {/* Card 8: Awaiting Customer Response */}
              <div 
                onClick={() => setFilters(prev => ({ ...prev, quotationStatus: 'SUBMITTED' }))}
                className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>8. Awaiting Client</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <div className="text-2xl font-bold font-mono text-blue-700">{kpis.quotationsAwaitingCustomerResponse}</div>
                <span className="text-[10px] text-slate-400 font-mono">Submitted, pending decision</span>
              </div>

              {/* Card 9: Quotations Requiring Follow-Up */}
              <div 
                onClick={() => setActiveTab('FOLLOW_UPS')}
                className="bg-white border border-slate-200 hover:border-blue-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>9. Require Follow-Up</span>
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{kpis.quotationsRequiringFollowUp}</div>
                <span className="text-[10px] text-slate-400 font-mono">Active pipeline calls</span>
              </div>

              {/* Card 10: Overdue Follow-ups */}
              <div 
                onClick={() => setActiveTab('FOLLOW_UPS')}
                className="bg-white border border-slate-200 hover:border-red-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>10. Overdue Actions</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-red-600">{kpis.overdueFollowUps}</div>
                <span className="text-[10px] text-red-500 font-mono font-medium">Needs urgent action</span>
              </div>
            </div>
          </div>

          {/* SECTION B: SALES AND ORDER KPIS (10 CARDS) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Sales, Booked Purchase Orders & Conversion KPIs (10 Metrics)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Verified against customer contracts & finance clearance
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Card 1: Orders Won */}
              <div 
                onClick={() => setActiveTab('PO_REGISTER')}
                className="bg-white border border-slate-200 hover:border-emerald-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>1. Orders Won</span>
                  <span className="text-emerald-700 font-bold text-[10px]">+{kpis.prevPeriodTrends.ordersWonChange}%</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-700">{kpis.ordersWon}</div>
                <span className="text-[10px] text-slate-400 font-mono">Verified booked POs</span>
              </div>

              {/* Card 2: Unique Opportunities Converted */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>2. Won Projects</span>
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{kpis.uniqueOpportunitiesConverted}</div>
                <span className="text-[10px] text-slate-400 font-mono">Unique projects secured</span>
              </div>

              {/* Card 3: Total Verified PO Value (AED) */}
              <div 
                onClick={() => setActiveTab('PO_REGISTER')}
                className="bg-white border-2 border-emerald-500 p-3.5 rounded-xl shadow-xs cursor-pointer transition bg-emerald-50/20"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span className="font-bold text-emerald-900">3. Verified PO Value</span>
                  <span className="text-emerald-700 font-bold text-[10px]">+{kpis.prevPeriodTrends.totalVerifiedPoValueChange}%</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-800">
                  {kpis.totalVerifiedPoValueAed.toLocaleString()} <span className="text-xs font-normal">AED</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono font-medium">Verified ex-VAT booked</span>
              </div>

              {/* Card 4: Quoted Value Associated with Won Orders */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>4. Quoted for Won</span>
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {kpis.quotedValueWonAed.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Original quoted baseline</span>
              </div>

              {/* Card 5: Conversion Rate % (Hit Rate) */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>5. Conversion Rate</span>
                  <span className="text-emerald-700 font-bold text-[10px]">+{kpis.prevPeriodTrends.conversionRateChange}%</span>
                </div>
                <div className="text-xl font-bold font-mono text-blue-700">
                  {kpis.conversionRateByCountPercent}% <span className="text-xs font-normal text-slate-500">Count</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {kpis.conversionRateByValuePercent}% by value
                </span>
              </div>

              {/* Card 6: Total Open Pipeline Value (AED) */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>6. Open Pipeline</span>
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xl font-bold font-mono text-blue-800">
                  {kpis.totalOpenPipelineValueAed.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Awaiting award</span>
              </div>

              {/* Card 7: Total Lost Quotation Value */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>7. Lost Quotations</span>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-500">
                  {kpis.totalLostQuotationValueAed.toLocaleString()} <span className="text-xs font-normal text-slate-400">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Lost to competition</span>
              </div>

              {/* Card 8: Average Order Value */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>8. Avg Order Size</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {kpis.averageOrderValueAed.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Per verified PO</span>
              </div>

              {/* Card 9: Orders Pending Verification (Draft POs) */}
              <div 
                onClick={() => setActiveTab('PO_REGISTER')}
                className="bg-white border border-slate-200 hover:border-amber-400 p-3.5 rounded-xl shadow-xs cursor-pointer transition"
              >
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>9. Draft POs</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-700">
                  {kpis.ordersPendingVerificationCount} <span className="text-xs font-normal text-slate-500">POs</span>
                </div>
                <span className="text-[10px] text-amber-700 font-mono font-medium">
                  {kpis.ordersPendingVerificationValueAed.toLocaleString()} AED awaiting stamp
                </span>
              </div>

              {/* Card 10: Quoted to PO Variance */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-[11px] font-mono mb-1">
                  <span>10. PO vs Quote Variance</span>
                  <span className={kpis.quotedToPoVarianceAed >= 0 ? 'text-emerald-700 font-bold text-[10px]' : 'text-red-600 font-bold text-[10px]'}>
                    {kpis.quotedToPoVariancePercent}%
                  </span>
                </div>
                <div className={`text-xl font-bold font-mono ${kpis.quotedToPoVarianceAed >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {kpis.quotedToPoVarianceAed >= 0 ? '+' : ''}{kpis.quotedToPoVarianceAed.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Scope additions & discount delta</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* COMMERCIAL FUNNEL & MONTHLY TREND CHARTS */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commercial Workflow Funnel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-700" />
                      <span>Commercial Conversion Funnel (7 Stages)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Tracking conversion rate and drop-off from inquiry to factory handover
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {kpis.conversionRateByCountPercent}% Overall Hit
                  </span>
                </div>

                <div className="space-y-3">
                  {funnelStages.map((stage, idx) => (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-slate-800">{stage.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">{stage.count} Tenders</span>
                          <span className="text-slate-500 font-medium">{stage.valueAed.toLocaleString()} AED</span>
                          <span className="font-bold text-blue-700 w-12 text-right">{stage.percentageOfTop}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(5, stage.percentageOfTop)}%`,
                            backgroundColor: stage.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Inward Tenders: {kpis.totalRfqsReceived}</span>
                <span>•</span>
                <span>Won Orders: {kpis.ordersWon}</span>
                <span>•</span>
                <span className="font-bold text-emerald-700">{kpis.totalVerifiedPoValueAed.toLocaleString()} AED Booked</span>
              </div>
            </div>

            {/* Monthly Quoted vs Won Order Trend Chart (SVG) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      <span>Monthly Commercial Performance (May - Oct 2026)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Quoted pipeline volume vs verified booked purchase order values (AED)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-3 h-3 bg-blue-200 rounded-xs"></span> Quoted
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                      <span className="w-3 h-3 bg-emerald-600 rounded-xs"></span> Won PO
                    </span>
                  </div>
                </div>

                {/* SVG Visual Chart */}
                <div className="h-48 w-full flex items-end justify-between gap-4 pt-6 pb-2 px-2">
                  {monthlyTrends.map((pt) => {
                    const maxVal = 1500000;
                    const quotedHeight = Math.max(8, (pt.quotedValueAed / maxVal) * 160);
                    const wonHeight = Math.max(6, (pt.wonPoValueAed / maxVal) * 160);

                    return (
                      <div key={pt.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="flex items-end gap-1.5 w-full justify-center">
                          {/* Quoted bar */}
                          <div
                            className="w-1/2 max-w-[28px] bg-blue-200 hover:bg-blue-300 rounded-t-sm transition-all relative"
                            style={{ height: `${quotedHeight}px` }}
                            title={`Quoted: ${pt.quotedValueAed.toLocaleString()} AED`}
                          ></div>
                          {/* Won bar */}
                          <div
                            className="w-1/2 max-w-[28px] bg-emerald-600 hover:bg-emerald-700 rounded-t-sm transition-all relative"
                            style={{ height: `${wonHeight}px` }}
                            title={`Won PO: ${pt.wonPoValueAed.toLocaleString()} AED`}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 text-center font-semibold">
                          {pt.monthShort}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Peak Quoted Month: Sep 2026</span>
                <span>•</span>
                <span className="font-bold text-emerald-700">Oct 2026: {kpis.totalVerifiedPoValueAed.toLocaleString()} AED Won</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Strip */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
            <div>
              <span className="text-emerald-400 font-bold block mb-1">ENTERPRISE DRILL-DOWN READY</span>
              <p className="text-slate-300">
                Explore deep analytical breakdowns by salesperson quota, estimator turnaround speed, quotation register with instant search, or record a verified customer purchase order.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('SALESPEOPLE')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Sales Leaders &rarr;
              </button>
              <button
                onClick={() => setActiveTab('ESTIMATORS')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Estimators &rarr;
              </button>
              <button
                onClick={() => setActiveTab('PO_REGISTER')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Book Purchase Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Tab 2: Salesperson Performance ---------------- */}
      {activeTab === 'SALESPEOPLE' && (
        <SalespersonPerformanceView
          performanceList={salespersonPerf}
          orders={filteredOrders}
          quotations={filteredQuotes}
          onSelectSalespersonFilter={(name) => {
            setFilters(prev => ({ ...prev, salesperson: name }));
            setActiveTab('OVERVIEW');
          }}
          onOpenPOModal={() => setActiveTab('PO_REGISTER')}
        />
      )}

      {/* ---------------- Tab 3: Estimator Performance ---------------- */}
      {activeTab === 'ESTIMATORS' && (
        <EstimatorPerformanceView
          performanceList={estimatorPerf}
          quotations={filteredQuotes}
          orders={filteredOrders}
          onSelectEstimatorFilter={(name) => {
            setFilters(prev => ({ ...prev, estimator: name }));
            setActiveTab('OVERVIEW');
          }}
        />
      )}

      {/* ---------------- Tab 4: Quotation Register & Pipeline ---------------- */}
      {activeTab === 'QUOTATION_REGISTER' && (
        <QuotationRegisterView
          quotations={filteredQuotes}
          projects={projects}
          onOpenQuotationWorkspace={onOpenQuotation}
          onOpenNewFollowUp={(quote) => {
            setSelectedQuoteForFollowUp(quote);
            setIsFollowUpModalOpen(true);
          }}
        />
      )}

      {/* ---------------- Tab 5: Purchase Order Booking Register ---------------- */}
      {activeTab === 'PO_REGISTER' && (
        <POBookingView
          orders={orders}
          quotations={quotations}
          projects={projects}
          onSavePO={onSavePO}
          onUpdatePO={onUpdatePO}
          onVerifyPO={onVerifyPO}
          onRejectPO={onRejectPO}
          onCancelPO={onCancelPO}
          onDeletePO={onDeletePO}
          onClearAllPOs={onClearAllPOs}
          onNavigateToQuotation={() => setActiveTab('QUOTATION_REGISTER')}
        />
      )}

      {/* ---------------- Tab 6: Follow-Up & Action Center ---------------- */}
      {activeTab === 'FOLLOW_UPS' && (
        <FollowUpCenterView
          followUps={followUps}
          quotations={quotations}
          onOpenNewFollowUp={(quote) => {
            setSelectedQuoteForFollowUp(quote || null);
            setIsFollowUpModalOpen(true);
          }}
        />
      )}

      {/* ---------------- Tab 7: Customer Profitability ---------------- */}
      {activeTab === 'PROFITABILITY' && (
        <ProfitabilityAnalyticsView
          customerSummaries={customerProfitability}
          projects={projects}
          quotations={filteredQuotes}
          orders={filteredOrders}
        />
      )}

      {/* ---------------- Tab 8: Master Components & Sizing (Preserved legacy) ---------------- */}
      {activeTab === 'CATALOG_OVERVIEW' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-700 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Components Catalog & Supplier Price Intelligence</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Direct access to the master technical database with {components.length} components, {manufacturers.length} manufacturers, and {prices.length} price points.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[10px] block">Total Components</span>
                <span className="text-xl font-bold text-slate-900">{components.length}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[10px] block">Manufacturers (OEMs)</span>
                <span className="text-xl font-bold text-amber-700">{manufacturers.length}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[10px] block">Recorded Prices</span>
                <span className="text-xl font-bold text-emerald-700">{prices.length}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[10px] block">Current Copper Base</span>
                <span className="text-xl font-bold text-blue-700">42.00 AED/kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Follow-up Modal */}
      <NewFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setSelectedQuoteForFollowUp(null);
        }}
        quotations={quotations}
        selectedQuotation={selectedQuoteForFollowUp}
        onSaveFollowUp={(activity) => {
          onSaveFollowUp(activity);
          setIsFollowUpModalOpen(false);
          setSelectedQuoteForFollowUp(null);
        }}
      />
    </div>
  );
};
