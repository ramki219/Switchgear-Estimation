import React, { useState } from 'react';
import { EstimatorPerformance, Quotation, PurchaseOrder } from '../../types';
import { 
  Calculator, 
  Clock, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Award
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface EstimatorPerformanceViewProps {
  performanceList: EstimatorPerformance[];
  quotations: Quotation[];
  orders: PurchaseOrder[];
  onSelectEstimatorFilter?: (name: string) => void;
}

export const EstimatorPerformanceView: React.FC<EstimatorPerformanceViewProps> = ({
  performanceList,
  quotations,
  orders,
  onSelectEstimatorFilter,
}) => {
  const [selectedEstimator, setSelectedEstimator] = useState<string | null>(performanceList[0]?.name || null);
  const [search, setSearch] = useState('');

  const filteredList = performanceList.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeEstimatorData = performanceList.find((e) => e.name === selectedEstimator) || performanceList[0];
  const activeEstimatorQuotes = quotations.filter((q) => q.estimator === activeEstimatorData?.name);

  const totalQuotesPrepared = performanceList.reduce((s, e) => s + e.quotationsPrepared, 0);
  const totalPreparedValue = performanceList.reduce((s, e) => s + e.totalQuotedValuePrepared, 0);
  const avgTurnaround = performanceList.length > 0
    ? (performanceList.reduce((s, e) => s + e.avgPreparationTimeDays, 0) / performanceList.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Calculator className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Estimator Workload & Productivity Intelligence</h2>
              <p className="text-xs text-slate-500">
                Track technical estimation capacity, SLD & sizing cycle times, quoted volume, revisions, and quotation-to-order hit rates.
              </p>
            </div>
          </div>
        </div>

        {/* Global Estimating Department Metrics */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block font-mono text-[11px]">Total Technical Costings:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {totalQuotesPrepared} Costings ({totalPreparedValue.toLocaleString()} AED)
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block font-mono text-[11px]">Avg Turnaround:</span>
            <span className="font-bold text-indigo-700 font-mono text-sm">
              {avgTurnaround} Days / Tender
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Estimator Cards & Right Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Estimator List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider">
              Engineering Estimators ({filteredList.length})
            </h3>
            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search engineer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredList.map((est) => {
              const isSelected = est.name === selectedEstimator;
              return (
                <div
                  key={est.name}
                  onClick={() => setSelectedEstimator(est.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {est.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {est.quotationsPrepared} Prepared | {est.revisionCount} Revisions
                      </span>
                    </div>
                    <Badge variant={est.winRatePercent >= 30 ? 'emerald' : 'blue'} size="sm">
                      {est.winRatePercent}% Win Rate
                    </Badge>
                  </div>

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Volume Prepared</span>
                      <span className="font-bold text-slate-900">
                        {(est.totalQuotedValuePrepared / 1000).toFixed(0)}k AED
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Turnaround</span>
                      <span className="font-bold text-indigo-700">{est.avgPreparationTimeDays}d</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Booked POs</span>
                      <span className="font-bold text-emerald-700">
                        {est.wonQuotationCount} ({est.associatedPoValue > 0 ? `${(est.associatedPoValue / 1000).toFixed(0)}k` : '0'})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Performance Metrics */}
        {activeEstimatorData && (
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Profile */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                    Technical Estimator Profile
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {activeEstimatorData.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Handled {activeEstimatorData.rfqsAssigned} RFQs • Prepared {activeEstimatorData.totalQuotedValuePrepared.toLocaleString()} AED • Won {activeEstimatorData.associatedPoValue.toLocaleString()} AED
                  </p>
                </div>
                {onSelectEstimatorFilter && (
                  <button
                    onClick={() => onSelectEstimatorFilter(activeEstimatorData.name)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Apply Filter to Entire Dashboard</span>
                  </button>
                )}
              </div>

              {/* 4 Performance Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Costings Prepared</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {activeEstimatorData.quotationsPrepared} <span className="text-xs text-slate-500 font-normal">Quotes</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeEstimatorData.pendingEstimation} pending estimation
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Average Speed</span>
                  <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">
                    {activeEstimatorData.avgPreparationTimeDays} <span className="text-xs text-slate-500 font-normal">Days</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    From RFQ to submission
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Win Rate %</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                    {activeEstimatorData.winRatePercent}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeEstimatorData.wonQuotationCount} converted to PO
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Revision Overhead</span>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                    {activeEstimatorData.revisionCount} <span className="text-xs text-slate-500 font-normal">Revisions</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Consultant spec changes
                  </span>
                </div>
              </div>
            </div>

            {/* Estimator Quotations Register Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-700 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Technical Quotations Engineered by {activeEstimatorData.name.split(' (')[0]} ({activeEstimatorQuotes.length})</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                      <th className="pb-2 font-semibold">Quote Number</th>
                      <th className="pb-2 font-semibold">Project & Client</th>
                      <th className="pb-2 font-semibold">Salesperson</th>
                      <th className="pb-2 font-semibold text-right">Quoted Value</th>
                      <th className="pb-2 font-semibold text-center">Status</th>
                      <th className="pb-2 font-semibold text-center">Linked PO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeEstimatorQuotes.map((q) => (
                      <tr key={q.quotationID} className="hover:bg-slate-50/70">
                        <td className="py-2.5 font-bold text-indigo-700">{q.quotationNumber}</td>
                        <td className="py-2.5 max-w-[200px] truncate">
                          <span className="font-bold text-slate-900 block truncate">{q.projectName}</span>
                          <span className="text-slate-500 text-[10px] block truncate">{q.clientName}</span>
                        </td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[140px]">
                          {q.salesperson?.split(' (')[0] || '—'}
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-900">
                          {q.grandTotal.toLocaleString()} AED
                        </td>
                        <td className="py-2.5 text-center">
                          <Badge 
                            variant={
                              q.status === 'ACCEPTED' ? 'emerald' : 
                              q.status === 'SUBMITTED' ? 'blue' : 
                              q.status === 'REJECTED' ? 'danger' : 'amber'
                            } 
                            size="sm"
                          >
                            {q.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-center font-bold text-emerald-700">
                          {q.linkedPoNumber || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
