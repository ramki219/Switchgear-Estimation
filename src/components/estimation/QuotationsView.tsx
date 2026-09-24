import React, { useState, useEffect } from 'react';
import { Project, EstimatePanel, Quotation } from '../../types';
import { Badge } from '../common/Badge';
import { 
  FileText, 
  ArrowLeft, 
  Save, 
  Printer, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { exportQuotationToCSV } from '../../services/exportService';

interface QuotationsViewProps {
  project: Project;
  panels: EstimatePanel[];
  quotation?: Quotation;
  onBackToEstimation: () => void;
  onSaveQuotation: (quoteData: any) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  project,
  panels,
  quotation,
  onBackToEstimation,
  onSaveQuotation,
}) => {
  const [quotationNumber, setQuotationNumber] = useState('');
  const [revisionNumber, setRevisionNumber] = useState('R0');
  const [quotationDate, setQuotationDate] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [overheadPercent, setOverheadPercent] = useState(8.0);
  const [profitMarginPercent, setProfitMarginPercent] = useState(15.0);
  const [taxPercent, setTaxPercent] = useState(5.0);
  const [deliveryWeeks, setDeliveryWeeks] = useState(8);
  const [warrantyMonths, setWarrantyMonths] = useState(18);
  const [paymentTerms, setPaymentTerms] = useState(
    '10% Advance with Order, 80% against Delivery, 10% on Testing & Handover'
  );
  const [status, setStatus] = useState<Quotation['status']>('DRAFT');

  // Preview Mode
  const [viewMode, setViewMode] = useState<'editor' | 'proposal'>('editor');

  // Sum raw costs from panels
  const totalEquipmentCost = panels.reduce((sum, p) => sum + p.equipmentCost, 0);
  const totalCopperCost = panels.reduce((sum, p) => sum + p.copperCost, 0);
  const totalEnclosureCost = panels.reduce((sum, p) => sum + p.enclosureCost, 0);
  const totalLabourCost = panels.reduce((sum, p) => sum + p.labourCost, 0);
  const totalDirectCost = totalEquipmentCost + totalCopperCost + totalEnclosureCost + totalLabourCost;

  // Real-time commercial math
  const overheadAmount = Number((totalDirectCost * (overheadPercent / 100)).toFixed(2));
  const costWithOverhead = totalDirectCost + overheadAmount;
  const subtotalBeforeTax = Number((costWithOverhead / (1 - profitMarginPercent / 100)).toFixed(2));
  const profitMarginAmount = Number((subtotalBeforeTax - costWithOverhead).toFixed(2));
  const taxAmount = Number((subtotalBeforeTax * (taxPercent / 100)).toFixed(2));
  const grandTotal = Number((subtotalBeforeTax + taxAmount).toFixed(2));

  useEffect(() => {
    if (quotation) {
      setQuotationNumber(quotation.quotationNumber);
      setRevisionNumber(quotation.revisionNumber);
      setQuotationDate(quotation.quotationDate);
      setValidityDays(quotation.validityDays);
      setOverheadPercent(quotation.overheadPercent);
      setProfitMarginPercent(quotation.profitMarginPercent);
      setTaxPercent(quotation.taxPercent);
      setDeliveryWeeks(quotation.deliveryPeriodWeeks);
      setWarrantyMonths(quotation.warrantyMonths);
      setPaymentTerms(quotation.paymentTerms);
      setStatus(quotation.status);
    } else {
      setQuotationNumber(`QT-2026-${String(project.projectID).padStart(3, '0')}-R0`);
      setRevisionNumber('R0');
      setQuotationDate(new Date().toISOString().split('T')[0]);
      setValidityDays(30);
      setOverheadPercent(8.0);
      setProfitMarginPercent(15.0);
      setTaxPercent(5.0);
      setDeliveryWeeks(8);
      setWarrantyMonths(18);
      setStatus('DRAFT');
    }
  }, [quotation, project]);

  const handleSave = () => {
    onSaveQuotation({
      projectID: project.projectID,
      quotationNumber,
      revisionNumber,
      quotationDate,
      validityDays,
      overheadPercent,
      profitMarginPercent,
      taxPercent,
      deliveryPeriodWeeks: deliveryWeeks,
      warrantyMonths,
      paymentTerms,
      status,
    });
  };

  const handleExportCSV = () => {
    const currentQuoteObj: any = {
      quotationNumber,
      projectCode: project.projectCode,
      projectName: project.projectName,
      clientName: project.clientName,
      revisionNumber,
      quotationDate,
      currency: project.currency,
      totalEquipmentCost,
      totalCopperCost,
      totalEnclosureCost,
      totalLabourCost,
      totalDirectCost,
      overheadPercent,
      overheadAmount,
      profitMarginPercent,
      profitMarginAmount,
      subtotalBeforeTax,
      taxPercent,
      taxAmount,
      grandTotal,
    };
    exportQuotationToCSV(currentQuoteObj, panels);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEstimation}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
            title="Back to Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-sm">{quotationNumber || 'QUOTATION'}</span>
              <Badge variant="purple" size="sm">REV {revisionNumber}</Badge>
              <Badge variant="emerald" size="sm">{status}</Badge>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">Commercial Quotation Engine</h2>
            <p className="text-xs text-slate-400 font-sans">
              Project: <strong className="text-slate-200">{project.projectName}</strong> | Client: {project.clientName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-slate-950 p-1 rounded border border-slate-800 flex text-xs">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                viewMode === 'editor' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cost & Margin Editor
            </button>
            <button
              onClick={() => setViewMode('proposal')}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                viewMode === 'proposal' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Printable Client Proposal
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3.5 py-2 rounded text-xs flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Quotation</span>
          </button>
        </div>
      </div>

      {viewMode === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column (2/3): Direct Costs & Margin Calculator */}
          <div className="lg:col-span-2 space-y-4">
            {/* Direct Cost Stack */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm font-bold text-slate-200">1. Factory Direct Cost Breakdown (Panels)</span>
                <span className="text-xs text-slate-400">{panels.length} Switchboards Total</span>
              </div>

              <div className="space-y-2 text-xs">
                {panels.map((p) => (
                  <div
                    key={p.panelID}
                    className="p-2.5 bg-slate-950 rounded border border-slate-800/80 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-cyan-400">{p.panelTag}</span>
                      <span className="text-slate-300 ml-2 font-normal text-[11px]">{p.panelName}</span>
                      <span className="text-slate-500 block text-[10px]">
                        {p.incomerRating}A | {p.formOfSeparation} | {p.ipRating} | {p.items.length} Feeders
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-200 text-xs">
                        {p.totalPanelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Equip: {p.equipmentCost.toLocaleString()} | Cu: {p.copperCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Cost Totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Equipment</span>
                  <span className="font-bold text-cyan-400">{totalEquipmentCost.toLocaleString()} AED</span>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Copper Busbars</span>
                  <span className="font-bold text-amber-400">{totalCopperCost.toLocaleString()} AED</span>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Enclosures</span>
                  <span className="font-bold text-blue-400">{totalEnclosureCost.toLocaleString()} AED</span>
                </div>
                <div className="bg-slate-950 p-2 rounded">
                  <span className="text-[10px] text-slate-500 block">Labour</span>
                  <span className="font-bold text-teal-400">{totalLabourCost.toLocaleString()} AED</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800 text-xs font-bold">
                <span className="text-slate-300">Total Direct Manufacturing Cost:</span>
                <span className="text-base text-slate-100">{totalDirectCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</span>
              </div>
            </div>

            {/* Commercial Terms & Conditions */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
              <span className="text-sm font-bold text-slate-200 block border-b border-slate-800 pb-2">
                2. Tender Commercial Clauses & Terms
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quotation Validity</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                    />
                    <span className="text-slate-500">Days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Manufacturing Lead Time</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={deliveryWeeks}
                      onChange={(e) => setDeliveryWeeks(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                    />
                    <span className="text-slate-500">Weeks</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Warranty Period</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={warrantyMonths}
                      onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                    />
                    <span className="text-slate-500">Months</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Commercial Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Right Column (1/3): Margins & Selling Price Calculation */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 text-xs">
              <span className="text-sm font-bold text-slate-200 block border-b border-slate-800 pb-2">
                3. Margin & Markup Engine
              </span>

              {/* Overhead % */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-400">Factory & Engineering Overhead:</label>
                  <span className="text-cyan-400 font-bold">{overheadPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={overheadPercent}
                  onChange={(e) => setOverheadPercent(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Overhead Amount:</span>
                  <span className="text-slate-300 font-mono">+{overheadAmount.toLocaleString()} AED</span>
                </div>
              </div>

              {/* Profit Margin % */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <label className="text-slate-400">Target Gross Profit Margin:</label>
                  <span className="text-emerald-400 font-bold">{profitMarginPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={0.5}
                  value={profitMarginPercent}
                  onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Gross Profit Markup:</span>
                  <span className="text-emerald-400 font-mono">+{profitMarginAmount.toLocaleString()} AED</span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subtotal (Excl. VAT):</span>
                  <span className="font-bold text-slate-100">{subtotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">UAE / GCC VAT (5%):</span>
                  <span className="text-slate-400">+{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</span>
                </div>
              </div>

              {/* Grand Total Selling Price */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-center space-y-1">
                <span className="text-emerald-300 text-xs font-semibold block uppercase tracking-wider">
                  Grand Total Tender Proposal
                </span>
                <span className="text-2xl font-bold text-emerald-400 block">
                  {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal">AED</span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Inclusive of 5% VAT & standard delivery to site
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-400 mb-1">Proposal Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                >
                  <option value="DRAFT">DRAFT (Preliminary Estimation)</option>
                  <option value="SUBMITTED">SUBMITTED (Issued to Client)</option>
                  <option value="ACCEPTED">ACCEPTED (Commercial Approval)</option>
                  <option value="REJECTED">REJECTED (Tender Lost)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PRINTABLE FORMAL CLIENT PROPOSAL */
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-4xl mx-auto space-y-6 text-slate-200 text-xs shadow-2xl">
          {/* Proposal Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-700 pb-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold block">
                TECHNICAL & COMMERCIAL QUOTATION
              </span>
              <h1 className="text-xl font-bold text-slate-100 mt-1">
                LOW VOLTAGE SWITCHGEAR DIVISION
              </h1>
              <p className="text-[11px] text-slate-400">
                Design, Assembly, Testing & Supply of IEC 61439-1/2 Compliant Switchboards
              </p>
            </div>
            <div className="text-right font-mono text-[11px]">
              <div><strong className="text-slate-400">Quote Ref:</strong> <span className="text-cyan-400 font-bold">{quotationNumber}</span></div>
              <div><strong className="text-slate-400">Revision:</strong> {revisionNumber}</div>
              <div><strong className="text-slate-400">Date:</strong> {quotationDate}</div>
              <div><strong className="text-slate-400">Validity:</strong> {validityDays} Days</div>
            </div>
          </div>

          {/* Client & Project Addresses */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">To (Client):</span>
              <div className="font-bold text-slate-100 text-xs">{project.clientName}</div>
              <div className="text-slate-400">{project.location}</div>
              {project.consultantName && (
                <div className="text-slate-400 mt-1">Consultant: {project.consultantName}</div>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">Project Details:</span>
              <div className="font-bold text-slate-100 text-xs">{project.projectName}</div>
              <div className="text-slate-400">Authority: <strong className="text-emerald-400">{project.authority}</strong></div>
              <div className="text-slate-400">Estimator: {project.assignedEstimator}</div>
            </div>
          </div>

          {/* Bill of Quantities (BOQ) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Scope of Supply & Pricing Breakdown (BOQ)
            </h4>
            <table className="w-full text-left border border-slate-800 bg-slate-950 text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Tag</th>
                  <th className="py-2.5 px-3">Switchboard Description</th>
                  <th className="py-2.5 px-3">Separation / IP</th>
                  <th className="py-2.5 px-3 text-right">Incomer</th>
                  <th className="py-2.5 px-3 text-right">Amount (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {panels.map((p, idx) => (
                  <tr key={p.panelID}>
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-cyan-400">{p.panelTag}</td>
                    <td className="py-2 px-3 text-slate-200">
                      {p.panelName}
                      <span className="text-[10px] text-slate-500 block">
                        {p.numberOfColumns} Tiers | {p.enclosureHeight}×{p.enclosureWidth}×{p.enclosureDepth} mm | {p.items.length} Feeders
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                      {p.formOfSeparation} / {p.ipRating}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">{p.incomerRating}A</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-100">
                      {(p.totalPanelCost * 1.25).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 border-t border-slate-800 font-mono text-xs">
                <tr>
                  <td colSpan={5} className="py-2 px-3 text-right text-slate-400">Total Net Amount (Excl. VAT):</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-100">{subtotalBeforeTax.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</td>
                </tr>
                <tr>
                  <td colSpan={5} className="py-2 px-3 text-right text-slate-400">UAE VAT (5%):</td>
                  <td className="py-2 px-3 text-right text-slate-300">+{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</td>
                </tr>
                <tr className="text-sm bg-slate-950 font-bold">
                  <td colSpan={5} className="py-2.5 px-3 text-right text-emerald-400">Grand Total Tender Price:</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Commercial Terms & Conditions */}
          <div className="space-y-2 text-[11px] bg-slate-950 p-4 rounded border border-slate-800">
            <span className="font-bold text-slate-300 block uppercase">Commercial Terms & Warranty:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>Payment Terms:</strong> {paymentTerms}</li>
              <li><strong>Delivery Period:</strong> {deliveryWeeks} weeks from approval of single-line diagrams & receipt of advance.</li>
              <li><strong>Warranty:</strong> {warrantyMonths} months against manufacturing defects per IEC 61439-1/2 standard.</li>
              <li><strong>Testing:</strong> Full routine tests (megger, high voltage dielectric withstand, functional trip logic) included.</li>
            </ul>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-[11px]">
            <div>
              <div className="h-12 border-b border-slate-700"></div>
              <span className="text-slate-400 block mt-1">Authorized Switchgear Estimator</span>
              <span className="text-slate-200 font-bold">{project.assignedEstimator}</span>
            </div>
            <div>
              <div className="h-12 border-b border-slate-700"></div>
              <span className="text-slate-400 block mt-1">Commercial Procurement Director</span>
              <span className="text-slate-200 font-bold">Approved for Tender Submission</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
