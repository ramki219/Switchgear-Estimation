import React from 'react';
import { Component, SupplierPrice } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Plus } from 'lucide-react';

interface PriceHistoryModalProps {
  component: Component | null;
  history: SupplierPrice[];
  isOpen: boolean;
  onClose: () => void;
  onOpenRevisePrice: (comp: Component) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  component,
  history,
  isOpen,
  onClose,
  onOpenRevisePrice,
}) => {
  if (!component || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Price History: ${component.partNumber}`}
      subtitle={`${component.componentName} • OEM: ${component.manufacturerName}`}
      maxWidth="4xl"
      actions={
        <>
          <button
            onClick={() => {
              onClose();
              onOpenRevisePrice(component);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Price Revision</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition shadow-2xs"
          >
            Close
          </button>
        </>
      }
    >
      <div className="space-y-4 font-mono">
        {/* Core Rule Explanation Banner */}
        <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <p className="text-xs text-purple-900 leading-relaxed">
            <strong>Historical Integrity Preserved:</strong> Old pricing rows are never overwritten. When supplier prices increase or contract discounts change, previous rows are archived with valid-until dates to preserve accurate historical cost estimation for older projects.
          </p>
        </div>

        {/* History Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] text-slate-600 uppercase bg-slate-50">
                <th className="py-2.5 px-3">Price Date</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 text-right">List Price</th>
                <th className="py-2.5 px-3 text-right">Discount</th>
                <th className="py-2.5 px-3 text-right">Net Price</th>
                <th className="py-2.5 px-3">Validity Window</th>
                <th className="py-2.5 px-3">Quotation Ref</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No price records logged yet for this component.
                  </td>
                </tr>
              ) : (
                history.map((item, index) => {
                  // Calculate change from previous chronological entry if exists
                  const prevItem = history[index + 1];
                  const priceDiff = prevItem ? item.netPrice - prevItem.netPrice : 0;
                  const percentDiff = prevItem && prevItem.netPrice > 0 
                    ? ((priceDiff / prevItem.netPrice) * 100).toFixed(1) 
                    : null;

                  return (
                    <tr 
                      key={item.supplierPriceID} 
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.isCurrent ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-900">
                        <span className="font-semibold">{item.priceDate}</span>
                        <span className="block text-[10px] text-slate-500">by {item.createdBy || 'estimator'}</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-800 font-sans">
                        <div className="truncate max-w-[130px] font-medium">{item.supplierName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.supplierPartNumber || '-'}</div>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {item.currency} {item.listPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                        {item.discountPercent.toFixed(1)}%
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className={`font-bold text-xs ${item.isCurrent ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {item.currency} {item.netPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        {percentDiff !== null && (
                          <div className={`text-[10px] flex items-center justify-end gap-0.5 ${
                            priceDiff > 0 ? 'text-rose-600' : priceDiff < 0 ? 'text-emerald-600' : 'text-slate-500'
                          }`}>
                            {priceDiff > 0 ? <ArrowUpRight className="w-3 h-3" /> : priceDiff < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                            <span>{priceDiff > 0 ? `+${percentDiff}%` : `${percentDiff}%`}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-[11px] text-slate-500">
                        {item.validUntil ? (
                          <span>Until {item.validUntil}</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Current Active</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {item.quotationReference || '-'}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {item.isCurrent ? (
                          <Badge variant="success">CURRENT</Badge>
                        ) : (
                          <Badge variant="default">ARCHIVED</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
