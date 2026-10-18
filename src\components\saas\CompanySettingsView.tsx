// ============================================================================
// COMPANY & TENANT SETTINGS VIEW
// Trade License, UAE VAT TRN, Costing Rules (Markup vs Margin), RBAC & Currencies
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Calculator, 
  CheckCircle2, 
  FileText, 
  Globe, 
  Lock,
  UserPlus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { CompanyTenant, SaaSUser, SaaSRole } from '../../types';

interface CompanySettingsViewProps {
  company: CompanyTenant;
  currentUserRole?: SaaSRole;
  usersList?: SaaSUser[];
  onSaveCompany: (updated: Partial<CompanyTenant>) => Promise<void>;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  company,
  currentUserRole = 'COMPANY_OWNER',
  usersList = [],
  onSaveCompany,
}) => {
  const [formData, setFormData] = useState<CompanyTenant>({ ...company });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setFormData({ ...company });
  }, [company]);

  const [teamMembers, setTeamMembers] = useState<SaaSUser[]>(
    usersList.length > 0 ? usersList : [
      {
        id: 1,
        uid: 'user-owner-1',
        companyId: company.id,
        email: company.email || 'ceo@emiratesswitchgear.ae',
        fullName: 'Eng. Ahmed Al-Mansoor',
        role: 'COMPANY_OWNER',
        phone: '+971 50 123 4567',
        isActive: true,
      },
      {
        id: 2,
        uid: 'user-est-1',
        companyId: company.id,
        email: 'estimation.lead@emiratesswitchgear.ae',
        fullName: 'Suresh Narayanan',
        role: 'ESTIMATION_ENGINEER',
        phone: '+971 55 987 6543',
        isActive: true,
      },
      {
        id: 3,
        uid: 'user-des-1',
        companyId: company.id,
        email: 'design.lead@emiratesswitchgear.ae',
        fullName: 'Fahad Bin Khalid',
        role: 'DESIGN_ENGINEER',
        phone: '+971 52 456 7890',
        isActive: true,
      },
      {
        id: 4,
        uid: 'user-pur-1',
        companyId: company.id,
        email: 'purchase@emiratesswitchgear.ae',
        fullName: 'Mohammed Tariq',
        role: 'PURCHASE_OFFICER',
        phone: '+971 56 321 0987',
        isActive: true,
      },
      {
        id: 5,
        uid: 'user-prod-1',
        companyId: company.id,
        email: 'workshop@emiratesswitchgear.ae',
        fullName: 'Rajesh Pillai',
        role: 'PRODUCTION_USER',
        phone: '+971 54 876 5432',
        isActive: true,
      },
    ]
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'costing' | 'team'>('profile');

  // Invite Engineer Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<SaaSRole>('ESTIMATION_ENGINEER');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Plan limits
  const planSeatLimits: Record<string, number> = {
    STARTER: 2,
    PROFESSIONAL: 5,
    ADVANCED: 15,
    BUSINESS: 50,
  };

  const maxSeats = planSeatLimits[company.plan] || 5;
  const isSeatLimitReached = teamMembers.length >= maxSeats;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSeatLimitReached) {
      setInviteError(`Seat limit reached (${teamMembers.length}/${maxSeats}) for ${company.plan} plan. Please upgrade plan to add more users.`);
      return;
    }
    if (!inviteFullName.trim() || !inviteEmail.trim()) {
      setInviteError('Full name and corporate email are required.');
      return;
    }

    const newUser: SaaSUser = {
      id: Date.now(),
      uid: `usr-${Date.now()}`,
      companyId: company.id,
      email: inviteEmail.trim(),
      fullName: inviteFullName.trim(),
      role: inviteRole,
      phone: invitePhone.trim() || undefined,
      isActive: true,
    };

    setTeamMembers([...teamMembers, newUser]);
    setIsInviteModalOpen(false);
    setInviteFullName('');
    setInviteEmail('');
    setInvitePhone('');
    setInviteRole('ESTIMATION_ENGINEER');
    setInviteError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveCompany(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
              Tenant Administration & Legal Settings
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              STRICT TENANT ISOLATION ACTIVE
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Tenant ID: <strong className="text-slate-900">{company.companyCode}</strong>
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            {formData.companyName} — Corporate Profile & Costing Engine Rules
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Configure UAE corporate trade license, TRN tax number, default estimation margin models, and engineering team permissions.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Company Profile & TRN
          </button>
          <button
            onClick={() => setActiveTab('costing')}
            className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
              activeTab === 'costing' ? 'bg-white text-cyan-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Costing & Margin Rules
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
              activeTab === 'team' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Members ({teamMembers.length})
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Company profile and costing engine configuration saved successfully to Cloud SQL!</span>
        </div>
      )}

      {/* FORM TAB 1: Profile & TRN */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-600" />
              Corporate Identity & Legal Entity
            </span>
            <span className="text-[10px] text-slate-400">All fields appear on customer quotations and official submittals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Company Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Company Code / Tenant Identifier</label>
              <input
                type="text"
                value={formData.companyCode}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">UAE Trade License Number</label>
              <input
                type="text"
                value={formData.tradeLicenseNo || ''}
                placeholder="e.g. CN-1029384"
                onChange={(e) => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                UAE Tax Registration Number (VAT TRN - 15 Digits)
              </label>
              <input
                type="text"
                maxLength={15}
                value={formData.vatTrn || ''}
                placeholder="100234567800003"
                onChange={(e) => setFormData({ ...formData, vatTrn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono tracking-wider"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Compliant with UAE Federal Tax Authority (FTA)</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">City / Emirate</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Doha">Doha (Qatar)</option>
                <option value="Riyadh">Riyadh (KSA)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Physical Factory Address</label>
              <input
                type="text"
                value={formData.address || ''}
                placeholder="Plot 598-123, Street 18, Al Quoz Industrial Area 4, Dubai, UAE"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Official Switchgear Telephone</label>
              <input
                type="text"
                value={formData.phone || ''}
                placeholder="+971 4 345 6789"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Official Tendering Email</label>
              <input
                type="email"
                value={formData.email || ''}
                placeholder="tendering@emiratesswitchgear.ae"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Corporate Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* FORM TAB 2: Costing & Margin Rules */}
      {activeTab === 'costing' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Automated Costing Engine & Commercial Formulas
            </span>
            <span className="text-[10px] text-slate-400">Enforces mathematical rigor across all estimator users</span>
          </div>

          {/* Pricing Formula Explanation & Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setFormData({ ...formData, defaultCostingMethod: 'MARKUP' })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                formData.defaultCostingMethod === 'MARKUP'
                  ? 'border-cyan-600 bg-cyan-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Method A: Cost Markup Method</span>
                {formData.defaultCostingMethod === 'MARKUP' && (
                  <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded font-bold">DEFAULT ACTIVE</span>
                )}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 my-2 font-mono text-[11px] text-cyan-900">
                Selling Price = Total Cost × (1 + Markup %)
              </div>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Applies a direct percentage addition on top of verified manufacturing cost. E.g., at 15% markup, 100,000 AED cost yields 115,000 AED selling price.
              </p>
            </div>

            <div
              onClick={() => setFormData({ ...formData, defaultCostingMethod: 'MARGIN' })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                formData.defaultCostingMethod === 'MARGIN'
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Method B: Gross Margin Method</span>
                {formData.defaultCostingMethod === 'MARGIN' && (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">DEFAULT ACTIVE</span>
                )}
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 my-2 font-mono text-[11px] text-emerald-900">
                Selling Price = Total Cost ÷ (1 − Gross Margin %)
              </div>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Guarantees exact retained gross margin on revenue. E.g., at 15% gross margin, 100,000 AED cost yields 117,647 AED selling price.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Default Target Profit Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="99"
                  value={formData.defaultMarginPercent}
                  onChange={(e) => setFormData({ ...formData, defaultMarginPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono font-bold"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Default VAT Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={formData.defaultVatPercent}
                  onChange={(e) => setFormData({ ...formData, defaultVatPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono font-bold"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">5.00% for UAE & KSA, 0% for Freezone Exports</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Primary Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold"
              >
                <option value="AED">AED — United Arab Emirates Dirham</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="QAR">QAR — Qatari Riyal</option>
                <option value="OMR">OMR — Omani Rial</option>
                <option value="KWD">KWD — Kuwaiti Dinar</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Costing Rules'}</span>
            </button>
          </div>
        </form>
      )}

      {/* FORM TAB 3: Team Members & RBAC */}
      {activeTab === 'team' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Team Members & Role-Based Permissions (RBAC)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isSeatLimitReached
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  Seats: {teamMembers.length} / {maxSeats} ({company.plan} Plan)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                The Company Owner controls engineering access. Confidential pricing and profit markups are isolated by permission.
              </p>
            </div>
            <button
              onClick={() => {
                setInviteError(null);
                setIsInviteModalOpen(true);
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-2xs self-start md:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Engineer</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                  <th className="p-3">User / Engineer</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role & Permissions</th>
                  <th className="p-3">Direct Phone</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {teamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-[10px]">
                        {m.fullName.charAt(0)}
                      </div>
                      <span>{m.fullName}</span>
                    </td>
                    <td className="p-3 text-slate-600">{m.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.role === 'COMPANY_OWNER'
                          ? 'bg-amber-100 text-amber-900'
                          : m.role === 'ESTIMATION_ENGINEER'
                          ? 'bg-cyan-100 text-cyan-900'
                          : m.role === 'DESIGN_ENGINEER'
                          ? 'bg-purple-100 text-purple-900'
                          : m.role === 'PURCHASE_OFFICER'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {m.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{m.phone || '—'}</td>
                    <td className="p-3 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {m.role !== 'COMPANY_OWNER' && (
                        <button
                          onClick={() => setTeamMembers(teamMembers.filter(x => x.id !== m.id))}
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITE ENGINEER & RBAC MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  <span>Invite Engineer / Staff Member</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Assign switchgear responsibilities & role-based permissions
                </p>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {isSeatLimitReached ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Active Subscription Seat Quota Reached</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Your company has used all <strong>{maxSeats} user seats</strong> permitted under the <strong>{company.plan} Plan</strong>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      alert('Redirecting to Subscription Plans tab to upgrade seats.');
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-2xs font-mono"
                  >
                    Upgrade Plan for More Seats
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-3 font-sans">
                {inviteError && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-[11px]">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Engineer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eng. Vikram Patel"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="v.patel@emiratesswitchgear.ae"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Direct Telephone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Role-Based Access Control (RBAC) *</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as SaaSRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="ESTIMATION_ENGINEER">ESTIMATION_ENGINEER — Panel sizing, breakers & quotation preparation</option>
                    <option value="DESIGN_ENGINEER">DESIGN_ENGINEER — SLD studio, ATS schemes & 2D layout drawings</option>
                    <option value="PURCHASE_OFFICER">PURCHASE_OFFICER — Supplier prices, purchase requisitions & shortages</option>
                    <option value="PRODUCTION_USER">PRODUCTION_USER — Workshop job cards, fabrication, wiring & FAT</option>
                    <option value="READ_ONLY">READ_ONLY — View-only access & quotation download</option>
                    <option value="COMPANY_OWNER">COMPANY_OWNER — Full administrative, billing & costing formulas</option>
                  </select>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 font-sans leading-relaxed">
                  <strong>Seat Status:</strong> After this invitation, your company will use <strong>{teamMembers.length + 1} of {maxSeats} seats</strong> on the {company.plan} tier.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 font-mono">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition shadow-2xs"
                  >
                    Send Invitation & Create User
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
