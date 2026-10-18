import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  HelpCircle, 
  Database, 
  Lock, 
  Check, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { 
  authApprovalService, 
  RegisteredClientCompany, 
  AppUserProfile, 
  UserRole, 
  ApprovalStatus,
  PLAN_LIMITS
} from '../../services/authApprovalService';
import { SaaSPlan } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

interface ClientCompaniesAndApprovalsViewProps {
  onNavigateToBureau?: () => void;
  onNavigateToProjects?: () => void;
  onClientDataUpdated?: () => void;
}

export const ClientCompaniesAndApprovalsView: React.FC<ClientCompaniesAndApprovalsViewProps> = ({
  onNavigateToBureau,
  onNavigateToProjects,
  onClientDataUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'approvals' | 'guide'>('companies');
  const [companies, setCompanies] = useState<RegisteredClientCompany[]>(() => authApprovalService.getClientCompanies());
  const [users, setUsers] = useState<AppUserProfile[]>(() => authApprovalService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApprovalStatus>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<RegisteredClientCompany | null>(null);
  const [customQuotaInput, setCustomQuotaInput] = useState<number>(50);
  const [selectedPlanInput, setSelectedPlanInput] = useState<SaaSPlan>('PROFESSIONAL');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showHowToGuide, setShowHowToGuide] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [passwordEditUid, setPasswordEditUid] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // New Company Form State
  const [newCompanyForm, setNewCompanyForm] = useState({
    companyName: '',
    tradeLicenseNo: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    contactPerson: '',
    email: '',
    phone: '',
    vatTrn: '',
    targetAuthority: 'DEWA / SEWA',
    plan: 'STARTER' as SaaSPlan,
    initialPassword: 'Client@2026',
  });

  const refreshData = () => {
    setCompanies(authApprovalService.getClientCompanies());
    setUsers(authApprovalService.getUsers());
    if (onClientDataUpdated) onClientDataUpdated();
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Metrics
  const totalCompaniesCount = companies.length;
  const approvedCompaniesCount = companies.filter(c => c.status === 'APPROVED').length;
  const pendingCompaniesCount = companies.filter(c => c.status === 'PENDING' || !!c.requestedPlan).length;
  const totalPipelineValue = companies.reduce((acc, c) => acc + (c.totalPipelineValueAed || 0), 0);

  const pendingUsersCount = users.filter(u => !u.approved).length;
  const approvedUsersCount = users.filter(u => u.approved).length;

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesSearch = 
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tradeLicenseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [companies, statusFilter, searchQuery]);

  // Handlers for Company Approval
  const handleApproveCompany = (companyId: string) => {
    const updated = authApprovalService.approveCompany(companyId, 'Admin');
    if (updated) {
      refreshData();
      showNotification(`Company "${updated.companyName}" & associated users approved!`);
    }
  };

  const handleApprovePlanUpgrade = (company: RegisteredClientCompany) => {
    if (!company.requestedPlan) return;
    const updated = authApprovalService.updateCompanyPlanAndQuota(company.id, company.requestedPlan);
    if (updated) {
      refreshData();
      showNotification(`Verified payment (${company.paymentReference}) & upgraded "${updated.companyName}" to ${updated.plan} (${updated.maxProjects} projects)!`);
    }
  };

  const handleSaveCompanyPlanAndQuota = () => {
    if (!selectedCompany) return;
    const updated = authApprovalService.updateCompanyPlanAndQuota(
      selectedCompany.id,
      selectedPlanInput,
      customQuotaInput
    );
    if (updated) {
      setSelectedCompany(updated);
      refreshData();
      showNotification(`Updated "${updated.companyName}" to ${updated.plan} plan with ${updated.maxProjects} max projects quota.`);
    }
  };

  const handleRejectCompany = (companyId: string) => {
    const updated = authApprovalService.rejectCompany(companyId, 'Documentation verification required');
    if (updated) {
      refreshData();
      showNotification(`Company "${updated.companyName}" status set to REJECTED.`);
    }
  };

  // Handlers for User Approval
  const handleApproveUser = (uid: string, role?: UserRole) => {
    const updated = authApprovalService.approveUser(uid, role, 'Chief Admin');
    if (updated) {
      refreshData();
      showNotification(`User "${updated.fullName}" (${updated.email}) approved with role ${updated.role}!`);
    }
  };

  const handleRejectUser = (uid: string) => {
    const updated = authApprovalService.rejectUser(uid);
    if (updated) {
      refreshData();
      showNotification(`User "${updated.email}" approval revoked.`);
    }
  };

  const handleRoleChange = (uid: string, newRole: UserRole) => {
    const updated = authApprovalService.updateUserRole(uid, newRole);
    if (updated) {
      refreshData();
      showNotification(`User role updated to ${newRole}`);
    }
  };

  const handleSaveUserPassword = (uid: string) => {
    if (!newPasswordInput.trim()) return;
    const updated = authApprovalService.updateUserPassword(uid, newPasswordInput.trim());
    if (updated) {
      setPasswordEditUid(null);
      setNewPasswordInput('');
      refreshData();
      showNotification(`Password updated for ${updated.email}`);
    }
  };

  // Register company submit
  const handleRegisterCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyForm.companyName || !newCompanyForm.email) {
      alert('Company Name and Email are required.');
      return;
    }

    const created = authApprovalService.registerCompany(newCompanyForm);
    // Also approve & create login user credentials so the client can sign in immediately
    authApprovalService.approveCompany(created.id, 'Admin');
    const createdUser = authApprovalService.registerUserSignup(
      newCompanyForm.email,
      newCompanyForm.contactPerson || newCompanyForm.companyName,
      newCompanyForm.companyName,
      'COMPANY_OWNER',
      newCompanyForm.initialPassword || 'Client@2026',
      created.companyCode
    );
    authApprovalService.approveUser(createdUser.uid, 'COMPANY_OWNER', 'Admin');

    setShowRegisterModal(false);
    refreshData();
    showNotification(
      `Client "${created.companyName}" (${created.companyCode}) created & approved! Login: ${newCompanyForm.email} / ${newCompanyForm.initialPassword}`
    );
    
    // Reset form
    setNewCompanyForm({
      companyName: '',
      tradeLicenseNo: '',
      country: 'United Arab Emirates',
      city: 'Dubai',
      contactPerson: '',
      email: '',
      phone: '',
      vatTrn: '',
      targetAuthority: 'DEWA / SEWA',
      plan: 'STARTER',
      initialPassword: 'Client@2026',
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900/90 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500/40 flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                <Building2 className="w-6 h-6 text-cyan-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    Client Companies & User Login Approvals
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Firestore Backend Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify how many clients are registered, manage login access rights, and approve or reject client accounts.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-cyan-700 hover:bg-cyan-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Client Company</span>
            </button>
            <button
              onClick={refreshData}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Answer Banner: "Where to check and How to check" */}
        <div className="mt-4 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-lg p-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-cyan-100 flex items-center gap-2">
                  Where to Check & How to Check Client Count
                  <span className="text-[10px] font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 px-2 py-0.2 rounded">Quick Guide</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  <strong className="text-white">Where to check:</strong> You can check right here in this <span className="underline decoration-cyan-400">Client Companies & Approvals</span> register, in the top header client counter pill, and under the <span className="underline decoration-cyan-400">Bidding Bureau</span> &gt; Contractor Clients tab.
                  <br />
                  <strong className="text-white">How to check:</strong> Look at the KPI cards below showing <span className="text-emerald-400 font-bold">{totalCompaniesCount} Total Registered Client Companies</span> ({approvedCompaniesCount} approved &amp; verified, {pendingCompaniesCount} pending review). You can search by Trade License, TRN, or Authority.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHowToGuide(!showHowToGuide)}
              className="text-xs text-cyan-300 hover:text-white shrink-0 flex items-center gap-1 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded transition cursor-pointer"
            >
              <span>{showHowToGuide ? 'Hide Full Architecture Guide' : 'Explain Backend & Approvals'}</span>
              {showHowToGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Explainer Box */}
          {showHowToGuide && (
            <div className="mt-4 pt-4 border-t border-cyan-800/40 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700/60">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  1. Backend Firestore Storage
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Data is persisted in Google Cloud Firestore in project <span className="font-mono text-cyan-200">{firebaseConfig.projectId}</span>. 
                  Company registrations live at <code className="text-amber-300">/companyRegistrations/{`{id}`}</code> and user accounts live at <code className="text-amber-300">/users/{`{uid}`}</code>.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded border border-slate-700/60">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  2. Admin Approval Security Flow
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  When a client company or user signs up, their profile has <code className="text-amber-300">approved: false</code>. Security rules restrict them from unverified access until an Administrator clicks <span className="text-emerald-400 font-bold">Approve</span>.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded border border-slate-700/60">
                <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  3. Multi-Role Authorization
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Admins can assign roles: <strong className="text-white">ADMIN</strong> (full approval powers), <strong className="text-white">CLIENT</strong> (submit tenders &amp; view ready pricing), or <strong className="text-white">ESTIMATION_ENGINEER</strong> (size panels &amp; calculate BOM).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Total Client Companies</span>
              <Building2 className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {totalCompaniesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Registered contractor firms
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
              <span>Approved & Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              {approvedCompaniesCount}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Full access to pricing & RFQs
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
              <span>Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
              {pendingCompaniesCount + pendingUsersCount}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {pendingCompaniesCount} companies, {pendingUsersCount} users
            </div>
          </div>

          <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-lg">
            <div className="text-[11px] font-semibold text-cyan-800 uppercase tracking-wider flex items-center justify-between">
              <span>Total Bidding Pipeline</span>
              <Sparkles className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-xl font-black text-cyan-800 mt-1 font-mono">
              AED {(totalPipelineValue / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-cyan-700 mt-0.5">
              Across active client projects
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mt-6 gap-2">
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'companies'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Registered Client Companies ({companies.length})</span>
            {pendingCompaniesCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {pendingCompaniesCount} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'approvals'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>User Login Approvals ({users.length})</span>
            {pendingUsersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                {pendingUsersCount} action needed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'guide'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Backend Data & Check Explanation</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REGISTERED CLIENT COMPANIES */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by company, license, TRN, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <div className="flex gap-1">
                {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      statusFilter === status
                        ? 'bg-cyan-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map(company => {
              const maxQuota = company.maxProjects || PLAN_LIMITS[company.plan || 'TRIAL']?.maxProjects || 2;
              const usedProjects = company.associatedProjectsCount || 0;
              return (
              <div 
                key={company.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {company.companyCode}
                        </span>
                        <span className="font-mono text-[10px] text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {company.plan || 'TRIAL'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                        {company.companyName}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{company.city}, {company.country}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                      company.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : company.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {company.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                      {company.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {company.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {company.status}
                    </span>
                  </div>

                  {/* Pending Plan Upgrade Banner */}
                  {company.requestedPlan && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-[11px] space-y-1.5">
                      <div className="font-bold text-amber-900 flex items-center justify-between">
                        <span>⚡ Upgrade Requested: {company.requestedPlan}</span>
                      </div>
                      <div className="font-mono text-[10px] text-amber-800">
                        Payment Ref: <strong>{company.paymentReference || 'Submitted'}</strong>
                      </div>
                      <button
                        onClick={() => handleApprovePlanUpgrade(company)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify Payment & Activate {company.requestedPlan}</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Trade License:</span>
                      <span className="font-mono font-medium text-slate-800">{company.tradeLicenseNo}</span>
                    </div>
                    {company.vatTrn && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">UAE TRN:</span>
                        <span className="font-mono font-medium text-slate-800">{company.vatTrn}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Contact Person:</span>
                      <span className="font-medium text-slate-800">{company.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Estimation Quota:</span>
                      <span className={`font-mono font-bold text-[11px] ${
                        usedProjects >= maxQuota ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {usedProjects} / {maxQuota} Projects
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[130px]">{company.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{company.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px]">
                    <span className="text-slate-400">Pipeline: </span>
                    <span className="font-bold font-mono text-slate-800">
                      AED {((company.totalPipelineValueAed || 0) / 1000).toFixed(1)}k
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {company.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleApproveCompany(company.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectCompany(company.id)}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setSelectedPlanInput(company.plan || 'TRIAL');
                          setCustomQuotaInput(company.maxProjects || PLAN_LIMITS[company.plan || 'TRIAL']?.maxProjects || 2);
                        }}
                        className="text-cyan-700 hover:text-cyan-900 text-xs font-bold flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded transition cursor-pointer"
                      >
                        <span>Manage Plan & Quota</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No client companies found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new client company.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER LOGIN APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-700" />
                <span>User Login Credentials & Approval Queue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage customer login credentials, passwords, roles, and account approval status.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Pending:</span>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                {pendingUsersCount} Users
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">User & Login Email</th>
                  <th className="py-2.5 px-3">Associated Client Company</th>
                  <th className="py-2.5 px-3">Login Password</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Approval Status</th>
                  <th className="py-2.5 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.uid} className={`hover:bg-slate-50/80 transition ${!u.approved ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{u.companyName || 'Independent / Not Linked'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.companyId || 'No ID'}</div>
                    </td>
                    <td className="py-3 px-3">
                      {passwordEditUid === u.uid ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="New password"
                            className="w-28 px-2 py-1 border border-slate-300 rounded text-[11px] font-mono"
                          />
                          <button
                            onClick={() => handleSaveUserPassword(u.uid)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setPasswordEditUid(null)}
                            className="px-1.5 py-1 text-slate-500 text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                            {u.password || 'Client@2026'}
                          </code>
                          <button
                            onClick={() => {
                              setPasswordEditUid(u.uid);
                              setNewPasswordInput(u.password || 'Client@2026');
                            }}
                            className="text-[10px] text-cyan-700 hover:underline font-semibold cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="ADMIN">ADMIN (Full Control)</option>
                        <option value="CLIENT">CLIENT (Tender Portal)</option>
                        <option value="ESTIMATION_ENGINEER">ESTIMATION_ENGINEER</option>
                        <option value="COMPANY_OWNER">COMPANY_OWNER</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.approved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      }`}>
                        {u.approved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {u.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!u.approved ? (
                          <>
                            <button
                              onClick={() => handleApproveUser(u.uid)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve Login</span>
                            </button>
                            <button
                              onClick={() => handleRejectUser(u.uid)}
                              className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer"
                              title="Reject Signup"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRejectUser(u.uid)}
                            className="text-amber-700 hover:text-amber-900 text-xs font-medium hover:bg-amber-50 px-2 py-1 rounded transition cursor-pointer"
                            title="Revoke Approval"
                          >
                            Revoke Access
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BACKEND ARCHITECTURE & EXPLANATION */}
      {activeTab === 'guide' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-700" />
              <span>Backend Architecture & How to Check Client Data</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive explanation of how client registrations, user permissions, and Firestore cloud synchronization operate in this system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Where to Check Client Data
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
                  <li>
                    <strong className="text-slate-800">Primary Hub:</strong> In the navigation menu under <span className="font-semibold text-cyan-800">"Client Companies &amp; Approvals"</span> (this view).
                  </li>
                  <li>
                    <strong className="text-slate-800">Header Counter:</strong> Look at the top bar right beside the user badge for the live <span className="font-mono bg-cyan-100 text-cyan-800 px-1 rounded">👥 {totalCompaniesCount} Clients</span> indicator.
                  </li>
                  <li>
                    <strong className="text-slate-800">Bidding Bureau Portal:</strong> Model A Outsourced Bidding Bureau includes a dedicated <span className="font-semibold text-cyan-800">Contractor Clients &amp; OEM Multipliers</span> tab where you can associate client discounts.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                  How to Check Client Data
                </h3>
                <ol className="space-y-2 text-xs text-slate-600 list-decimal pl-4">
                  <li>
                    Review the <strong className="text-slate-800">Total Client Companies</strong> metric at the top of the dashboard.
                  </li>
                  <li>
                    Check the breakdown: <strong className="text-emerald-700">{approvedCompaniesCount} Approved</strong> vs. <strong className="text-amber-700">{pendingCompaniesCount} Pending Approval</strong>.
                  </li>
                  <li>
                    Filter by status using the status pills (ALL, APPROVED, PENDING, REJECTED).
                  </li>
                  <li>
                    Search for specific contractors by Trade License number (e.g. <code className="bg-slate-200 px-1 rounded">DXB-TL-482910</code>), UAE VAT TRN, or Authority (DEWA, SEWA, ADDC).
                  </li>
                </ol>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-700 text-white text-xs flex items-center justify-center font-bold">3</span>
                  How Backend Data & Approvals Work
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  The backend utilizes a secure Zero-Trust architecture backed by Firestore Cloud Database:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[11px] space-y-1.5 overflow-x-auto">
                  <div className="text-cyan-400">// Firestore Collections:</div>
                  <div>1. /users/{'{uid}'} {'->'} {'{ email, role, approved: bool, companyId }'}</div>
                  <div>2. /companyRegistrations/{'{id}'} {'->'} {'{ companyName, tradeLicense, status }'}</div>
                </div>
                <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Pending State:</strong> New users start with <code className="text-amber-700 bg-amber-50 px-1 rounded">approved: false</code>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Admin Verification:</strong> Only authenticated Admins can toggle approval and assign roles.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Instant Activation:</strong> Once approved, the client can log in, view ready final prices on fixed assemblies, and submit project inquiries.</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/80 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Live Provisioned Firebase Backend
                </h3>
                <p className="text-xs text-emerald-800">
                  Project ID: <span className="font-mono font-bold">{firebaseConfig.projectId}</span>
                  <br />
                  Database ID: <span className="font-mono font-bold">{firebaseConfig.firestoreDatabaseId || '(default)'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW COMPANY MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-scale-in">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-700" />
                <h3 className="font-bold text-slate-900 text-base">Register Client Company</h3>
              </div>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterCompanySubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Contractor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Ghandi Switchgear LLC"
                  value={newCompanyForm.companyName}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trade License No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DXB-TL-482910"
                    value={newCompanyForm.tradeLicenseNo}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, tradeLicenseNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UAE VAT TRN (Optional)</label>
                  <input
                    type="text"
                    placeholder="15-digit TRN"
                    value={newCompanyForm.vatTrn}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, vatTrn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eng. Tariq Mansoor"
                    value={newCompanyForm.contactPerson}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@company.ae"
                    value={newCompanyForm.email}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+971 4 231 8800"
                    value={newCompanyForm.phone}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City & Emirate</label>
                  <input
                    type="text"
                    value={newCompanyForm.city}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subscription Plan</label>
                  <select
                    value={newCompanyForm.plan}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, plan: e.target.value as SaaSPlan })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  >
                    <option value="TRIAL">TRIAL (2 Projects)</option>
                    <option value="STARTER">STARTER (10 Projects)</option>
                    <option value="PROFESSIONAL">PROFESSIONAL (50 Projects)</option>
                    <option value="ADVANCED">ADVANCED (200 Projects)</option>
                    <option value="BUSINESS">BUSINESS (1000 Projects)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Login Password *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyForm.initialPassword}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, initialPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                >
                  Create & Approve Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPANY DOSSIER & QUOTA MANAGEMENT MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-scale-in">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-700" />
                <h3 className="font-bold text-slate-900 text-base">{selectedCompany.companyName}</h3>
              </div>
              <button 
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px]">Client Code:</span>
                  <div className="font-mono font-bold text-slate-800 text-sm">{selectedCompany.companyCode}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Status:</span>
                  <div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                      {selectedCompany.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Plan & Estimation Quota Controls */}
              <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-3">
                <div className="font-bold text-cyan-950 text-xs flex items-center justify-between">
                  <span>Subscription Plan & Estimation Quota Control</span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-cyan-200 text-cyan-800">
                    Used: {selectedCompany.associatedProjectsCount || 0} Projects
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Active Plan Tier</label>
                    <select
                      value={selectedPlanInput}
                      onChange={(e) => {
                        const newPlan = e.target.value as SaaSPlan;
                        setSelectedPlanInput(newPlan);
                        setCustomQuotaInput(PLAN_LIMITS[newPlan]?.maxProjects || 10);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    >
                      <option value="TRIAL">TRIAL (2 Projects)</option>
                      <option value="STARTER">STARTER (10 Projects)</option>
                      <option value="PROFESSIONAL">PROFESSIONAL (50 Projects)</option>
                      <option value="ADVANCED">ADVANCED (200 Projects)</option>
                      <option value="BUSINESS">BUSINESS (1000 Projects)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Max Estimations Quota</label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={customQuotaInput}
                      onChange={(e) => setCustomQuotaInput(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCompanyPlanAndQuota}
                  className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  Save Plan & Quota Allocation
                </button>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Trade License:</span>
                  <span className="font-mono font-semibold">{selectedCompany.tradeLicenseNo}</span>
                </div>
                {selectedCompany.vatTrn && (
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">VAT TRN:</span>
                    <span className="font-mono font-semibold">{selectedCompany.vatTrn}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Contact Person:</span>
                  <span className="font-medium">{selectedCompany.contactPerson}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Login Email:</span>
                  <span className="font-mono">{selectedCompany.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono">{selectedCompany.phone}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Total Pipeline:</span>
                  <span className="font-mono font-bold text-emerald-700">AED {(selectedCompany.totalPipelineValueAed || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
