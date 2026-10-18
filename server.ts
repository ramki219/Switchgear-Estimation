// ============================================================================
// FULL-STACK SERVER (Express + Vite Middlewares + Cloud SQL + Firebase Auth)
// Multi-Tenant SaaS Platform for LV Switchgear Manufacturers (UAE & Global)
// ============================================================================

import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './src/db/index.ts';
import { 
  companies, 
  users, 
  subscriptions, 
  projects, 
  estimatePanels, 
  estimateItems, 
  components, 
  supplierPrices, 
  quotations, 
  boms, 
  productionJobs, 
  purchaseRequisitions, 
  auditLogs,
  purchaseOrders,
  followUpActivities
} from './src/db/schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health checks for Cloud Run startup/liveness probes
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'lv-switchgear-saas' });
});

// Helper to log audit events
async function logAudit(companyId: number, userEmail: string, action: string, entity: string, entityId?: number, details?: string) {
  try {
    await db.insert(auditLogs).values({
      companyId,
      userEmail,
      action,
      entity,
      entityId,
      details,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// ----------------------------------------------------------------------------
// API: AUTH & TENANT CONTEXT
// ----------------------------------------------------------------------------
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.dbUser;
    const company = await db.select().from(companies).where(eq(companies.id, user.companyId));
    const sub = await db.select().from(subscriptions).where(eq(subscriptions.companyId, user.companyId));
    
    res.json({
      user,
      company: company[0] || null,
      subscription: sub[0] || null,
    });
  } catch (error: any) {
    console.error('Error fetching auth context:', error);
    res.status(500).json({ error: error.message });
  }
});

// Switch / Register Tenant Company
app.post('/api/tenant/register', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, tradeLicenseNo, city, vatTrn, phone, email, currency } = req.body;
    const code = `UAE-${Date.now().toString().slice(-6)}`;
    
    const newCompany = await db.insert(companies).values({
      companyCode: code,
      companyName: companyName || 'UAE Switchgear Factory',
      tradeLicenseNo,
      city: city || 'Dubai',
      vatTrn,
      phone,
      email,
      currency: currency || 'AED',
      plan: 'STARTER',
      subscriptionStatus: 'TRIAL',
    }).returning();

    // Link user to new company
    await db.update(users).set({
      companyId: newCompany[0].id,
      role: 'COMPANY_OWNER',
    }).where(eq(users.id, req.dbUser.id));

    // Create default starter subscription
    await db.insert(subscriptions).values({
      companyId: newCompany[0].id,
      plan: 'STARTER',
      priceAedMonthly: '299.00',
      status: 'TRIAL',
      maxProjects: 10,
      maxUsers: 2,
    });

    logAudit(newCompany[0].id, req.user?.email || 'user', 'REGISTER_COMPANY', 'companies', newCompany[0].id);

    res.json(newCompany[0]);
  } catch (error: any) {
    console.error('Error registering company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Company Settings
app.put('/api/tenant/company', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const { 
      companyName, 
      tradeLicenseNo, 
      city, 
      address, 
      phone, 
      email, 
      vatTrn, 
      currency, 
      defaultCostingMethod, 
      defaultMarginPercent, 
      defaultVatPercent 
    } = req.body;

    const updated = await db.update(companies).set({
      companyName,
      tradeLicenseNo,
      city,
      address,
      phone,
      email,
      vatTrn,
      currency,
      defaultCostingMethod,
      defaultMarginPercent: defaultMarginPercent ? String(defaultMarginPercent) : undefined,
      defaultVatPercent: defaultVatPercent ? String(defaultVatPercent) : undefined,
      updatedAt: new Date(),
    }).where(eq(companies.id, companyId)).returning();

    logAudit(companyId, req.user?.email || 'user', 'UPDATE_SETTINGS', 'companies', companyId);

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subscription Management & Plan Upgrade
app.post('/api/tenant/subscription/change-plan', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const { plan, billingCycle, paymentReference, instantActivate } = req.body;

    const plansConfig: Record<string, { price: string; maxProjects: number; maxUsers: number }> = {
      TRIAL: { price: '0.00', maxProjects: 2, maxUsers: 1 },
      STARTER: { price: '299.00', maxProjects: 10, maxUsers: 2 },
      PROFESSIONAL: { price: '499.00', maxProjects: 50, maxUsers: 5 },
      ADVANCED: { price: '999.00', maxProjects: 200, maxUsers: 15 },
      BUSINESS: { price: '1999.00', maxProjects: 1000, maxUsers: 50 },
    };

    const targetConfig = plansConfig[plan] || plansConfig.STARTER;
    const targetStatus = instantActivate ? 'ACTIVE' : 'PENDING_APPROVAL';

    // Update company plan
    if (instantActivate) {
      await db.update(companies).set({
        plan,
        subscriptionStatus: 'ACTIVE',
        updatedAt: new Date(),
      }).where(eq(companies.id, companyId));
    }

    // Upsert subscription
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId));
    let subResult;
    if (existing.length > 0) {
      subResult = await db.update(subscriptions).set({
        plan: instantActivate ? plan : existing[0].plan,
        priceAedMonthly: targetConfig.price,
        billingCycle: billingCycle || 'MONTHLY',
        status: targetStatus,
        maxProjects: instantActivate ? targetConfig.maxProjects : existing[0].maxProjects,
        maxUsers: instantActivate ? targetConfig.maxUsers : existing[0].maxUsers,
      }).where(eq(subscriptions.id, existing[0].id)).returning();
    } else {
      subResult = await db.insert(subscriptions).values({
        companyId,
        plan,
        priceAedMonthly: targetConfig.price,
        billingCycle: billingCycle || 'MONTHLY',
        status: targetStatus,
        maxProjects: targetConfig.maxProjects,
        maxUsers: targetConfig.maxUsers,
      }).returning();
    }

    logAudit(
      companyId,
      req.user?.email || 'user',
      'UPGRADE_SUBSCRIPTION',
      'subscriptions',
      subResult[0].id,
      `Plan request: ${plan} (${targetStatus}) Ref: ${paymentReference || 'N/A'}`
    );

    res.json(subResult[0]);
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Team Members
app.get('/api/tenant/users', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const team = await db.select().from(users).where(eq(users.companyId, req.companyId!));
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// API: PROJECTS & ESTIMATES (TENANT SCOPED)
// ----------------------------------------------------------------------------
app.get('/api/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const projectList = await db.select().from(projects)
      .where(eq(projects.companyId, companyId))
      .orderBy(desc(projects.createdAt));
    
    res.json(projectList);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const data = req.body;

    // Enforce Tenant Subscription Quota (maxProjects)
    const existingProjects = await db.select().from(projects).where(eq(projects.companyId, companyId));
    const subRows = await db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId));
    const maxAllowed = subRows.length > 0 ? (subRows[0].maxProjects || 2) : 2;

    if (existingProjects.length >= maxAllowed) {
      return res.status(403).json({
        error: `Estimation project quota reached (${existingProjects.length} / ${maxAllowed}). Please upgrade your subscription plan to create additional projects.`,
        code: 'QUOTA_EXCEEDED',
      });
    }

    const newProject = await db.insert(projects).values({
      companyId,
      projectCode: data.projectCode || `PRJ-${Date.now().toString().slice(-5)}`,
      projectName: data.projectName,
      clientName: data.clientName,
      consultantName: data.consultantName || '',
      contractorName: data.contractorName || '',
      authority: data.authority || 'DEWA',
      status: data.status || 'ESTIMATION',
      currency: data.currency || 'AED',
      dueDate: data.dueDate ? data.dueDate : null,
      directMaterialCost: String(data.directMaterialCost || '0.00'),
      copperCost: String(data.copperCost || '0.00'),
      enclosureCost: String(data.enclosureCost || '0.00'),
      labourCost: String(data.labourCost || '0.00'),
      overheadCost: String(data.overheadCost || '0.00'),
      totalCost: String(data.totalCost || '0.00'),
      costingMethod: data.costingMethod || 'MARKUP',
      marginPercent: String(data.marginPercent || '15.00'),
      sellingPrice: String(data.sellingPrice || '0.00'),
      vatPercent: String(data.vatPercent || '5.00'),
      vatAmount: String(data.vatAmount || '0.00'),
      grandTotal: String(data.grandTotal || '0.00'),
      notes: data.notes || '',
      createdBy: req.user?.email || 'Engineer',
    }).returning();

    logAudit(companyId, req.user?.email || 'user', 'CREATE_PROJECT', 'projects', newProject[0].id);

    res.json(newProject[0]);
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const projectId = parseInt(req.params.id, 10);

    const projectData = await db.select().from(projects).where(
      and(eq(projects.id, projectId), eq(projects.companyId, companyId))
    );

    if (projectData.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const panelsData = await db.select().from(estimatePanels).where(
      and(eq(estimatePanels.projectId, projectId), eq(estimatePanels.companyId, companyId))
    );

    // Get items for all panels
    const itemsData = await db.select().from(estimateItems).where(
      eq(estimateItems.companyId, companyId)
    );

    res.json({
      project: projectData[0],
      panels: panelsData,
      items: itemsData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const projectId = parseInt(req.params.id, 10);
    const data = req.body;

    const updated = await db.update(projects).set({
      projectName: data.projectName,
      clientName: data.clientName,
      consultantName: data.consultantName,
      contractorName: data.contractorName,
      authority: data.authority,
      status: data.status,
      currency: data.currency,
      dueDate: data.dueDate || null,
      directMaterialCost: String(data.directMaterialCost ?? '0.00'),
      copperCost: String(data.copperCost ?? '0.00'),
      enclosureCost: String(data.enclosureCost ?? '0.00'),
      labourCost: String(data.labourCost ?? '0.00'),
      overheadCost: String(data.overheadCost ?? '0.00'),
      totalCost: String(data.totalCost ?? '0.00'),
      costingMethod: data.costingMethod ?? 'MARKUP',
      marginPercent: String(data.marginPercent ?? '15.00'),
      sellingPrice: String(data.sellingPrice ?? '0.00'),
      vatPercent: String(data.vatPercent ?? '5.00'),
      vatAmount: String(data.vatAmount ?? '0.00'),
      grandTotal: String(data.grandTotal ?? '0.00'),
      notes: data.notes,
      updatedAt: new Date(),
    }).where(and(eq(projects.id, projectId), eq(projects.companyId, companyId))).returning();

    logAudit(companyId, req.user?.email || 'user', 'UPDATE_PROJECT', 'projects', projectId);

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const projectId = parseInt(req.params.id, 10);

    // Delete cascading items and panels
    const panelsList = await db.select().from(estimatePanels).where(
      and(eq(estimatePanels.projectId, projectId), eq(estimatePanels.companyId, companyId))
    );

    for (const p of panelsList) {
      await db.delete(estimateItems).where(eq(estimateItems.panelId, p.id));
    }

    await db.delete(estimatePanels).where(
      and(eq(estimatePanels.projectId, projectId), eq(estimatePanels.companyId, companyId))
    );

    await db.delete(projects).where(
      and(eq(projects.id, projectId), eq(projects.companyId, companyId))
    );

    logAudit(companyId, req.user?.email || 'user', 'DELETE_PROJECT', 'projects', projectId);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate Project
app.post('/api/projects/:id/duplicate', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const sourceId = parseInt(req.params.id, 10);

    const source = await db.select().from(projects).where(
      and(eq(projects.id, sourceId), eq(projects.companyId, companyId))
    );

    if (source.length === 0) return res.status(404).json({ error: 'Source project not found' });

    const p = source[0];
    const newProject = await db.insert(projects).values({
      companyId,
      projectCode: `${p.projectCode}-REV1`,
      projectName: `${p.projectName} (Copy)`,
      clientName: p.clientName,
      consultantName: p.consultantName,
      contractorName: p.contractorName,
      authority: p.authority,
      status: 'ESTIMATION',
      currency: p.currency,
      dueDate: p.dueDate,
      directMaterialCost: p.directMaterialCost,
      copperCost: p.copperCost,
      enclosureCost: p.enclosureCost,
      labourCost: p.labourCost,
      overheadCost: p.overheadCost,
      totalCost: p.totalCost,
      costingMethod: p.costingMethod,
      marginPercent: p.marginPercent,
      sellingPrice: p.sellingPrice,
      vatPercent: p.vatPercent,
      vatAmount: p.vatAmount,
      grandTotal: p.grandTotal,
      notes: p.notes,
      createdBy: req.user?.email || 'Engineer',
    }).returning();

    // Copy panels
    const panelsList = await db.select().from(estimatePanels).where(
      and(eq(estimatePanels.projectId, sourceId), eq(estimatePanels.companyId, companyId))
    );

    for (const panel of panelsList) {
      const newPanel = await db.insert(estimatePanels).values({
        companyId,
        projectId: newProject[0].id,
        panelTag: panel.panelTag,
        panelName: panel.panelName,
        panelTypeCode: panel.panelTypeCode,
        ratedCurrent: panel.ratedCurrent,
        faultLevelKa: panel.faultLevelKa,
        voltageV: panel.voltageV,
        frequencyHz: panel.frequencyHz,
        formOfSeparation: panel.formOfSeparation,
        ipRating: panel.ipRating,
        mountingType: panel.mountingType,
        widthMm: panel.widthMm,
        heightMm: panel.heightMm,
        depthMm: panel.depthMm,
        equipmentCost: panel.equipmentCost,
        copperWeightKg: panel.copperWeightKg,
        copperCost: panel.copperCost,
        enclosureCost: panel.enclosureCost,
        labourHours: panel.labourHours,
        labourCost: panel.labourCost,
        totalPanelCost: panel.totalPanelCost,
        sldTopologyJson: panel.sldTopologyJson,
        gaLayoutJson: panel.gaLayoutJson,
      }).returning();

      // Copy items
      const itemsList = await db.select().from(estimateItems).where(
        and(eq(estimateItems.panelId, panel.id), eq(estimateItems.companyId, companyId))
      );

      for (const it of itemsList) {
        await db.insert(estimateItems).values({
          companyId,
          panelId: newPanel[0].id,
          componentId: it.componentId,
          feederTag: it.feederTag,
          description: it.description,
          deviceType: it.deviceType,
          manufacturer: it.manufacturer,
          partNumber: it.partNumber,
          ratingA: it.ratingA,
          poles: it.poles,
          icuKa: it.icuKa,
          quantity: it.quantity,
          unit: it.unit,
          unitCost: it.unitCost,
          discountPercent: it.discountPercent,
          netCost: it.netCost,
          totalCost: it.totalCost,
          remarks: it.remarks,
        });
      }
    }

    logAudit(companyId, req.user?.email || 'user', 'DUPLICATE_PROJECT', 'projects', newProject[0].id);

    res.json(newProject[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// API: PANELS & ESTIMATE ITEMS
// ----------------------------------------------------------------------------
app.post('/api/projects/:id/panels', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const projectId = parseInt(req.params.id, 10);
    const data = req.body;

    const newPanel = await db.insert(estimatePanels).values({
      companyId,
      projectId,
      panelTag: data.panelTag,
      panelName: data.panelName,
      panelTypeCode: data.panelTypeCode || 'MDB',
      ratedCurrent: data.ratedCurrent || 1600,
      faultLevelKa: data.faultLevelKa || 50,
      voltageV: data.voltageV || 415,
      frequencyHz: data.frequencyHz || 50,
      formOfSeparation: data.formOfSeparation || 'Form 4b',
      ipRating: data.ipRating || 'IP54',
      mountingType: data.mountingType || 'Floor Standing',
      widthMm: data.widthMm || 2400,
      heightMm: data.heightMm || 2200,
      depthMm: data.depthMm || 1000,
      equipmentCost: String(data.equipmentCost || '0.00'),
      copperWeightKg: String(data.copperWeightKg || '0.00'),
      copperCost: String(data.copperCost || '0.00'),
      enclosureCost: String(data.enclosureCost || '0.00'),
      labourHours: String(data.labourHours || '0.00'),
      labourCost: String(data.labourCost || '0.00'),
      totalPanelCost: String(data.totalPanelCost || '0.00'),
      sldTopologyJson: data.sldTopologyJson || null,
      gaLayoutJson: data.gaLayoutJson || null,
    }).returning();

    res.json(newPanel[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/panels/:panelId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const panelId = parseInt(req.params.panelId, 10);
    const data = req.body;

    const updated = await db.update(estimatePanels).set({
      panelTag: data.panelTag,
      panelName: data.panelName,
      panelTypeCode: data.panelTypeCode,
      ratedCurrent: data.ratedCurrent,
      faultLevelKa: data.faultLevelKa,
      voltageV: data.voltageV,
      frequencyHz: data.frequencyHz,
      formOfSeparation: data.formOfSeparation,
      ipRating: data.ipRating,
      mountingType: data.mountingType,
      widthMm: data.widthMm,
      heightMm: data.heightMm,
      depthMm: data.depthMm,
      equipmentCost: String(data.equipmentCost ?? '0.00'),
      copperWeightKg: String(data.copperWeightKg ?? '0.00'),
      copperCost: String(data.copperCost ?? '0.00'),
      enclosureCost: String(data.enclosureCost ?? '0.00'),
      labourHours: String(data.labourHours ?? '0.00'),
      labourCost: String(data.labourCost ?? '0.00'),
      totalPanelCost: String(data.totalPanelCost ?? '0.00'),
      sldTopologyJson: data.sldTopologyJson ?? undefined,
      gaLayoutJson: data.gaLayoutJson ?? undefined,
      updatedAt: new Date(),
    }).where(and(eq(estimatePanels.id, panelId), eq(estimatePanels.companyId, companyId))).returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/panels/:panelId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const panelId = parseInt(req.params.panelId, 10);

    await db.delete(estimateItems).where(
      and(eq(estimateItems.panelId, panelId), eq(estimateItems.companyId, companyId))
    );

    await db.delete(estimatePanels).where(
      and(eq(estimatePanels.id, panelId), eq(estimatePanels.companyId, companyId))
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Feeder Items
app.post('/api/panels/:panelId/items', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const panelId = parseInt(req.params.panelId, 10);
    const data = req.body;

    const newItem = await db.insert(estimateItems).values({
      companyId,
      panelId,
      componentId: data.componentId || null,
      feederTag: data.feederTag,
      description: data.description,
      deviceType: data.deviceType || 'MCCB',
      manufacturer: data.manufacturer || 'ABB',
      partNumber: data.partNumber || '',
      ratingA: data.ratingA || 100,
      poles: data.poles || 4,
      icuKa: data.icuKa || 36,
      quantity: data.quantity || 1,
      unit: data.unit || 'NOS',
      unitCost: String(data.unitCost || '0.00'),
      discountPercent: String(data.discountPercent || '0.00'),
      netCost: String(data.netCost || '0.00'),
      totalCost: String(data.totalCost || '0.00'),
      remarks: data.remarks || '',
    }).returning();

    res.json(newItem[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/items/:itemId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const itemId = parseInt(req.params.itemId, 10);

    await db.delete(estimateItems).where(
      and(eq(estimateItems.id, itemId), eq(estimateItems.companyId, companyId))
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// API: MASTER COMPONENTS & PRICE LISTS
// ----------------------------------------------------------------------------
app.get('/api/components', async (req: Request, res: Response) => {
  try {
    // Return all active components
    const list = await db.select().from(components).where(eq(components.isActive, true));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/components', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const data = req.body;

    const newComp = await db.insert(components).values({
      companyId,
      componentCode: data.componentCode || `CMP-${Date.now()}`,
      categoryCode: data.categoryCode,
      manufacturer: data.manufacturer,
      productFamily: data.productFamily,
      partNumber: data.partNumber,
      model: data.model,
      description: data.description,
      ratedVoltage: data.ratedVoltage || 415,
      ratedCurrent: data.ratedCurrent,
      poles: data.poles || 4,
      breakingCapacityKa: data.breakingCapacityKa,
      tripUnit: data.tripUnit,
      unit: data.unit || 'NOS',
      purchasePrice: String(data.purchasePrice || '0.00'),
      currency: data.currency || 'AED',
      supplier: data.supplier,
      datasheetUrl: data.datasheetUrl,
      isSampleData: false,
      isActive: true,
    }).returning();

    logAudit(companyId, req.user?.email || 'user', 'ADD_COMPONENT', 'components', newComp[0].id);

    res.json(newComp[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// API: PRODUCTION HANDOVER & PURCHASING
// ----------------------------------------------------------------------------
app.get('/api/production/jobs', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await db.select().from(productionJobs).where(eq(productionJobs.companyId, req.companyId!));
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/production/jobs', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const data = req.body;

    const newJob = await db.insert(productionJobs).values({
      companyId,
      projectId: data.projectId,
      panelId: data.panelId || null,
      jobNumber: data.jobNumber || `JOB-${Date.now().toString().slice(-4)}`,
      panelTag: data.panelTag,
      status: data.status || 'QUEUED',
      targetDate: data.targetDate || null,
      supervisor: data.supervisor || 'Workshop Foreman',
      notes: data.notes || '',
    }).returning();

    logAudit(companyId, req.user?.email || 'user', 'CREATE_PRODUCTION_JOB', 'production_jobs', newJob[0].id);

    res.json(newJob[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchase/requisitions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const prs = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.companyId, req.companyId!));
    res.json(prs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/purchase/requisitions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const data = req.body;

    const newPr = await db.insert(purchaseRequisitions).values({
      companyId,
      projectId: data.projectId,
      prNumber: data.prNumber || `PR-${Date.now().toString().slice(-4)}`,
      status: 'PENDING',
      supplierName: data.supplierName || 'Official Distributor',
      totalAmount: String(data.totalAmount || '0.00'),
      requestedBy: req.user?.email || 'Purchase Officer',
      itemsSummary: data.itemsSummary || '',
    }).returning();

    logAudit(companyId, req.user?.email || 'user', 'CREATE_PURCHASE_REQ', 'purchase_requisitions', newPr[0].id);

    res.json(newPr[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// API: AUDIT LOGS
// ----------------------------------------------------------------------------
app.get('/api/audit-logs', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db.select().from(auditLogs)
      .where(eq(auditLogs.companyId, req.companyId!))
      .orderBy(desc(auditLogs.timestamp))
      .limit(50);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// API: COMMERCIAL INTELLIGENCE & PURCHASE ORDER BOOKING
// ----------------------------------------------------------------------------
app.get('/api/commercial/purchase-orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await db.select().from(purchaseOrders)
      .where(eq(purchaseOrders.companyId, req.companyId!))
      .orderBy(desc(purchaseOrders.createdAt));
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/commercial/purchase-orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const data = req.body;
    const vatPercent = data.vatPercent ?? 5.0;
    const poValEx = parseFloat(data.poValueExVat || '0');
    const vatAmt = parseFloat((poValEx * (vatPercent / 100)).toFixed(2));
    const poValInc = parseFloat((poValEx + vatAmt).toFixed(2));

    const newPo = await db.insert(purchaseOrders).values({
      companyId,
      poNumber: data.poNumber,
      quotationId: data.quotationId ? parseInt(data.quotationId, 10) : null,
      projectId: parseInt(data.projectId, 10),
      clientName: data.clientName,
      salesperson: data.salesperson,
      estimator: data.estimator || null,
      poReceivedDate: data.poReceivedDate || null,
      poValueExVat: String(poValEx),
      vatPercent: String(vatPercent),
      vatAmount: String(vatAmt),
      poValueIncVat: String(poValInc),
      currency: data.currency || 'AED',
      status: data.status || 'DRAFT',
      isPartialPo: Boolean(data.isPartialPo),
      partialPoNote: data.partialPoNote || null,
      poDocumentRef: data.poDocumentRef || null,
      remarks: data.remarks || null,
      enteredBy: req.user?.email || 'Commercial User',
      verifiedBy: data.status === 'VERIFIED' ? (req.user?.email || 'Verifier') : null,
      verificationDate: data.status === 'VERIFIED' ? new Date().toISOString().split('T')[0] : null,
    }).returning();

    logAudit(companyId, req.user?.email || 'user', 'BOOK_PURCHASE_ORDER', 'purchase_orders', newPo[0].id, `PO: ${data.poNumber} (${poValEx} AED)`);

    // If verified, update project status to WON
    if (data.status === 'VERIFIED') {
      await db.update(projects).set({ status: 'WON' }).where(eq(projects.id, parseInt(data.projectId, 10)));
    }

    res.json(newPo[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/commercial/purchase-orders/:id/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const id = parseInt(req.params.id, 10);
    const verifier = req.user?.email || 'Commercial Manager';
    const today = new Date().toISOString().split('T')[0];

    const updated = await db.update(purchaseOrders).set({
      status: 'VERIFIED',
      verifiedBy: verifier,
      verificationDate: today,
      updatedAt: new Date(),
    }).where(and(eq(purchaseOrders.id, id), eq(purchaseOrders.companyId, companyId))).returning();

    if (updated.length > 0) {
      logAudit(companyId, verifier, 'VERIFY_PURCHASE_ORDER', 'purchase_orders', id, `Verified PO ${updated[0].poNumber}`);
      await db.update(projects).set({ status: 'WON' }).where(eq(projects.id, updated[0].projectId));
    }

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/commercial/follow-ups', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.select().from(followUpActivities)
      .where(eq(followUpActivities.companyId, req.companyId!))
      .orderBy(desc(followUpActivities.activityDate));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/commercial/follow-ups', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.companyId!;
    const data = req.body;

    const newActivity = await db.insert(followUpActivities).values({
      companyId,
      quotationId: data.quotationId ? parseInt(data.quotationId, 10) : null,
      projectId: parseInt(data.projectId, 10),
      clientName: data.clientName,
      salesperson: data.salesperson,
      contactPerson: data.contactPerson || null,
      channel: data.channel || 'PHONE',
      notes: data.notes,
      nextActionDate: data.nextActionDate || null,
      nextActionNotes: data.nextActionNotes || null,
      statusUpdate: data.statusUpdate || null,
    }).returning();

    logAudit(companyId, req.user?.email || 'user', 'ADD_FOLLOW_UP', 'follow_up_activities', newActivity[0].id);

    res.json(newActivity[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// STATIC ASSETS & VITE INTEGRATION
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Production mode: serve built assets from dist
    const distDir = path.resolve(__dirname, 'dist');
    const indexHtml = path.resolve(distDir, 'index.html');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(200).send('<!doctype html><html><body><h1>Application Starting...</h1></body></html>');
      }
    });
  } else {
    // Development mode: Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LV Switchgear SaaS Engine running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
