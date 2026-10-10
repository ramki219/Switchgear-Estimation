import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Project, EstimatePanel, Quotation, BureauClient } from '../../types';

interface TenderDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  panels: EstimatePanel[];
  quotation?: Quotation;
  client?: BureauClient;
}

export const TenderDossierModal: React.FC<TenderDossierModalProps> = ({
  isOpen,
  onClose,
  project,
  panels,
  quotation,
  client,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalEquipmentCost = panels.reduce((sum, p) => sum + p.equipmentCost, 0);
  const totalCopperCost = panels.reduce((sum, p) => sum + p.copperCost, 0);
  const totalEnclosureCost = panels.reduce((sum, p) => sum + p.enclosureCost, 0);
  const totalLabourCost = panels.reduce((sum, p) => sum + p.labourCost, 0);
  const totalDirectCost = totalEquipmentCost + totalCopperCost + totalEnclosureCost + totalLabourCost;
  
  const totalCopperWeight = panels.reduce((sum, p) => sum + p.copperWeightKg, 0);
  const sellingPrice = quotation?.grandTotal || project.sellingPrice || totalDirectCost * 1.25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Official Tender Bidding Dossier
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  IEC 61439-1/2 COMPLIANT
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {project.projectCode} • Prepared for {client?.companyName || project.clientName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-mono font-medium transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white text-slate-900 print:bg-white print:text-black print:p-0 print:m-0">
          
          {/* Header Banner */}
          <div className="border-b-2 border-cyan-600 pb-6 print:border-black">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-mono text-cyan-800 font-bold">
                  SWITCHGEAR ESTIMATION & ENGINEERING TENDER BUREAU
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 print:text-black mt-1">
                  TECHNICAL SUBMITTAL & COMMERCIAL TENDER DOSSIER
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Reference: <strong className="text-slate-800 print:text-black">{quotation?.quotationNumber || `QT-${project.projectCode}-R0`}</strong> • Revision: {quotation?.revisionNumber || 'R0'}
                </p>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-slate-500">Date: {quotation?.quotationDate || new Date().toISOString().split('T')[0]}</div>
                <div className="text-slate-500">Validity: {quotation?.validityDays || 30} Days</div>
                <div className="text-emerald-700 font-bold mt-1">Authority: {project.authority}</div>
              </div>
            </div>
          </div>

          {/* Project & Client Identification Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Tender Project Details</div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">{project.projectName}</div>
              <div className="text-slate-600 mt-1">Location: {project.location}</div>
              <div className="text-slate-600">Consultant: {project.consultantName || 'Standard Consulting Engineers'}</div>
              <div className="text-slate-600">Assigned Bureau Lead: {project.assignedEstimator}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase">Bidding Panel Builder / Contractor</div>
              <div className="font-bold text-sm text-cyan-800 mt-0.5">
                {client?.companyName || project.clientName}
              </div>
              <div className="text-slate-600 mt-1">
                Contact: {client?.contactPerson || 'Tendering Department'}
              </div>
              <div className="text-slate-600">
                Email / Phone: {client?.email || 'estimating@panelbuilder.com'} • {client?.phone || '+971 4 000 0000'}
              </div>
              <div className="text-slate-600">
                Standard Terms: {client?.defaultPaymentTerms || quotation?.paymentTerms || '30 Days Net'}
              </div>
            </div>
          </div>

          {/* Section 1: Executive Scope of Supply */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-800 print:text-black border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>1. Schedule of Low Voltage Switchboards ({panels.length} Assemblies)</span>
              <span className="text-[10px] text-slate-500">Standard: IEC 61439-1 & IEC 61439-2</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tag</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Incomer (A)</th>
                    <th className="py-2.5 px-3">Fault Icw</th>
                    <th className="py-2.5 px-3">Form</th>
                    <th className="py-2.5 px-3">IP</th>
                    <th className="py-2.5 px-3">Dimensions (H×W×D mm)</th>
                    <th className="py-2.5 px-3 text-right">Selling Price ({project.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {panels.map((p) => (
                    <tr key={p.panelID} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-cyan-800">{p.panelTag}</td>
                      <td className="py-2.5 px-3 text-slate-900">{p.panelName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.incomerRating}A</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.shortCircuitRating}kA 1s</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.formOfSeparation}</td>
                      <td className="py-2.5 px-3 text-slate-700">{p.ipRating}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {p.enclosureHeight}×{p.enclosureWidth}×{p.enclosureDepth}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {(p.totalPanelCost * 1.25).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Technical Compliance Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-800 print:text-black border-b border-slate-200 pb-1">
              2. Technical Compliance & Verification Schedule (IEC 61439-1 & 2)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase">Busbar Material</div>
                <div className="font-bold text-slate-900 mt-0.5">High Conductivity Cu-ETP</div>
                <div className="text-[10px] text-slate-500 mt-1">99.9% Pure Electrolytic Copper</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase">Current Density Limit</div>
                <div className="font-bold text-slate-900 mt-0.5">1.50 A / mm²</div>
                <div className="text-[10px] text-slate-500 mt-1">IEC 61439 temperature rise verified</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase">Total Copper Tonnage</div>
                <div className="font-bold text-amber-700 mt-0.5">{totalCopperWeight.toFixed(1)} kg</div>
                <div className="text-[10px] text-slate-500 mt-1">Includes phase, neutral & earth bars</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500 uppercase">Sheet Steel Enclosure</div>
                <div className="font-bold text-slate-900 mt-0.5">Electro-Galvanized 2.0mm</div>
                <div className="text-[10px] text-slate-500 mt-1">RAL 7035 Powder Coated 70-90µm</div>
              </div>
            </div>
          </div>

          {/* Section 3: Commercial Proposal & Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-800 print:text-black border-b border-slate-200 pb-1">
              3. Commercial Proposal & Bidding Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-slate-50">
                <div className="text-[10px] text-slate-600 font-bold uppercase border-b border-slate-200 pb-1">
                  Cost Breakdown Structure
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Major Equipment & Breakers:</span>
                  <span className="font-semibold text-slate-900">{project.currency} {totalEquipmentCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Copper Busbar Materials ({totalCopperWeight.toFixed(0)} kg):</span>
                  <span className="font-semibold text-slate-900">{project.currency} {totalCopperCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Modular Enclosures & Hardware:</span>
                  <span className="font-semibold text-slate-900">{project.currency} {totalEnclosureCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Assembly, Wiring & Testing Labour:</span>
                  <span className="font-semibold text-slate-900">{project.currency} {totalLabourCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-slate-300 font-bold text-slate-900">
                  <span>Total Direct Factory Cost:</span>
                  <span>{project.currency} {totalDirectCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white shadow-2xs">
                <div className="text-[10px] text-slate-600 font-bold uppercase border-b border-slate-200 pb-1">
                  Commercial Offer to Contractor
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Engineering & Administrative Overhead:</span>
                  <span className="text-slate-900">{project.currency} {(quotation?.overheadAmount || totalDirectCost * 0.08).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Contractor Net Profit Margin:</span>
                  <span className="text-emerald-700 font-semibold">
                    {project.currency} {(quotation?.profitMarginAmount || totalDirectCost * 0.17).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Value Added Tax (5% VAT):</span>
                  <span className="text-slate-900">{project.currency} {(quotation?.taxAmount || sellingPrice * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-cyan-600 font-bold text-sm text-cyan-800">
                  <span>TOTAL TENDER OFFER (INCL. VAT):</span>
                  <span>{project.currency} {sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Terms & Signoff */}
          <div className="border-t border-slate-200 pt-4 text-xs font-mono space-y-4">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Commercial Terms & Warranty:</div>
              <p className="text-slate-700 mt-1 leading-relaxed">
                • <strong>Payment Terms:</strong> {quotation?.paymentTerms || client?.defaultPaymentTerms || '10% Advance, 80% against delivery, 10% on testing.'}<br />
                • <strong>Delivery Lead Time:</strong> {quotation?.deliveryPeriodWeeks || client?.defaultDeliveryWeeks || 8} Weeks from drawing approval.<br />
                • <strong>Warranty:</strong> {quotation?.warrantyMonths || client?.defaultWarrantyMonths || 18} Months against manufacturing defects.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-300">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Prepared by Outsourced Estimation Bureau:</div>
                <div className="mt-8 border-b border-slate-300 w-48"></div>
                <div className="text-slate-900 font-semibold mt-1">Lead Switchgear Estimator (PE, IEEE)</div>
                <div className="text-[10px] text-slate-500">Model A Engineering Tendering Bureau</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">Accepted & Acknowledged by Contractor:</div>
                <div className="mt-8 border-b border-slate-300 w-48"></div>
                <div className="text-slate-900 font-semibold mt-1">
                  Authorized Signatory / Technical Director
                </div>
                <div className="text-[10px] text-slate-500">{client?.companyName || project.clientName}</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
