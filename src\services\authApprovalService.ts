// src/services/authApprovalService.ts
import { db } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
} from 'firebase/firestore';
import { CompanyTenant, SaaSPlan, SaaSRole, SaaSSubscription, SaaSUser } from '../types';

export type UserRole = 'ADMIN' | 'CLIENT' | 'ESTIMATION_ENGINEER' | 'COMPANY_OWNER';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RegisteredClientCompany {
  id: string; // registrationId or companyId
  numericId?: number;
  companyCode: string;
  companyName: string;
  tradeLicenseNo: string;
  country: string;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
  vatTrn?: string;
  address?: string;
  status: ApprovalStatus;
  plan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ADVANCED' | 'BUSINESS' | 'ENTERPRISE';
  maxProjects: number;
  maxUsers: number;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'PAST_DUE' | 'CANCELLED';
  requestedPlan?: SaaSPlan;
  billingCycle?: 'MONTHLY' | 'ANNUAL';
  paymentReference?: string;
  paymentMethod?: string;
  paymentSubmittedAt?: string;
  targetAuthority: string;
  submittedAt: string;
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
  role: UserRole;
  saasRole?: SaaSRole;
  approved: boolean;
  companyId?: string;
  companyName?: string;
  phone?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLoginAt?: string;
}

export interface PlatformPaymentSettings {
  beneficiaryName: string;
  bankName: string;
  iban: string;
  swiftCode: string;
  vatTrn: string;
  supportEmail: string;
  supportPhone: string;
  requireAdminApprovalOnSignup: boolean;
  defaultTrialProjectsLimit: number;
  stripeLinks: {
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

export const PLAN_LIMITS: Record<SaaSPlan, { priceMonthly: number; priceAnnual: number; maxProjects: number; maxUsers: number }> = {
  TRIAL: { priceMonthly: 0, priceAnnual: 0, maxProjects: 2, maxUsers: 1 },
  STARTER: { priceMonthly: 299, priceAnnual: 2990, maxProjects: 10, maxUsers: 2 },
  PROFESSIONAL: { priceMonthly: 499, priceAnnual: 4990, maxProjects: 50, maxUsers: 5 },
  ADVANCED: { priceMonthly: 999, priceAnnual: 9990, maxProjects: 200, maxUsers: 15 },
  BUSINESS: { priceMonthly: 1999, priceAnnual: 19990, maxProjects: 1000, maxUsers: 50 },
};

const STORAGE_KEYS = {
  CLIENT_COMPANIES: 'lv_estimator_client_companies_v2',
  APP_USERS: 'lv_estimator_app_users_v2',
  CURRENT_ACTIVE_USER: 'lv_estimator_active_session_user_v1',
  PLATFORM_PAYMENT_SETTINGS: 'lv_estimator_platform_payment_settings_v1',
};

const DEFAULT_PAYMENT_SETTINGS: PlatformPaymentSettings = {
  beneficiaryName: 'LV Switchgear Estimator SaaS LLC',
  bankName: 'Emirates NBD Bank PJSC (Dubai)',
  iban: 'AE29 0331 2345 6789 0123 456',
  swiftCode: 'EBILAEADXXX',
  vatTrn: '100234567800003',
  supportEmail: 'billing@lvestimator.ae',
  supportPhone: '+971 4 345 6789',
  requireAdminApprovalOnSignup: false,
  defaultTrialProjectsLimit: 2,
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

const INITIAL_CLIENT_COMPANIES: RegisteredClientCompany[] = [
  {
    id: 'comp-ags-01',
    numericId: 1,
    companyCode: 'EMIRATES-LV-01',
    companyName: 'Al Ghandi Switchgear LLC',
    tradeLicenseNo: 'DXB-TL-482910',
    country: 'United Arab Emirates',
    city: 'Dubai',
    contactPerson: 'Eng. Tariq Mansoor',
    email: 'tariq.m@alghandiswitchgear.ae',
    phone: '+971 4 231 8800',
    vatTrn: '100234567800003',
    address: 'Ras Al Khor Industrial Area 2, Dubai, UAE',
    status: 'APPROVED',
    plan: 'BUSINESS',
    maxProjects: 1000,
    maxUsers: 50,
    subscriptionStatus: 'ACTIVE',
    targetAuthority: 'DEWA / SEWA',
    submittedAt: '2026-08-15T09:30:00Z',
    approvedAt: '2026-08-16T11:00:00Z',
    approvedBy: 'System Administrator',
    associatedProjectsCount: 4,
    totalPipelineValueAed: 1850000,
  },
  {
    id: 'comp-dan-02',
    numericId: 2,
    companyCode: 'GULF-PANELS-02',
    companyName: 'Danway Electrical & Mechanical Engineering',
    tradeLicenseNo: 'SHJ-TL-882194',
    country: 'United Arab Emirates',
    city: 'Sharjah',
    contactPerson: 'Eng. K. Suresh',
    email: 'suresh.k@danwayeme.com',
    phone: '+971 6 534 5111',
    vatTrn: '100987654300003',
    address: 'Industrial Area 13, Sharjah, UAE',
    status: 'APPROVED',
    plan: 'ADVANCED',
    maxProjects: 200,
    maxUsers: 15,
    subscriptionStatus: 'ACTIVE',
    targetAuthority: 'SEWA / DEWA / FEWA',
    submittedAt: '2026-08-20T14:15:00Z',
    approvedAt: '2026-08-21T10:00:00Z',
    approvedBy: 'System Administrator',
    associatedProjectsCount: 3,
    totalPipelineValueAed: 2420000,
  },
  {
    id: 'comp-pps-03',
    numericId: 3,
    companyCode: 'CLI-PPS-03',
    companyName: 'Power Plus Switchboards Manufacturing LLC',
    tradeLicenseNo: 'DXB-TL-991204',
    country: 'United Arab Emirates',
    city: 'Dubai',
    contactPerson: 'Eng. Hisham Al-Sayed',
    email: 'hisham.s@powerplusswitchgear.com',
    phone: '+971 4 883 4500',
    vatTrn: '100456123400003',
    address: 'Dubai Investments Park (DIP 1), Dubai, UAE',
    status: 'APPROVED',
    plan: 'PROFESSIONAL',
    maxProjects: 50,
    maxUsers: 5,
    subscriptionStatus: 'ACTIVE',
    targetAuthority: 'DEWA',
    submittedAt: '2026-09-02T11:45:00Z',
    approvedAt: '2026-09-03T08:30:00Z',
    approvedBy: 'System Administrator',
    associatedProjectsCount: 2,
    totalPipelineValueAed: 960000,
  },
  {
    id: 'comp-gulf-04',
    numericId: 4,
    companyCode: 'CLI-GEC-04',
    companyName: 'Gulf Electro-Mechanical Contracting LLC',
    tradeLicenseNo: 'AUH-CN-330192',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    contactPerson: 'Mustafa Al-Hashimi',
    email: 'm.hashimi@gulfelectro.ae',
    phone: '+971 2 642 9911',
    vatTrn: '100345678900003',
    address: 'Musaffah Industrial M-14, Abu Dhabi, UAE',
    status: 'PENDING',
    plan: 'TRIAL',
    maxProjects: 2,
    maxUsers: 1,
    subscriptionStatus: 'PENDING_APPROVAL',
    requestedPlan: 'PROFESSIONAL',
    paymentReference: 'ENBD-TRF-8829104',
    paymentMethod: 'BANK_TRANSFER',
    paymentSubmittedAt: '2026-10-16T16:20:00Z',
    targetAuthority: 'ADDC / AADC',
    submittedAt: '2026-10-16T16:20:00Z',
    associatedProjectsCount: 0,
    totalPipelineValueAed: 0,
  },
  {
    id: 'comp-arab-05',
    numericId: 5,
    companyCode: 'CLI-APE-05',
    companyName: 'Arabian Power & Engineering Systems',
    tradeLicenseNo: 'RAK-TL-110293',
    country: 'United Arab Emirates',
    city: 'Ras Al Khaimah',
    contactPerson: 'Zaid Al-Balooshi',
    email: 'procurement@arabianpower.ae',
    phone: '+971 7 244 8822',
    address: 'Al Hamra Industrial Zone, RAK, UAE',
    status: 'PENDING',
    plan: 'TRIAL',
    maxProjects: 2,
    maxUsers: 1,
    subscriptionStatus: 'TRIAL',
    targetAuthority: 'FEWA / Etihad WE',
    submittedAt: '2026-10-17T08:10:00Z',
    associatedProjectsCount: 0,
    totalPipelineValueAed: 0,
  }
];

const INITIAL_USERS: AppUserProfile[] = [
  {
    uid: 'admin-lead-01',
    email: 'admin@lvswitchgear.com',
    password: 'Admin@2026',
    fullName: 'Platform Owner & Super Admin',
    role: 'ADMIN',
    saasRole: 'PLATFORM_ADMIN',
    approved: true,
    companyId: 'comp-ags-01',
    companyName: 'SwitchgearOS Platform HQ',
    createdAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-08-01T08:00:00Z',
    approvedBy: 'Super Admin',
  },
  {
    uid: 'user-client-01',
    email: 'tariq.m@alghandiswitchgear.ae',
    password: 'Client@2026',
    fullName: 'Eng. Tariq Mansoor',
    role: 'COMPANY_OWNER',
    saasRole: 'COMPANY_OWNER',
    approved: true,
    companyId: 'comp-ags-01',
    companyName: 'Al Ghandi Switchgear LLC',
    createdAt: '2026-08-15T09:30:00Z',
    approvedAt: '2026-08-16T11:00:00Z',
    approvedBy: 'Platform Owner & Super Admin',
  },
  {
    uid: 'user-client-02',
    email: 'suresh.k@danwayeme.com',
    password: 'Client@2026',
    fullName: 'Eng. K. Suresh',
    role: 'ESTIMATION_ENGINEER',
    saasRole: 'ESTIMATION_ENGINEER',
    approved: true,
    companyId: 'comp-dan-02',
    companyName: 'Danway Electrical & Mechanical Engineering',
    createdAt: '2026-08-20T14:15:00Z',
    approvedAt: '2026-08-21T10:00:00Z',
    approvedBy: 'Platform Owner & Super Admin',
  },
  {
    uid: 'user-pending-01',
    email: 'm.hashimi@gulfelectro.ae',
    password: 'Client@2026',
    fullName: 'Mustafa Al-Hashimi',
    role: 'COMPANY_OWNER',
    saasRole: 'COMPANY_OWNER',
    approved: false,
    companyId: 'comp-gulf-04',
    companyName: 'Gulf Electro-Mechanical Contracting LLC',
    createdAt: '2026-10-16T16:20:00Z',
  },
  {
    uid: 'user-pending-02',
    email: 'khalid.engineer@gmail.com',
    password: 'Client@2026',
    fullName: 'Eng. Khalid Mansoori',
    role: 'ESTIMATION_ENGINEER',
    saasRole: 'ESTIMATION_ENGINEER',
    approved: false,
    companyId: 'comp-arab-05',
    companyName: 'Arabian Power & Engineering Systems',
    createdAt: '2026-10-17T09:40:00Z',
  }
];

function normalizePlan(plan: string): SaaSPlan {
  if (plan === 'ENTERPRISE' || plan === 'BUSINESS') return 'BUSINESS';
  if (plan === 'ADVANCED') return 'ADVANCED';
  if (plan === 'PROFESSIONAL') return 'PROFESSIONAL';
  if (plan === 'STARTER') return 'STARTER';
  return 'TRIAL';
}

class AuthApprovalService {
  // Sync to Firestore if online, with graceful fallback
  private async syncCompanyToFirestore(company: RegisteredClientCompany) {
    try {
      const docRef = doc(db, 'companyRegistrations', company.id);
      await setDoc(docRef, {
        registrationId: company.id,
        companyCode: company.companyCode,
        companyName: company.companyName,
        email: company.email,
        status: company.status,
        submittedAt: company.submittedAt,
        tradeLicenseNo: company.tradeLicenseNo,
        country: company.country,
        city: company.city,
        contactPerson: company.contactPerson,
        phone: company.phone,
        plan: company.plan,
        maxProjects: company.maxProjects,
        maxUsers: company.maxUsers,
        subscriptionStatus: company.subscriptionStatus || 'TRIAL',
        requestedPlan: company.requestedPlan || null,
        paymentReference: company.paymentReference || null,
        targetAuthority: company.targetAuthority,
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore company sync notice (offline or rule mode):', e);
    }
  }

  private async syncUserToFirestore(user: AppUserProfile) {
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        role: user.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
        approved: user.approved,
        companyId: user.companyId || '',
        fullName: user.fullName,
        createdAt: user.createdAt,
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore user sync notice (offline or rule mode):', e);
    }
  }

  // --- PLATFORM PAYMENT SETTINGS ---
  getPaymentSettings(): PlatformPaymentSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.PLATFORM_PAYMENT_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_PAYMENT_SETTINGS, JSON.stringify(DEFAULT_PAYMENT_SETTINGS));
      return DEFAULT_PAYMENT_SETTINGS;
    }
    try {
      return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  }

  savePaymentSettings(settings: PlatformPaymentSettings): void {
    localStorage.setItem(STORAGE_KEYS.PLATFORM_PAYMENT_SETTINGS, JSON.stringify(settings));
  }

  // --- CLIENT COMPANIES ---
  getClientCompanies(): RegisteredClientCompany[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_COMPANIES);
    if (!raw) {
      this.saveClientCompanies(INITIAL_CLIENT_COMPANIES);
      return INITIAL_CLIENT_COMPANIES;
    }
    try {
      const parsed: RegisteredClientCompany[] = JSON.parse(raw);
      return parsed.map(c => ({
        ...c,
        maxProjects: c.maxProjects ?? PLAN_LIMITS[normalizePlan(c.plan)].maxProjects,
        maxUsers: c.maxUsers ?? PLAN_LIMITS[normalizePlan(c.plan)].maxUsers,
      }));
    } catch {
      return INITIAL_CLIENT_COMPANIES;
    }
  }

  saveClientCompanies(list: RegisteredClientCompany[]): void {
    localStorage.setItem(STORAGE_KEYS.CLIENT_COMPANIES, JSON.stringify(list));
  }

  registerCompany(data: {
    companyName: string;
    tradeLicenseNo: string;
    country: string;
    city: string;
    contactPerson: string;
    email: string;
    phone: string;
    vatTrn?: string;
    address?: string;
    targetAuthority?: string;
    plan?: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ADVANCED' | 'BUSINESS' | 'ENTERPRISE';
    maxProjects?: number;
    password?: string;
    autoApprove?: boolean;
  }): RegisteredClientCompany {
    const list = this.getClientCompanies();
    const id = `comp-${Date.now().toString(36)}`;
    const count = list.length + 1;
    const companyCode = `CLI-${data.companyName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'NEW'}-${String(count).padStart(2, '0')}`;
    const planKey = normalizePlan(data.plan || 'TRIAL');
    const limits = PLAN_LIMITS[planKey];
    const isApproved = data.autoApprove ?? false;

    const newCompany: RegisteredClientCompany = {
      id,
      numericId: Date.now(),
      companyCode,
      companyName: data.companyName,
      tradeLicenseNo: data.tradeLicenseNo || `TL-${Math.floor(100000 + Math.random() * 900000)}`,
      country: data.country || 'United Arab Emirates',
      city: data.city || 'Dubai',
      contactPerson: data.contactPerson,
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '+971 4 000 0000',
      vatTrn: data.vatTrn,
      address: data.address || `${data.city || 'Dubai'} Industrial Area, UAE`,
      status: isApproved ? 'APPROVED' : 'PENDING',
      plan: planKey,
      maxProjects: data.maxProjects ?? limits.maxProjects,
      maxUsers: limits.maxUsers,
      subscriptionStatus: planKey === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
      targetAuthority: data.targetAuthority || 'DEWA / SEWA',
      submittedAt: new Date().toISOString(),
      approvedAt: isApproved ? new Date().toISOString() : undefined,
      approvedBy: isApproved ? 'Platform Admin' : undefined,
      associatedProjectsCount: 0,
      totalPipelineValueAed: 0,
    };

    const updated = [newCompany, ...list];
    this.saveClientCompanies(updated);
    this.syncCompanyToFirestore(newCompany);

    // Also create user login record if email is not yet registered
    const users = this.getUsers();
    const cleanEmail = data.email.trim().toLowerCase();
    if (!users.some(u => u.email.toLowerCase() === cleanEmail)) {
      const newUser: AppUserProfile = {
        uid: `uid-${Date.now().toString(36)}`,
        email: cleanEmail,
        password: data.password || 'Client@2026',
        fullName: data.contactPerson || cleanEmail.split('@')[0],
        role: 'COMPANY_OWNER',
        saasRole: 'COMPANY_OWNER',
        approved: isApproved,
        companyId: newCompany.id,
        companyName: newCompany.companyName,
        phone: data.phone,
        createdAt: new Date().toISOString(),
        approvedAt: isApproved ? new Date().toISOString() : undefined,
        approvedBy: isApproved ? 'Platform Admin' : undefined,
      };
      this.saveUsers([newUser, ...users]);
      this.syncUserToFirestore(newUser);
    }

    return newCompany;
  }

  // Self-service customer registration from Login Page
  registerCustomerAccount(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    city: string;
    role: SaaSRole;
  }): {
    success: boolean;
    requiresApproval?: boolean;
    error?: string;
    user?: SaaSUser;
    company?: CompanyTenant;
    subscription?: SaaSSubscription;
  } {
    const cleanEmail = data.email.trim().toLowerCase();
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    const settings = this.getPaymentSettings();
    const autoApprove = !settings.requireAdminApprovalOnSignup;
    const trialProjects = settings.defaultTrialProjectsLimit || 2;
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    const createdComp = this.registerCompany({
      companyName: data.companyName.trim(),
      tradeLicenseNo: `TL-PENDING-${Math.floor(1000 + Math.random() * 9000)}`,
      country: 'United Arab Emirates',
      city: data.city,
      contactPerson: fullName,
      email: cleanEmail,
      phone: '+971 50 000 0000',
      plan: 'TRIAL',
      maxProjects: trialProjects,
      password: data.password,
      autoApprove,
    });

    // Update user's specific role if needed
    const updatedUsers = this.getUsers();
    const userIdx = updatedUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (userIdx !== -1) {
      updatedUsers[userIdx].saasRole = data.role;
      updatedUsers[userIdx].password = data.password;
      this.saveUsers(updatedUsers);
    }

    if (!autoApprove) {
      return {
        success: true,
        requiresApproval: true,
      };
    }

    return this.buildSessionForCompanyAndUser(createdComp, updatedUsers[userIdx]);
  }

  // Strictly authenticate email & password against registered users
  authenticateUser(email: string, password: string): {
    success: boolean;
    error?: string;
    user?: SaaSUser;
    company?: CompanyTenant;
    subscription?: SaaSSubscription;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return {
        success: false,
        error: 'No account found with this email address. Please click "Create new account" to register for a Free Trial, or contact the platform administrator.',
      };
    }

    // Verify password (if user has a password stored)
    if (matchedUser.password && matchedUser.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please try again or contact support to reset your credentials.',
      };
    }

    if (!matchedUser.approved) {
      return {
        success: false,
        error: 'Your account registration is pending administrator approval. Once approved by our team, you will be able to sign in.',
      };
    }

    const companies = this.getClientCompanies();
    const matchedComp = companies.find(
      c => c.id === matchedUser.companyId || c.email.toLowerCase() === cleanEmail
    ) || companies[0];

    if (matchedComp && matchedComp.status === 'REJECTED') {
      return {
        success: false,
        error: `Access for ${matchedComp.companyName} has been suspended (${matchedComp.rejectionReason || 'Verification required'}). Please contact billing support.`,
      };
    }

    // Update lastLoginAt
    matchedUser.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);

    return this.buildSessionForCompanyAndUser(matchedComp, matchedUser);
  }

  buildSessionForCompanyAndUser(comp: RegisteredClientCompany, usr: AppUserProfile): {
    success: boolean;
    user: SaaSUser;
    company: CompanyTenant;
    subscription: SaaSSubscription;
  } {
    const planKey = normalizePlan(comp.plan);
    const limits = PLAN_LIMITS[planKey];
    const maxProjects = comp.maxProjects ?? limits.maxProjects;
    const maxUsers = comp.maxUsers ?? limits.maxUsers;
    const numericCompanyId = comp.numericId || Math.abs(comp.id.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0));

    const saasRole: SaaSRole = usr.role === 'ADMIN'
      ? 'PLATFORM_ADMIN'
      : (usr.saasRole || (usr.role === 'ESTIMATION_ENGINEER' ? 'ESTIMATION_ENGINEER' : 'COMPANY_OWNER'));

    const tenant: CompanyTenant = {
      id: numericCompanyId,
      companyCode: comp.companyCode,
      companyName: comp.companyName,
      tradeLicenseNo: comp.tradeLicenseNo,
      country: comp.country || 'United Arab Emirates',
      city: comp.city || 'Dubai',
      address: comp.address || `${comp.city}, UAE`,
      phone: comp.phone,
      email: comp.email,
      vatTrn: comp.vatTrn || '100234567800003',
      currency: 'AED',
      defaultCostingMethod: 'MARKUP',
      defaultMarginPercent: 15.0,
      defaultVatPercent: 5.0,
      plan: planKey,
      subscriptionStatus: comp.subscriptionStatus || (planKey === 'TRIAL' ? 'TRIAL' : 'ACTIVE'),
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
      fullName: usr.fullName,
      role: saasRole,
      phone: usr.phone || comp.phone,
      isActive: usr.approved,
    };

    const subscription: SaaSSubscription = {
      id: numericCompanyId,
      companyId: numericCompanyId,
      plan: planKey,
      priceAedMonthly: limits.priceMonthly,
      billingCycle: comp.billingCycle || 'MONTHLY',
      status: comp.subscriptionStatus === 'PENDING_APPROVAL'
        ? 'PENDING_APPROVAL'
        : (planKey === 'TRIAL' ? 'TRIAL' : 'ACTIVE'),
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

  // Update plan and quota from Admin Dashboard
  updateCompanyPlanAndQuota(
    companyId: string,
    newPlan: SaaSPlan,
    customMaxProjects?: number,
    customMaxUsers?: number,
    approvedBy: string = 'Platform Admin'
  ): RegisteredClientCompany | null {
    const list = this.getClientCompanies();
    const idx = list.findIndex(c => c.id === companyId || c.companyCode === companyId);
    if (idx === -1) return null;

    const limits = PLAN_LIMITS[newPlan] || PLAN_LIMITS.STARTER;
    list[idx] = {
      ...list[idx],
      status: 'APPROVED',
      plan: newPlan,
      maxProjects: customMaxProjects ?? limits.maxProjects,
      maxUsers: customMaxUsers ?? limits.maxUsers,
      subscriptionStatus: newPlan === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
      requestedPlan: undefined,
      approvedAt: new Date().toISOString(),
      approvedBy,
    };

    this.saveClientCompanies(list);
    this.syncCompanyToFirestore(list[idx]);

    // Also ensure associated users are approved
    const users = this.getUsers();
    users.forEach(u => {
      if (u.companyId === list[idx].id) {
        u.approved = true;
      }
    });
    this.saveUsers(users);

    // If active session in localStorage matches this company, update it live
    const activeCompanyRaw = localStorage.getItem('switchgear_saas_company');
    if (activeCompanyRaw) {
      try {
        const activeComp: CompanyTenant = JSON.parse(activeCompanyRaw);
        if (activeComp.companyCode === list[idx].companyCode) {
          activeComp.plan = newPlan;
          activeComp.subscriptionStatus = list[idx].subscriptionStatus!;
          activeComp.maxProjects = list[idx].maxProjects;
          activeComp.maxUsers = list[idx].maxUsers;
          activeComp.requestedPlan = undefined;
          localStorage.setItem('switchgear_saas_company', JSON.stringify(activeComp));
        }
      } catch {}
    }

    return list[idx];
  }

  // Customer submits payment reference (Bank Transfer or Stripe) for plan upgrade
  submitPaymentUpgradeRequest(params: {
    companyCode: string;
    companyEmail?: string;
    requestedPlan: SaaSPlan;
    billingCycle: 'MONTHLY' | 'ANNUAL';
    paymentMethod: 'card' | 'bank_transfer';
    paymentReference: string;
    autoActivate?: boolean;
  }): RegisteredClientCompany | null {
    const list = this.getClientCompanies();
    let idx = list.findIndex(
      c => c.companyCode === params.companyCode || (params.companyEmail && c.email.toLowerCase() === params.companyEmail.toLowerCase())
    );

    if (idx === -1) {
      return null;
    }

    const limits = PLAN_LIMITS[params.requestedPlan] || PLAN_LIMITS.PROFESSIONAL;

    if (params.autoActivate) {
      list[idx] = {
        ...list[idx],
        status: 'APPROVED',
        plan: params.requestedPlan,
        maxProjects: limits.maxProjects,
        maxUsers: limits.maxUsers,
        billingCycle: params.billingCycle,
        subscriptionStatus: 'ACTIVE',
        requestedPlan: undefined,
        paymentReference: params.paymentReference,
        paymentMethod: params.paymentMethod.toUpperCase(),
        paymentSubmittedAt: new Date().toISOString(),
      };
    } else {
      list[idx] = {
        ...list[idx],
        requestedPlan: params.requestedPlan,
        billingCycle: params.billingCycle,
        subscriptionStatus: 'PENDING_APPROVAL',
        paymentReference: params.paymentReference,
        paymentMethod: params.paymentMethod.toUpperCase(),
        paymentSubmittedAt: new Date().toISOString(),
      };
    }

    this.saveClientCompanies(list);
    this.syncCompanyToFirestore(list[idx]);
    return list[idx];
  }

  approveCompany(companyId: string, approvedBy: string = 'Admin'): RegisteredClientCompany | null {
    const list = this.getClientCompanies();
    const idx = list.findIndex(c => c.id === companyId);
    if (idx === -1) return null;

    const targetPlan = list[idx].requestedPlan || normalizePlan(list[idx].plan);
    const limits = PLAN_LIMITS[targetPlan];

    list[idx] = {
      ...list[idx],
      status: 'APPROVED',
      plan: targetPlan,
      maxProjects: list[idx].requestedPlan ? limits.maxProjects : (list[idx].maxProjects || limits.maxProjects),
      maxUsers: list[idx].requestedPlan ? limits.maxUsers : (list[idx].maxUsers || limits.maxUsers),
      subscriptionStatus: targetPlan === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
      requestedPlan: undefined,
      approvedAt: new Date().toISOString(),
      approvedBy,
    };

    this.saveClientCompanies(list);
    this.syncCompanyToFirestore(list[idx]);

    // Also auto-approve associated users for this company
    const users = this.getUsers();
    let usersChanged = false;
    users.forEach(u => {
      if (u.companyId === companyId && !u.approved) {
        u.approved = true;
        u.approvedAt = new Date().toISOString();
        u.approvedBy = approvedBy;
        usersChanged = true;
        this.syncUserToFirestore(u);
      }
    });
    if (usersChanged) {
      this.saveUsers(users);
    }

    return list[idx];
  }

  rejectCompany(companyId: string, reason: string = 'Incomplete documentation or verification issue'): RegisteredClientCompany | null {
    const list = this.getClientCompanies();
    const idx = list.findIndex(c => c.id === companyId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: 'REJECTED',
      rejectionReason: reason,
    };

    this.saveClientCompanies(list);
    this.syncCompanyToFirestore(list[idx]);
    return list[idx];
  }

  // --- USERS & LOGIN APPROVALS ---
  getUsers(): AppUserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_USERS);
    if (!raw) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  }

  saveUsers(list: AppUserProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.APP_USERS, JSON.stringify(list));
  }

  approveUser(uid: string, assignedRole?: UserRole, approvedBy: string = 'Admin'): AppUserProfile | null {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === uid);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      approved: true,
      role: assignedRole || list[idx].role || 'CLIENT',
      approvedAt: new Date().toISOString(),
      approvedBy,
    };

    this.saveUsers(list);
    this.syncUserToFirestore(list[idx]);
    return list[idx];
  }

  rejectUser(uid: string): AppUserProfile | null {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === uid);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      approved: false,
    };

    this.saveUsers(list);
    this.syncUserToFirestore(list[idx]);
    return list[idx];
  }

  updateUserRole(uid: string, newRole: UserRole): AppUserProfile | null {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === uid);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      role: newRole,
      saasRole: newRole === 'ADMIN' ? 'PLATFORM_ADMIN' : newRole === 'ESTIMATION_ENGINEER' ? 'ESTIMATION_ENGINEER' : 'COMPANY_OWNER',
    };

    this.saveUsers(list);
    this.syncUserToFirestore(list[idx]);
    return list[idx];
  }

  updateUserPassword(uid: string, newPassword: string): AppUserProfile | null {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.uid === uid);
    if (idx === -1) return null;
    list[idx].password = newPassword;
    this.saveUsers(list);
    return list[idx];
  }

  // Get active session user
  getCurrentUser(): AppUserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVE_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    const admin = INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVE_USER, JSON.stringify(admin));
    return admin;
  }

  setCurrentUser(user: AppUserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVE_USER, JSON.stringify(user));
  }
}

export const authApprovalService = new AuthApprovalService();
