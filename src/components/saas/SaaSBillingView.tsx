// ============================================================================
// SAAS BILLING & SUBSCRIPTION MANAGEMENT VIEW
// Pricing in AED, Tenant Limits, Feature Matrix, Real Payment Settings & Checkout
// ============================================================================

import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Users, 
  FolderGit2, 
  FileSpreadsheet, 
  Receipt, 
  HelpCircle,
  AlertCircle,
  Printer,
  Download,
  Landmark,
  ArrowDownRight,
  Settings,
  ExternalLink,
  Clock,
  Lock
} from 'lucide-react';
import { SaaSPlan, CompanyTenant, SaaSSubscription, UserProfile } from '../../types';
import { authApprovalService, PLAN_LIMITS, PlatformPaymentSettings } from '../../services/authApprovalService';

interface SaaSBillingViewProps {
  company: CompanyTenant;
  subscription: SaaSSubscription | null;
  currentUser?: UserProfile;
  projectsCount?: number;
  onUpgradePlan: (newPlan: SaaSPlan, billingCycle: 'MONTHLY' | 'ANNUAL', paymentRef?: string, instantActivate?: boolean) => Promise<void>;
}

export const SaaSBillingView: React.FC<SaaSBillingViewProps> = ({
  company,
  subscription,
  currentUser,
  projectsCount = 0,
  onUpgradePlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<SaaSPlan>(company.plan || 'TRIAL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Platform Owner Payment & Bank Settings
  const [paymentSettings, setPaymentSettings] = useState<PlatformPaymentSettings>(() =>
    authApprovalService.getPaymentSettings()
  );
  const [showAdminSettingsModal, setShowAdminSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState<PlatformPaymentSettings>(() =>
    authApprovalService.getPaymentSettings()
  );

  // Payment Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [planToCheckout, setPlanToCheckout] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [taxInvoiceModalOpen, setTaxInvoiceModalOpen] = useState(false);

  const isPlatformAdmin = currentUser?.role === 'ADMIN' || currentUser?.saasRole === 'PLATFORM_ADMIN';
  const maxProjectsAllowed = company.maxProjects || PLAN_LIMITS[company.plan || 'TRIAL']?.maxProjects || 2;
  const maxUsersAllowed = company.maxUsers || PLAN_LIMITS[company.plan || 'TRIAL']?.maxUsers || 1;
  const usagePercentage = Math.min(100, Math.round((projectsCount / Math.max(1, maxProjectsAllowed)) * 100));

  React.useEffect(() => {
    if (company.plan) {
      setSelectedPlan(company.plan);
    }
  }, [company]);

  const plans = [
    {
      id: 'STARTER' as SaaSPlan,
      name: 'Starter',
      subtitle: 'For small workshops & independent estimation contractors',
      priceMonthly: 299,
      priceAnnual: 2990, // ~2 months free
      badge: 'Entry Level',
      maxProjects: 10,
      maxUsers: 2,
      stripeUrl: paymentSettings.stripeStarterUrl,
      features: [
        'Single company tenant',
        'Standard MDB, SMDB & DB estimation',
        'Up to 10 active projects simultaneously',
        'Standard BOQ and quotation exports',
        'Basic component catalog access',
        'Email customer support',
      ],
      notIncluded: [
        'Advanced ATS & interlocking designer',
        'Workshop production job cards',
        'ERP purchase requisition generator',
        'Multi-user approval workflows',
      ],
    },
    {
      id: 'PROFESSIONAL' as SaaSPlan,
      name: 'Professional',
      subtitle: 'For established LV panel builders & switchgear manufacturers',
      priceMonthly: 499,
      priceAnnual: 4990,
      badge: 'Most Popular',
      popular: true,
      maxProjects: 50,
      maxUsers: 5,
      stripeUrl: paymentSettings.stripeProfessionalUrl,
      features: [
        'Full LV switchgear estimation suite',
        'Up to 50 active projects',
        '5 engineering user seats',
        'Interactive IEC 61439 SLD & 2D CAD layout',
        'Component price management & supplier history',
        'Automated copper busbar sizing engine',
        'Consolidated Bill of Materials (BOM)',
        'Commercial quotations with VAT calculation',
        'Export to genuine Excel (.xlsx) & PDF',
      ],
      notIncluded: [
        'Workshop production job cards & handover',
        'Custom ERP integrations',
      ],
    },
    {
      id: 'ADVANCED' as SaaSPlan,
      name: 'Advanced',
      subtitle: 'For medium-to-large panel manufacturing factories with engineering teams',
      priceMonthly: 999,
      priceAnnual: 9990,
      badge: 'Factory Scale',
      maxProjects: 200,
      maxUsers: 15,
      stripeUrl: paymentSettings.stripeAdvancedUrl,
      features: [
        'All Professional features included',
        'Up to 200 active projects',
        '15 engineering, purchasing & production users',
        'Workshop Production Handover & Job Cards',
        'Purchase Requisition Generator & Shortage Tracking',
        'Material Issue Slips for assembly floor',
        'Role-based access control (RBAC)',
        'Tender approval & revision control workflows',
        'Company-branded quotation templates',
        'Priority technical phone & WhatsApp support',
      ],
      notIncluded: [
        'Custom on-premise ERP connectors',
      ],
    },
    {
      id: 'BUSINESS' as SaaSPlan,
      name: 'Business Enterprise',
      subtitle: 'For multi-factory switchgear corporations & regional EPC contractors',
      priceMonthly: 1999,
      priceAnnual: 19990,
      badge: 'Enterprise',
      maxProjects: 1000,
      maxUsers: 50,
      stripeUrl: paymentSettings.stripeBusinessUrl,
      features: [
        'All Advanced features included',
        'Unlimited active projects (up to 1,000)',
        '50 user seats with fine-grained permissions',
        'Multi-brand Value Engineering optimizer',
        'Contractor OEM discount agreements portal',
        'Dedicated account manager in UAE',
        'Custom onboarding & database migration assistance',
        'API & Webhook access for ERP synchronization',
        '99.9% SLA uptime guarantee',
      ],
      notIncluded: [],
    },
  ];

  const handleSelectPlan = (plan: any) => {
    setPlanToCheckout(plan);
    setPaymentReference('');
    setErrorMessage(null);
    setCheckoutModalOpen(true);
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await authApprovalService.savePaymentSettings(settingsForm);
    setPaymentSettings(saved);
    setShowAdminSettingsModal(false);
    setSuccessMessage('Platform Bank Account, VAT TRN, and Stripe Payment Links saved successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleSubmitPaymentRequest = async (instantAdminOverride = false) => {
    if (!planToCheckout) return;
    if (!instantAdminOverride && !paymentReference.trim()) {
      setErrorMessage('Please enter your Bank Transfer Reference / Wire Narration or Stripe Receipt ID so our billing team can verify and activate your subscription.');
      return;
    }

    setIsProcessingPayment(true);
    setErrorMessage(null);
    try {
      const refString = paymentReference.trim() || `ADMIN-OVERRIDE-${Date.now().toString().slice(-5)}`;
      await onUpgradePlan(planToCheckout.id, billingCycle, refString, instantAdminOverride);

      if (instantAdminOverride) {
        setSuccessMessage(`Plan immediately activated to ${planToCheckout.name} (${planToCheckout.maxProjects} Projects quota).`);
      } else {
        setSuccessMessage(
          `Upgrade request for ${planToCheckout.name} Plan submitted with reference "${refString}". Your account status is PENDING_APPROVAL and will be activated upon payment verification.`
        );
      }
      setCheckoutModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || 'Failed to process upgrade request.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
              SaaS Subscription & Tenant Licensing
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
              company.subscriptionStatus === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : company.subscriptionStatus === 'PENDING_APPROVAL'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}>
              STATUS: {company.subscriptionStatus || 'TRIALING'}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Current Plan: <strong className="text-slate-900">{company.plan || 'TRIAL'}</strong>
            </span>
            {company.requestedPlan && (
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Upgrade Pending: {company.requestedPlan} (Ref: {company.paymentReference})
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Subscription Plans & Estimation Quota Management
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Scalable multi-tenant cloud licensing for electrical panel estimation, single line diagram engineering, and production handover.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isPlatformAdmin && (
            <button
              onClick={() => {
                setSettingsForm(authApprovalService.getPaymentSettings());
                setShowAdminSettingsModal(true);
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Your Bank & Stripe Settings</span>
            </button>
          )}

          {/* Annual / Monthly Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition ${
                billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL' ? 'bg-white text-cyan-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual (Save 17%)</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">2 Months Free</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Tenant Estimation Quota Meter */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white rounded-xl p-5 border border-slate-700 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Active Tenant Workspace Quota
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              {company.companyName} ({company.companyCode})
            </h3>
            <p className="text-[11px] text-slate-300 font-sans mt-1">
              {company.plan === 'TRIAL'
                ? 'You are currently on the Free Trial tier (max 2 estimation projects, PDF/Excel commercial exports locked).'
                : `Your ${company.plan} license includes up to ${maxProjectsAllowed} estimation projects and full commercial BOQ/Quotation exports.`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Estimations / Projects Used:</span>
              </span>
              <strong className={projectsCount >= maxProjectsAllowed ? 'text-rose-400' : 'text-emerald-400'}>
                {projectsCount} / {maxProjectsAllowed} Projects ({usagePercentage}%)
              </strong>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  projectsCount >= maxProjectsAllowed
                    ? 'bg-rose-500'
                    : usagePercentage >= 75
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Licensed User Seats: {maxUsersAllowed} Engineers</span>
              <span>Commercial Exports: {company.plan === 'TRIAL' ? '🔒 Locked on Trial' : '✅ Unlocked'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center gap-2">
            {projectsCount >= maxProjectsAllowed ? (
              <div className="bg-rose-500/20 border border-rose-400/40 text-rose-200 px-3 py-2 rounded-lg text-[11px] font-sans flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>You have reached your {maxProjectsAllowed}-project quota limit. Select a plan below to unlock more estimations.</span>
              </div>
            ) : (
              <div className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 px-3 py-2 rounded-lg text-[11px] font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>{Math.max(0, maxProjectsAllowed - projectsCount)}</strong> estimation project slots remaining in your current quota.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 font-sans text-xs font-medium">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = company.plan === p.id;
          const isPendingThisPlan = company.requestedPlan === p.id;
          const displayPrice = billingCycle === 'ANNUAL' ? Math.round(p.priceAnnual / 12) : p.priceMonthly;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border flex flex-col justify-between transition-all shadow-xs ${
                p.popular ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md' : 'border-slate-200'
              }`}
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    p.popular ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active Plan
                    </span>
                  )}
                  {isPendingThisPlan && !isCurrent && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Pending Approval
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                <p className="text-[11px] text-slate-500 font-sans mt-1 h-9 leading-relaxed">
                  {p.subtitle}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">{displayPrice.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-medium">AED / month</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {billingCycle === 'ANNUAL' ? `Billed annually at ${p.priceAnnual.toLocaleString()} AED` : 'Billed monthly + 5% UAE VAT'}
                  </span>
                </div>
              </div>

              {/* Limits callouts */}
              <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Max Projects: <strong>{p.maxProjects}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>User Seats: <strong>{p.maxUsers}</strong></span>
                </div>
              </div>

              {/* Features List */}
              <div className="p-5 flex-1 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Included Capabilities
                </span>
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 font-sans">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/40">
                <button
                  disabled={isCurrent || isUpdating}
                  onClick={() => handleSelectPlan(p)}
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : p.popular
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? (
                    'Current Active Plan'
                  ) : (
                    <span>
                      {p.priceMonthly > (plans.find(x => x.id === company.plan)?.priceMonthly || 0)
                        ? 'Upgrade to ' + p.name
                        : 'Switch to ' + p.name}
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONNECTED UAE CORPORATE BANK ACCOUNT & PAYOUT DETAILS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Official Settlement Bank Account & Tax Details</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 font-bold uppercase">
                  Direct AED Settlement
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-sans">
                All subscription payments (Stripe Checkout Links or Corporate Bank Transfers) settle to the following account.
              </p>
            </div>
          </div>
          <div className="font-mono text-right text-[11px]">
            <span className="text-slate-500 block">Billing & Support Desk</span>
            <strong className="text-slate-900">{paymentSettings.supportPhone} • {paymentSettings.supportEmail}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-[11px]">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Beneficiary Entity</span>
            <strong className="text-slate-900">{paymentSettings.beneficiaryName}</strong>
            <span className="text-[10px] text-slate-400 block">Corporate Account</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Bank Institution</span>
            <strong className="text-slate-900">{paymentSettings.bankName}</strong>
            <span className="text-[10px] text-slate-400 block">SWIFT: {paymentSettings.swiftBic}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Settlement Account (IBAN)</span>
            <strong className="text-emerald-900 tracking-wider">{paymentSettings.iban}</strong>
            <span className="text-[10px] text-emerald-600 block">Direct AED Wire / Transfer</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">VAT Registered Entity</span>
            <strong className="text-slate-900">TRN: {paymentSettings.vatTrn}</strong>
            <span className="text-[10px] text-slate-400 block">FTA UAE 5% VAT Compliant</span>
          </div>
        </div>
      </div>

      {/* CHECKOUT & PAYMENT REFERENCE VERIFICATION MODAL */}
      {checkoutModalOpen && planToCheckout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
                  Subscription Upgrade & Quota Unlock
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Subscribe to {planToCheckout.name} Plan ({planToCheckout.maxProjects} Projects)
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-sans flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Price calculation */}
            {(() => {
              const basePrice = billingCycle === 'ANNUAL' ? planToCheckout.priceAnnual : planToCheckout.priceMonthly;
              const vatAmount = basePrice * 0.05;
              const grandTotal = basePrice + vatAmount;

              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Plan Base ({billingCycle}) — {planToCheckout.maxProjects} Projects Quota:</span>
                    <strong className="text-slate-900">{basePrice.toLocaleString()} AED</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>UAE Federal VAT (5.0%):</span>
                    <strong className="text-slate-900">{vatAmount.toFixed(2)} AED</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-cyan-900">
                    <span>Total Payable:</span>
                    <span>{grandTotal.toFixed(2)} AED</span>
                  </div>
                </div>
              );
            })()}

            {/* Payment method selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`flex-1 py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>UAE Bank Transfer (IBAN)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'card' ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900' : 'border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Online Card (Stripe Link)</span>
              </button>
            </div>

            {paymentMethod === 'bank_transfer' ? (
              <div className="space-y-3 font-sans">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1.5 font-mono">
                  <div className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">
                    STEP 1: TRANSFER TO OFFICIAL UAE BANK ACCOUNT
                  </div>
                  <div>Beneficiary: <strong>{paymentSettings.beneficiaryName}</strong></div>
                  <div>Bank: <strong>{paymentSettings.bankName}</strong></div>
                  <div>IBAN: <strong className="text-emerald-800">{paymentSettings.iban}</strong></div>
                  <div>SWIFT/BIC: <strong>{paymentSettings.swiftBic}</strong></div>
                  <div>VAT TRN: <strong>{paymentSettings.vatTrn}</strong></div>
                </div>

                <button
                  type="button"
                  onClick={() => setTaxInvoiceModalOpen(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 font-mono shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View & Print Official Proforma Tax Invoice (PDF)</span>
                </button>

                <div className="pt-1">
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">
                    STEP 2: Enter Bank Transfer Reference / Cheque No. <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ENBD-TRX-9948271 or PDC Cheque #00412"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Once submitted, the Platform Admin will verify the bank credit and activate your {planToCheckout.maxProjects}-project quota.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                <div className="p-3.5 bg-cyan-50 rounded-xl border border-cyan-200 text-[11px] text-cyan-950 space-y-2">
                  <div className="font-bold text-cyan-900">
                    STEP 1: PAY SECURELY VIA STRIPE UAE CHECKOUT
                  </div>
                  <p className="leading-relaxed">
                    For PCI-DSS security, card numbers are never stored on this server. Click below to complete your card payment on Stripe's hosted checkout page, then enter your receipt reference below.
                  </p>
                  {planToCheckout.stripeUrl ? (
                    <a
                      href={planToCheckout.stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 font-mono shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Stripe Checkout for {planToCheckout.name} Plan</span>
                    </a>
                  ) : (
                    <div className="p-2.5 bg-white/80 rounded border border-cyan-300 text-[11px] text-slate-700">
                      <strong>Note:</strong> Online Stripe Payment Link is not yet configured by the Platform Administrator. Please use <strong>UAE Bank Transfer (IBAN)</strong> or contact <strong>{paymentSettings.supportEmail}</strong>.
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">
                    STEP 2: Enter Stripe Receipt / Transaction ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pi_3Q8xK2LkdIwHu7ix or Stripe Receipt #1842-9012"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 font-mono">
              {isPlatformAdmin ? (
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleSubmitPaymentRequest(true)}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-lg font-bold text-[11px] transition cursor-pointer"
                  title="Platform Admin Only: Activate immediately without waiting"
                >
                  ⚡ Admin Instant Activate
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleSubmitPaymentRequest(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <span>Submitting...</span>
                  ) : (
                    <span>Submit Payment Reference</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM ADMIN BANK & STRIPE CONFIGURATION MODAL */}
      {showAdminSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
                  Platform Owner Configuration
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Your UAE Bank Account, Tax Details & Stripe Payment Links
                </h3>
              </div>
              <button
                onClick={() => setShowAdminSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Beneficiary Company Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.beneficiaryName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, beneficiaryName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">UAE Bank Name & Branch</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">UAE IBAN Number</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.iban}
                    onChange={(e) => setSettingsForm({ ...settingsForm, iban: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.swiftBic}
                    onChange={(e) => setSettingsForm({ ...settingsForm, swiftBic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Supplier VAT TRN (15 digits)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.vatTrn}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vatTrn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Free Trial Project Quota (New Signups)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={settingsForm.trialProjectLimit}
                    onChange={(e) => setSettingsForm({ ...settingsForm, trialProjectLimit: Number(e.target.value) || 2 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Billing Support Email</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.supportEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Billing Support Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.supportPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 font-mono">
                  Optional: Stripe Payment Links (from dashboard.stripe.com/payment-links)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Starter Plan (299 AED) Stripe URL</label>
                    <input
                      type="url"
                      placeholder="https://buy.stripe.com/..."
                      value={settingsForm.stripeStarterUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripeStarterUrl: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Professional Plan (499 AED) Stripe URL</label>
                    <input
                      type="url"
                      placeholder="https://buy.stripe.com/..."
                      value={settingsForm.stripeProfessionalUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripeProfessionalUrl: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Advanced Plan (999 AED) Stripe URL</label>
                    <input
                      type="url"
                      placeholder="https://buy.stripe.com/..."
                      value={settingsForm.stripeAdvancedUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripeAdvancedUrl: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Business Plan (1999 AED) Stripe URL</label>
                    <input
                      type="url"
                      placeholder="https://buy.stripe.com/..."
                      value={settingsForm.stripeBusinessUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripeBusinessUrl: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAdminSettingsModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Payment & Bank Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL UAE FTA TAX INVOICE MODAL (فاتورة ضريبية) */}
      {taxInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase">
                Official Document — UAE FTA VAT Compliant
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-800 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaxInvoiceModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Invoice Body */}
            <div className="space-y-6 text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">PROFORMA TAX INVOICE</h2>
                  <div className="text-sm font-bold text-slate-500 font-sans">فاتورة ضريبية مبدئية</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Invoice No: <strong className="text-slate-900">TAX-INV-2026-{company.companyCode}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Issue Date: <strong>{new Date().toISOString().slice(0, 10)}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-cyan-900">{paymentSettings.beneficiaryName}</div>
                  <div className="text-[10px] text-slate-500 font-sans">United Arab Emirates</div>
                  <div className="text-[10px] text-slate-500 font-sans">{paymentSettings.supportEmail} • {paymentSettings.supportPhone}</div>
                  <div className="text-[11px] font-bold text-slate-900 mt-1 font-mono">
                    Supplier TRN: {paymentSettings.vatTrn}
                  </div>
                </div>
              </div>

              {/* Customer / Billed To Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Customer / Billed To</span>
                  <div className="font-bold text-slate-900 text-xs">{company.companyName}</div>
                  <div className="text-[11px] text-slate-600 font-sans">{company.address || 'Industrial Area, UAE'}</div>
                  <div className="text-[11px] text-slate-600">{company.city}, United Arab Emirates</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Customer Tax Details</span>
                  <div className="text-[11px] text-slate-700">Customer TRN: <strong className="font-mono text-slate-900">{company.vatTrn || 'Pending'}</strong></div>
                  <div className="text-[11px] text-slate-700">Trade License: <strong className="font-mono text-slate-900">{company.tradeLicenseNo || 'Pending'}</strong></div>
                  <div className="text-[11px] text-slate-700">Tenant Code: <strong className="font-mono text-cyan-900">{company.companyCode}</strong></div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-bold">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price (AED)</th>
                    <th className="py-2.5 text-right">VAT Rate</th>
                    <th className="py-2.5 text-right">VAT (AED)</th>
                    <th className="py-2.5 text-right">Total (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3">
                      <div className="font-bold text-slate-900">
                        {planToCheckout?.name || 'Professional'} Tier Cloud License ({billingCycle})
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        Includes {planToCheckout?.maxProjects || 50} active projects quota, SLD CAD studio, and {planToCheckout?.maxUsers || 5} user seats
                      </div>
                    </td>
                    <td className="py-3 text-center">1</td>
                    <td className="py-3 text-right">
                      {((billingCycle === 'ANNUAL' ? (planToCheckout?.priceAnnual || 4990) : (planToCheckout?.priceMonthly || 499))).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono">5.0%</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-800">
                      {(((billingCycle === 'ANNUAL' ? (planToCheckout?.priceAnnual || 4990) : (planToCheckout?.priceMonthly || 499))) * 0.05).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      {(((billingCycle === 'ANNUAL' ? (planToCheckout?.priceAnnual || 4990) : (planToCheckout?.priceMonthly || 499))) * 1.05).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Excl. VAT:</span>
                    <span>{((billingCycle === 'ANNUAL' ? (planToCheckout?.priceAnnual || 4990) : (planToCheckout?.priceMonthly || 499))).toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>UAE VAT (5.00%):</span>
                    <span className="text-emerald-700 font-bold">{(((billingCycle === 'ANNUAL' ? (planToCheckout?.priceAnnual || 4990) : (planToCheckout?.priceMonthly || 499))) * 0.05).toFixed(2)} AED</span>
                  </div>
                  <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount Due:</span>
                    <span>{(((billingCycle === 'ANNUAL' ? (planToCheckout?.priceAnnual || 4990) : (planToCheckout?.priceMonthly || 499))) * 1.05).toFixed(2)} AED</span>
                  </div>
                </div>
              </div>

              {/* Payment Settlement Instructions */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                <span className="font-bold text-emerald-950 uppercase block">DIRECT BANK TRANSFER SETTLEMENT INSTRUCTIONS</span>
                <div className="text-slate-700">Beneficiary: <strong>{paymentSettings.beneficiaryName}</strong></div>
                <div className="text-slate-700">Bank Name: <strong>{paymentSettings.bankName}</strong></div>
                <div className="text-slate-700">Account / IBAN: <strong className="font-mono text-emerald-900">{paymentSettings.iban}</strong></div>
                <div className="text-slate-700">SWIFT / BIC Code: <strong className="font-mono">{paymentSettings.swiftBic}</strong></div>
                <div className="text-slate-500 font-sans text-[10px] pt-1">
                  * Please quote Invoice Reference <code className="font-mono text-slate-900">TAX-INV-2026-{company.companyCode}</code> in your bank transfer narration and submit the transaction reference in the portal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
