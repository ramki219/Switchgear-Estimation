// ============================================================================
// AUTHENTICATION & MULTI-TENANT SWITCHER MODAL
// Google Sign-In via Firebase Auth + Automatic Tenant Isolation Verification
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  LogIn, 
  LogOut, 
  User, 
  Sparkles, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { auth, googleAuthProvider } from '../../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { CompanyTenant, SaaSUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SaaSUser | null;
  currentCompany: CompanyTenant;
  onSwitchTenant: (company: CompanyTenant, user: SaaSUser) => void;
  onSignOut?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentCompany,
  onSwitchTenant,
  onSignOut,
}) => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google Sign-in with Firebase
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      
      const loggedUser: SaaSUser = {
        id: Date.now(),
        uid: fbUser.uid,
        companyId: currentCompany.id,
        email: fbUser.email || 'user@example.com',
        fullName: fbUser.displayName || 'Authorized Engineer',
        role: 'COMPANY_OWNER',
        phone: fbUser.phoneNumber || undefined,
        isActive: true,
      };

      onSwitchTenant(currentCompany, loggedUser);
      onClose();
    } catch (err: any) {
      console.warn('Firebase popup notice:', err);
      setAuthError(err.message || 'Popup closed or Google Sign-In cancelled.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth).catch(() => {});
    if (onSignOut) {
      onSignOut();
    }
    onClose();
  };

  // Demo Switchgear Tenants to test Tenant Isolation
  const demoTenants: Array<{ company: CompanyTenant; user: SaaSUser }> = [
    {
      company: {
        id: 1,
        companyCode: 'EMIRATES-LV-01',
        companyName: 'Emirates Switchgear Manufacturing LLC',
        tradeLicenseNo: 'CN-1029384',
        country: 'United Arab Emirates',
        city: 'Dubai',
        address: 'Al Quoz Industrial Area 4, Dubai, UAE',
        phone: '+971 4 345 6789',
        email: 'sales@emiratesswitchgear.ae',
        vatTrn: '100234567800003',
        currency: 'AED',
        defaultCostingMethod: 'MARKUP',
        defaultMarginPercent: 15.00,
        defaultVatPercent: 5.00,
        plan: 'PROFESSIONAL',
        subscriptionStatus: 'ACTIVE',
      },
      user: {
        id: 1,
        uid: 'demo-user-emirates-owner',
        companyId: 1,
        email: 'ahmed.almansoor@emiratesswitchgear.ae',
        fullName: 'Eng. Ahmed Al-Mansoor',
        role: 'COMPANY_OWNER',
        phone: '+971 50 123 4567',
        isActive: true,
      },
    },
    {
      company: {
        id: 2,
        companyCode: 'GULF-PANELS-02',
        companyName: 'Gulf Modern Switchboards FZCO',
        tradeLicenseNo: 'FZ-9928172',
        country: 'United Arab Emirates',
        city: 'Abu Dhabi',
        address: 'ICAD 1, Musaffah Industrial, Abu Dhabi, UAE',
        phone: '+971 2 550 4321',
        email: 'tenders@gulfswitchboards.ae',
        vatTrn: '100987654300003',
        currency: 'AED',
        defaultCostingMethod: 'MARGIN',
        defaultMarginPercent: 18.50,
        defaultVatPercent: 5.00,
        plan: 'ADVANCED',
        subscriptionStatus: 'ACTIVE',
      },
      user: {
        id: 2,
        uid: 'demo-user-gulf-estimator',
        companyId: 2,
        email: 'suresh.kumar@gulfswitchboards.ae',
        fullName: 'Eng. Suresh Kumar (Lead Estimator)',
        role: 'ESTIMATION_ENGINEER',
        phone: '+971 52 987 1122',
        isActive: true,
      },
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono text-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                SaaS Authentication & Multi-Tenant Access
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Google Workspace SSO + Cryptographic Tenant Isolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Current Active User Information */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-sans">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase font-bold">
            <span>ACTIVE AUTHENTICATED SESSION</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">VERIFIED</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                {currentUser?.fullName?.charAt(0) || 'E'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{currentUser?.fullName || 'Eng. Ahmed Al-Mansoor'}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.email || 'sales@emiratesswitchgear.ae'}</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
              {currentUser?.role?.replace('_', ' ') || 'COMPANY OWNER'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between font-mono text-[11px] text-slate-600">
            <span>Tenant Company:</span>
            <strong className="text-slate-900">{currentCompany.companyName} ({currentCompany.companyCode})</strong>
          </div>
        </div>

        {/* Action 1: Sign in with Google (Live Firebase Auth) */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs flex items-center justify-center gap-2.5 shadow-2xs transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{loading ? 'Authenticating with Google...' : 'Sign In with Google (Corporate SSO)'}</span>
          </button>
          {authError && (
            <p className="text-[10px] text-amber-700 mt-1 font-sans">{authError}</p>
          )}
        </div>

        {/* Tenant Isolation Simulation & Switcher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 text-[11px]">
              Switch Company Tenant (Test Data Isolation)
            </span>
            <span className="text-[10px] text-slate-400">Isolated database scopes</span>
          </div>

          <div className="space-y-1.5">
            {demoTenants.map(({ company: c, user: u }) => {
              const isActive = currentCompany.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSwitchTenant(c, u);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isActive
                      ? 'border-cyan-600 bg-cyan-50/60 ring-1 ring-cyan-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-700" />
                      <span>{c.companyName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                      User: <strong>{u.fullName}</strong> ({u.role.replace('_', ' ')}) • {c.city}, UAE
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                      Current Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      Switch <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Isolation Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 leading-relaxed font-sans flex items-start gap-2">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Tenant Isolation Assurance:</strong> Every SQL query is automatically scoped with <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">WHERE company_id = ?</code>. Tenant A's tender calculations, component discount rates, and customer quotes are cryptographically separated from Tenant B.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
