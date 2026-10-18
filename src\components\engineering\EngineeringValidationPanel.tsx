// ============================================================================
// ENGINEERING VALIDATION PANEL (GREEN / YELLOW / RED)
// Displays deterministic checks for short-circuit, interlocking, and compliance
// Never silently corrects the user's design.
// ============================================================================

import React from 'react';
import { EngineeringValidation, SLDTopology } from '../../types/engineering';
import { ValidationEngine } from '../../services/validationEngine';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Info,
  ExternalLink
} from 'lucide-react';

interface EngineeringValidationPanelProps {
  topology: SLDTopology;
}

export const EngineeringValidationPanel: React.FC<EngineeringValidationPanelProps> = ({
  topology,
}) => {
  const validations = ValidationEngine.validateDesign(topology);

  const errors = validations.filter(v => v.severity === 'ERROR');
  const warnings = validations.filter(v => v.severity === 'WARNING');
  const valids = validations.filter(v => v.severity === 'VALID');

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 uppercase">
              IEC 61439 Design Verification Matrix
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Panel: <strong className="text-slate-900">{topology.panelTag}</strong>
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Engineering Validation & Safety Compliance Check
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Automated verification of breaking capacity (Icu), dual-source interlocks, continuous current ratings, and busbar withstand.
          </p>
        </div>

        {/* Status Count Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-bold">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{errors.length} Critical Errors</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{warnings.length} Reviews Required</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{valids.length} Validated</span>
          </div>
        </div>
      </div>

      {/* 1. Critical Errors (RED) */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>CRITICAL ENGINEERING ERRORS (Must Be Resolved Before Manufacturing)</span>
          </div>

          <div className="space-y-2">
            {errors.map(err => (
              <div key={err.id} className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-xs flex items-center gap-2">
                    <span className="px-1.5 py-0.2 bg-rose-200 text-rose-900 rounded text-[9px] font-mono">
                      {err.code}
                    </span>
                    <span>{err.category} VALIDATION FAILURE</span>
                  </span>
                  {err.iecClause && (
                    <span className="text-[10px] text-rose-700 font-semibold">{err.iecClause}</span>
                  )}
                </div>

                <p className="text-rose-900 text-xs font-sans font-medium leading-relaxed">
                  {err.message}
                </p>

                {err.recommendation && (
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-[11px] text-rose-800">
                    <strong>Corrective Action:</strong> {err.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Engineering Reviews Required (YELLOW) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>ENGINEERING REVIEWS REQUIRED (Preliminary Values / Design Warnings)</span>
        </div>

        <div className="space-y-2">
          {warnings.map(warn => (
            <div key={warn.id} className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 text-xs flex items-center gap-2">
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[9px] font-mono">
                    {warn.code}
                  </span>
                  <span>{warn.category} DESIGN NOTICE</span>
                </span>
                {warn.iecClause && (
                  <span className="text-[10px] text-amber-800 font-semibold">{warn.iecClause}</span>
                )}
              </div>

              <p className="text-amber-900 text-xs font-sans leading-relaxed">
                {warn.message}
              </p>

              {warn.recommendation && (
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  <strong>Recommendation:</strong> {warn.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Validated Criteria (GREEN) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>VALIDATED CRITERIA (IEC 61439 Satisfied)</span>
        </div>

        <div className="space-y-2">
          {valids.map(val => (
            <div key={val.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 text-xs">{val.message}</span>
                  <div className="text-[10px] text-emerald-700 mt-0.5">{val.category} Category Approved</div>
                </div>
              </div>

              {val.iecClause && (
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {val.iecClause}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
