// src/db/users.ts
import { db } from './index.ts';
import { users, companies } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  try {
    // 1. Check if user already exists
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    // 2. If new user, find or create default company
    let defaultCompanyId: number;
    const existingCompanies = await db.select().from(companies);
    if (existingCompanies.length === 0) {
      const newCompany = await db.insert(companies).values({
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
        defaultMarginPercent: '15.00',
        defaultVatPercent: '5.00',
        plan: 'PROFESSIONAL',
        subscriptionStatus: 'ACTIVE',
      }).returning();
      defaultCompanyId = newCompany[0].id;
    } else {
      defaultCompanyId = existingCompanies[0].id;
    }

    // 3. Upsert user safely
    const result = await db.insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0],
        companyId: defaultCompanyId,
        role: 'COMPANY_OWNER',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
