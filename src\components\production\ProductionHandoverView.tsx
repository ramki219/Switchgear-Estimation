// ============================================================================
// PURCHASING & PRODUCTION HANDOVER VIEW
// Conversion of approved estimation into Workshop Job Cards & Procurement Requisitions
// ============================================================================

import React, { useState } from 'react';
import { 
  Wrench, 
  ShoppingCart, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Download, 
  Plus, 
  Clock, 
  Building2, 
  Layers, 
  PackageCheck,
  UserCheck
} from 'lucide-react';
import { Project, EstimatePanel, ProductionJobCard, PurchaseRequisitionRecord } from '../../types';
import * as XLSX from 'xlsx';

interface ProductionHandoverViewProps {
  projects: Project[];
  activeProject: Project | null;
  panels: EstimatePanel[];
  onSelectProject: (p: Project) => void;
}

export const ProductionHandoverView: React.FC<ProductionHandoverViewProps> = ({
  projects,
  activeProject,
  panels,
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState<'job_cards' | 'purchase_reqs' | 'shortages'>('job_cards');

  // Sample production job cards state
  const [jobCards, setJobCards] = useState<ProductionJobCard[]>([
    {
      id: 1,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      jobNumber: 'JOB-2026-081',
      panelTag: 'MDB-01 (4000A Main Switchboard)',
      status: 'FABRICATION',
      targetDate: '2026-11-15',
      actualCompletionDate: undefined,
      supervisor: 'Eng. Rajesh Pillai (Workshop Foreman)',
      notes: 'Sheet metal laser cutting & 2mm galvanised steel bending completed. IP54 powder coating RAL 7035 in progress.',
      createdAt: '2026-10-01',
    },
    {
      id: 2,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      jobNumber: 'JOB-2026-082',
      panelTag: 'ATS-01 (2500A Auto Transfer Switch)',
      status: 'BUSBAR_WORK',
      targetDate: '2026-11-20',
      actualCompletionDate: undefined,
      supervisor: 'Eng. Rajesh Pillai',
      notes: 'Main 3x (100x10) mm ETP copper busbars bent and torque tightened to 50 Nm. Mechanical walking beam interlock aligned.',
      createdAt: '2026-10-03',
    },
    {
      id: 3,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      jobNumber: 'JOB-2026-083',
      panelTag: 'SMDB-B1 (800A Sub-Main Board)',
      status: 'WIRING',
      targetDate: '2026-11-10',
      actualCompletionDate: undefined,
      supervisor: 'Fahad Bin Khalid (QC Inspector)',
      notes: 'MCCB secondary control wiring, CT metering loops, and TB01 terminal block numbering in progress.',
      createdAt: '2026-10-04',
    },
    {
      id: 4,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      jobNumber: 'JOB-2026-084',
      panelTag: 'APFC-01 (400 kVAR Capacitor Bank)',
      status: 'QUEUED',
      targetDate: '2026-11-28',
      supervisor: 'Eng. Rajesh Pillai',
      notes: 'Awaiting delivery of detuned 7% harmonic reactors from supplier.',
      createdAt: '2026-10-05',
    },
  ]);

  // Sample purchase requisitions state
  const [purchaseReqs, setPurchaseReqs] = useState<PurchaseRequisitionRecord[]>([
    {
      id: 1,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      prNumber: 'PR-2026-104',
      status: 'PO_ISSUED',
      supplierName: 'Al Ghandi Electrical Supplies (ABB Authorized)',
      totalAmount: 184500,
      requestedBy: 'Mohammed Tariq (Purchase Officer)',
      itemsSummary: '1x Emax 2 E4.2V 4000A 4P Drawout ACB, 2x Emax 2 E2.2N 2500A 4P, 18x Tmax XT4N 250A MCCBs',
      createdAt: '2026-10-02',
    },
    {
      id: 2,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      prNumber: 'PR-2026-105',
      status: 'APPROVED',
      supplierName: 'Ducab Metal Industries LLC (Copper)',
      totalAmount: 58800,
      requestedBy: 'Mohammed Tariq',
      itemsSummary: '1,400 kg ETP Grade 99.9% Electrolytic Flat Copper Bars (100x10 mm & 80x10 mm)',
      createdAt: '2026-10-04',
    },
    {
      id: 3,
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      prNumber: 'PR-2026-106',
      status: 'PENDING',
      supplierName: 'Rittal Middle East FZE (Enclosures)',
      totalAmount: 42300,
      requestedBy: 'Mohammed Tariq',
      itemsSummary: '5x VX25 Modular Enclosure Tiers (2200x800x1000 mm) Form 4b with gland plates & louvers',
      createdAt: '2026-10-06',
    },
  ]);

  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [selectedPanelForJob, setSelectedPanelForJob] = useState<string>(panels[0]?.panelTag || 'MDB-01');
  const [targetDateForJob, setTargetDateForJob] = useState<string>('2026-11-30');

  const handleCreateJob = () => {
    const newJob: ProductionJobCard = {
      id: Date.now(),
      companyId: 1,
      projectId: activeProject?.projectID || 1,
      jobNumber: `JOB-2026-${String(jobCards.length + 85).padStart(3, '0')}`,
      panelTag: selectedPanelForJob,
      status: 'QUEUED',
      targetDate: targetDateForJob,
      supervisor: 'Eng. Rajesh Pillai',
      notes: 'Initial production work order scheduled from estimation handover.',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setJobCards([newJob, ...jobCards]);
    setNewJobModalOpen(false);
  };

  const handleExportJobSchedule = () => {
    const wsData = jobCards.map(j => ({
      'Job Number': j.jobNumber,
      'Switchboard / Panel': j.panelTag,
      'Production Stage': j.status,
      'Target Completion': j.targetDate,
      'Workshop Supervisor': j.supervisor,
      'Progress Notes': j.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production Schedule');
    XLSX.writeFile(wb, `${activeProject?.projectCode || 'PROJECT'}_Production_Handover.xlsx`);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase">
              Production Handover & Procurement Floor
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              ESTIMATION HANDOVER READY
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Active Tender: <strong className="text-slate-900">{activeProject?.projectCode || 'SELECT PROJECT'}</strong>
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Manufacturing Job Cards, Assembly Floor Handover & Purchase Requisitions
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Converts won or approved estimation tenders into workshop job cards, procurement requisitions, and material shortage trackings.
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
            <button
              onClick={() => setActiveTab('job_cards')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
                activeTab === 'job_cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Job Cards ({jobCards.length})
            </button>
            <button
              onClick={() => setActiveTab('purchase_reqs')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
                activeTab === 'purchase_reqs' ? 'bg-white text-cyan-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Procurement ({purchaseReqs.length})
            </button>
            <button
              onClick={() => setActiveTab('shortages')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
                activeTab === 'shortages' ? 'bg-white text-amber-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock & Shortages
            </button>
          </div>

          <button
            onClick={handleExportJobSchedule}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
            title="Export production handover schedule to Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WORKSHOP JOB CARDS */}
      {activeTab === 'job_cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">
              Live Switchboard Fabrication & Assembly Queue
            </span>
            <button
              onClick={() => setNewJobModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Job Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobCards.map((card) => {
              const statusColor = 
                card.status === 'QUEUED' ? 'bg-slate-100 text-slate-800 border-slate-300' :
                card.status === 'FABRICATION' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                card.status === 'BUSBAR_WORK' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                card.status === 'WIRING' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                card.status === 'TESTING' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                card.status === 'FAT_PASSED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                'bg-slate-100 text-slate-700 border-slate-300';

              return (
                <div key={card.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm">{card.jobNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                        {card.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-cyan-900 text-xs mb-1">{card.panelTag}</h4>
                    <p className="text-[11px] text-slate-600 font-sans leading-relaxed mb-3">
                      {card.notes}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Supervisor: <strong className="text-slate-800">{card.supervisor}</strong></span>
                      <span>Target: <strong className="text-slate-800">{card.targetDate}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE REQUISITIONS */}
      {activeTab === 'purchase_reqs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="font-bold text-slate-900 text-sm">
                Approved Purchase Requisitions (Procurement Floor)
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Automatically prepared from estimated component BOM and copper weight requirements.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3">PR Number</th>
                  <th className="p-3">Authorized Supplier / Vendor</th>
                  <th className="p-3">Procurement Summary & Quantities</th>
                  <th className="p-3 text-right">Estimated Cost (AED)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Requested By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseReqs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-cyan-800">{pr.prNumber}</td>
                    <td className="p-3 font-medium text-slate-900">{pr.supplierName}</td>
                    <td className="p-3 text-slate-600 max-w-md font-sans leading-tight">{pr.itemsSummary}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {pr.totalAmount.toLocaleString()} AED
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pr.status === 'PO_ISSUED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        pr.status === 'APPROVED' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {pr.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{pr.requestedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK & SHORTAGE CHECKS */}
      {activeTab === 'shortages' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Material Availability & Shortage Report
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Compares project BOM required quantities against current factory warehouse inventory.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">In Factory Stock</span>
              <span className="text-xl font-bold text-emerald-900 mt-1 block">78%</span>
              <span className="text-[10px] text-emerald-700 font-sans">Busbars, standard MCCBs (up to 250A), terminals & copper lugs</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">On Active Purchase Order</span>
              <span className="text-xl font-bold text-amber-900 mt-1 block">18%</span>
              <span className="text-[10px] text-amber-700 font-sans">4000A ACBs, 2500A drawout breakers (ETA: 10 working days)</span>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
              <span className="text-[10px] font-bold text-red-800 uppercase block">Procurement Shortage</span>
              <span className="text-xl font-bold text-red-900 mt-1 block">4%</span>
              <span className="text-[10px] text-red-700 font-sans">Castell key mechanical interlocking cylinders for ATS scheme</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Job Card */}
      {newJobModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Issue Production Job Card</h3>
              <button onClick={() => setNewJobModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Switchboard / Panel</label>
                <select
                  value={selectedPanelForJob}
                  onChange={(e) => setSelectedPanelForJob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                >
                  {panels.map((p, idx) => (
                    <option key={idx} value={p.panelTag}>{p.panelTag} — {p.panelName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Target FAT Testing Date</label>
                <input
                  type="date"
                  value={targetDateForJob}
                  onChange={(e) => setTargetDateForJob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setNewJobModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
              >
                Confirm & Issue Job Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
