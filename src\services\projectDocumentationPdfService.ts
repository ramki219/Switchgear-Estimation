// ============================================================================
// LV SWITCHGEAR SaaS PLATFORM - PROJECT ARCHITECTURE & WORKFLOW PDF GENERATOR
// Executive Engineering & Technical Specification Document
// Covers: Project Overview, Frontend/Backend Architecture, Database Schema, Workflows
// ============================================================================

import { jsPDF } from 'jspdf';

export interface DocumentationPdfOptions {
  companyName?: string;
  generatedBy?: string;
}

export function generateProjectDocumentationPDF(options: DocumentationPdfOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  let y = margin;

  // Colors
  const primaryBlue = [24, 119, 242]; // #1877f2
  const darkNavy = [10, 37, 64]; // #0A2540
  const slateDark = [30, 41, 59]; // #1e293b
  const slateMuted = [100, 116, 139]; // #64748b
  const accentCyan = [8, 145, 178]; // #0891b2
  const bgLight = [248, 250, 252]; // #f8fafc
  const borderLight = [226, 232, 240]; // #e2e8f0

  // Helper: check space and add page
  const checkAddPage = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 18) {
      addFooter();
      doc.addPage();
      y = margin + 10;
      addHeader();
    }
  };

  // Header for subsequent pages
  const addHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('SwitchgearOS • Technical Architecture & Engineering Workflow Specification', margin, margin);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
    y = margin + 8;
  };

  // Footer for all pages
  const addFooter = () => {
    const pageNum = doc.getNumberOfPages();
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('Commercial LV Switchgear SaaS Platform (UAE & International)', margin, pageHeight - 7);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 7);
  };

  // Helper: Section Heading
  const addSectionTitle = (title: string, badge?: string) => {
    checkAddPage(22);
    y += 4;
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(margin, y - 4, contentWidth, 11, 1.5, 1.5, 'F');
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(1.2);
    doc.line(margin, y - 4, margin, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(title, margin + 4, y + 3.5);

    if (badge) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      const badgeWidth = doc.getTextWidth(badge) + 4;
      doc.setFillColor(235, 243, 255);
      doc.roundedRect(pageWidth - margin - badgeWidth - 2, y - 2, badgeWidth, 6, 1, 1, 'F');
      doc.text(badge, pageWidth - margin - badgeWidth, y + 2.2);
    }

    y += 11;
  };

  // Helper: Subsection Heading
  const addSubSectionTitle = (title: string) => {
    checkAddPage(14);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
    doc.text(title, margin, y);
    y += 6;
  };

  // Helper: Paragraph
  const addParagraph = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    checkAddPage(lines.length * 4.3 + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * 4.3 + 2;
  };

  // Helper: Bullet point
  const addBullet = (bulletLabel: string, bulletText: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const prefix = `•  ${bulletLabel}: `;
    const prefixWidth = doc.getTextWidth(prefix);
    const availableWidth = contentWidth - prefixWidth - 4;

    const bodyLines = doc.splitTextToSize(bulletText, availableWidth);
    checkAddPage(Math.max(bodyLines.length, 1) * 4.2 + 2);

    doc.text(prefix, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(bodyLines[0], margin + 2 + prefixWidth, y);
    y += 4.2;

    for (let i = 1; i < bodyLines.length; i++) {
      doc.text(bodyLines[i], margin + 2 + prefixWidth, y);
      y += 4.2;
    }
    y += 1;
  };

  // Helper: Boxed Callout
  const addCallout = (title: string, content: string[]) => {
    const totalLines = content.reduce((acc, c) => acc + doc.splitTextToSize(c, contentWidth - 10).length, 0);
    const boxHeight = 10 + totalLines * 4.2;
    checkAddPage(boxHeight + 4);

    doc.setFillColor(243, 248, 255);
    doc.setDrawColor(200, 220, 250);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(title, margin + 4, y + 5);

    let cy = y + 9.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    content.forEach((c) => {
      const lines = doc.splitTextToSize(c, contentWidth - 10);
      doc.text(lines, margin + 4, cy);
      cy += lines.length * 4.2;
    });

    y += boxHeight + 4;
  };

  // Helper: Formatted Key-Value Table
  const addTable = (headers: string[], rows: string[][], colWidths: number[]) => {
    checkAddPage(12 + rows.length * 6);
    y += 2;

    // Header
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    let curX = margin;
    headers.forEach((h, i) => {
      doc.text(h, curX + 2, y + 4.2);
      curX += colWidths[i];
    });
    y += 6;

    // Rows
    rows.forEach((row, rIdx) => {
      checkAddPage(6);
      doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

      curX = margin;
      row.forEach((cell, cIdx) => {
        doc.setFont('helvetica', cIdx === 0 ? 'bold' : 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
        doc.text(cell, curX + 2, y + 3.8);
        curX += colWidths[cIdx];
      });
      y += 5.5;
    });

    y += 4;
  };

  // ==========================================================================
  // PAGE 1: TITLE & COVER HEADER
  // ==========================================================================

  // Top Accent Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 32, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SwitchgearOS', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 210, 240);
  doc.text('Commercial LV Switchgear Estimation & Engineering SaaS Platform', margin, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SYSTEM SPECIFICATION & ARCHITECTURE MANUAL', pageWidth - margin - 85, 26);

  y = 42;

  // Metadata block
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('DOCUMENT SCOPE:', margin + 4, y + 5.5);
  doc.text('TARGET MARKET:', margin + 65, y + 5.5);
  doc.text('STANDARDS & CODES:', margin + 125, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Complete End-to-End System Overview', margin + 4, y + 10);
  doc.text(`Tenant: ${options.companyName || 'Emirates Switchgear LLC'}`, margin + 4, y + 14);

  doc.text('UAE & GCC Panel Manufacturers', margin + 65, y + 10);
  doc.text('Tendering & Estimation Depts', margin + 65, y + 14);

  doc.text('IEC 61439-1 & 2 (Form 2b / Form 4b)', margin + 125, y + 10);
  doc.text('DEWA / SEWA / ADDC / FEWA / Kahramaa', margin + 125, y + 14);

  y += 24;

  // ==========================================================================
  // SECTION 1: EXECUTIVE PROJECT OVERVIEW
  // ==========================================================================
  addSectionTitle('1. Project Overview & Business Purpose', 'COMMERCIAL SaaS');

  addParagraph(
    'SwitchgearOS is a commercial, multi-tenant Software-as-a-Service (SaaS) platform engineered specifically for Low Voltage (LV) electrical switchgear manufacturers, system integrators, panel builders, and tender estimation departments in the United Arab Emirates and globally. The platform transforms the traditionally fragmented, error-prone manual spreadsheets used in switchgear estimation into an automated, auditable, and production-ready engineering engine.'
  );

  addBullet(
    'Core Objective',
    'Enable panel manufacturers to rapidly configure switchboards, automatically size copper busbars, calculate direct material costs, apply configurable overheads and profit margins, generate customer quotations in AED with 5% UAE VAT, and export fabrication job cards for workshop production.'
  );

  addBullet(
    'Panel Types Supported',
    'Main Distribution Boards (MDB), Sub-Main Distribution Boards (SMDB), Final Distribution Boards (DB), Motor Control Centres (MCC), Power Control Centres (PCC), Automatic Transfer Switch (ATS) panels, Automatic Power Factor Correction (APFC) capacitor banks with detuned reactors, and Outdoor Feeder Pillars.'
  );

  addBullet(
    'Multi-Tenant Architecture',
    'Each client company operates as an isolated tenant. Data, circuit schedules, secret supplier discounts, bill of materials, and customer quotations are strictly separated by company_id and cryptographic access controls.'
  );

  // ==========================================================================
  // SECTION 2: FRONTEND ARCHITECTURE & TECH STACK
  // ==========================================================================
  addSectionTitle('2. Frontend Architecture & Technology Stack', 'CLIENT LAYER');

  addParagraph(
    'The frontend is built with React 19 and Vite 6, utilizing modern functional components, hooks, TypeScript 5.8+, and Tailwind CSS v4. It delivers real-time calculation responsiveness without server round-trips for standard sizing math, combined with rich interactive engineering canvases.'
  );

  addTable(
    ['Frontend Module', 'Technology / Library', 'Role & Responsibility in SwitchgearOS'],
    [
      ['SPA Framework', 'React 19 + TypeScript', 'Reactive UI, state management, component modularity, type safety.'],
      ['Build Tool & Bundler', 'Vite 6 + Tailwind CSS v4', 'Sub-second HMR in dev, optimized production bundling, modern styling.'],
      ['Auth Gateway', 'Facebook-Style UI + Firebase', 'Recognizable two-column login, Google Sign-in, registration modal.'],
      ['SLD CAD Engine', 'SVG Vector Canvas API', 'IEC 61439 single-line diagram generation, busbar mimic, ATS interlocks.'],
      ['2D Panel GA Studio', 'Dynamic SVG Layout', 'Panel enclosure facia mimic, door cutouts, digital meter placement.'],
      ['Estimation Workspace', 'React State + Sizing Hooks', 'Real-time copper busbar weight, enclosure dimensions, and live pricing.'],
      ['Document & PDF Export', 'jsPDF + SheetJS (XLSX)', 'One-click client quotations, consolidated BOMs, technical submittals.'],
    ],
    [38, 48, 96]
  );

  addCallout('Key Frontend Architectural Highlights', [
    '• Zero Client-Side Secret Leakage: Sensitive OEM master cost lists are safeguarded; tenant pricing is scoped to the user session.',
    '• Immediate Calculation Feedback: When an estimator changes breaker poles, frame size, or copper market price (AED/kg), busbar weights and cost totals recalculate in real-time.',
    '• Responsive Facebook-Style Login: Ensures high conversion and immediate user familiarity while gating access to authenticated engineers.'
  ]);

  // ==========================================================================
  // SECTION 3: BACKEND ARCHITECTURE & REST APIS
  // ==========================================================================
  addSectionTitle('3. Backend Architecture & REST APIs', 'SERVER LAYER');

  addParagraph(
    'The backend runs as a high-performance Node.js / Express service in server.ts with Vite middleware integration. It enforces multi-tenant security, authenticates Firebase JWT bearer tokens, and provides RESTful endpoints interfacing with Cloud SQL PostgreSQL.'
  );

  addTable(
    ['API Route Group', 'Method & Path', 'Backend Functionality & Tenant Isolation'],
    [
      ['Auth & Tenant', 'GET /api/auth/me', 'Resolves Firebase UID, checks user company_id, returns role and subscription.'],
      ['Tenant Registration', 'POST /api/tenant/register', 'Creates new isolated company record with UAE Trade License, TRN & plan.'],
      ['Company Settings', 'PUT /api/tenant/company', 'Updates 15-digit FTA VAT TRN, costing method (Markup vs Margin), addresses.'],
      ['Subscriptions', 'POST /api/subscriptions/upgrade', 'Upgrades tier (Starter/Pro/Adv/Biz), sets user/project quotas in AED.'],
      ['Projects & RFQs', 'GET, POST /api/projects', 'Queries and creates tenders strictly filtered by req.companyId.'],
      ['Panels & Sizing', 'GET, POST /api/panels', 'Handles MDB/SMDB/DB/MCC panels, copper calculations, enclosure sizing.'],
      ['Components Catalog', 'GET, POST /api/components', 'Queries verified OEM components (ABB, Schneider, Siemens, LS, Eaton).'],
      ['Quotations', 'POST /api/quotations', 'Compiles approved BOM, applies overheads, margin %, and 5% UAE VAT.'],
      ['Production Handover', 'POST /api/production/jobs', 'Converts won estimate into workshop job cards (Fabrication, Wiring, FAT).'],
    ],
    [36, 48, 98]
  );

  // ==========================================================================
  // SECTION 4: DATABASE ARCHITECTURE (POSTGRESQL & DRIZZLE)
  // ==========================================================================
  addSectionTitle('4. Database Architecture & Multi-Tenant Schema', 'DATA LAYER');

  addParagraph(
    'The persistence layer utilizes Google Cloud SQL PostgreSQL provisioned via Drizzle ORM. Microsoft SQL Server DDL scripts (001_Database.sql through 005_StoredProcedures.sql) are also maintained for enterprise on-premise deployments. Every single business table carries a company_id foreign key to guarantee complete tenant data separation.'
  );

  addTable(
    ['Table Name', 'Primary Key & Foreign Keys', 'Business Purpose & Key Fields'],
    [
      ['companies', 'id (PK)', 'Tenants (company_code, trade_license_no, vat_trn, currency, plan).'],
      ['users', 'id (PK), company_id (FK)', 'Engineers (uid, email, full_name, role: OWNER/ESTIMATOR/DESIGN/PURCHASE).'],
      ['subscriptions', 'id (PK), company_id (FK)', 'Billing records (plan, price_aed, billing_cycle, max_projects, status).'],
      ['projects', 'id (PK), company_id (FK)', 'Tenders (project_code, client, authority: DEWA/SEWA, due_date, status).'],
      ['estimate_panels', 'id (PK), project_id (FK)', 'Switchboards (panel_type: MDB/MCC, busbar_rating, form_factor: 2b/4b, IP).'],
      ['estimate_items', 'id (PK), panel_id (FK)', 'Feeder circuits (component_id, qty, unit_price, breaking_capacity).'],
      ['components', 'id (PK)', 'Master catalog (oem, part_number, description, rated_current, price).'],
      ['supplier_prices', 'id (PK), component_id (FK)', 'Confidential vendor discount agreements and price validity dates.'],
      ['boms', 'id (PK), project_id (FK)', 'Consolidated material bills aggregating all switchboards across a project.'],
      ['quotations', 'id (PK), project_id (FK)', 'Commercial bids (equipment_cost, copper_cost, margin, 5% UAE VAT).'],
      ['production_jobs', 'id (PK), project_id (FK)', 'Workshop job cards (job_number, stage, assigned_tech, target_fat_date).'],
      ['purchase_requisitions', 'id (PK), company_id (FK)', 'Material purchase requests sent to ABB, Schneider, and local distributors.'],
      ['audit_logs', 'id (PK), company_id (FK)', 'Immutable audit trail logging every tender, price, and role change.'],
    ],
    [38, 48, 96]
  );

  addCallout('Tenant Isolation Security Guarantee', [
    '• Database Level: Every SELECT, UPDATE, and DELETE query automatically injects WHERE company_id = ?.',
    '• Storage Level: A competitor company can never view another panel builder\'s component discount structure, quotation margins, or tender bidding documents.',
    '• RBAC Enforcement: Role-based permissions prevent estimation engineers from altering corporate billing or bank account settings.'
  ]);

  // ==========================================================================
  // SECTION 5: INTERNAL WORKFLOW & CALCULATION ENGINE
  // ==========================================================================
  addSectionTitle('5. Internal Workflow & Estimation Calculations', 'ENGINEERING LOGIC');

  addSubSectionTitle('5.1 End-to-End Workflow Stages:');
  addBullet('Stage 1 - Authentication & Tenant Gate', 'User authenticates via Facebook-style gateway or Google Sign-In; backend binds their session to their isolated manufacturing company.');
  addBullet('Stage 2 - Tender RFQ Setup', 'User creates a tender project, specifying Client, Location, Authority (DEWA, SEWA, ADDC, FEWA), and submission deadline.');
  addBullet('Stage 3 - Switchboard & Circuit Sizing', 'Configures panel assemblies (MDB, SMDB, DB, MCC, APFC, ATS). Selects incomer rating (e.g. 2500A ACB 4P 65kA), bus couplers, and outgoing MCCB/MCB feeders.');
  addBullet('Stage 4 - SLD & CAD GA Generation', 'Single Line Diagram Studio automatically lays out symbols, interlocks, and busbar mimics. 2D GA generator sizes panel height, width, and depth.');
  addBullet('Stage 5 - Costing & Margin Engine', 'Calculates Direct Material + Copper Weight + Enclosure + Assembly Labour + Overheads + Contingency + Target Margin + 5% UAE VAT.');
  addBullet('Stage 6 - Formal Proposal Generation', 'Generates professional commercial quotations and client tender BOQ documents ready for contractor submission.');
  addBullet('Stage 7 - Production Handover & Procurement', 'Upon order award, the estimation BOM converts into workshop job cards, shortage alerts, and supplier Purchase Requisitions.');

  addSubSectionTitle('5.2 Transparent Costing Mathematical Formulas:');
  addParagraph(
    'The estimation engine enforces completely transparent, auditable calculations:'
  );

  addCallout('Switchgear Costing Formula Suite', [
    '1. Direct Material Cost = Sum of (Component Quantity × Net Purchase Price)',
    '2. Copper Busbar Sizing (IEC 61439):',
    '   • Main Busbar Cross Section (mm²) = Rated Current (A) / Current Density (typically 1.5 - 2.0 A/mm²)',
    '   • Copper Weight (kg) = Total Length (m) × Cross Section (mm²) × 0.0089 kg/cm³',
    '   • Total Copper Cost (AED) = Copper Weight (kg) × Daily Market Copper Rate (AED/kg)',
    '3. Enclosure Fabrication Cost = Height (mm) × Width (mm) × Depth (mm) × Form Factor Multiplier (Form 2b: 1.0, Form 4b: 1.4) × Rate/m²',
    '4. Labour Cost = (Copper Hours + Assembly Hours + Wiring Hours + FAT Testing Hours) × Hourly Rate (AED/hr)',
    '5. Total Manufacturing Cost = Direct Material + Copper Cost + Enclosure Cost + Labour Cost',
    '6. Internal Cost with Overheads = Total Manufacturing Cost × (1 + Overhead % / 100)',
    '7. Selling Price (Markup Method) = Internal Cost × (1 + Margin % / 100)',
    '8. Selling Price (Gross Margin Method) = Internal Cost / (1 - Margin % / 100)',
    '9. Final UAE Tender Price = Selling Price + (Selling Price × 5.0% UAE VAT)'
  ]);

  // ==========================================================================
  // SECTION 6: BILLING, SUBSCRIPTION & BANK PAYOUTS
  // ==========================================================================
  addSectionTitle('6. Subscription Billing & Commercial UAE Payout Flow', 'B2B REVENUE');

  addParagraph(
    'SwitchgearOS operates on a monthly or annual SaaS subscription model designed for UAE businesses with four transparent tiers: Starter (AED 299/mo), Professional (AED 499/mo), Advanced (AED 999/mo), and Business (AED 1,999/mo).'
  );

  addTable(
    ['Tier Plan', 'Monthly (AED)', 'Annual (AED)', 'Max Active Users', 'Max Monthly Projects', 'Target Customer Segment'],
    [
      ['Starter', 'AED 299', 'AED 2,990', '2 Users', '10 Projects', 'Small workshops & independent panel estimators'],
      ['Professional', 'AED 499', 'AED 4,990', '5 Users', '50 Projects', 'Mid-sized switchgear factories & system integrators'],
      ['Advanced', 'AED 999', 'AED 9,990', '15 Users', '150 Projects', 'Large panel builders with dedicated engineering departments'],
      ['Business', 'AED 1,999', 'AED 19,990', '50 Users', 'Unlimited', 'Enterprise manufacturing plants with multi-branch tendering'],
    ],
    [28, 28, 28, 30, 32, 36]
  );

  addBullet(
    'Payment Channel 1: Corporate Visa / Mastercard',
    'Online instant checkout via Stripe UAE or Checkout.com. Payouts settle automatically within 2 business days directly into your UAE Corporate Bank Account (Emirates NBD, FAB, ADCB, or Wio).'
  );

  addBullet(
    'Payment Channel 2: UAE Corporate Bank Transfer / Cheque',
    'Platform auto-generates a Proforma Tax Invoice containing company IBAN, SWIFT, and 15-digit FTA TRN for direct B2B wire payment or Post-Dated Cheque (PDC).'
  );

  // Add final page footer
  addFooter();

  return doc;
}

export function downloadProjectDocumentationPDF(options: DocumentationPdfOptions = {}): void {
  const doc = generateProjectDocumentationPDF(options);
  const filename = `SwitchgearOS_Technical_Architecture_and_Workflow_Manual_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
