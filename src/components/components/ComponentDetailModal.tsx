import React from 'react';
import { Component } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Cpu, DollarSign, History, Shield, Zap, Layers, Calendar } from 'lucide-react';

interface ComponentDetailModalProps {
  component: Component | null;
  onClose: () => void;
  onOpenPriceHistory: (comp: Component) => void;
  onRevisePrice: (comp: Component) => void;
  onEditComponent: (comp: Component) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  onClose,
  onOpenPriceHistory,
  onRevisePrice,
  onEditComponent,
}) => {
  if (!component) return null;

  return (
    <Modal
      isOpen={!!component}
      onClose={onClose}
      title={`${component.partNumber} - Technical Datasheet`}
      subtitle={`Code: ${component.componentCode} | OEM: ${component.manufacturerName}`}
      maxWidth="3xl"
      actions={
        <>
          <button
            onClick={() => onOpenPriceHistory(component)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-purple-300 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800/80 rounded transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Price History</span>
          </button>
          <button
            onClick={() => onRevisePrice(component)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/80 rounded transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Revise Price</span>
          </button>
          <button
            onClick={() => onEditComponent(component)}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Edit Specs
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Title block */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">{component.componentName}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{component.description || 'Standard Low Voltage electrical distribution component'}</p>
            </div>
            <div className="shrink-0 text-right">
              {component.isActive ? (
                <Badge variant="success" size="md">ACTIVE ITEM</Badge>
              ) : (
                <Badge variant="danger" size="md">INACTIVE</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Current Active Commercial Price */}
        <div className="bg-slate-950/80 border border-emerald-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Current Active Supplier Rate</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              From Pricing Engine
            </span>
          </div>

          {component.currentPrice ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 font-mono">
              <div>
                <span className="text-[11px] text-slate-400 block">Net Buying Cost</span>
                <span className="text-lg font-bold text-emerald-400">
                  {component.currentPrice.currency} {component.currentPrice.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">List & Discount</span>
                <span className="text-xs text-slate-300">
                  {component.currentPrice.listPrice.toLocaleString()} - {component.currentPrice.discountPercent}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Supplier / Ref</span>
                <span className="text-xs text-slate-200 truncate block">
                  {component.currentPrice.supplierName}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {component.currentPrice.quotationReference || 'No Ref'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Lead Time & Valid</span>
                <span className="text-xs text-slate-300 block">
                  {component.currentPrice.leadTimeDays || 14} Days Lead
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Until: {component.currentPrice.validUntil || 'Open'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-400 font-mono py-1">
              No current active price record found for this component. Click "Revise Price" to add one.
            </div>
          )}
        </div>

        {/* Technical Electrical Parameters */}
        <div>
          <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Electrical & Physical Ratings</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Rated Current (In)</span>
              <span className="font-bold text-slate-100">{component.ratedCurrent ? `${component.ratedCurrent} A` : 'N/A'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Rated Voltage (Ue)</span>
              <span className="font-bold text-slate-100">{component.ratedVoltage ? `${component.ratedVoltage} V` : '415 V'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Breaking Capacity (Icu)</span>
              <span className="font-bold text-slate-100">{component.breakingCapacity ? `${component.breakingCapacity} kA` : 'N/A'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Poles & Phase</span>
              <span className="font-bold text-slate-100">{component.poles ? `${component.poles} Poles` : '3P'}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Mounting Execution</span>
              <span className="font-bold text-slate-100">{component.mountingType || 'Fixed'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Ingress Protection (IP)</span>
              <span className="font-bold text-slate-100">{component.ipRating || 'IP20'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Standard / Norm</span>
              <span className="font-bold text-slate-100">{component.iecStandard || 'IEC 60947-2'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Rated Frequency</span>
              <span className="font-bold text-slate-100">{component.frequency ? `${component.frequency} Hz` : '50 Hz'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Technical Specifications */}
        {component.specifications && component.specifications.length > 0 && (
          <div>
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Specialized Engineering Specifications</span>
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-lg divide-y divide-slate-800/80 font-mono text-xs">
              {component.specifications.map((spec, i) => (
                <div key={i} className="flex items-center justify-between p-2.5">
                  <span className="text-slate-400">{spec.specificationName}</span>
                  <span className="text-slate-100 font-semibold">
                    {spec.specificationValue} {spec.unit ? `(${spec.unit})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
