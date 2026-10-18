import React, { useState, useMemo } from 'react';
import { PurchaseOrder, Quotation, Project, PurchaseOrderStatus, POAuditEntry } from '../../types';
import { Badge } from '../common/Badge';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Download, 
  DollarSign, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Percent, 
  History, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  X,
  Eye,
  Trash2
} from 'lucide-react';

interface POBookingViewProps {
  orders: PurchaseOrder[];
  quotations: Quotation[];
  projects: Project[];
  onSavePO: (po: Omit<PurchaseOrder, 'poID' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => void;
  onUpdatePO: (po: PurchaseOrder) => void;
  onVerifyPO: (poID: number, verifiedBy: string) => void;
  onRejectPO: (poID: number, reason: string) => void;
  onCancelPO: (poID: number, reason: string) => void;
  onDeletePO?: (poID: number) => void;
  onClearAllPOs?: () => void;
  onNavigateToQuotation?: (quotationNumber: string) => void;
}

export const POBookingView: React.FC<POBookingViewProps> = ({
  orders,
  quotations,
  projects,
  onSavePO,
  onUpdatePO,
  onVerifyPO,
  onRejectPO,
  onCancelPO,
  onDeletePO,
  onClearAllPOs,
  onNavigateToQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [selectedPOForAudit, setSelectedPOForAudit] = useState<PurchaseOrder | null>(null);
  const [poToReject, setPoToReject] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [poModalError, setPoModalError] = useState<string | null>(null);

  // Commercial Governance:
  // A purchase order can only be booked against a quotation that has actually been QUOTED
  // (i.e. SUBMITTED, ACCEPTED, or REVISED). Unquoted or draft estimates cannot have a PO.
  const eligibleQuotations = useMemo(() => {
    return quotations.filter(q => q.status === 'SUBMITTED' || q.status === 'ACCEPTED' || q.status === 'REVISED');
  }, [quotations]);

  // Form State for New/Manual PO Entry
  const [selectedQuoteId, setSelectedQuoteId] = useState<number>(eligibleQuotations[0]?.quotationID || 0);
  const [poNumber, setPoNumber] = useState('');
  const [poReceivedDate, setPoReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [poValueExVat, setPoValueExVat] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(5.0);
  const [salesperson, setSalesperson] = useState('');
  const [isPartialPO, setIsPartialPO] = useState(false);
  const [partialPONote, setPartialPONote] = useState('');
  const [poDocumentRef, setPoDocumentRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [initialStatus, setInitialStatus] = useState<PurchaseOrderStatus>('VERIFIED');
  const [enteredBy, setEnteredBy] = useState('Commercial Officer');

  const selectedQuote = eligibleQuotations.find(q => q.quotationID === selectedQuoteId) || eligibleQuotations[0];

  // Auto-sync salesperson & initial estimate when quotation selection changes in modal
  const handleQuoteChange = (quoteId: number) => {
    setSelectedQuoteId(quoteId);
    const q = eligibleQuotations.find(item => item.quotationID === quoteId);
    if (q) {
      setSalesperson(q.salesperson || 'Commercial Sales Lead');
      if (poValueExVat === 0) {
        setPoValueExVat(q.subtotalBeforeTax);
      }
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
      const matchSearch = !searchTerm ||
        o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.salesperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, selectedStatus, searchTerm]);

  // Total Verified vs Draft Aggregates
  const stats = useMemo(() => {
    const verified = orders.filter(o => o.status === 'VERIFIED');
    const draft = orders.filter(o => o.status === 'DRAFT' || o.status === 'SUBMITTED');
    const cancelled = orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED');

    const totalVerifiedAED = verified.reduce((sum, o) => sum + o.poValueExVat, 0);
    const totalDraftAED = draft.reduce((sum, o) => sum + o.poValueExVat, 0);

    return {
      verifiedCount: verified.length,
      totalVerifiedAED,
      draftCount: draft.length,
      totalDraftAED,
      cancelledCount: cancelled.length,
    };
  }, [orders]);

  const handleOpenNewModal = () => {
    const defaultQuote = eligibleQuotations[0];
    if (defaultQuote) {
      setSelectedQuoteId(defaultQuote.quotationID);
      setSalesperson(defaultQuote.salesperson || 'Commercial Sales Lead');
      setPoValueExVat(defaultQuote.subtotalBeforeTax);
    }
    setPoNumber(`PO-CUST-${Date.now().toString().slice(-4)}`);
    setPoModalError(null);
    setIsNewPOModalOpen(true);
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    // Check duplicate PO number for this client
    const isDuplicate = orders.some(
      o => o.poNumber.trim().toLowerCase() === poNumber.trim().toLowerCase() && 
           o.clientName.toLowerCase() === selectedQuote.clientName.toLowerCase()
    );
    if (isDuplicate) {
      setPoModalError(`A Purchase Order with number "${poNumber}" already exists for client "${selectedQuote.clientName}". Please verify the customer reference.`);
      return;
    }

    const vatAmt = Number((poValueExVat * (vatPercent / 100)).toFixed(2));
    const poValInc = Number((poValueExVat + vatAmt).toFixed(2));

    onSavePO({
      poNumber: poNumber.trim(),
      quotationID: selectedQuote.quotationID,
      quotationNumber: selectedQuote.quotationNumber,
      revisionNumber: selectedQuote.revisionNumber || 'R0',
      projectID: selectedQuote.projectID,
      projectCode: selectedQuote.projectCode,
      projectName: selectedQuote.projectName,
      clientName: selectedQuote.clientName,
      salesperson: salesperson || selectedQuote.salesperson || 'Sales Manager',
      estimator: selectedQuote.estimator,
      poReceivedDate,
      poValueExVat: Number(poValueExVat.toFixed(2)),
      vatPercent,
      vatAmount: vatAmt,
      poValueIncVat: poValInc,
      currency: 'AED',
      status: initialStatus,
      isPartialPO,
      partialPONote: isPartialPO ? partialPONote : undefined,
      poDocumentRef: poDocumentRef || undefined,
      remarks: remarks || undefined,
      enteredBy,
      verifiedBy: initialStatus === 'VERIFIED' ? enteredBy : undefined,
      verificationDate: initialStatus === 'VERIFIED' ? poReceivedDate : undefined,
    });

    setIsNewPOModalOpen(false);
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="emerald" size="sm">VERIFIED PO</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral" size="sm">DRAFT</Badge>;
      case 'SUBMITTED':
        return <Badge variant="amber" size="sm">PENDING AUDIT</Badge>;
      case 'REJECTED':
        return <Badge variant="amber" size="sm">REJECTED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral" size="sm">CANCELLED</Badge>;
    }
  };

  const exportPOCSV = () => {
    const headers = [
      'Customer PO Number',
      'Quotation Number',
      'Revision',
      'Project Code',
      'Project Name',
      'Customer Name',
      'Salesperson',
      'Estimator',
      'PO Received Date',
      'PO Value Ex-VAT (AED)',
      'VAT Amount (AED)',
      'PO Value Inc-VAT (AED)',
      'PO Status',
      'Is Partial PO',
      'Verified By',
      'Verification Date',
      'Quoted Value Ex-VAT (AED)',
      'PO Variance (AED)',
      'Variance %'
    ];

    const rows = filteredOrders.map(o => {
      const linkedQuote = quotations.find(q => q.quotationID === o.quotationID);
      const quotedVal = linkedQuote ? linkedQuote.subtotalBeforeTax : 0;
      const variance = o.poValueExVat - quotedVal;
      const variancePct = quotedVal > 0 ? ((variance / quotedVal) * 100).toFixed(2) : '0';

      return [
        `"${o.poNumber}"`,
        `"${o.quotationNumber}"`,
        `"${o.revisionNumber}"`,
        `"${o.projectCode}"`,
        `"${o.projectName.replace(/"/g, '""')}"`,
        `"${o.clientName.replace(/"/g, '""')}"`,
        `"${o.salesperson}"`,
        `"${o.estimator || '-'}"`,
        o.poReceivedDate,
        o.poValueExVat.toFixed(2),
        o.vatAmount.toFixed(2),
        o.poValueIncVat.toFixed(2),
        o.status,
        o.isPartialPO ? 'YES' : 'NO',
        `"${o.verifiedBy || '-'}"`,
        o.verificationDate || '-',
        quotedVal.toFixed(2),
        variance.toFixed(2),
        `${variancePct}%`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Order_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono uppercase">
              COMMERCIAL BOOKING MODULE
            </span>
            <span className="text-xs text-slate-500 font-mono">Manual PO Entry & Verification Audit</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <span>Customer Purchase Order Booking & Verification</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Record customer purchase orders against approved quotation revisions with mandatory manual value verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onClearAllPOs && orders.length > 0 && (
            <button
              onClick={onClearAllPOs}
              className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 hover:border-red-200"
              title="Clear all recorded purchase orders"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All POs</span>
            </button>
          )}

          <button
            onClick={exportPOCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PO Register (CSV)</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Commercial ERP Governance Banner: Unquoted Rule */}
      {eligibleQuotations.length === 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                0 Quotations Quoted — Commercial Governance Rule Active
              </h4>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                You have not quoted a single quotation yet (all quotations in the system are currently in Draft / Estimation).
                In accordance with LV switchgear ERP workflow, projects cannot receive Purchase Orders until a quotation is officially submitted to the client. No unquoted projects will appear in the PO register.
              </p>
            </div>
          </div>
          {onNavigateToQuotation && (
            <button
              onClick={() => onNavigateToQuotation('')}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              Go to Quotations
            </button>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-emerald-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold text-emerald-900">Total Verified PO Value</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {stats.totalVerifiedAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.verifiedCount} Verified, Audited Orders</span>
          </p>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold text-amber-900">Pending PO Confirmation</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">
            {stats.totalDraftAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            {stats.draftCount} Draft / Unverified POs (Excluded from KPI)
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold text-slate-700">Average Booked PO Value</span>
            <DollarSign className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.verifiedCount > 0 
              ? (stats.totalVerifiedAED / stats.verifiedCount).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
              : 0} AED
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Per verified commercial booking
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-bold text-slate-700">Orders Conversion Ratio</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {quotations.length > 0 
              ? ((stats.verifiedCount / quotations.length) * 100).toFixed(1) 
              : 0}%
          </div>
          <p className="text-[11px] text-purple-700 mt-1">
            {stats.verifiedCount} won of {quotations.length} total quotes
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO#, Client, Project, Salesperson..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-500 font-bold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none"
          >
            <option value="ALL">All PO Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Pending Verification</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* PO Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Customer PO #</th>
                <th className="py-3 px-3.5">Linked Quotation</th>
                <th className="py-3 px-3.5">Project & Client</th>
                <th className="py-3 px-3.5">Sales Owner</th>
                <th className="py-3 px-3.5">PO Date</th>
                <th className="py-3 px-3.5 text-right">PO Value (Ex-VAT)</th>
                <th className="py-3 px-3.5 text-right">VAT (5%)</th>
                <th className="py-3 px-3.5 text-right">Total With VAT</th>
                <th className="py-3 px-3.5 text-right">Quoted vs PO Variance</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    <div className="max-w-md mx-auto py-6 px-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <FileCheck className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        No Purchase Orders in Register
                      </h4>
                      {eligibleQuotations.length === 0 ? (
                        <>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            No projects appear in this list because your company has not quoted a single quotation yet (0 quoted quotations).
                            In LV switchgear ERP workflow, Purchase Orders can only be booked against quotations that have been officially submitted to clients.
                          </p>
                          {onNavigateToQuotation && (
                            <button
                              onClick={() => onNavigateToQuotation('')}
                              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <span>Open Quotations &amp; Submit a Quote</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          No purchase orders found matching your search and filter criteria.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => {
                  const linkedQuote = quotations.find(q => q.quotationID === po.quotationID);
                  const quotedExVat = linkedQuote ? linkedQuote.subtotalBeforeTax : 0;
                  const variance = po.poValueExVat - quotedExVat;
                  const variancePct = quotedExVat > 0 ? (variance / quotedExVat) * 100 : 0;

                  return (
                    <tr key={po.poID} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{po.poNumber}</span>
                          {po.isPartialPO && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-200">
                              PARTIAL
                            </span>
                          )}
                        </div>
                        {po.poDocumentRef && (
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Doc: {po.poDocumentRef}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigateToQuotation?.(po.quotationNumber)}
                          className="font-bold text-cyan-800 hover:text-cyan-900 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{po.quotationNumber}</span>
                          <span className="text-[10px] text-slate-400">({po.revisionNumber})</span>
                        </button>
                        <span className="text-[10px] text-slate-500 block font-sans">
                          Quoted: {quotedExVat.toLocaleString()} AED
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-sans">
                        <span className="font-bold text-slate-900 block truncate max-w-[200px]" title={po.projectName}>
                          {po.projectName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[200px]" title={po.clientName}>
                          {po.clientName}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block text-xs">{po.salesperson}</span>
                        {po.estimator && (
                          <span className="text-[10px] text-slate-400 block">Est: {po.estimator}</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                        {po.poReceivedDate}
                      </td>

                      <td className="py-3 px-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                        {po.poValueExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-500 whitespace-nowrap">
                        {po.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                      </td>

                      <td className="py-3 px-3.5 text-right font-black text-emerald-800 whitespace-nowrap">
                        {po.poValueIncVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-sans">
                        <div className={`flex items-center justify-end gap-1 font-bold ${
                          Math.abs(variance) < 1 
                            ? 'text-slate-600' 
                            : variance > 0 
                              ? 'text-emerald-700' 
                              : 'text-amber-700'
                        }`}>
                          {variance > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          ) : variance < 0 ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
                          ) : null}
                          <span>
                            {variance >= 0 ? '+' : ''}{variance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} AED
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          ({variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%)
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {getStatusBadge(po.status)}
                        {po.verifiedBy && (
                          <span className="text-[9px] text-slate-400 block mt-0.5" title={`Verified on ${po.verificationDate}`}>
                            by {po.verifiedBy}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {po.status !== 'VERIFIED' && po.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => onVerifyPO(po.poID, 'Commercial Manager')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition shadow-2xs cursor-pointer"
                              title="Verify PO and book order into revenue pipeline"
                            >
                              Verify PO
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedPOForAudit(po)}
                            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition"
                            title="View Audit Trail & Verification Log"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {po.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setPoToReject(po);
                                setRejectionReason('');
                              }}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                              title="Reject or Cancel PO"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {onDeletePO && (
                            <button
                              type="button"
                              onClick={() => onDeletePO(po.poID)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                              title="Delete PO from register"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual PO Booking Modal */}
      {isNewPOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-700" />
                  <span>Record Customer Purchase Order (Manual Entry)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter verified commercial PO values from signed contract. Quoted value is never assumed.
                </p>
              </div>
              <button
                onClick={() => setIsNewPOModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="mt-4 space-y-4 text-xs font-sans">
              {poModalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{poModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Link to Quotation Revision *
                </label>
                {eligibleQuotations.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-mono">
                    <span className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      No Quoted Quotations Available
                    </span>
                    <span>In accordance with commercial ERP workflow, a quotation must first be submitted to the client before a purchase order can be booked.</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedQuoteId}
                      onChange={(e) => handleQuoteChange(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
                    >
                      {eligibleQuotations.map(q => (
                        <option key={q.quotationID} value={q.quotationID}>
                          {q.quotationNumber} ({q.revisionNumber}) — {q.clientName} | Quoted: {q.subtotalBeforeTax.toLocaleString()} AED ex-VAT
                        </option>
                      ))}
                    </select>
                    {selectedQuote && (
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 font-mono">
                        <span>Project: <strong>{selectedQuote.projectName}</strong></span>
                        <span>|</span>
                        <span>Quoted ex-VAT: <strong>{selectedQuote.subtotalBeforeTax.toLocaleString()} AED</strong></span>
                        <span>|</span>
                        <span>Estimator: <strong>{selectedQuote.estimator || 'Technical Team'}</strong></span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer PO Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-AFE-2026-9901"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">PO Received Date *</label>
                  <input
                    type="date"
                    required
                    value={poReceivedDate}
                    onChange={(e) => setPoReceivedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Critical Requirement: Manually Entered PO Value */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    Manually Entered PO Financial Value (AED)
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold">
                    Never auto-populated from quotation
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">PO Value Ex-VAT (AED) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      step={0.01}
                      value={poValueExVat}
                      onChange={(e) => setPoValueExVat(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-400 rounded-lg px-3 py-2 text-emerald-950 font-black text-sm focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">VAT Percentage (%)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={vatPercent}
                      onChange={(e) => setVatPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">PO Value Inc-VAT (AED)</label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold">
                      {(poValueExVat + (poValueExVat * (vatPercent / 100))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Variance Display */}
                {selectedQuote && (
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-200 text-xs">
                    <span className="text-slate-600">
                      Comparable Quoted: <strong>{selectedQuote.subtotalBeforeTax.toLocaleString()} AED</strong>
                    </span>
                    <span className={`font-bold ${
                      poValueExVat >= selectedQuote.subtotalBeforeTax ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      Variance: {(poValueExVat - selectedQuote.subtotalBeforeTax).toLocaleString()} AED 
                      ({selectedQuote.subtotalBeforeTax > 0 ? (((poValueExVat - selectedQuote.subtotalBeforeTax) / selectedQuote.subtotalBeforeTax) * 100).toFixed(2) : 0}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Salesperson Responsible *</label>
                  <input
                    type="text"
                    required
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial PO Status *</label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:border-cyan-600 focus:outline-none"
                  >
                    <option value="VERIFIED">Verified (Approved for Production & Revenue)</option>
                    <option value="SUBMITTED">Pending Verification / Audit</option>
                    <option value="DRAFT">Draft / Letter of Intent</option>
                  </select>
                </div>
              </div>

              {/* Partial PO Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isPartialPO}
                    onChange={(e) => setIsPartialPO(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600"
                  />
                  <span>This is a Partial Purchase Order (e.g. Phase 1 release)</span>
                </label>

                {isPartialPO && (
                  <input
                    type="text"
                    placeholder="Specify partial release scope, e.g. 'Covers MDB-01 & MDB-02 only. Balance 50% to follow.'"
                    value={partialPONote}
                    onChange={(e) => setPartialPONote(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">PO File / Document Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-Signed-Contract-2026.pdf"
                    value={poDocumentRef}
                    onChange={(e) => setPoDocumentRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Entered By User *</label>
                  <input
                    type="text"
                    required
                    value={enteredBy}
                    onChange={(e) => setEnteredBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Commercial Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Payment milestone terms, advance check received, warranty conditions..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewPOModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eligibleQuotations.length === 0}
                  className={`px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition ${
                    eligibleQuotations.length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  }`}
                  title={eligibleQuotations.length === 0 ? 'Cannot book PO: You have not quoted any quotation yet' : 'Book Purchase Order'}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Book Purchase Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Drawer / Modal */}
      {selectedPOForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-700" />
                  <span>Audit Trail for {selectedPOForAudit.poNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete verifiable log of PO value entries, edits, and verification stamps
                </p>
              </div>
              <button
                onClick={() => setSelectedPOForAudit(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client / Project:</span>
                  <span className="font-bold text-slate-900">{selectedPOForAudit.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Value:</span>
                  <span className="font-bold text-emerald-800">{selectedPOForAudit.poValueExVat.toLocaleString()} AED ex-VAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold">{getStatusBadge(selectedPOForAudit.status)}</span>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <span className="font-bold text-slate-700 font-sans block text-xs">Change Events:</span>
                {(!selectedPOForAudit.auditHistory || selectedPOForAudit.auditHistory.length === 0) ? (
                  <p className="text-slate-400 italic text-center py-4">No separate audit history logged for this record.</p>
                ) : (
                  selectedPOForAudit.auditHistory.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-bold text-purple-800">{item.action}</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-slate-800 font-semibold font-sans text-xs">
                        {item.newValue || item.details}
                      </div>
                      {item.oldValue && (
                        <div className="text-[10px] text-slate-500">
                          Previous: {item.oldValue}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        Authorized User: <strong className="text-slate-600">{item.user}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
              <button
                type="button"
                onClick={() => setSelectedPOForAudit(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject PO Modal */}
      {poToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Reject / Cancel Purchase Order</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please enter the commercial justification for rejecting PO #{poToReject.poNumber}.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <textarea
                required
                rows={3}
                placeholder="Reason (e.g. Terms unacceptable, credit limit breached, pricing discrepancy)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-red-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPoToReject(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim()}
                  onClick={() => {
                    onRejectPO(poToReject.poID, rejectionReason);
                    setPoToReject(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
