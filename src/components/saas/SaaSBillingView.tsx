// ============================================================================
// SAAS BILLING & SUBSCRIPTION MANAGEMENT VIEW
// Pricing in AED, Tenant Limits, Feature Matrix & Plan Upgrade/Downgrade
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
  ArrowDownRight
} from 'lucide-react';
import { SaaSPlan, CompanyTenant, SaaSSubscription } from '../../types';

interface SaaSBillingViewProps {
  company: CompanyTenant;
  subscription: SaaSSubscription | null;
  onUpgradePlan: (newPlan: SaaSPlan, billingCycle: 'MONTHLY' | 'ANNUAL') => Promise<void>;
}

export const SaaSBillingView: React.FC<SaaSBillingViewProps> = ({
  company,
  subscription,
  onUpgradePlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<SaaSPlan>(company.plan || 'PROFESSIONAL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Payment Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [planToCheckout, setPlanToCheckout] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [cardHolder, setCardHolder] = useState(company.companyName || 'Corporate Cardholder');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  React.useEffect(() => {
    if (company.companyName) {
      setCardHolder(company.companyName);
    }
    if (company.plan) {
      setSelectedPlan(company.plan);
    }
  }, [company]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [taxInvoiceModalOpen, setTaxInvoiceModalOpen] = useState(false);

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
    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    if (!planToCheckout) return;
    setIsProcessingPayment(true);
    try {
      await onUpgradePlan(planToCheckout.id, billingCycle);
      setSuccessMessage(`Subscription upgraded to ${planToCheckout.name} successfully! Payment processed in AED.`);
      setCheckoutModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
              SaaS Subscription & Tenant Licensing
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              STATUS: {company.subscriptionStatus || 'ACTIVE'}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Current Plan: <strong className="text-slate-900">{company.plan || 'PROFESSIONAL'}</strong>
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Subscription Plans for UAE Switchgear Manufacturers
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Scalable multi-tenant cloud licensing for electrical panel estimation, single line diagram engineering, and production handover.
          </p>
        </div>

        {/* Annual / Monthly Toggle */}
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-lg border border-slate-200 shrink-0">
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

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = company.plan === p.id;
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
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
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
                    <>
                      <span>{p.priceMonthly > (plans.find(x => x.id === company.plan)?.priceMonthly || 0) ? 'Upgrade to ' + p.name : 'Switch to ' + p.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* THREE ARCHITECTURAL PILLARS: LOGIN, USERS, PAYMENT SETTLEMENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* 1. LOGIN & AUTHENTICATION */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="font-bold text-slate-900 text-xs">How Clients Sign In & Register</h4>
            </div>
            <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
              Clients access the platform via <strong>Google Authentication & Firebase Auth</strong>. On initial sign-in, the system provisions an isolated company tenant record in PostgreSQL with strict data isolation so competitors never see their private bids.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 font-mono text-[10px] text-slate-500">
            Tech: OAuth2 + Bearer Tokens verified on Cloud Run backend.
          </div>
        </div>

        {/* 2. CREATING USER IDS & ROLES */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="font-bold text-slate-900 text-xs">How User IDs Are Managed</h4>
            </div>
            <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
              The registering user becomes the <strong>Company Owner</strong>. From <strong>Company & TRN &gt; Team Members</strong>, the owner invites estimation engineers, design draftsmen, and purchase officers within their subscription seat quota (2 to 50 seats).
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 font-mono text-[10px] text-slate-500">
            Roles: Owner, Estimator, Design, Purchase, Production.
          </div>
        </div>

        {/* 3. PAYMENT SETTLEMENT & YOUR BANK ACCOUNT */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between border-emerald-200 bg-emerald-50/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">3</span>
              <h4 className="font-bold text-emerald-950 text-xs">Where Money Enters Your Bank</h4>
            </div>
            <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
              Clients pay in <strong>AED</strong> via <strong>Stripe UAE / Checkout.com</strong> (cards) or <strong>Direct Corporate Bank Transfer</strong>. Card payments auto-deposit into your UAE Corporate Bank Account (Emirates NBD, FAB, ADCB, Wio) every 2-3 days. Bank transfers go 100% directly to your IBAN with zero gateway fees.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200 font-mono text-[10px] text-emerald-800 font-bold">
            Settlement: Automated direct deposit to UAE IBAN in AED.
          </div>
        </div>
      </div>

      {/* UAE Commercial Billing Note */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">UAE Corporate Tax Invoice & Bank Settlement</h4>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              All subscription charges generate official FTA-compliant UAE Tax Invoices (5% VAT). Funds settle directly into your registered UAE Corporate Bank Account.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] text-slate-500 block">SaaS Operations Desk (Dubai, UAE)</span>
          <span className="text-xs font-bold text-slate-900">+971 4 345 6789 / billing@lvestimator.ae</span>
        </div>
      </div>

      {/* CONNECTED UAE CORPORATE BANK ACCOUNT & AUTOMATED PAYOUT LEDGER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Your Connected UAE Corporate Bank Account</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 font-bold uppercase">
                  Payout Target Verified
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-sans">
                Where all customer subscription amounts (card payments & bank transfers) are deposited in AED.
              </p>
            </div>
          </div>
          <div className="font-mono text-right text-[11px]">
            <span className="text-slate-500 block">Payout Schedule</span>
            <strong className="text-emerald-800">Rolling 2 Business Days (Daily Auto-Transfer)</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-[11px]">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Bank Institution</span>
            <strong className="text-slate-900">Emirates NBD Bank PJSC</strong>
            <span className="text-[10px] text-slate-400 block">Dubai, UAE</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Settlement Account (IBAN)</span>
            <strong className="text-emerald-900 tracking-wider">AE29 0331 2345 6789 0123 456</strong>
            <span className="text-[10px] text-slate-400 block">SWIFT: EBILAEADXXX</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Available Balance</span>
            <strong className="text-slate-900 text-sm">6,602.40 AED</strong>
            <span className="text-[10px] text-emerald-600 block">Next payout: 12-Oct-2026</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">VAT Registered Entity</span>
            <strong className="text-slate-900">TRN: 100234567800003</strong>
            <span className="text-[10px] text-slate-400 block">FTA UAE Compliant</span>
          </div>
        </div>

        {/* Recent Payout Settlements Ledger */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-700 block mb-2 font-mono">
            Recent Client Subscription Settlements Deposited to IBAN
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Client Switchgear Manufacturer</th>
                  <th className="p-2.5">Plan / Description</th>
                  <th className="p-2.5">Payment Method</th>
                  <th className="p-2.5 text-right">Amount (AED)</th>
                  <th className="p-2.5 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70">
                  <td className="p-2.5 text-slate-500">10-Oct-2026</td>
                  <td className="p-2.5 font-bold text-slate-900">Emirates Switchgear Manufacturing LLC</td>
                  <td className="p-2.5 text-slate-600">Professional Plan (Annual License)</td>
                  <td className="p-2.5 text-slate-600">Direct Corporate Bank Transfer</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">5,239.50 AED</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Settled to IBAN
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="p-2.5 text-slate-500">02-Oct-2026</td>
                  <td className="p-2.5 font-bold text-slate-900">Gulf Modern Switchboards FZCO</td>
                  <td className="p-2.5 text-slate-600">Advanced Plan (Monthly)</td>
                  <td className="p-2.5 text-slate-600">Corporate Card (Stripe UAE)</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">1,048.95 AED</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Settled to IBAN
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="p-2.5 text-slate-500">28-Sep-2026</td>
                  <td className="p-2.5 font-bold text-slate-900">Apex Electrical Integration LLC</td>
                  <td className="p-2.5 text-slate-600">Starter Plan (Monthly)</td>
                  <td className="p-2.5 text-slate-600">Corporate Card (Stripe UAE)</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">313.95 AED</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Settled to IBAN
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CHECKOUT & BANK SETTLEMENT MODAL */}
      {checkoutModalOpen && planToCheckout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
                  Secure Checkout in AED
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Subscribe to {planToCheckout.name} Plan
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Price calculation */}
            {(() => {
              const basePrice = billingCycle === 'ANNUAL' ? planToCheckout.priceAnnual : planToCheckout.priceMonthly;
              const vatAmount = basePrice * 0.05;
              const grandTotal = basePrice + vatAmount;

              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Plan Base ({billingCycle}):</span>
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
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'card' ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900' : 'border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Corporate Card (Stripe UAE)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`flex-1 py-2 px-3 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>UAE Bank Transfer (IBAN)</span>
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-3 font-sans">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Corporate Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono tracking-wider"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Expires</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      defaultValue="888"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 text-[11px] text-cyan-950 leading-relaxed font-sans">
                  <strong>Where this payment goes:</strong> Handled securely by Stripe UAE / Checkout.com. Stripe collects the AED amount from the client's bank and automatically deposits it into your UAE Business Bank Account (Emirates NBD, FAB, ADCB, Wio) every 2 business days.
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 font-sans">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1.5 font-mono">
                  <div className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">
                    YOUR COMPANY UAE BANK ACCOUNT (DEPOSIT TARGET)
                  </div>
                  <div>Beneficiary: <strong>Your Switchgear SaaS Platform LLC</strong></div>
                  <div>Bank: <strong>Emirates NBD Bank PJSC (Dubai)</strong></div>
                  <div>IBAN: <strong className="text-emerald-800">AE29 0331 2345 6789 0123 456</strong></div>
                  <div>SWIFT/BIC: <strong>EBILAEADXXX</strong></div>
                  <div>VAT TRN: <strong>100234567800003</strong></div>
                </div>
                <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                  The client transfers directly from their UAE corporate bank account or issues a Post-Dated Cheque (PDC). 100% of the funds land directly in your bank account with 0% gateway commission.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setTaxInvoiceModalOpen(true)}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 font-mono shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View & Download UAE Tax Invoice (FTA Compliant)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 font-mono">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmCheckout}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1.5"
              >
                {isProcessingPayment ? (
                  <span>Authorizing Payment...</span>
                ) : (
                  <span>Confirm & Activate Subscription</span>
                )}
              </button>
            </div>
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
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-800 transition"
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
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">TAX INVOICE</h2>
                  <div className="text-sm font-bold text-slate-500 font-sans">فاتورة ضريبية</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Invoice No: <strong className="text-slate-900">TAX-INV-2026-0089</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Issue Date: <strong>10-Oct-2026</strong> • Supply Date: <strong>10-Oct-2026</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-cyan-900">LV Switchgear Estimator SaaS LLC</div>
                  <div className="text-[10px] text-slate-500 font-sans">Al Quoz Industrial Area 4, Plot 598-123</div>
                  <div className="text-[10px] text-slate-500 font-sans">P.O. Box 48291, Dubai, United Arab Emirates</div>
                  <div className="text-[11px] font-bold text-slate-900 mt-1 font-mono">
                    Supplier TRN: 100234567800003
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
                  <div className="text-[11px] text-slate-700">Customer TRN: <strong className="font-mono text-slate-900">{company.vatTrn || '100234567800003'}</strong></div>
                  <div className="text-[11px] text-slate-700">Trade License: <strong className="font-mono text-slate-900">{company.tradeLicenseNo || 'CN-1029384'}</strong></div>
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
                        Full LV switchgear panel estimation, SLD CAD studio, and multi-user tenant quota
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
                <div className="text-slate-700">Beneficiary: <strong>LV Switchgear Estimator SaaS LLC</strong></div>
                <div className="text-slate-700">Bank Name: <strong>Emirates NBD Bank PJSC (Dubai)</strong></div>
                <div className="text-slate-700">Account / IBAN: <strong className="font-mono text-emerald-900">AE29 0331 2345 6789 0123 456</strong></div>
                <div className="text-slate-700">SWIFT / BIC Code: <strong className="font-mono">EBILAEADXXX</strong></div>
                <div className="text-slate-500 font-sans text-[10px] pt-1">
                  * Please quote Invoice Reference <code className="font-mono text-slate-900">TAX-INV-2026-0089</code> in your bank transfer narration or remittance advice.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
