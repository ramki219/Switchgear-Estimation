import React from 'react';
import { LabourRate } from '../../types';
import { Clock, Hammer, DollarSign, Wrench } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LabourRatesViewProps {
  labourRates: LabourRate[];
}

export const LabourRatesView: React.FC<LabourRatesViewProps> = ({ labourRates }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <span>Labour, Fabrication & Engineering Rates</span>
        </h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Activity-based costing per man-hour stored in SQL Server schema <code className="text-cyan-700 font-mono">pricing.LabourRates</code>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-600 uppercase bg-slate-50">
              <th className="py-3 px-4">Activity Code</th>
              <th className="py-3 px-4">Activity Description</th>
              <th className="py-3 px-4">Cost Center Category</th>
              <th className="py-3 px-4 text-right">Standard Hourly Rate</th>
              <th className="py-3 px-4">Effective Date</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {labourRates.map((lr) => (
              <tr key={lr.labourRateID} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-bold text-orange-700">
                  {lr.activityCode}
                </td>
                <td className="py-3 px-4 text-slate-800 font-sans">
                  {lr.activityName}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="purple">{lr.category}</Badge>
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700 text-xs">
                  {lr.currency} {lr.ratePerHour.toFixed(2)} / hr
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {lr.effectiveFrom}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge variant="success">ACTIVE RATE</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
