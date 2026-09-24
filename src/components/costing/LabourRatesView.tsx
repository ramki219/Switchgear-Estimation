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
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Labour, Fabrication & Engineering Rates</span>
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Activity-based costing per man-hour stored in SQL Server schema <code className="text-cyan-400 font-mono">pricing.LabourRates</code>
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-950/60">
              <th className="py-3 px-4">Activity Code</th>
              <th className="py-3 px-4">Activity Description</th>
              <th className="py-3 px-4">Cost Center Category</th>
              <th className="py-3 px-4 text-right">Standard Hourly Rate</th>
              <th className="py-3 px-4">Effective Date</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {labourRates.map((lr) => (
              <tr key={lr.labourRateID} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-orange-400">
                  {lr.activityCode}
                </td>
                <td className="py-3 px-4 text-slate-200 font-sans">
                  {lr.activityName}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="purple">{lr.category}</Badge>
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400 text-xs">
                  {lr.currency} {lr.ratePerHour.toFixed(2)} / hr
                </td>
                <td className="py-3 px-4 text-slate-400">
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
