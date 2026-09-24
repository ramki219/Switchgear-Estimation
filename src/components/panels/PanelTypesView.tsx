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
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Switchgear Panel Types & Assemblies (IEC 61439-1/2)</span>
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Standard switchboard configurations, form of internal separation, and default ingress protection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {panelTypes.map((pt) => (
          <div
            key={pt.panelTypeID}
            className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800 px-2 py-0.5 rounded">
                  {pt.panelTypeCode}
                </span>
                <Badge variant="success">IEC COMPLIANT</Badge>
              </div>

              <h4 className="text-sm font-bold text-slate-100 mt-2">{pt.panelTypeName}</h4>
              <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                {pt.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Default Separation:</span>
                <Badge variant="warning">{pt.defaultFormOfSeparation}</Badge>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Default Protection:</span>
                <Badge variant="info">{pt.defaultIPRating}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
