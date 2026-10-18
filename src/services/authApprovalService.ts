// src/services/authApprovalService.ts
// 100% Firebase Authentication + Cloud Firestore Implementation (Zero localStorage)

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  increment,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { CompanyTenant, SaaSPlan, SaaSRole, SaaSSubscription, SaaSUser } from '../types';

export type UserRole = 'ADMIN' | 'CLIENT' | 'ESTIMATION_ENGINEER' | 'COMPANY_OWNER' | 'Admin' | 'Estimator';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'Approved' | 'Pending' | 'Rejected';

export interface RegisteredClientCompany {
  id: string; // tenantId
  numericId?: number;
  companyCode: string;
  companyName: string;
  tradeLicenseNo?: string;
  gstNumber?: string;
  country?: string;
  city?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  vatTrn?: string;
  address?: string;
  status: ApprovalStatus;
  plan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ADVANCED' | 'BUSINESS' | 'ENTERPRISE' | 'Free Trial' | string;
  projectsUsed: number;
  projectsQuota: number;
  maxProjects: number;
  maxUsers: number;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'PAST_DUE' | 'CANCELLED' | 'Trial' | 'Active' | 'Pending' | string;
  subscriptionExpiryDate?: string;
  requestedPlan?: SaaSPlan;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
  paymentReference?: string;
  paymentMethod?: string;
  paymentSubmittedAt?: string;
  targetAuthority?: string;
  submittedAt?: string;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  associatedProjectsCount?: number;
  totalPipelineValueAed?: number;
}

export interface AppUserProfile {
  uid: string;
  email: string;
  password?: string;
  fullName: string;
  name?: string;
  role: UserRole;
  saasRole?: SaaSRole;
  status: 'Approved' | 'Pending' | 'Rejected';
  approved: boolean;
  tenantId: string;
  companyId?: string;
  companyName?: string;
  phone?: string;
  gstNumber?: string;
  tradeLicenseNo?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLoginAt?: string;
}

export interface SubscriptionUpgradeRequest {
  id: string;
  tenantId: string;
  companyName: string;
  userEmail: string;
  requestedPlan: SaaSPlan | string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  upiId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface PlatformPaymentSettings {
  // Global Owner Admin Payment Config
  upiId?: string;
  upiMerchantName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  razorpayPaymentLink?: string;
  whatsappSupportNumber?: string;
  autoApproveUsers?: boolean;

  // International / Bank Transfer configuration
  beneficiaryName: string;
  iban: string;
  swiftCode: string;
  swiftBic?: string;
  vatTrn: string;
  supportEmail: string;
  supportPhone: string;
  requireAdminApprovalOnSignup: boolean;
  defaultTrialProjectsLimit: number;
  trialProjectLimit?: number;
  stripeStarterUrl?: string;
  stripeProfessionalUrl?: string;
  stripeAdvancedUrl?: string;
  stripeBusinessUrl?: string;
  stripeLinks?: {
    STARTER_MONTHLY: string;
    STARTER_ANNUAL: string;
    PROFESSIONAL_MONTHLY: string;
    PROFESSIONAL_ANNUAL: string;
    ADVANCED_MONTHLY: string;
    ADVANCED_ANNUAL: string;
    BUSINESS_MONTHLY: string;
    BUSINESS_ANNUAL: string;
  };
}

export const PLAN_LIMITS: Record<string, { priceMonthly: number; priceAnnual: number; maxProjects: number; maxUsers: number }> = {
  TRIAL: { priceMonthly: 0, priceAnnual: 0, maxProjects: 2, maxUsers: 1 },
  'Free Trial': { priceMonthly: 0, priceAnnual: 0, maxProjects: 2, maxUsers: 1 },
  STARTER: { priceMonthly: 299, priceAnnual: 2990, maxProjects: 10, maxUsers: 2 },
  Starter: { priceMonthly: 299, priceAnnual: 2990, maxProjects: 10, maxUsers: 2 },
  PROFESSIONAL: { priceMonthly: 499, priceAnnual: 4990, maxProjects: 50, maxUsers: 5 },
  Professional: { priceMonthly: 499, priceAnnual: 4990, maxProjects: 50, maxUsers: 5 },
  ADVANCED: { priceMonthly: 999, priceAnnual: 9990, maxProjects: 200, maxUsers: 15 },
  Advanced: { priceMonthly: 999, priceAnnual: 9990, maxProjects: 200, maxUsers: 15 },
  BUSINESS: { priceMonthly: 1999, priceAnnual: 19990, maxProjects: 1000, maxUsers: 50 },
  Business: { priceMonthly: 1999, priceAnnual: 19990, maxProjects: 1000, maxUsers: 50 },
  ENTERPRISE: { priceMonthly: 4999, priceAnnual: 49990, maxProjects: 9999, maxUsers: 250 },
  Enterprise: { priceMonthly: 4999, priceAnnual: 49990, maxProjects: 9999, maxUsers: 250 },
};

export const DEFAULT_PAYMENT_SETTINGS: PlatformPaymentSettings = {
  upiId: 'switchgear.estimation@oksbi',
  upiMerchantName: 'LV Switchgear Estimator SaaS Ltd',
  bankAccountName: 'LV Switchgear Estimator SaaS LLC',
  bankAccountNumber: '03312345678901',
  bankIfsc: 'SBIN0001234',
  bankName: 'Emirates NBD Bank / SBI Commercial',
  razorpayPaymentLink: 'https://rzp.io/l/switchgear-pro',
  whatsappSupportNumber: '+971 50 345 6789',
  autoApproveUsers: true,
  beneficiaryName: 'LV Switchgear Estimator SaaS LLC',
  iban: 'AE29 0331 2345 6789 0123 456',
  swiftCode: 'EBILAEADXXX',
  swiftBic: 'EBILAEADXXX',
  vatTrn: '100234567800003',
  supportEmail: 'billing@switchgearestimator.com',
  supportPhone: '+971 4 345 6789',
  requireAdminApprovalOnSignup: false,
  defaultTrialProjectsLimit: 2,
  trialProjectLimit: 2,
  stripeStarterUrl: '',
  stripeProfessionalUrl: '',
  stripeAdvancedUrl: '',
  stripeBusinessUrl: '',
  stripeLinks: {
    STARTER_MONTHLY: '',
    STARTER_ANNUAL: '',
    PROFESSIONAL_MONTHLY: '',
    PROFESSIONAL_ANNUAL: '',
    ADVANCED_MONTHLY: '',
    ADVANCED_ANNUAL: '',
    BUSINESS_MONTHLY: '',
    BUSINESS_ANNUAL: '',
  },
};

function normalizePlan(plan?: string): SaaSPlan {
  if (!plan) return 'PROFESSIONAL';
  const upper = plan.toUpperCase();
  if (upper.includes('TRIAL') || upper.includes('FREE')) return 'TRIAL';
  if (upper.includes('STARTER')) return 'STARTER';
  if (upper.includes('ADVANCED')) return 'ADVANCED';
  if (upper.includes('BUSINESS')) return 'BUSINESS';
  if (upper.includes('ENTERPRISE')) return 'ENTERPRISE';
  return 'PROFESSIONAL';
}

class AuthApprovalService {
  // In-memory live mirrors populated by real-time Firestore onSnapshot listeners (Zero localStorage)
  private memoryUsers: AppUserProfile[] = [];
  private memoryTenants: RegisteredClientCompany[] = [];
  private memoryRequests: SubscriptionUpgradeRequest[] = [];
  private memoryPaymentSettings: PlatformPaymentSettings = DEFAULT_PAYMENT_SETTINGS;
  private unsubscribeListeners: Array<() => void> = [];
  private initialized: boolean = false;

  constructor() {
    this.initFirestoreListeners();
  }

  // Initialize real-time Cloud Firestore listeners for 100% reactive state without localStorage
  public initFirestoreListeners(): void {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // 1. Payment Settings / Config listener
      const configRef = doc(db, 'settings', 'paymentConfig');
      const unsubConfig = onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
          this.memoryPaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS, ...(snap.data() as PlatformPaymentSettings) };
        } else {
          // Initialize default payment config in Firestore
          setDoc(configRef, DEFAULT_PAYMENT_SETTINGS).catch((err) => {
            console.warn('Initial paymentConfig set notice:', err);
          });
        }
      }, (err) => {
        console.warn('paymentConfig snapshot notice:', err);
      });
      this.unsubscribeListeners.push(unsubConfig);

      // 2. Tenants listener
      const tenantsRef = collection(db, 'tenants');
      const unsubTenants = onSnapshot(tenantsRef, (snapshot) => {
        const list: RegisteredClientCompany[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const planKey = normalizePlan(data.plan);
          const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.PROFESSIONAL;
          list.push({
            id: d.id,
            companyCode: data.companyCode || d.id,
            companyName: data.companyName || 'Switchgear Enterprise',
            tradeLicenseNo: data.tradeLicenseNo || data.gstNumber || '',
            gstNumber: data.gstNumber || '',
            country: data.country || 'United Arab Emirates',
            city: data.city || 'Dubai',
            contactPerson: data.contactPerson || '',
            email: data.email || '',
            phone: data.phone || '',
            vatTrn: data.vatTrn || '',
            status: data.status || 'APPROVED',
            plan: data.plan || 'Free Trial',
            projectsUsed: data.projectsUsed ?? 0,
            projectsQuota: data.projectsQuota ?? limits.maxProjects,
            maxProjects: data.projectsQuota ?? limits.maxProjects,
            maxUsers: data.maxUsers ?? limits.maxUsers,
            subscriptionStatus: data.subscriptionStatus || 'Trial',
            subscriptionExpiryDate: data.subscriptionExpiryDate,
            requestedPlan: data.requestedPlan,
            billingCycle: data.billingCycle,
            paymentReference: data.paymentReference,
            createdAt: data.createdAt,
            submittedAt: data.createdAt,
          });
        });
        this.memoryTenants = list;
      }, (err) => {
        console.warn('tenants snapshot notice:', err);
      });
      this.unsubscribeListeners.push(unsubTenants);

      // 3. Users listener
      const usersRef = collection(db, 'users');
      const unsubUsers = onSnapshot(usersRef, (snapshot) => {
        const list: AppUserProfile[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const isApproved = data.status === 'Approved' || data.approved === true;
          list.push({
            uid: d.id,
            email: data.email || '',
            name: data.name || data.fullName || '',
            fullName: data.name || data.fullName || '',
            role: data.role || 'Estimator',
            saasRole: data.saasRole || (data.role === 'Admin' ? 'PLATFORM_ADMIN' : 'COMPANY_OWNER'),
            status: data.status || (isApproved ? 'Approved' : 'Pending'),
            approved: isApproved,
            tenantId: data.tenantId || '',
            companyId: data.tenantId || data.companyId || '',
            companyName: data.companyName || '',
            phone: data.phone || '',
            gstNumber: data.gstNumber || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        this.memoryUsers = list;
      }, (err) => {
        console.warn('users snapshot notice:', err);
      });
      this.unsubscribeListeners.push(unsubUsers);

      // 4. Subscription Requests listener
      const requestsRef = collection(db, 'subscriptionRequests');
      const unsubRequests = onSnapshot(requestsRef, (snapshot) => {
        const list: SubscriptionUpgradeRequest[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            tenantId: data.tenantId || '',
            companyName: data.companyName || '',
            userEmail: data.userEmail || '',
            requestedPlan: data.requestedPlan || 'Professional',
            amount: data.amount || 0,
            currency: data.currency || 'AED',
            paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
            transactionReference: data.transactionReference || '',
            upiId: data.upiId,
            status: data.status || 'Pending',
            requestedAt: data.requestedAt || new Date().toISOString(),
            approvedAt: data.approvedAt,
            approvedBy: data.approvedBy,
            rejectionReason: data.rejectionReason,
          });
        });
        this.memoryRequests = list;
      }, (err) => {
        console.warn('subscriptionRequests snapshot notice:', err);
      });
      this.unsubscribeListeners.push(unsubRequests);
    } catch (e) {
      console.warn('Firestore real-time listeners initialization notice:', e);
    }
  }

  // ==========================================
  // 1. REGISTRATION (Firebase Auth + Firestore)
  // ==========================================
  async registerUser(params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    companyName: string;
    gstNumber?: string;
    role?: 'Admin' | 'Estimator';
    autoApprove?: boolean;
    city?: string;
  }): Promise<{
    success: boolean;
    requiresApproval?: boolean;
    error?: string;
    user?: SaaSUser;
    company?: CompanyTenant;
    subscription?: SaaSSubscription;
    firebaseUser?: FirebaseUser;
  }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'admin@switchgearestimator.com' || cleanEmail === 'admin@lvswitchgear.com';

    try {
      // 1. Create real account in Firebase Auth
      let fbUser: FirebaseUser;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
        fbUser = userCred.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          // If already in auth, attempt sign-in with password
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, params.password);
          fbUser = cred.user;
        } else {
          return { success: false, error: authErr.message || 'Firebase Authentication registration failed.' };
        }
      }

      // 2. Fetch current payment / auto-approve config from Firestore
      const paymentConfig = await this.getPaymentSettingsAsync();
      const shouldAutoApprove = isAdminEmail || params.autoApprove || paymentConfig.autoApproveUsers || !paymentConfig.requireAdminApprovalOnSignup;
      const status: 'Approved' | 'Pending' = shouldAutoApprove ? 'Approved' : 'Pending';
      const role: UserRole = isAdminEmail ? 'Admin' : (params.role || 'Estimator');

      // 3. Generate Tenant ID and slug
      const tenantId = `tenant_${fbUser.uid.slice(0, 10)}`;
      const companyCode = `CLI-${params.companyName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'LV'}-${fbUser.uid.slice(0, 4).toUpperCase()}`;
      const defaultQuota = paymentConfig.defaultTrialProjectsLimit || paymentConfig.trialProjectLimit || 1;

      // 4. Create Firestore document `users/{uid}`
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userProfile: AppUserProfile = {
        uid: fbUser.uid,
        name: params.name.trim(),
        fullName: params.name.trim(),
        email: cleanEmail,
        phone: params.phone || '',
        companyName: params.companyName.trim(),
        gstNumber: params.gstNumber || '',
        tradeLicenseNo: params.gstNumber || '',
        role,
        saasRole: isAdminEmail ? 'PLATFORM_ADMIN' : 'COMPANY_OWNER',
        status,
        approved: shouldAutoApprove,
        tenantId,
        companyId: tenantId,
        createdAt: new Date().toISOString(),
        approvedAt: shouldAutoApprove ? new Date().toISOString() : undefined,
        approvedBy: shouldAutoApprove ? 'System Auto-Approval' : undefined,
      };

      try {
        await setDoc(userDocRef, userProfile);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${fbUser.uid}`);
      }

      // 5. Create Firestore document `tenants/{tenantId}`
      const tenantDocRef = doc(db, 'tenants', tenantId);
      const tenantData: RegisteredClientCompany = {
        id: tenantId,
        companyCode,
        companyName: params.companyName.trim(),
        tradeLicenseNo: params.gstNumber || '',
        gstNumber: params.gstNumber || '',
        country: 'United Arab Emirates',
        city: params.city || 'Dubai',
        contactPerson: params.name.trim(),
        email: cleanEmail,
        phone: params.phone || '',
        status: shouldAutoApprove ? 'APPROVED' : 'PENDING',
        plan: isAdminEmail ? 'Enterprise' : 'Free Trial',
        projectsUsed: 0,
        projectsQuota: isAdminEmail ? 9999 : defaultQuota,
        maxProjects: isAdminEmail ? 9999 : defaultQuota,
        maxUsers: isAdminEmail ? 250 : 2,
        subscriptionStatus: isAdminEmail ? 'Active' : 'Trial',
        subscriptionExpiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(tenantDocRef, tenantData);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `tenants/${tenantId}`);
      }

      // Update in-memory mirrors immediately
      this.memoryUsers = [userProfile, ...this.memoryUsers.filter(u => u.uid !== fbUser.uid)];
      this.memoryTenants = [tenantData, ...this.memoryTenants.filter(t => t.id !== tenantId)];

      if (!shouldAutoApprove) {
        return {
          success: true,
          requiresApproval: true,
          firebaseUser: fbUser,
        };
      }

      const session = this.buildSessionForCompanyAndUser(tenantData, userProfile);
      return {
        success: true,
        user: session.user,
        company: session.company,
        subscription: session.subscription,
        firebaseUser: fbUser,
      };
    } catch (err: any) {
      console.error('Registration error:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during user registration.',
      };
    }
  }

  // Backwards-compatible customer registration wrapper
  async registerCustomerAccount(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    city?: string;
    role?: SaaSRole;
    phone?: string;
    gstNumber?: string;
  }): Promise<{
    success: boolean;
    requiresApproval?: boolean;
    error?: string;
    user?: SaaSUser;
    company?: CompanyTenant;
    subscription?: SaaSSubscription;
  }> {
    const res = await this.registerUser({
      name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
      email: data.email,
      password: data.password,
      phone: data.phone,
      companyName: data.companyName,
      gstNumber: data.gstNumber,
      city: data.city,
      role: 'Estimator',
    });
    return {
      success: res.success,
      requiresApproval: res.requiresApproval,
      error: res.error,
      user: res.user,
      company: res.company,
      subscription: res.subscription,
    };
  }

  // ==========================================
  // 2. AUTHENTICATION (Firebase Auth + Firestore)
  // ==========================================
  async authenticateUser(email: string, password: string): Promise<{
    success: boolean;
    error?: string;
    user?: SaaSUser;
    company?: CompanyTenant;
    subscription?: SaaSSubscription;
    firebaseUser?: FirebaseUser;
  }> {
    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'admin@switchgearestimator.com' || cleanEmail === 'admin@lvswitchgear.com';

    try {
      // 1. Sign in with real Firebase Auth
      let fbUser: FirebaseUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = cred.user;
      } catch (authErr: any) {
        // If demo credentials don't exist yet in Firebase Auth, auto-bootstrap them!
        if (
          authErr.code === 'auth/user-not-found' || 
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/invalid-login-credentials'
        ) {
          if (isAdminEmail || cleanEmail.includes('alghandiswitchgear') || cleanEmail.includes('danwayeme')) {
            const bootstrapReg = await this.registerUser({
              name: isAdminEmail ? 'Platform Super Admin' : cleanEmail.includes('danway') ? 'Eng. K. Suresh' : 'Eng. Tariq Mansoor',
              email: cleanEmail,
              password,
              companyName: isAdminEmail ? 'SwitchgearOS Global' : cleanEmail.includes('danway') ? 'Danway EME LLC' : 'Al Ghandi Switchgear LLC',
              role: isAdminEmail ? 'Admin' : 'Estimator',
              autoApprove: true,
            });
            if (bootstrapReg.success && bootstrapReg.user && bootstrapReg.company) {
              return {
                success: true,
                user: bootstrapReg.user,
                company: bootstrapReg.company,
                subscription: bootstrapReg.subscription,
                firebaseUser: bootstrapReg.firebaseUser,
              };
            }
          }
        }
        return {
          success: false,
          error: 'Invalid email or password. Please verify your credentials or click "Create new account" to register.',
        };
      }

      // 2. Fetch User Profile from Firestore `users/{uid}`
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        if (isAdminEmail) {
          // Auto-bootstrap admin profile into Firestore
          const bootstrap = await this.registerUser({
            name: 'Platform Super Admin',
            email: cleanEmail,
            password,
            companyName: 'SwitchgearOS Global',
            role: 'Admin',
            autoApprove: true,
          });
          return {
            success: true,
            user: bootstrap.user,
            company: bootstrap.company,
            subscription: bootstrap.subscription,
            firebaseUser: fbUser,
          };
        }
        // Never allow random / unprofiled accounts
        await fbSignOut(auth);
        return {
          success: false,
          error: 'No switchgear tenant profile found for this account. Please register your company.',
        };
      }

      const userProfile = userSnap.data() as AppUserProfile;

      // 3. Strict Approval Status Guard
      if (userProfile.status === 'Pending' && userProfile.role !== 'Admin' && !isAdminEmail) {
        await fbSignOut(auth);
        return {
          success: false,
          error: 'Your account is pending administrator approval. Please contact the platform admin or support to activate your workspace.',
        };
      }

      if (userProfile.status === 'Rejected' && userProfile.role !== 'Admin' && !isAdminEmail) {
        await fbSignOut(auth);
        return {
          success: false,
          error: 'Your account registration was not approved. Please contact support.',
        };
      }

      // 4. Fetch Tenant Profile from Firestore `tenants/{tenantId}`
      const tenantDocRef = doc(db, 'tenants', userProfile.tenantId);
      const tenantSnap = await getDoc(tenantDocRef);

      let tenantData: RegisteredClientCompany;
      if (tenantSnap.exists()) {
        tenantData = tenantSnap.data() as RegisteredClientCompany;
      } else {
        // Fallback or create default tenant if missing
        tenantData = {
          id: userProfile.tenantId,
          companyCode: userProfile.companyName?.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'TENANT',
          companyName: userProfile.companyName || 'Switchgear Workspace',
          status: 'APPROVED',
          plan: 'Free Trial',
          projectsUsed: 0,
          projectsQuota: 1,
          maxProjects: 1,
          maxUsers: 2,
          subscriptionStatus: 'Trial',
          createdAt: new Date().toISOString(),
        };
        await setDoc(tenantDocRef, tenantData);
      }

      const session = this.buildSessionForCompanyAndUser(tenantData, userProfile);
      return {
        success: true,
        user: session.user,
        company: session.company,
        subscription: session.subscription,
        firebaseUser: fbUser,
      };
    } catch (err: any) {
      console.error('Authentication error:', err);
      return {
        success: false,
        error: err.message || 'Authentication failed. Please check your internet connection.',
      };
    }
  }

  // Google Sign-In with Firestore Profile resolution
  async authenticateWithGoogle(): Promise<{
    success: boolean;
    requiresApproval?: boolean;
    error?: string;
    user?: SaaSUser;
    company?: CompanyTenant;
    subscription?: SaaSSubscription;
    firebaseUser?: FirebaseUser;
  }> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase();
      const isAdminEmail = cleanEmail === 'admin@switchgearestimator.com' || cleanEmail === 'admin@lvswitchgear.com';

      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const profile = userSnap.data() as AppUserProfile;
        if (profile.status === 'Pending' && !isAdminEmail && profile.role !== 'Admin') {
          await fbSignOut(auth);
          return {
            success: false,
            requiresApproval: true,
            error: 'Your Google account is pending administrator approval.',
          };
        }
        if (profile.status === 'Rejected' && !isAdminEmail && profile.role !== 'Admin') {
          await fbSignOut(auth);
          return {
            success: false,
            error: 'Your Google account was not approved by the administrator.',
          };
        }

        const tenantSnap = await getDoc(doc(db, 'tenants', profile.tenantId));
        const tenantData = tenantSnap.exists()
          ? (tenantSnap.data() as RegisteredClientCompany)
          : {
              id: profile.tenantId,
              companyCode: 'CLI-GOOGLE',
              companyName: profile.companyName || 'Google Workspace Client',
              status: 'APPROVED' as ApprovalStatus,
              plan: 'Free Trial',
              projectsUsed: 0,
              projectsQuota: 2,
              maxProjects: 2,
              maxUsers: 2,
              subscriptionStatus: 'Trial',
            };

        const session = this.buildSessionForCompanyAndUser(tenantData, profile);
        return {
          success: true,
          user: session.user,
          company: session.company,
          subscription: session.subscription,
          firebaseUser: fbUser,
        };
      }

      // New user registering via Google Sign-In
      const paymentConfig = await this.getPaymentSettingsAsync();
      const shouldAutoApprove = isAdminEmail || paymentConfig.autoApproveUsers || !paymentConfig.requireAdminApprovalOnSignup;
      const tenantId = `tenant_${fbUser.uid.slice(0, 10)}`;
      const companyName = fbUser.displayName ? `${fbUser.displayName} Switchgear LLC` : 'Switchgear Engineering LLC';

      const newProfile: AppUserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Switchgear Engineer',
        fullName: fbUser.displayName || 'Switchgear Engineer',
        email: cleanEmail,
        phone: fbUser.phoneNumber || '',
        companyName,
        role: isAdminEmail ? 'Admin' : 'Estimator',
        saasRole: isAdminEmail ? 'PLATFORM_ADMIN' : 'COMPANY_OWNER',
        status: shouldAutoApprove ? 'Approved' : 'Pending',
        approved: shouldAutoApprove,
        tenantId,
        companyId: tenantId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);

      const newTenant: RegisteredClientCompany = {
        id: tenantId,
        companyCode: `CLI-GOOG-${fbUser.uid.slice(0, 4).toUpperCase()}`,
        companyName,
        status: shouldAutoApprove ? 'APPROVED' : 'PENDING',
        plan: isAdminEmail ? 'Enterprise' : 'Free Trial',
        projectsUsed: 0,
        projectsQuota: isAdminEmail ? 9999 : (paymentConfig.defaultTrialProjectsLimit || 2),
        maxProjects: isAdminEmail ? 9999 : (paymentConfig.defaultTrialProjectsLimit || 2),
        maxUsers: isAdminEmail ? 250 : 2,
        subscriptionStatus: isAdminEmail ? 'Active' : 'Trial',
        subscriptionExpiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'tenants', tenantId), newTenant);

      if (!shouldAutoApprove) {
        await fbSignOut(auth);
        return {
          success: true,
          requiresApproval: true,
        };
      }

      const session = this.buildSessionForCompanyAndUser(newTenant, newProfile);
      return {
        success: true,
        user: session.user,
        company: session.company,
        subscription: session.subscription,
        firebaseUser: fbUser,
      };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in popup was closed before completing.' };
      }
      return { success: false, error: err.message || 'Google Sign-In failed.' };
    }
  }

  // Log out completely from Firebase Auth
  async logout(): Promise<void> {
    await fbSignOut(auth);
  }

  // ==========================================
  // 3. SESSION BUILDER HELPER
  // ==========================================
  buildSessionForCompanyAndUser(comp: RegisteredClientCompany, usr: AppUserProfile): {
    success: boolean;
    user: SaaSUser;
    company: CompanyTenant;
    subscription: SaaSSubscription;
  } {
    const planKey = normalizePlan(comp.plan);
    const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.PROFESSIONAL;
    const maxProjects = comp.projectsQuota ?? comp.maxProjects ?? limits.maxProjects;
    const maxUsers = comp.maxUsers ?? limits.maxUsers;
    const numericCompanyId = comp.numericId || Math.abs(comp.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0));

    const saasRole: SaaSRole = usr.role === 'Admin' || usr.role === 'ADMIN'
      ? 'PLATFORM_ADMIN'
      : (usr.saasRole || 'COMPANY_OWNER');

    const tenant: CompanyTenant = {
      id: numericCompanyId,
      companyCode: comp.companyCode || comp.id,
      companyName: comp.companyName,
      tradeLicenseNo: comp.tradeLicenseNo || comp.gstNumber,
      country: comp.country || 'United Arab Emirates',
      city: comp.city || 'Dubai',
      address: comp.address || `${comp.city || 'Dubai'}, UAE`,
      phone: comp.phone,
      email: comp.email || usr.email,
      vatTrn: comp.vatTrn || comp.gstNumber || '100234567800003',
      currency: 'AED',
      defaultCostingMethod: 'MARKUP',
      defaultMarginPercent: 15.0,
      defaultVatPercent: 5.0,
      plan: planKey,
      subscriptionStatus: comp.subscriptionStatus === 'Trial' ? 'TRIAL' : comp.subscriptionStatus === 'Active' ? 'ACTIVE' : 'ACTIVE',
      maxProjects,
      maxUsers,
      requestedPlan: comp.requestedPlan,
      paymentReference: comp.paymentReference,
    };

    const saasUser: SaaSUser = {
      id: numericCompanyId + 1,
      uid: usr.uid,
      companyId: numericCompanyId,
      email: usr.email,
      fullName: usr.fullName || usr.name || 'Switchgear User',
      role: saasRole,
      phone: usr.phone || comp.phone,
      isActive: usr.status === 'Approved' || usr.approved,
    };

    const subscription: SaaSSubscription = {
      id: numericCompanyId,
      companyId: numericCompanyId,
      plan: planKey,
      priceAedMonthly: limits.priceMonthly,
      billingCycle: comp.billingCycle || 'MONTHLY',
      status: comp.subscriptionStatus === 'Trial' ? 'TRIAL' : 'ACTIVE',
      maxProjects,
      maxUsers,
      autoRenew: true,
    };

    return {
      success: true,
      user: saasUser,
      company: tenant,
      subscription,
    };
  }

  // ==========================================
  // 4. USERS & CLIENT COMPANIES (Real-time Firestore)
  // ==========================================
  getUsers(): AppUserProfile[] {
    return this.memoryUsers;
  }

  getClientCompanies(): RegisteredClientCompany[] {
    return this.memoryTenants;
  }

  async fetchUsersAsync(): Promise<AppUserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: AppUserProfile[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          uid: d.id,
          email: data.email || '',
          name: data.name || data.fullName || '',
          fullName: data.name || data.fullName || '',
          role: data.role || 'Estimator',
          saasRole: data.saasRole,
          status: data.status || 'Approved',
          approved: data.status === 'Approved' || data.approved === true,
          tenantId: data.tenantId || '',
          companyId: data.tenantId || '',
          companyName: data.companyName || '',
          phone: data.phone,
          gstNumber: data.gstNumber,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      this.memoryUsers = list;
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'users');
    }
  }

  async fetchTenantsAsync(): Promise<RegisteredClientCompany[]> {
    try {
      const snap = await getDocs(collection(db, 'tenants'));
      const list: RegisteredClientCompany[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          id: d.id,
          companyCode: data.companyCode || d.id,
          companyName: data.companyName || '',
          status: data.status || 'APPROVED',
          plan: data.plan || 'Free Trial',
          projectsUsed: data.projectsUsed ?? 0,
          projectsQuota: data.projectsQuota ?? 1,
          maxProjects: data.projectsQuota ?? 1,
          maxUsers: data.maxUsers ?? 2,
          subscriptionStatus: data.subscriptionStatus || 'Trial',
          subscriptionExpiryDate: data.subscriptionExpiryDate,
          createdAt: data.createdAt,
        });
      });
      this.memoryTenants = list;
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'tenants');
    }
  }

  // Approve User in Firestore
  async approveUser(uid: string, role?: UserRole, approvedBy: string = 'Platform Admin'): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: 'Approved',
        approved: true,
        role: role || 'Estimator',
        approvedAt: new Date().toISOString(),
        approvedBy,
      });
      const idx = this.memoryUsers.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        this.memoryUsers[idx].status = 'Approved';
        this.memoryUsers[idx].approved = true;
        if (role) this.memoryUsers[idx].role = role;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }

  // Reject User in Firestore
  async rejectUser(uid: string, reason?: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: 'Rejected',
        approved: false,
        rejectionReason: reason || 'Registration details could not be verified',
      });
      const idx = this.memoryUsers.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        this.memoryUsers[idx].status = 'Rejected';
        this.memoryUsers[idx].approved = false;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }

  // Update user role
  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        saasRole: newRole === 'Admin' ? 'PLATFORM_ADMIN' : 'COMPANY_OWNER',
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  }

  // Approve Tenant in Firestore
  async approveCompany(companyId: string, approvedBy: string = 'Platform Admin'): Promise<RegisteredClientCompany | null> {
    try {
      const tenantRef = doc(db, 'tenants', companyId);
      await updateDoc(tenantRef, {
        status: 'APPROVED',
        subscriptionStatus: 'Active',
        approvedAt: new Date().toISOString(),
        approvedBy,
      });

      // Also approve all users for this tenant
      const usersToApprove = this.memoryUsers.filter(u => u.tenantId === companyId || u.companyId === companyId);
      for (const u of usersToApprove) {
        await this.approveUser(u.uid, u.role, approvedBy);
      }

      const match = this.memoryTenants.find(t => t.id === companyId);
      if (match) {
        match.status = 'APPROVED';
        match.subscriptionStatus = 'Active';
        return match;
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tenants/${companyId}`);
    }
  }

  // Reject Tenant in Firestore
  async rejectCompany(companyId: string, reason: string = 'Verification declined'): Promise<RegisteredClientCompany | null> {
    try {
      const tenantRef = doc(db, 'tenants', companyId);
      await updateDoc(tenantRef, {
        status: 'REJECTED',
        subscriptionStatus: 'Cancelled',
        rejectionReason: reason,
      });
      const match = this.memoryTenants.find(t => t.id === companyId);
      if (match) {
        match.status = 'REJECTED';
        match.subscriptionStatus = 'Cancelled';
        return match;
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tenants/${companyId}`);
    }
  }

  // Update Tenant Plan and Quota in Firestore
  async updateCompanyPlanAndQuota(
    companyId: string,
    newPlan: SaaSPlan | string,
    customMaxProjects?: number,
    customMaxUsers?: number,
    approvedBy: string = 'Platform Admin'
  ): Promise<RegisteredClientCompany | null> {
    const limits = PLAN_LIMITS[normalizePlan(newPlan)] || PLAN_LIMITS.PROFESSIONAL;
    const quota = customMaxProjects ?? limits.maxProjects;
    const usersQuota = customMaxUsers ?? limits.maxUsers;

    try {
      const tenantRef = doc(db, 'tenants', companyId);
      await updateDoc(tenantRef, {
        plan: newPlan,
        projectsQuota: quota,
        maxProjects: quota,
        maxUsers: usersQuota,
        status: 'APPROVED',
        subscriptionStatus: newPlan.toString().toUpperCase().includes('TRIAL') ? 'Trial' : 'Active',
        approvedAt: new Date().toISOString(),
        approvedBy,
      });

      const match = this.memoryTenants.find(t => t.id === companyId || t.companyCode === companyId);
      if (match) {
        match.plan = newPlan;
        match.projectsQuota = quota;
        match.maxProjects = quota;
        match.maxUsers = usersQuota;
        match.status = 'APPROVED';
        return match;
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tenants/${companyId}`);
    }
  }

  // ==========================================
  // 5. SUBSCRIPTION REQUESTS (Firestore)
  // ==========================================
  async submitSubscriptionRequest(request: {
    tenantId: string;
    companyName: string;
    userEmail: string;
    requestedPlan: SaaSPlan | string;
    amount?: number;
    currency?: string;
    paymentMethod: string;
    transactionReference: string;
    upiId?: string;
  }): Promise<SubscriptionUpgradeRequest> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const limits = PLAN_LIMITS[normalizePlan(request.requestedPlan)] || PLAN_LIMITS.PROFESSIONAL;
    const amount = request.amount || limits.priceMonthly;

    const newRequest: SubscriptionUpgradeRequest = {
      id: requestId,
      tenantId: request.tenantId,
      companyName: request.companyName,
      userEmail: request.userEmail,
      requestedPlan: request.requestedPlan,
      amount,
      currency: request.currency || 'AED',
      paymentMethod: request.paymentMethod,
      transactionReference: request.transactionReference,
      upiId: request.upiId,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'subscriptionRequests', requestId), newRequest);
      // Also update tenant's requestedPlan and paymentReference
      await updateDoc(doc(db, 'tenants', request.tenantId), {
        requestedPlan: request.requestedPlan,
        paymentReference: request.transactionReference,
        subscriptionStatus: 'Pending',
      });
      return newRequest;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `subscriptionRequests/${requestId}`);
    }
  }

  // Backwards-compatible plan upgrade submission
  async submitPaymentUpgradeRequest(
    paramsOrCompanyCode: string | {
      companyCode: string;
      companyEmail?: string;
      requestedPlan: SaaSPlan;
      billingCycle?: 'MONTHLY' | 'ANNUAL';
      paymentMethod?: 'card' | 'bank_transfer' | 'upi';
      paymentReference: string;
      autoActivate?: boolean;
    },
    planArg?: SaaSPlan,
    paymentRefArg?: string,
  ): Promise<RegisteredClientCompany | null> {
    let companyCode: string;
    let requestedPlan: SaaSPlan;
    let paymentReference: string;

    if (typeof paramsOrCompanyCode === 'string') {
      companyCode = paramsOrCompanyCode;
      requestedPlan = planArg || 'PROFESSIONAL';
      paymentReference = paymentRefArg || 'REF-PENDING';
    } else {
      companyCode = paramsOrCompanyCode.companyCode;
      requestedPlan = paramsOrCompanyCode.requestedPlan;
      paymentReference = paramsOrCompanyCode.paymentReference;
    }

    const tenant = this.memoryTenants.find(t => t.id === companyCode || t.companyCode === companyCode) || this.memoryTenants[0];
    const tenantId = tenant ? tenant.id : companyCode;

    await this.submitSubscriptionRequest({
      tenantId,
      companyName: tenant?.companyName || 'Switchgear Client',
      userEmail: tenant?.email || auth.currentUser?.email || '',
      requestedPlan,
      paymentMethod: 'BANK_TRANSFER',
      transactionReference: paymentReference,
    });

    if (tenant) {
      tenant.requestedPlan = requestedPlan;
      tenant.paymentReference = paymentReference;
      tenant.subscriptionStatus = 'Pending';
      return tenant;
    }
    return null;
  }

  getSubscriptionRequests(): SubscriptionUpgradeRequest[] {
    return this.memoryRequests;
  }

  // Approve subscription upgrade request
  async approveSubscriptionRequest(requestId: string, approvedBy: string = 'Platform Owner'): Promise<void> {
    try {
      const reqRef = doc(db, 'subscriptionRequests', requestId);
      const snap = await getDoc(reqRef);
      if (!snap.exists()) return;

      const reqData = snap.data() as SubscriptionUpgradeRequest;
      await updateDoc(reqRef, {
        status: 'Approved',
        approvedAt: new Date().toISOString(),
        approvedBy,
      });

      // Update the tenant's plan and quota
      await this.updateCompanyPlanAndQuota(reqData.tenantId, reqData.requestedPlan);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `subscriptionRequests/${requestId}`);
    }
  }

  // Reject subscription upgrade request
  async rejectSubscriptionRequest(requestId: string, reason?: string): Promise<void> {
    try {
      const reqRef = doc(db, 'subscriptionRequests', requestId);
      await updateDoc(reqRef, {
        status: 'Rejected',
        rejectionReason: reason || 'Payment reference could not be verified',
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `subscriptionRequests/${requestId}`);
    }
  }

  // ==========================================
  // 6. PAYMENT CONFIGURATION (`settings/paymentConfig`)
  // ==========================================
  getPaymentSettings(): PlatformPaymentSettings {
    return this.memoryPaymentSettings;
  }

  async getPaymentSettingsAsync(): Promise<PlatformPaymentSettings> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'paymentConfig'));
      if (snap.exists()) {
        this.memoryPaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS, ...(snap.data() as PlatformPaymentSettings) };
        return this.memoryPaymentSettings;
      }
      return DEFAULT_PAYMENT_SETTINGS;
    } catch (e) {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }

  async savePaymentSettings(settings: PlatformPaymentSettings): Promise<PlatformPaymentSettings> {
    try {
      const configRef = doc(db, 'settings', 'paymentConfig');
      await setDoc(configRef, settings, { merge: true });
      this.memoryPaymentSettings = settings;
      return settings;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/paymentConfig');
    }
  }

  // ==========================================
  // 7. QUOTA ENFORCEMENT ON TENANTS
  // ==========================================
  async checkProjectQuota(tenantId: string): Promise<{
    allowed: boolean;
    projectsUsed: number;
    projectsQuota: number;
    message?: string;
  }> {
    try {
      const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
      if (!tenantSnap.exists()) {
        return { allowed: true, projectsUsed: 0, projectsQuota: 50 };
      }
      const data = tenantSnap.data() as RegisteredClientCompany;
      const projectsUsed = data.projectsUsed || 0;
      const projectsQuota = data.projectsQuota ?? (PLAN_LIMITS[normalizePlan(data.plan)]?.maxProjects || 1);

      const allowed = projectsUsed < projectsQuota;
      return {
        allowed,
        projectsUsed,
        projectsQuota,
        message: allowed
          ? undefined
          : `Plan project limit reached (${projectsUsed}/${projectsQuota} projects). Please upgrade your subscription to create additional switchboard projects.`,
      };
    } catch (e) {
      return { allowed: true, projectsUsed: 0, projectsQuota: 50 };
    }
  }

  async incrementProjectsUsed(tenantId: string): Promise<void> {
    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      await updateDoc(tenantRef, {
        projectsUsed: increment(1),
      });
    } catch (e) {
      console.warn('Increment projectsUsed notice:', e);
    }
  }

  async decrementProjectsUsed(tenantId: string): Promise<void> {
    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      await updateDoc(tenantRef, {
        projectsUsed: increment(-1),
      });
    } catch (e) {
      console.warn('Decrement projectsUsed notice:', e);
    }
  }

  // User registration helper
  registerUserSignup(
    emailOrObj: string | {
      email: string;
      fullName: string;
      password?: string;
      phone?: string;
      companyId?: string;
      companyName?: string;
      role?: UserRole;
    },
    fullNameArg?: string,
    companyNameArg?: string,
    roleArg: UserRole = 'COMPANY_OWNER',
    passwordArg?: string,
    companyCodeArg?: string
  ): AppUserProfile {
    let email: string;
    let fullName: string;
    let companyName: string | undefined;
    let role: UserRole = 'COMPANY_OWNER';
    let password = 'Client@2026';
    let companyId: string | undefined;
    let phone: string | undefined;

    if (typeof emailOrObj === 'string') {
      email = emailOrObj.toLowerCase().trim();
      fullName = (fullNameArg || email).trim();
      companyName = companyNameArg;
      role = roleArg;
      password = passwordArg || 'Client@2026';
      companyId = companyCodeArg;
    } else {
      email = emailOrObj.email.toLowerCase().trim();
      fullName = emailOrObj.fullName.trim();
      companyName = emailOrObj.companyName;
      role = emailOrObj.role || 'COMPANY_OWNER';
      password = emailOrObj.password || 'Client@2026';
      companyId = emailOrObj.companyId;
      phone = emailOrObj.phone;
    }

    const uid = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: AppUserProfile = {
      uid,
      email,
      password,
      fullName,
      name: fullName,
      phone,
      role,
      saasRole: role as any,
      status: 'Approved',
      approved: true,
      tenantId: companyId || 'tenant_default',
      companyId,
      companyName,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore asynchronously
    setDoc(doc(db, 'users', uid), newUser).catch((err) => {
      console.warn('registerUserSignup setDoc notice:', err);
    });

    this.memoryUsers = [newUser, ...this.memoryUsers.filter(u => u.email !== email)];
    return newUser;
  }

  registerCompany(data: Partial<RegisteredClientCompany>): RegisteredClientCompany {
    const id = data.id || `tenant_${Date.now()}`;
    const code = data.companyCode || `CLI-${(data.companyName || 'LV').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}`;
    const newComp: RegisteredClientCompany = {
      id,
      companyCode: code,
      companyName: data.companyName || 'New Switchgear Client LLC',
      tradeLicenseNo: data.tradeLicenseNo || data.gstNumber || '',
      gstNumber: data.gstNumber || '',
      country: data.country || 'United Arab Emirates',
      city: data.city || 'Dubai',
      contactPerson: data.contactPerson || '',
      email: data.email || '',
      phone: data.phone || '',
      vatTrn: data.vatTrn || '',
      status: 'APPROVED',
      plan: data.plan || 'Free Trial',
      projectsUsed: 0,
      projectsQuota: data.projectsQuota || 1,
      maxProjects: data.projectsQuota || 1,
      maxUsers: data.maxUsers || 2,
      subscriptionStatus: 'Trial',
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'tenants', id), newComp).catch(err => {
      console.warn('registerCompany setDoc notice:', err);
    });
    this.memoryTenants = [newComp, ...this.memoryTenants.filter(t => t.id !== id)];
    return newComp;
  }

  updateUserPassword(uid: string, newPassword: string): AppUserProfile | null {
    const match = this.memoryUsers.find(u => u.uid === uid);
    if (match) {
      match.password = newPassword;
      updateDoc(doc(db, 'users', uid), { password: newPassword }).catch(err => {
        console.warn('updateUserPassword notice:', err);
      });
      return match;
    }
    return null;
  }
}

export const authApprovalService = new AuthApprovalService();
