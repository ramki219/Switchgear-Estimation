import React, { useState, useMemo } from 'react';
import { Quotation, Project } from '../../types';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Download, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  Eye,
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react';

interface QuotationRegisterViewProps {
  quotations: Quotation[];
  projects: Project[];
  onOpenQuotationWorkspace?: (quotation: Quotation) => void;
  onOpenNewFollowUp?: (quotation: Quotation) => void;
}

export const QuotationRegisterView: React.FC<QuotationRegisterViewProps> = ({
  quotations,
  projects,
  onOpenQuotationWorkspace,
  onOpenNewFollowUp,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSalesperson, setSelectedSalesperson] = useState('ALL');
  const [selectedEstimator, setSelectedEstimator] = useState('ALL');
  const [sortField, setSortField] = useState<keyof Quotation>('quotationDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected quotation for detail side panel/modal
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<Quotation | null>(null);

  // Extract unique options
  const salespeople = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach(q => { if (q.salesperson) set.add(q.salesperson); });
    return Array.from(set);
  }, [quotations]);

  const estimators = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach(q => { if (q.estimator) set.add(q.estimator); });
    return Array.from(set);
  }, [quotations]);

  // Filtered & Sorted
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchStatus = selectedStatus === 'ALL' || q.status === selectedStatus;
      const matchSales = selectedSalesperson === 'ALL' || q.salesperson === selectedSalesperson;
      const matchEst = selectedEstimator === 'ALL' || q.estimator === selectedEstimator;
      const matchSearch = !search ||
        q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.clientName.toLowerCase().includes(search.toLowerCase()) ||
        q.projectName.toLowerCase().includes(search.toLowerCase()) ||
        (q.salesperson && q.salesperson.toLowerCase().includes(search.toLowerCase())) ||
        (q.estimator && q.estimator.toLowerCase().includes(search.toLowerCase())) ||
        (q.rfqReference && q.rfqReference.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSales && matchEst && matchSearch;
    }).sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [quotations, selectedStatus, selectedSalesperson, selectedEstimator, search, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredQuotations.length / pageSize) || 1;
  const paginatedQuotes = filteredQuotations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Quotation) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="emerald" size="sm">ACCEPTED / WON</Badge>;
      case 'SUBMITTED':
        return <Badge variant="purple" size="sm">SUBMITTED</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral" size="sm">DRAFT</Badge>;
      case 'REJECTED':
        return <Badge variant="amber" size="sm">LOST / REJECTED</Badge>;
      case 'REVISED':
        return <Badge variant="blue" size="sm">REVISED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const calculateDaysSince = (dateStr?: string) => {
    if (!dateStr) return '-';
    const submitted = new Date(dateStr).getTime();
    const today = new Date().getTime();
    const diffDays = Math.floor((today - submitted) / (1000 * 3600 * 24));
    return diffDays >= 0 ? `${diffDays}d` : '-';
  };

  const exportCSV = () => {
    const headers = [
      'RFQ Reference',
      'Quotation Number',
      'Revision',
      'Customer Name',
      'Project Name',
      'Location',
      'Salesperson',
      'Estimator',
      'RFQ Received Date',
      'Estimation Assigned Date',
      'Quotation Prepared Date',
      'Quotation Submitted Date',
      'Quoted Value Ex-VAT (AED)',
      'VAT Amount (AED)',
      'Quoted Value Inc-VAT (AED)',
      'Estimated Cost (AED)',
      'Estimated Gross Profit (AED)',
      'Gross Margin %',
      'Status',
      'Expected PO Date',
      'Last Follow-Up Date',
      'Next Follow-Up Date',
      'Days Since Submission',
      'Lost Reason',
      'Linked PO Status'
    ];

    const rows = filteredQuotations.map(q => {
      const proj = projects.find(p => p.projectID === q.projectID);
      const daysSince = calculateDaysSince(q.quotationSubmittedDate);

      return [
        `"${q.rfqReference || '-'}"`,
        `"${q.quotationNumber}"`,
        `"${q.revisionNumber}"`,
        `"${q.clientName.replace(/"/g, '""')}"`,
        `"${q.projectName.replace(/"/g, '""')}"`,
        `"${proj?.location || 'UAE'}"`,
        `"${q.salesperson || '-'}"`,
        `"${q.estimator || '-'}"`,
        q.rfqReceivedDate || '-',
        q.estimationAssignedDate || '-',
        q.quotationPreparedDate || '-',
        q.quotationSubmittedDate || '-',
        q.subtotalBeforeTax.toFixed(2),
        q.taxAmount.toFixed(2),
        q.grandTotal.toFixed(2),
        q.totalDirectCost.toFixed(2),
        q.profitMarginAmount.toFixed(2),
        `${q.profitMarginPercent.toFixed(1)}%`,
        q.status,
        q.expectedPoDate || '-',
        q.lastFollowUpDate || '-',
        q.nextFollowUpDate || '-',
        daysSince,
        `"${q.lostReason || '-'}"`,
        `"${q.linkedPoStatus || '-'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Master_Quotation_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded font-mono uppercase">
              COMMERCIAL REGISTER
            </span>
            <span className="text-xs text-slate-500 font-mono">End-to-End Quotation Log</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            <span>Master Switchgear Quotation Register</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Complete searchable register linking RFQ, revisions, sales ownership, estimator work, margins, and PO award states.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border border-slate-300"
        >
          <Download className="w-4 h-4" />
          <span>Export Register (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs text-xs font-sans">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Quote #, Client, Project, RFQ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses ({quotations.length})</option>
              <option value="SUBMITTED">Submitted ({quotations.filter(q => q.status === 'SUBMITTED').length})</option>
              <option value="ACCEPTED">Accepted / Won ({quotations.filter(q => q.status === 'ACCEPTED').length})</option>
              <option value="DRAFT">Draft ({quotations.filter(q => q.status === 'DRAFT').length})</option>
              <option value="REJECTED">Lost ({quotations.filter(q => q.status === 'REJECTED').length})</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Salespeople</option>
              {salespeople.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedEstimator}
              onChange={(e) => setSelectedEstimator(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">All Estimators</option>
              {estimators.map(est => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredQuotations.length}</strong> matching quotation records</span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => handleSort('grandTotal')}
              className={`px-2 py-0.5 rounded border ${sortField === 'grandTotal' ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold' : 'bg-slate-50 border-slate-200'}`}
            >
              Quoted Value
            </button>
            <button
              onClick={() => handleSort('quotationDate')}
              className={`px-2 py-0.5 rounded border ${sortField === 'quotationDate' ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold' : 'bg-slate-50 border-slate-200'}`}
            >
              Date
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-3">Quotation #</th>
                <th className="py-3 px-3">RFQ Ref</th>
                <th className="py-3 px-3">Customer & Project</th>
                <th className="py-3 px-3">Sales Owner</th>
                <th className="py-3 px-3">Estimator</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3 text-right">Quoted Ex-VAT</th>
                <th className="py-3 px-3 text-right">Estimated Cost</th>
                <th className="py-3 px-3 text-right">Gross Margin</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Linked PO</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-sans">
                    No quotations found in this register view.
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((q) => {
                  const proj = projects.find(p => p.projectID === q.projectID);

                  return (
                    <tr key={q.quotationID} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenQuotationWorkspace?.(q)}
                          className="font-bold text-cyan-800 hover:text-cyan-900 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{q.quotationNumber}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({q.revisionNumber})</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {q.quotationDate}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {q.rfqReference || '-'}
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span className="font-bold text-slate-900 block truncate max-w-[200px]" title={q.projectName}>
                          {q.projectName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[200px]" title={q.clientName}>
                          {q.clientName} ({proj?.location || 'UAE'})
                        </span>
                      </td>

                      <td className="py-3 px-3 font-sans whitespace-nowrap text-slate-800">
                        {q.salesperson || '-'}
                      </td>

                      <td className="py-3 px-3 font-sans whitespace-nowrap text-slate-700">
                        {q.estimator || '-'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {q.quotationSubmittedDate || '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                        {q.subtotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                        {q.totalDirectCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-sans font-bold text-emerald-700">
                        {q.profitMarginPercent.toFixed(1)}%
                        <span className="text-[10px] text-slate-400 block font-mono">
                          +{q.profitMarginAmount.toLocaleString()} AED
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(q.status)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {q.linkedPoNumber ? (
                          <div>
                            <span className="font-bold text-emerald-800 block">{q.linkedPoNumber}</span>
                            <span className="text-[10px] text-slate-500">{q.linkedPoStatus} ({q.verifiedPoValue?.toLocaleString()} AED)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedQuoteDetail(q)}
                            className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition"
                            title="View Detail Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenNewFollowUp?.(q)}
                            className="p-1 hover:bg-cyan-50 text-slate-500 hover:text-cyan-700 rounded transition"
                            title="Log Follow-Up"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 font-sans">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Slideover / Modal */}
      {selectedQuoteDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase">Commercial Quotation Record</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedQuoteDetail.quotationNumber}</span>
                  <span className="text-xs text-slate-500">Rev {selectedQuoteDetail.revisionNumber}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuoteDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Client Name:</span>
                <span className="font-bold text-slate-900">{selectedQuoteDetail.clientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Project Name:</span>
                <span className="font-bold text-slate-900">{selectedQuoteDetail.projectName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sales Owner:</span>
                <span className="font-bold text-slate-900">{selectedQuoteDetail.salesperson || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Estimator:</span>
                <span className="font-bold text-slate-900">{selectedQuoteDetail.estimator || '-'}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 space-y-2 text-xs">
              <span className="font-bold text-purple-950 block">Commercial Financial Summary</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block text-[10px]">Direct Cost:</span>
                  <span className="font-bold text-slate-900">{selectedQuoteDetail.totalDirectCost.toLocaleString()} AED</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block text-[10px]">Overhead ({selectedQuoteDetail.overheadPercent}%):</span>
                  <span className="font-bold text-slate-900">{selectedQuoteDetail.overheadAmount.toLocaleString()} AED</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block text-[10px]">Gross Profit ({selectedQuoteDetail.profitMarginPercent}%):</span>
                  <span className="font-bold text-emerald-800">{selectedQuoteDetail.profitMarginAmount.toLocaleString()} AED</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 block text-[10px]">Quoted Total (ex-VAT):</span>
                  <span className="font-black text-purple-900">{selectedQuoteDetail.subtotalBeforeTax.toLocaleString()} AED</span>
                </div>
              </div>
            </div>

            {/* Dates & Milestones */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">RFQ Date:</span>
                <span className="font-semibold text-slate-800">{selectedQuoteDetail.rfqReceivedDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Prepared Date:</span>
                <span className="font-semibold text-slate-800">{selectedQuoteDetail.quotationPreparedDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Submitted Date:</span>
                <span className="font-semibold text-slate-800">{selectedQuoteDetail.quotationSubmittedDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Expected PO Date:</span>
                <span className="font-semibold text-slate-800">{selectedQuoteDetail.expectedPoDate || '-'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedQuoteDetail(null);
                  onOpenQuotationWorkspace?.(selectedQuoteDetail);
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Commercial Quotation Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
