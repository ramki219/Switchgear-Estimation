import React from 'react';
import { PanelType } from '../../types';
import { Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface PanelTypesViewProps {
  panelTypes: PanelType[];
}

export const PanelTypesView: React.FC<PanelTypesViewProps> = ({ panelTypes }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Switchgear Panel Types & Assemblies (IEC 61439-1/2)</span>
        </h3>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Standard switchboard configurations, form of internal separation, and default ingress protection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {panelTypes.map((pt) => (
          <div
            key={pt.panelTypeID}
            className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  {pt.panelTypeCode}
                </span>
                <Badge variant="success">IEC COMPLIANT</Badge>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-2">{pt.panelTypeName}</h4>
              <p className="text-xs text-slate-600 font-mono mt-1 leading-relaxed">
                {pt.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 font-mono text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Default Separation:</span>
                <Badge variant="warning">{pt.defaultFormOfSeparation}</Badge>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Default Protection:</span>
                <Badge variant="info">{pt.defaultIPRating}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
