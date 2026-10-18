// ============================================================================
// CUSTOMER BOQ VS MANUFACTURING BOM COMPONENT
// Distinguishes Customer-Facing Commercial BOQ from Workshop Manufacturing BOM
// ============================================================================

import React, { useState } from 'react';
import { SLDTopology, CustomerBOQItem } from '../../types/engineering';
import { BOQService } from '../../services/boqService';
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Receipt, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CustomerBOQViewProps {
  topology: SLDTopology;
}

export const CustomerBOQView: React.FC<CustomerBOQViewProps> = ({
  topology,
}) => {
  const [viewMode, setViewMode] = useState<'customer_boq' | 'manufacturing_bom'>('customer_boq');
  const [searchTerm, setSearchTerm] = useState('');

  const boqItems = BOQService.generateCustomerBOQ(topology);
  const totalBOQAmount = boqItems.reduce((sum, item) => sum + (item.totalRateAED || 0), 0);

  const filteredBOQ = boqItems.filter(item =>
    !searchTerm ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ratingSpecification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    const worksheetData = boqItems.map(item => ({
      'Item No.': item.itemNumber,
      'Equipment Description': item.description,
      'Manufacturer / Make': item.make,
      'Model Series': item.model,
      'Rating & Technical Specification': item.ratingSpecification,
      'Quantity': item.quantity,
      'Unit': item.unit,
      'Compliance Standard': item.complianceStandard,
      'Unit Rate (AED)': item.unitRateAED,
      'Total Amount (AED)': item.totalRateAED,
      'Remarks': item.remarks || '',
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customer BOQ');
    XLSX.writeFile(wb, `${topology.panelTag}_Customer_BOQ.xlsx`);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
              Customer BOQ & Commercial Tender Schedule
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Panel: <strong className="text-slate-900">{topology.panelTag}</strong>
            </span>
            <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-semibold">
              Hides Internal Workshop Scrap & Margin Stack
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Bill of Quantities (BOQ) for Consultant & Client Tender Submittals
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Formal equipment line items with IEC standards, OEM brand specifications, and commercial pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
            <button
              onClick={() => setViewMode('customer_boq')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                viewMode === 'customer_boq' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer BOQ (Formal)
            </button>
            <button
              onClick={() => setViewMode('manufacturing_bom')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                viewMode === 'manufacturing_bom' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workshop Manufacturing BOM
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase block">Total Line Items</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{boqItems.length} Sections</span>
          <span className="text-[10px] text-slate-500">Incomers, Feeders, Busbars, Enclosure</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase block">Primary Switchgear OEM</span>
          <span className="text-2xl font-bold text-cyan-800 mt-1 block">{boqItems[0]?.make || 'ABB'}</span>
          <span className="text-[10px] text-slate-500">Certified IEC 60947-2</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase block">Total Equipment Value</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            AED {totalBOQAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">Excluding 5% UAE VAT</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase block">Compliance Form</span>
          <span className="text-2xl font-bold text-purple-800 mt-1 block">{topology.formOfSeparation}</span>
          <span className="text-[10px] text-slate-500">Enclosure Protection: {topology.ipRating}</span>
        </div>
      </div>

      {/* BOQ Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search description, make, rating..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 focus:outline-hidden focus:border-cyan-600"
            />
          </div>

          <span className="text-slate-500 text-[11px]">
            Showing {filteredBOQ.length} of {boqItems.length} BOQ entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Item #</th>
                <th className="py-2.5 px-3">Equipment Technical Description</th>
                <th className="py-2.5 px-3">Make / OEM</th>
                <th className="py-2.5 px-3">Model Series</th>
                <th className="py-2.5 px-3">Rating / Parameters</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3 text-right">Unit Rate (AED)</th>
                <th className="py-2.5 px-3 text-right">Total (AED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBOQ.map(item => (
                <tr key={item.itemNumber} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">{item.itemNumber}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-sans text-xs max-w-md leading-relaxed">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-cyan-800 whitespace-nowrap">{item.make}</td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{item.model}</td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">{item.ratingSpecification}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 text-center">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-center">{item.unit}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                    {item.unitRateAED?.toLocaleString()} AED
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                    {item.totalRateAED?.toLocaleString()} AED
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={7} className="py-3 px-3 text-right text-slate-700 text-xs">
                  TOTAL ESTIMATED SWITCHBOARD VALUE (AED):
                </td>
                <td colSpan={2} className="py-3 px-3 text-right text-base text-emerald-800">
                  {totalBOQAmount.toLocaleString()} AED
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
