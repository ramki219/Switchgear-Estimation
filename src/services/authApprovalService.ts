// src/services/authApprovalService.ts
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

export type UserRole = 'ADMIN' | 'CLIENT' | 'ESTIMATION_ENGINEER' | 'COMPANY_OWNER';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RegisteredClientCompany {
  id: string; // registrationId or companyId
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
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
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
  fullName: string;
  role: UserRole;
  approved: boolean;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastLoginAt?: string;
}

const STORAGE_KEYS = {
  CLIENT_COMPANIES: 'lv_estimator_client_companies_v1',
  APP_USERS: 'lv_estimator_app_users_v1',
  CURRENT_ACTIVE_USER: 'lv_estimator_active_session_user_v1',
};

const INITIAL_CLIENT_COMPANIES: RegisteredClientCompany[] = [
  {
    id: 'comp-ags-01',
    companyCode: 'CLI-AGS-01',
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
    plan: 'ENTERPRISE',
    targetAuthority: 'DEWA / SEWA',
    submittedAt: '2026-08-15T09:30:00Z',
    approvedAt: '2026-08-16T11:00:00Z',
    approvedBy: 'System Administrator',
    associatedProjectsCount: 4,
    totalPipelineValueAed: 1850000,
  },
  {
    id: 'comp-dan-02',
    companyCode: 'CLI-DAN-02',
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
    plan: 'ENTERPRISE',
    targetAuthority: 'SEWA / DEWA / FEWA',
    submittedAt: '2026-08-20T14:15:00Z',
    approvedAt: '2026-08-21T10:00:00Z',
    approvedBy: 'System Administrator',
    associatedProjectsCount: 3,
    totalPipelineValueAed: 2420000,
  },
  {
    id: 'comp-pps-03',
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
    targetAuthority: 'DEWA',
    submittedAt: '2026-09-02T11:45:00Z',
    approvedAt: '2026-09-03T08:30:00Z',
    approvedBy: 'System Administrator',
    associatedProjectsCount: 2,
    totalPipelineValueAed: 960000,
  },
  {
    id: 'comp-gulf-04',
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
    plan: 'PROFESSIONAL',
    targetAuthority: 'ADDC / AADC',
    submittedAt: '2026-10-16T16:20:00Z',
    associatedProjectsCount: 0,
    totalPipelineValueAed: 0,
  },
  {
    id: 'comp-arab-05',
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
    plan: 'STARTER',
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
    fullName: 'Chief Estimator & Admin',
    role: 'ADMIN',
    approved: true,
    companyId: 'comp-ags-01',
    companyName: 'Al Ghandi Switchgear LLC',
    createdAt: '2026-08-01T08:00:00Z',
    approvedAt: '2026-08-01T08:00:00Z',
    approvedBy: 'Super Admin',
  },
  {
    uid: 'user-client-01',
    email: 'tariq.m@alghandiswitchgear.ae',
    fullName: 'Eng. Tariq Mansoor',
    role: 'CLIENT',
    approved: true,
    companyId: 'comp-ags-01',
    companyName: 'Al Ghandi Switchgear LLC',
    createdAt: '2026-08-15T09:30:00Z',
    approvedAt: '2026-08-16T11:00:00Z',
    approvedBy: 'Chief Estimator & Admin',
  },
  {
    uid: 'user-client-02',
    email: 'suresh.k@danwayeme.com',
    fullName: 'Eng. K. Suresh',
    role: 'CLIENT',
    approved: true,
    companyId: 'comp-dan-02',
    companyName: 'Danway Electrical & Mechanical Engineering',
    createdAt: '2026-08-20T14:15:00Z',
    approvedAt: '2026-08-21T10:00:00Z',
    approvedBy: 'Chief Estimator & Admin',
  },
  {
    uid: 'user-pending-01',
    email: 'm.hashimi@gulfelectro.ae',
    fullName: 'Mustafa Al-Hashimi',
    role: 'CLIENT',
    approved: false,
    companyId: 'comp-gulf-04',
    companyName: 'Gulf Electro-Mechanical Contracting LLC',
    createdAt: '2026-10-16T16:20:00Z',
  },
  {
    uid: 'user-pending-02',
    email: 'khalid.engineer@gmail.com',
    fullName: 'Eng. Khalid Mansoori',
    role: 'ESTIMATION_ENGINEER',
    approved: false,
    companyId: 'comp-arab-05',
    companyName: 'Arabian Power & Engineering Systems',
    createdAt: '2026-10-17T09:40:00Z',
  }
];

class AuthApprovalService {
  // Sync to Firestore if online, with graceful fallback
  private async syncCompanyToFirestore(company: RegisteredClientCompany) {
    try {
      const docRef = doc(db, 'companyRegistrations', company.id);
      await setDoc(docRef, {
        registrationId: company.id,
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

  // --- CLIENT COMPANIES ---
  getClientCompanies(): RegisteredClientCompany[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_COMPANIES);
    if (!raw) {
      this.saveClientCompanies(INITIAL_CLIENT_COMPANIES);
      return INITIAL_CLIENT_COMPANIES;
    }
    try {
      return JSON.parse(raw);
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
    plan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  }): RegisteredClientCompany {
    const list = this.getClientCompanies();
    const id = `comp-${Date.now().toString(36)}`;
    const count = list.length + 1;
    const companyCode = `CLI-${data.companyName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'NEW'}-${String(count).padStart(2, '0')}`;
    
    const newCompany: RegisteredClientCompany = {
      id,
      companyCode,
      companyName: data.companyName,
      tradeLicenseNo: data.tradeLicenseNo,
      country: data.country || 'United Arab Emirates',
      city: data.city || 'Dubai',
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      vatTrn: data.vatTrn,
      address: data.address,
      status: 'PENDING',
      plan: data.plan || 'PROFESSIONAL',
      targetAuthority: data.targetAuthority || 'DEWA / SEWA',
      submittedAt: new Date().toISOString(),
      associatedProjectsCount: 0,
      totalPipelineValueAed: 0,
    };

    const updated = [newCompany, ...list];
    this.saveClientCompanies(updated);
    this.syncCompanyToFirestore(newCompany);

    return newCompany;
  }

  approveCompany(companyId: string, approvedBy: string = 'Admin'): RegisteredClientCompany | null {
    const list = this.getClientCompanies();
    const idx = list.findIndex(c => c.id === companyId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: 'APPROVED',
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
    };

    this.saveUsers(list);
    this.syncUserToFirestore(list[idx]);
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
    // Default to admin user for preview
    const admin = INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVE_USER, JSON.stringify(admin));
    return admin;
  }

  setCurrentUser(user: AppUserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVE_USER, JSON.stringify(user));
  }
}

export const authApprovalService = new AuthApprovalService();
