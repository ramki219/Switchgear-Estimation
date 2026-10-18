import React from 'react';
import { Calculator, ArrowRight, Layers, DollarSign, FileSpreadsheet, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

export const EstimationPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" size="md">PHASE 2 ROADMAP</Badge>
              <span className="text-xs text-slate-400 font-mono">Next Development Module</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <span>Low Voltage Switchgear Estimation & BOM Engine</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Phase 1 successfully establishes Master Data, Components, Suppliers, and Historical Pricing. Phase 2 will implement multi-panel estimation, automatic BOM calculation, and formal quotation generation.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
        <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Planned Phase 2 Engineering Cost Calculation Flow
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">1. Project & Enquiry</span>
            <p className="text-slate-400 text-[11px]">Client RFQ, consultant specs (DEWA/SEWA/Kahramaa), tender deadline & revision control.</p>
          </div>
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">2. Panel Configuration</span>
            <p className="text-slate-400 text-[11px]">MDB, SMDB, MCC, APFC panel tags, incomer rating (1600A), Icu (65kA), Form 4b Type 6.</p>
          </div>
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">3. Automated BOM</span>
            <p className="text-slate-400 text-[11px]">Pulls active net prices from Phase 1 pricing database + copper busbar kg calculation.</p>
          </div>
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">4. Cost Engine</span>
            <p className="text-slate-400 text-[11px]">Material + Busbar + Labour + Overheads + Engineering + Testing + Margin %.</p>
          </div>
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">5. Commercial Quote</span>
            <p className="text-slate-400 text-[11px]">Formal PDF proposal, Excel quotation breakdown, VAT and warranty terms.</p>
          </div>
        </div>
      </div>

      {/* SQL Tables Already Ready for Phase 2 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
          SQL Server Schemas Already Provisioned in Database Scripts:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-purple-300 font-semibold block mb-1">est.Estimates & Panels</span>
            <p className="text-slate-400 text-[11px]">Headers, panel tags, separation forms, short-circuit ratings, and line-item costs.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-purple-300 font-semibold block mb-1">bom.BOMHeaders & Items</span>
            <p className="text-slate-400 text-[11px]">Consolidated component list, quantities, units, and procurement statuses.</p>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800">
            <span className="text-purple-300 font-semibold block mb-1">sales.Quotations</span>
            <p className="text-slate-400 text-[11px]">Commercial revisions (R0, R1, R2), VAT calculations, and customer commercial terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
