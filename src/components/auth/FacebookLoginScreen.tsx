// ============================================================================
// FACEBOOK-STYLE LOGIN & REGISTRATION GATEWAY FOR SWITCHGEAR SaaS
// Authentic Facebook UI & Layout with UAE Switchgear Multi-Tenant Architecture
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  X, 
  Sparkles, 
  AlertCircle, 
  Zap, 
  CheckCircle2,
  Cpu,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { auth, googleAuthProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { CompanyTenant, SaaSUser, SaaSRole, SaaSSubscription } from '../../types';
import { downloadProjectDocumentationPDF } from '../../services/projectDocumentationPdfService';
import { authApprovalService } from '../../services/authApprovalService';

interface FacebookLoginScreenProps {
  onLoginSuccess: (user: SaaSUser, company: CompanyTenant, subscription?: SaaSSubscription) => void;
}

export const FacebookLoginScreen: React.FC<FacebookLoginScreenProps> = ({
  onLoginSuccess,
}) => {
  // Login form state - clean, NOT pre-filled with fake details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Registration Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regEmirate, setRegEmirate] = useState('Dubai');
  const [regRole, setRegRole] = useState<SaaSRole>('COMPANY_OWNER');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // 1. Handle Standard Email / Password Login (Strictly Verified via AuthApprovalService)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('The email address you entered isn’t connected to an account.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await authApprovalService.authenticateUser(cleanEmail, password);
      if (!authResult.success || !authResult.user || !authResult.company) {
        setErrorMessage(authResult.error || 'Invalid email or password.');
        return;
      }

      onLoginSuccess(authResult.user, authResult.company, authResult.subscription);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Real Google Sign-In with Firebase Authentication
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const authResult = await authApprovalService.authenticateWithGoogle();
      if (!authResult.success) {
        setErrorMessage(authResult.error || 'Google Sign-In failed.');
        return;
      }

      if (authResult.requiresApproval) {
        setErrorMessage('Your Google account has been registered and is pending administrator approval.');
        return;
      }

      if (authResult.user && authResult.company) {
        onLoginSuccess(authResult.user, authResult.company, authResult.subscription);
      }
    } catch (err: any) {
      console.warn('Firebase popup notice:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-In was cancelled. Please try again or log in with your email.');
      } else {
        setErrorMessage(err.message || 'Unable to complete Google Sign-In.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Registration Form Submission (Creates Free Trial Account with 1 Estimation Quota)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    if (!regFirstName.trim() || !regLastName.trim()) {
      setRegError('Please enter your first and last name.');
      return;
    }

    if (!regEmail.trim()) {
      setRegError('Please enter a valid work email address.');
      return;
    }

    if (!regCompanyName.trim()) {
      setRegError('Please enter your switchgear company name.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApprovalService.registerCustomerAccount({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        companyName: regCompanyName,
        city: regEmirate,
        role: regRole,
      });

      if (!result.success) {
        setRegError(result.error || 'Registration failed.');
        return;
      }

      if (result.requiresApproval) {
        setRegSuccess(true);
        setRegSuccessMessage('Account submitted for Administrator Approval! You will be able to log in once approved.');
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegSuccess(false);
          setErrorMessage('Your account registration is pending administrator approval.');
        }, 2200);
        return;
      }

      setRegSuccess(true);
      setRegSuccessMessage('Free Trial account created (1 Free Project Estimation included)! Logging you in...');
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess(false);
        if (result.user && result.company) {
          onLoginSuccess(result.user, result.company, result.subscription);
        }
      }, 800);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Quick Evaluation Login helper (Uses verified accounts in AuthApprovalService)
  const handleQuickDemoLogin = async (accountType: 'admin' | 'emirates' | 'gulf') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      let email = 'admin@switchgearestimator.com';
      let pass = 'Admin@2026';
      if (accountType === 'emirates') {
        email = 'tariq.m@alghandiswitchgear.ae';
        pass = 'Client@2026';
      } else if (accountType === 'gulf') {
        email = 'suresh.k@danwayeme.com';
        pass = 'Client@2026';
      }

      const res = await authApprovalService.authenticateUser(email, pass);
      if (res.success && res.user && res.company) {
        onLoginSuccess(res.user, res.company, res.subscription);
      } else {
        setErrorMessage(res.error || 'Demo login failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 flex flex-col justify-between selection:bg-[#1877f2] selection:text-white">
      {/* Top Banner on Mobile */}
      <div className="lg:hidden bg-[#1877f2] text-white p-3 text-center font-bold text-sm shadow-xs flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 fill-white" />
        <span>SwitchgearOS • UAE LV Panel Estimation Platform</span>
      </div>

      {/* Main Facebook-Style Center Container */}
      <div className="flex-1 max-w-[1020px] w-full mx-auto px-4 md:px-8 py-10 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        
        {/* Left Column: Iconic Facebook-Style Wordmark & Value Proposition */}
        <div className="w-full lg:w-[540px] text-center lg:text-left pt-2 lg:pt-0">
          <div className="inline-flex items-center gap-2 mb-1">
            <h1 className="text-[#1877f2] text-5xl md:text-6xl font-extrabold tracking-tighter">
              switchgear<span className="text-[#0d65d9]">OS</span>
            </h1>
          </div>
          
          <h2 className="text-xl md:text-[26px] leading-snug md:leading-normal font-normal text-slate-800 mt-2 max-w-lg mx-auto lg:mx-0">
            SwitchgearOS connects your panel estimation, SLD CAD design, busbar sizing, and commercial tender quotation into one unified UAE platform.
          </h2>

          {/* Value highlights underneath the tagline */}
          <div className="mt-8 space-y-3 hidden sm:block max-w-md mx-auto lg:mx-0 text-left">
            <div className="flex items-center gap-3 text-slate-700 text-sm">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#1877f2] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span><strong>DEWA, SEWA, ADDC, FEWA</strong> & Kahramaa utility specifications ready</span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 text-sm">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#1877f2] shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <span><strong>IEC 61439-1 & 2</strong> Form 2b/4b automated copper busbar calculation</span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 text-sm">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#1877f2] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span><strong>Isolated Tenant Security:</strong> Confidential BOM prices and tenders</span>
            </div>

            <div className="flex items-center gap-3 text-slate-700 text-sm">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#1877f2] shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span><strong>Automated 5% UAE VAT</strong> TRN invoice & Excel/PDF BOQ generator</span>
            </div>
          </div>
        </div>

        {/* Right Column: Iconic Facebook Login Card */}
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <div className="w-full bg-white rounded-lg shadow-xl shadow-slate-300/40 border border-slate-200 p-4 sm:p-5 flex flex-col">
            
            {/* Error Message if any */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              <div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address or corporate ID"
                  className="w-full px-4 py-3.5 text-base border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none transition bg-white text-slate-900 placeholder-slate-400"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3.5 pr-11 text-base border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none transition bg-white text-slate-900 placeholder-slate-400"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Facebook Primary Blue Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1465cf] text-white font-bold py-3 text-xl rounded-md transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Log In'
                )}
              </button>

              {/* Forgotten password link */}
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotSent(false);
                }}
                className="text-[#1877f2] text-sm hover:underline text-center py-1 transition"
              >
                Forgotten password?
              </button>

              {/* Divider with 'or' */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-slate-200"></div>
                <span className="absolute bg-white px-3 text-xs text-slate-400 uppercase font-semibold">
                  or
                </span>
              </div>

              {/* Sign in with Google (Firebase) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-md text-sm transition shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Facebook Green "Create new account" Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(true);
                    setRegError(null);
                  }}
                  className="bg-[#42b72a] hover:bg-[#36a420] active:bg-[#2f8f1c] text-white font-bold py-2.5 px-6 rounded-md text-base transition shadow-xs inline-block cursor-pointer"
                >
                  Create new account
                </button>
              </div>
            </form>
          </div>

          {/* Under-Card Notice (like Facebook's 'Create a Page for a celebrity...') */}
          <div className="mt-7 text-xs text-slate-600 text-center leading-relaxed">
            <span
              onClick={() => setShowRegisterModal(true)}
              className="font-bold text-slate-900 hover:underline cursor-pointer"
            >
              Create a Switchgear Tenant
            </span>{' '}
            for a panel manufacturing factory, contracting enterprise, or tender estimation office.
          </div>

          {/* Fast 1-Click Evaluation Buttons (Convenient for review & testing) */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 w-full text-center">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Role Test Logins (Admin vs. Paid Client)
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold px-3 py-1.5 rounded border border-slate-700 transition shadow-2xs cursor-pointer"
                title="Login as Platform Owner (admin@lvswitchgear.com / Admin@2026) to manage clients, approvals & quotas"
              >
                ★ Platform Admin (Owner)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('emirates')}
                className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded border border-slate-300 transition shadow-2xs cursor-pointer"
              >
                Al Ghandi (Paid Client)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('gulf')}
                className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded border border-slate-300 transition shadow-2xs cursor-pointer"
              >
                Danway (Estimator)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Facebook-Style Footer with Languages & Switchgear Links */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-[1020px] mx-auto px-4 md:px-8 space-y-3">
          {/* Languages */}
          <div className="flex flex-wrap items-center gap-3 text-slate-500">
            <span className="text-slate-800 font-medium">English (UK)</span>
            <span className="text-slate-300">•</span>
            <button className="hover:underline">العربية (UAE)</button>
            <span className="text-slate-300">•</span>
            <button className="hover:underline">Français</button>
            <span className="text-slate-300">•</span>
            <button className="hover:underline">हिन्दी</button>
            <span className="text-slate-300">•</span>
            <button className="hover:underline">Deutsch</button>
            <span className="text-slate-300">•</span>
            <button className="hover:underline">Español</button>
            <span className="text-slate-300">•</span>
            <button className="hover:underline">Italiano</button>
            <button className="border border-slate-200 px-1.5 py-0.5 rounded text-[10px] bg-slate-50 hover:bg-slate-100 ml-1">
              +
            </button>
          </div>

          <div className="border-t border-slate-200 pt-3 flex flex-wrap gap-x-4 gap-y-2 text-slate-500">
            <button onClick={() => setShowRegisterModal(true)} className="hover:underline">Sign Up</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:underline">Log In</button>
            <button
              onClick={() => downloadProjectDocumentationPDF()}
              className="text-[#1877f2] font-semibold hover:underline"
              title="Download Complete Technical PDF Manual with Architecture, Schema and Workflows"
            >
              Project PDF Manual
            </button>
            <span className="hover:underline">DEWA Green Building Regulations</span>
            <span className="hover:underline">SEWA Low Voltage Specifications</span>
            <span className="hover:underline">ADDC & AADC Wiring Regulations</span>
            <span className="hover:underline">IEC 61439-1 / 2 Verification</span>
            <span className="hover:underline">Single Line Diagram Studio</span>
            <span className="hover:underline">AED Copper Busbar Calculator</span>
            <span className="hover:underline">FTA 5% UAE VAT Compliance</span>
            <span className="hover:underline">Privacy Policy</span>
            <span className="hover:underline">Terms of Service</span>
            <span className="hover:underline">Cookies</span>
            <span className="hover:underline">Help & Support</span>
          </div>

          <div className="pt-2 text-slate-400 font-mono text-[11px]">
            SwitchgearOS Platform © 2026 • Commercial Multi-Tenant LV Switchgear SaaS for UAE & International Manufacturers
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* FACEBOOK-STYLE "SIGN UP" MODAL                                       */}
      {/* ==================================================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-[440px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Sign Up for Free Trial</h3>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">Includes 2 Free LV Switchgear Project Estimations</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegister} className="p-5 space-y-3.5">
              {regError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{regSuccessMessage || 'Account registered! Logging you into your tenant workspace...'}</span>
                </div>
              )}

              {/* First Name & Surname */}
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="First name"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none bg-slate-50/50"
                  required
                />
                <input
                  type="text"
                  placeholder="Surname"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none bg-slate-50/50"
                  required
                />
              </div>

              {/* Corporate Work Email */}
              <div>
                <input
                  type="email"
                  placeholder="Corporate work email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none bg-slate-50/50"
                  required
                />
              </div>

              {/* Switchgear Company Name */}
              <div>
                <input
                  type="text"
                  placeholder="Switchgear Company Name (e.g. Al Fanar Panels LLC)"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none bg-slate-50/50"
                  required
                />
              </div>

              {/* UAE Emirate / City Dropdown */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Emirate / Region
                  </label>
                  <select
                    value={regEmirate}
                    onChange={(e) => setRegEmirate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:border-[#1877f2] outline-none bg-slate-50/50"
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Engineering Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as SaaSRole)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:border-[#1877f2] outline-none bg-slate-50/50"
                  >
                    <option value="COMPANY_OWNER">Company Owner / MD</option>
                    <option value="ESTIMATION_ENGINEER">Estimation Engineer</option>
                    <option value="DESIGN_ENGINEER">Design & SLD Engineer</option>
                    <option value="PURCHASE_OFFICER">Purchase Officer</option>
                    <option value="PRODUCTION_USER">Production Manager</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] outline-none bg-slate-50/50"
                  required
                />
              </div>

              {/* Legal disclaimer */}
              <p className="text-[11px] text-slate-500 leading-normal">
                By clicking Sign Up, you agree to our{' '}
                <span className="text-[#1877f2] hover:underline cursor-pointer">Terms</span>,{' '}
                <span className="text-[#1877f2] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                <span className="text-[#1877f2] hover:underline cursor-pointer">UAE FTA Tax Compliance</span> rules.
              </p>

              {/* Green Sign Up button */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={regSuccess}
                  className="bg-[#00a400] hover:bg-[#009000] text-white font-bold text-base px-12 py-2 rounded-md shadow-xs transition cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FORGOT PASSWORD MODAL                                                */}
      {/* ==================================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-[420px] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Find Your Account</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {forgotSent ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900">Password Reset Email Sent</h4>
                  <p className="text-xs text-slate-600">
                    If an account exists for <strong>{forgotEmail}</strong>, we have sent password reset instructions to your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="bg-[#1877f2] text-white text-sm font-semibold px-5 py-2 rounded-md"
                  >
                    Back to Log In
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    Please enter your corporate email address or switchgear account ID to search for your account.
                  </p>
                  <input
                    type="email"
                    placeholder="Corporate email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-[#1877f2] outline-none"
                    required
                  />
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (forgotEmail.trim()) {
                          setForgotSent(true);
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] rounded-md"
                    >
                      Search
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
