// ============================================================================
// PROJECT ARCHITECTURE & WORKFLOW DOCUMENTATION MODAL
// Interactive Document Viewer with One-Click PDF Download
// ============================================================================

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  CheckCircle2, 
  Layers, 
  Server, 
  Database, 
  Workflow, 
  Cpu, 
  Building2, 
  Printer, 
  ShieldCheck, 
  DollarSign,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { downloadProjectDocumentationPDF } from '../../services/projectDocumentationPdfService';
import { CompanyTenant } from '../../types';

interface ProjectDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompany?: CompanyTenant | null;
}

export const ProjectDocumentationModal: React.FC<ProjectDocumentationModalProps> = ({
  isOpen,
  onClose,
  currentCompany,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'frontend_backend' | 'database' | 'workflows' | 'costing_math' | 'billing'>('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      downloadProjectDocumentationPDF({
        companyName: currentCompany?.companyName || 'Emirates Switchgear Manufacturing LLC',
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 font-sans text-slate-900">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  SwitchgearOS Project Manual & Architecture Specification
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono font-semibold">
                  OFFICIAL PDF SPEC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Comprehensive guide to Frontend, Backend, Cloud SQL Database & Engineering Workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              title="Download compiled multi-page PDF document"
            >
              {isDownloading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloadSuccess ? 'PDF Downloaded!' : 'Download Official PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Print Documentation"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Project Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('frontend_backend')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'frontend_backend'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>2. Frontend & Backend</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Database Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'workflows'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>4. System Workflows</span>
          </button>

          <button
            onClick={() => setActiveTab('costing_math')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'costing_math'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>5. Costing Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'billing'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>6. Pricing & Payouts</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm bg-white">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Executive Project Overview</span>
                </h3>
                <p className="text-slate-700 text-xs mt-2 leading-relaxed font-sans">
                  SwitchgearOS is a commercial, multi-tenant Software-as-a-Service (SaaS) platform built for 
                  Low Voltage (LV) switchgear panel builders, electrical contractors, and tender estimation 
                  engineers in the UAE and worldwide. It replaces manual, error-prone spreadsheets with an 
                  automated, auditable, and production-ready calculation engine complying with 
                  <strong> IEC 61439-1 &amp; 2 Form 2b/4b</strong> and local utility specifications 
                  (DEWA, SEWA, ADDC, FEWA, and Kahramaa).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono text-cyan-800 mb-2">
                    Target Customers
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600">
                    <li>• LV Switchgear Manufacturers in the UAE</li>
                    <li>• Panel Builders &amp; System Integrators</li>
                    <li>• Tender Estimation &amp; Costing Departments</li>
                    <li>• Electrical CAD &amp; SLD Design Engineers</li>
                    <li>• Purchasing &amp; Production Floor Managers</li>
                  </ul>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono text-cyan-800 mb-2">
                    Switchboard Assemblies
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600">
                    <li>• <strong>MDB</strong> — Main Distribution Board</li>
                    <li>• <strong>SMDB</strong> — Sub-Main Distribution Board</li>
                    <li>• <strong>DB</strong> — Final Distribution Board</li>
                    <li>• <strong>MCC</strong> — Motor Control Centre</li>
                    <li>• <strong>ATS</strong> — Auto Transfer Switch (3-Breaker)</li>
                    <li>• <strong>APFC</strong> — Capacitor Banks &amp; Reactors</li>
                  </ul>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono text-cyan-800 mb-2">
                    Security &amp; Compliance
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600">
                    <li>• Strict Tenant Isolation (WHERE company_id = ?)</li>
                    <li>• Firebase Authentication + JWT Verification</li>
                    <li>• UAE 15-Digit FTA TRN &amp; 5% VAT Invoicing</li>
                    <li>• Activity Audit Trail with Timestamping</li>
                    <li>• Cloud SQL PostgreSQL Relational Storage</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRONTEND & BACKEND */}
          {activeTab === 'frontend_backend' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Frontend Architecture */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Frontend Architecture (Client)</h4>
                      <span className="text-[10px] text-slate-500 font-mono">React 19 • Vite • Tailwind v4</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed as a high-density, real-time engineering single-page application (SPA). 
                    Breaker ratings, frame sizes, and copper prices recalculate instantly in local memory 
                    without latency, while syncing securely to the backend.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Facebook-Style Login Gateway:</strong> Familiar 2-column layout offering Google Sign-in, email/password, and instant registration modal.
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>SLD Studio &amp; CAD Canvas:</strong> Vector SVG engine drawing single line diagrams, interlocking logic, and busbar mimics.
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>2D Panel GA Drawing:</strong> Automated panel facia layout computing cubicle dimensions and digital meter cutouts.
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Report &amp; PDF Export Engine:</strong> Client-side PDF and Excel generation for tender bids and workshop job cards.
                    </div>
                  </div>
                </div>

                {/* Backend Architecture */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Backend Architecture (Server)</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Node.js • Express • Drizzle ORM</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Full-stack architecture hosted in server.ts running Express on port 3000 with Vite middleware in development. 
                    All endpoints require Firebase Admin JWT verification and scope queries to the authenticated tenant.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Authentication Middleware:</strong> Decodes Firebase ID tokens, looks up user record, and injects <code className="text-blue-700">req.companyId</code>.
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Multi-Tenant APIs:</strong> Endpoints for company profile, subscriptions, tender projects, estimate panels, BOMs, and quotations.
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Production Handover APIs:</strong> Converts approved tenders into workshop job cards for copper fabrication, wiring, and FAT testing.
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Audit Logging:</strong> Automatically tracks pricing alterations, margin adjustments, and project approvals.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-700" />
                  <span>Cloud SQL PostgreSQL Database Schema (Drizzle ORM)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  13 core tables engineered with strict foreign keys and tenant isolation columns:
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Table Name</th>
                      <th className="p-3">Key Fields</th>
                      <th className="p-3">Tenant Separation Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">companies</td>
                      <td className="p-3">id, company_code, company_name, trade_license_no, vat_trn, currency, plan</td>
                      <td className="p-3 text-slate-600">Root tenant entity representing the UAE switchgear manufacturing plant.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">users</td>
                      <td className="p-3">id, uid, company_id, email, full_name, role (OWNER, ESTIMATOR, etc.)</td>
                      <td className="p-3 text-slate-600">Users mapped to their corporate tenant with Role-Based Access Control (RBAC).</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">subscriptions</td>
                      <td className="p-3">id, company_id, plan (STARTER, PRO, etc.), price_aed_monthly, status</td>
                      <td className="p-3 text-slate-600">Controls active billing status, project quotas, and seat limits in AED.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">projects</td>
                      <td className="p-3">id, company_id, project_code, client_name, authority, due_date, status</td>
                      <td className="p-3 text-slate-600">Tenders &amp; enquiries. Competitor companies can never access other bids.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">estimate_panels</td>
                      <td className="p-3">id, project_id, panel_tag, panel_type, rated_current, form_factor, ip_rating</td>
                      <td className="p-3 text-slate-600">Physical switchboards (MDB, SMDB, DB, MCC, APFC) within a tender.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">estimate_items</td>
                      <td className="p-3">id, panel_id, component_id, quantity, unit_price, breaking_capacity</td>
                      <td className="p-3 text-slate-600">Feeder breakers (ACB, MCCB, MCB, contactor, meter) sizing rows.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">components</td>
                      <td className="p-3">id, manufacturer, part_number, description, rated_current, purchase_price</td>
                      <td className="p-3 text-slate-600">Master electrical components verified from ABB, Schneider, Siemens, Eaton, LS.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">boms</td>
                      <td className="p-3">id, project_id, item_code, quantity, unit_rate, total_amount</td>
                      <td className="p-3 text-slate-600">Consolidated procurement Bill of Materials aggregating all project panels.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">quotations</td>
                      <td className="p-3">id, project_id, direct_cost, overhead_cost, selling_price, vat_amount</td>
                      <td className="p-3 text-slate-600">Commercial client proposal bids with 5% UAE VAT breakdown.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">production_jobs</td>
                      <td className="p-3">id, project_id, job_number, current_stage, target_fat_date, is_completed</td>
                      <td className="p-3 text-slate-600">Workshop floor job cards tracking copper cutting, wiring, and FAT testing.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WORKFLOWS */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-blue-600" />
                  <span>End-to-End System &amp; User Engineering Workflow</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  How a switchgear tender moves from client inquiry to factory floor production:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Authentication &amp; Tenant Resolution</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Engineer logs in via Facebook-style gateway or Google Workspace. 
                      System attaches tenant context; new manufacturers are auto-provisioned with isolated database schema.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Tender Project Creation &amp; Utility Authority</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Estimation engineer creates tender (e.g. Dubai South 11kV Substation MDBs). 
                      Selects regional authority (DEWA, SEWA, ADDC, FEWA) to trigger mandatory fault level (50kA vs 65kA) and neutral sizing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Switchboard Feeder Configuration &amp; Sizing</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Estimator configures incomer (ACB 2500A 4P), bus coupler, and outgoing feeders (MCCB/MCB). 
                      Engine calculates copper busbar dimensions (e.g. 2 x 100x10mm copper flat bars per phase) and sheet metal enclosure sizes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">SLD CAD Studio &amp; 2D GA Facia Drawing</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Single Line Diagram is auto-generated with IEC standard symbols, ATS walking beam interlocks, and mimic bus. 
                      2D GA viewer arranges modular cubicles with door cutouts and digital meter panels.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Commercial Quotation &amp; 5% UAE VAT Proposal</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Costing engine applies direct material + copper rate + enclosure fabrication + assembly labour + overheads + target margin + 5% UAE VAT. 
                      One-click export of formal client proposal with technical specifications.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    6
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Production Handover &amp; Workshop Job Cards</h5>
                    <p className="text-xs text-slate-600 mt-1">
                      Upon contract award, approved BOM transfers to workshop floor: Copper Cutting &amp; Bending, Fabrication, Component Assembly, Wiring, and Factory Acceptance Testing (FAT).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COSTING FORMULAS */}
          {activeTab === 'costing_math' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-base text-cyan-400 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span>Mathematical Estimation &amp; Sizing Formulas</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Every calculation performed in SwitchgearOS is completely deterministic and verified against IEC 61439 standards:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-900 font-mono mb-2">1. Copper Busbar Sizing &amp; Weight</div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                    <div>Area (mm²) = Rated Current (A) / Current Density</div>
                    <div>Density: 1.5 A/mm² (Form 4b) | 2.0 A/mm² (Form 2b)</div>
                    <div>Cu Weight (kg) = Total Length × Cross Section × 0.0089</div>
                    <div>Cu Cost = Weight (kg) × Cu Market Rate (AED/kg)</div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-900 font-mono mb-2">2. Enclosure Sheet Metal Cost</div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                    <div>Volume = Height × Width × Depth (mm)</div>
                    <div>Form Factor Multiplier: Form 2b = 1.0 | Form 4b = 1.4</div>
                    <div>IP Rating Multiplier: IP42 = 1.0 | IP54 = 1.15 | IP65 = 1.3</div>
                    <div>Enclosure Cost = Base Cost × Form Multiplier × IP Multiplier</div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-900 font-mono mb-2">3. Activity-Based Labour Sizing</div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                    <div>Total Hours = Cu Fabrication + Assembly + Wiring + FAT</div>
                    <div>Labour Rate = Standard Rate (AED 45 - 65 / hr)</div>
                    <div>Labour Cost = Total Hours × Hourly Rate</div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-900 font-mono mb-2">4. Commercial Markups &amp; UAE VAT</div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                    <div>Internal Cost = Direct Mat + Cu + Enclosure + Labour</div>
                    <div>Cost with Overheads = Internal Cost × (1 + Overhead %)</div>
                    <div>Selling Price (Markup) = Cost with Overheads × (1 + Margin %)</div>
                    <div>Selling Price (Margin) = Cost with Overheads / (1 - Margin %)</div>
                    <div>Final Tender Price = Selling Price × 1.05 (5% UAE VAT)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BILLING & PAYOUTS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>SaaS Subscription Pricing &amp; Bank Settlement Architecture</span>
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  How client switchgear companies subscribe, pay in AED, and how funds settle directly into your UAE Corporate Bank Account:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                <div className="p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="text-xs font-bold text-slate-500 font-mono uppercase">Starter</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">AED 299<span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-[11px] text-slate-500 mt-2">2 Users • 10 Projects</div>
                </div>

                <div className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50/40 relative shadow-sm">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Most Popular</span>
                  <div className="text-xs font-bold text-blue-700 font-mono uppercase">Professional</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">AED 499<span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-[11px] text-slate-500 mt-2">5 Users • 50 Projects</div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="text-xs font-bold text-slate-500 font-mono uppercase">Advanced</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">AED 999<span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-[11px] text-slate-500 mt-2">15 Users • 150 Projects</div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="text-xs font-bold text-slate-500 font-mono uppercase">Business</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">AED 1,999<span className="text-xs font-normal text-slate-500">/mo</span></div>
                  <div className="text-[11px] text-slate-500 mt-2">50 Users • Unlimited</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
                <h5 className="font-bold text-slate-900 text-xs">Direct Payouts to Your UAE Corporate Bank Account:</h5>
                <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                  <p>
                    <strong>Channel A: Online Corporate Card (Stripe UAE / Checkout.com)</strong><br />
                    When an engineering firm pays AED 499 + 5% VAT (AED 523.95), the gateway collects payment and executes an automated 
                    <strong> 2-business-day rolling deposit</strong> into your linked UAE corporate IBAN (Emirates NBD, First Abu Dhabi Bank, ADCB, or Wio).
                  </p>
                  <p>
                    <strong>Channel B: UAE Corporate Bank Transfer (EFT) or Cheque (PDC)</strong><br />
                    The platform auto-generates a Proforma Tax Invoice displaying your company name, 15-digit FTA TRN, and IBAN/SWIFT. 
                    Once confirmed, your admin switches their account status to ACTIVE in Cloud SQL.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with One-Click PDF Download */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Complete Architecture Specification • Includes Full PostgreSQL Schema &amp; Costing Math</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'PDF Downloaded!' : 'Download Complete PDF Document'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
