// src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users, companies } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
  companyId?: number;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Attach or fetch tenant context
    const dbUserList = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
    if (dbUserList.length > 0) {
      req.dbUser = dbUserList[0];
      req.companyId = dbUserList[0].companyId || 1;
    } else {
      // Find default company
      const compList = await db.select().from(companies);
      const defaultCompanyId = compList.length > 0 ? compList[0].id : 1;
      const newUser = await db.insert(users).values({
        uid: decodedToken.uid,
        email: decodedToken.email || 'user@example.com',
        fullName: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Engineer'),
        companyId: defaultCompanyId,
        role: 'COMPANY_OWNER',
        isActive: true,
      }).returning();
      req.dbUser = newUser[0];
      req.companyId = defaultCompanyId;
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
