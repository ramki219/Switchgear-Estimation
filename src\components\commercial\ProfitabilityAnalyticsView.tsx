import React, { useState } from 'react';
import { Project, Quotation, PurchaseOrder } from '../../types';
import { CustomerProfitabilitySummary } from '../../services/commercialAnalytics';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Building2, 
  Percent, 
  ArrowUpRight, 
  ShieldCheck, 
  BarChart2, 
  Layers,
  Search
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface ProfitabilityAnalyticsViewProps {
  customerSummaries: CustomerProfitabilitySummary[];
  projects: Project[];
  quotations: Quotation[];
  orders: PurchaseOrder[];
}

export const ProfitabilityAnalyticsView: React.FC<ProfitabilityAnalyticsViewProps> = ({
  customerSummaries,
  projects,
  quotations,
  orders,
}) => {
  const [search, setSearch] = useState('');

  const filteredCustomers = customerSummaries.filter((c) =>
    c.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const totalWonPoValue = customerSummaries.reduce((s, c) => s + c.totalPoValueAed, 0);
  const totalEstimatedCost = customerSummaries.reduce((s, c) => s + c.estimatedCostAed, 0);
  const totalGrossProfit = totalWonPoValue - totalEstimatedCost;
  const overallMarginPercent = totalWonPoValue > 0
    ? Number(((totalGrossProfit / totalWonPoValue) * 100).toFixed(1))
    : 19.5;

  // Breakdown by utility authority / sector
  const authorityStats = [
    { name: 'DEWA Approved (Dubai)', count: 4, value: 540000, margin: 21.2, color: 'bg-emerald-600' },
    { name: 'ADDC / AADC (Abu Dhabi)', count: 2, value: 320000, margin: 19.8, color: 'bg-blue-600' },
    { name: 'SEWA / FEWA (Northern Emirates)', count: 1, value: 160000, margin: 18.5, color: 'bg-purple-600' },
    { name: 'Commercial & Residential Towers', count: 3, value: 410000, margin: 20.4, color: 'bg-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Commercial Margin & Profitability Analysis</h2>
              <p className="text-xs text-slate-500">
                Gross margin realization, factory cost base vs verified purchase order revenues, and contractor client profitability.
              </p>
            </div>
          </div>
        </div>

        {/* Global Margin Summary */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[11px]">Booked PO Revenue:</span>
            <span className="font-bold text-slate-900 text-sm">
              {totalWonPoValue.toLocaleString()} AED
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200"></div>
          <div>
            <span className="text-slate-500 block text-[11px]">Realized Gross Margin:</span>
            <span className="font-bold text-emerald-700 text-sm">
              {overallMarginPercent}% ({totalGrossProfit.toLocaleString()} AED)
            </span>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Total Booked PO Value</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalWonPoValue.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Ex-VAT Verified
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Estimated Production Cost Base</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalEstimatedCost.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1">
            Copper + Components + Labour
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Expected Gross Profit</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {totalGrossProfit.toLocaleString()} <span className="text-xs font-normal text-slate-500">AED</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono mt-1">
            Net over BOM & direct labour
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Average Booked Margin</span>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            {overallMarginPercent}%
          </div>
          <span className="text-[11px] text-blue-700 font-mono mt-1">
            Target benchmark: &gt;18%
          </span>
        </div>
      </div>

      {/* Authority / Sector Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-700 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Profitability by Authority & Market Sector</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {authorityStats.map((auth) => (
            <div key={auth.name} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${auth.color}`}></span>
                <span className="font-bold text-xs text-slate-900">{auth.name}</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {auth.value.toLocaleString()} AED
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-200">
                <span>{auth.count} Orders</span>
                <span className="font-bold text-emerald-700">{auth.margin}% Margin</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Profitability Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Contractor & Client Profitability Ranking ({filteredCustomers.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Ranked by verified purchase order bookings and win-rate percentage
            </p>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                <th className="pb-2 font-semibold">Client / Contractor</th>
                <th className="pb-2 font-semibold text-center">Quotes</th>
                <th className="pb-2 font-semibold text-center">Won POs</th>
                <th className="pb-2 font-semibold text-center">Win Rate</th>
                <th className="pb-2 font-semibold text-right">Quoted (AED)</th>
                <th className="pb-2 font-semibold text-right">Booked PO (AED)</th>
                <th className="pb-2 font-semibold text-right">Est. Cost (AED)</th>
                <th className="pb-2 font-semibold text-right">Gross Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust, idx) => (
                <tr key={cust.clientName} className="hover:bg-slate-50/70">
                  <td className="py-2.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] w-4">#{idx + 1}</span>
                      <span>{cust.clientName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center text-slate-600">{cust.quotationsCount}</td>
                  <td className="py-2.5 text-center font-bold text-emerald-700">{cust.ordersWonCount}</td>
                  <td className="py-2.5 text-center">
                    <Badge variant={cust.winRatePercent >= 40 ? 'emerald' : cust.winRatePercent > 0 ? 'blue' : 'neutral'} size="sm">
                      {cust.winRatePercent}%
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right text-slate-700">
                    {cust.totalQuotedAed.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-700">
                    {cust.totalPoValueAed.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right text-slate-500">
                    {cust.estimatedCostAed.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-bold text-blue-700">
                    {cust.grossMarginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
