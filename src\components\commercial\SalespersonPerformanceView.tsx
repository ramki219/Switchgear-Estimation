import React, { useState } from 'react';
import { SalespersonPerformance, PurchaseOrder, Quotation } from '../../types';
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  Target, 
  DollarSign, 
  FileCheck, 
  Clock, 
  PhoneCall, 
  Calendar,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Search
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SalespersonPerformanceViewProps {
  performanceList: SalespersonPerformance[];
  orders: PurchaseOrder[];
  quotations: Quotation[];
  onSelectSalespersonFilter?: (name: string) => void;
  onOpenPOModal?: () => void;
}

export const SalespersonPerformanceView: React.FC<SalespersonPerformanceViewProps> = ({
  performanceList,
  orders,
  quotations,
  onSelectSalespersonFilter,
  onOpenPOModal,
}) => {
  const [selectedRep, setSelectedRep] = useState<string | null>(performanceList[0]?.name || null);
  const [search, setSearch] = useState('');

  const filteredList = performanceList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeRepData = performanceList.find((p) => p.name === selectedRep) || performanceList[0];
  const activeRepOrders = orders.filter((o) => o.salesperson === activeRepData?.name);
  const activeRepQuotes = quotations.filter((q) => q.salesperson === activeRepData?.name);

  // Overall totals across sales team
  const totalWonValue = performanceList.reduce((s, p) => s + p.totalVerifiedPoValue, 0);
  const totalTarget = performanceList.reduce((s, p) => s + p.salesTargetAed, 0);
  const overallTeamAchievement = totalTarget > 0 ? ((totalWonValue / totalTarget) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Commercial Sales Team Performance</h2>
              <p className="text-xs text-slate-500">
                Individual salesperson quotas, verified purchase orders secured, pipeline conversion, and active customer follow-up metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Team Summary KPI */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block font-mono text-[11px]">Team Won PO Value:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">
              {totalWonValue.toLocaleString()} AED
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block font-mono text-[11px]">Overall Target Progress:</span>
            <span className="font-bold text-blue-700 font-mono text-sm">
              {overallTeamAchievement}% of {totalTarget.toLocaleString()} AED
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rep Cards & Right Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sales Rep Cards & Leaderboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider">
              Sales Leaders ({filteredList.length})
            </h3>
            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search rep..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredList.map((rep, idx) => {
              const isSelected = rep.name === selectedRep;
              return (
                <div
                  key={rep.name}
                  onClick={() => setSelectedRep(rep.name)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {rep.name.split(' (')[0]}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {rep.name.includes('(') ? rep.name.split('(')[1]?.replace(')', '') : 'Sales Lead'}
                        </span>
                      </div>
                    </div>
                    <Badge variant={rep.targetProgressPercent >= 75 ? 'emerald' : 'blue'} size="sm">
                      {rep.targetProgressPercent}% of Target
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, rep.targetProgressPercent)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Verified PO</span>
                      <span className="font-bold text-emerald-700">
                        {rep.totalVerifiedPoValue > 0 ? `${(rep.totalVerifiedPoValue / 1000).toFixed(0)}k AED` : '0 AED'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Win Rate</span>
                      <span className="font-bold text-blue-700">{rep.conversionRatePercent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Open Pipeline</span>
                      <span className="font-bold text-slate-700">
                        {(rep.openPipelineValue / 1000).toFixed(0)}k AED
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Drilldown for Selected Rep */}
        {activeRepData && (
          <div className="lg:col-span-2 space-y-6">
            {/* Rep Overview Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Individual Performance Profile
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {activeRepData.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Annual Quota: {activeRepData.salesTargetAed.toLocaleString()} AED | Verified Booked: {activeRepData.totalVerifiedPoValue.toLocaleString()} AED
                  </p>
                </div>
                {onSelectSalespersonFilter && (
                  <button
                    onClick={() => onSelectSalespersonFilter(activeRepData.name)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Apply Filter to Entire Dashboard</span>
                  </button>
                )}
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Opportunities Won</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                    {activeRepData.opportunitiesWon} <span className="text-xs text-slate-500 font-normal">POs</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    From {activeRepData.quotationsSubmitted} submitted
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Win Rate (Conversion)</span>
                  <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">
                    {activeRepData.conversionRatePercent}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Industry avg: ~25%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Average Order Value</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {activeRepData.averageOrderValue.toLocaleString()} <span className="text-xs text-slate-500 font-normal">AED</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Per booked PO
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-mono block">Follow-up Load</span>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-0.5 flex items-center gap-1">
                    <span>{activeRepData.followUpsPending}</span>
                    {activeRepData.overdueFollowUps > 0 && (
                      <span className="text-[11px] font-bold text-red-600 bg-red-100 px-1.5 py-0.2 rounded-full">
                        {activeRepData.overdueFollowUps} overdue
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Active client contacts
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Purchase Orders List */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-700 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secured Orders & Booked POs ({activeRepOrders.length})</span>
                </h4>
                {onOpenPOModal && (
                  <button
                    onClick={onOpenPOModal}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    + Enter New PO
                  </button>
                )}
              </div>

              {activeRepOrders.length === 0 ? (
                <div className="text-center py-6 text-slate-400 font-mono text-xs">
                  No purchase orders booked yet for this salesperson in the current period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                        <th className="pb-2 font-semibold">PO Number</th>
                        <th className="pb-2 font-semibold">Project & Client</th>
                        <th className="pb-2 font-semibold">Quote Ref</th>
                        <th className="pb-2 font-semibold text-right">Verified PO Value</th>
                        <th className="pb-2 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeRepOrders.map((po) => (
                        <tr key={po.poID} className="hover:bg-slate-50/70">
                          <td className="py-2.5 font-bold text-slate-900">
                            {po.poNumber}
                          </td>
                          <td className="py-2.5 max-w-[200px] truncate">
                            <span className="text-slate-900 font-bold block truncate">{po.projectName}</span>
                            <span className="text-slate-500 text-[10px] block truncate">{po.clientName}</span>
                          </td>
                          <td className="py-2.5 text-blue-700">{po.quotationNumber}</td>
                          <td className="py-2.5 text-right font-bold text-emerald-700">
                            {po.poValueExVat.toLocaleString()} AED
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge variant={po.status === 'VERIFIED' ? 'emerald' : 'amber'} size="sm">
                              {po.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active Quotations Pipeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Active Quotations Pipeline ({activeRepQuotes.length})</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                      <th className="pb-2 font-semibold">Quotation Number</th>
                      <th className="pb-2 font-semibold">Project</th>
                      <th className="pb-2 font-semibold">Client</th>
                      <th className="pb-2 font-semibold text-right">Quoted Value</th>
                      <th className="pb-2 font-semibold text-center">Status</th>
                      <th className="pb-2 font-semibold text-center">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRepQuotes.map((q) => (
                      <tr key={q.quotationID} className="hover:bg-slate-50/70">
                        <td className="py-2.5 font-bold text-blue-700">{q.quotationNumber}</td>
                        <td className="py-2.5 text-slate-900 font-medium truncate max-w-[160px]">{q.projectName}</td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[140px]">{q.clientName}</td>
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
                        <td className="py-2.5 text-center text-[11px] text-slate-500">
                          {q.nextFollowUpDate || '—'}
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
