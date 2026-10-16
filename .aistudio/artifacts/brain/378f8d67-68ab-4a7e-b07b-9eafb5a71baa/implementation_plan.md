# Action Plan: SLD/CAD Studio Integration, PDF Quotation Engine & Client Demo Hardening

A targeted pre-demo action plan to link the SLD & CAD Studio with Projects and RFQ panels via two-way synchronization, equip the Quotation Engine with formal downloadable UAE Tax Quotation PDFs, and verify all navigation routes and database records for tomorrow's client presentation.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following directions have been confirmed for tomorrow's client demo:
> - **Two-Way Panel Sync**: Estimators can jump directly from any Project panel card into the SLD & CAD Studio. Sizing adjustments (incomer ACBs, outgoing MCCBs, copper busbar cross-section, enclosure height/width) will automatically sync back into the Project Panel BOM and recalculate direct costs in real-time.
> - **Downloadable UAE Tax Quotation PDF**: QuotationsView will feature an official, high-resolution downloadable PDF engine (`exportQuotationToPDF` powered by jsPDF) embedding company letterhead, UAE 15-digit TRN, itemized panel schedule, 5% UAE VAT, IEC 61439 warranty clauses, and authorized signatory blocks.
> - **Commercial Demo Focus**: Prominently emphasize the commercial margin/markup engine, overhead allocation, selling price calculation, and multi-tenant B2B subscription plans (Starter, Professional, Advanced, Business) with corporate card and bank transfer checkout.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **SLD & CAD Studio Linkage**: Activates the `currentView === 'sld_studio'` render route in `App.tsx`, connecting it directly with `activeProject` and `activePanels`. Users can select panels dynamically, view graphical single-line schematics, 2D front elevations, ATS walking beam interlocks, and door facias, and click "Sync to Project Estimate" to push bill of materials into the cost stack.
  2. **Official Client Quotation PDF Engine**: Adds an export action in `QuotationsView` that compiles the active quotation, project specifications, panel itemization, commercial terms, and company tax data into a print-ready vector PDF document.
  3. **End-to-End System Audit**: Tests all navigation routes, multi-tenant isolation, demo presets, price books, and database calls to guarantee zero dead clicks or runtime crashes during the client demonstration.
- **Target Audience / Persona**: Switchgear Sales Directors, Lead Estimating Engineers, and Prospective Switchgear Manufacturer Clients attending tomorrow's demo.
- **Key Value**: Demonstrates an unbroken, real-time switchgear engineering-to-commercial pipeline: from SLD drawing straight to profitable, compliant tender submission.

---

### 2. User Experience & Visual Design

- **Panel Card & CAD Studio Navigation**:
  - In `EstimationWorkspaceView`, every panel card will display a "Design in SLD Studio" action button alongside existing feeder tools.
  - In `SLDStudioView`, a top contextual banner will show the active Project and Panel with a switcher dropdown (`MDB-01`, `SMDB-01`, etc.), plus an instant "Sync to Estimate" button.
- **Quotation PDF Presentation**:
  - In `QuotationsView`, alongside the "Export CSV" button, a prominent `Download Official PDF Quote` button will generate a publication-grade document containing:
    - Official corporate letterhead with company TRN and address.
    - Tabular schedule of switchboards (tags, descriptions, forms of separation, incomers, outgoings, unit & total AED).
    - UAE VAT 5% calculation matrix with tabular figures.
    - Standard GCC switchgear terms (testing per IEC 61439, 18-month warranty, payment milestones).
    - Dual signature blocks for Lead Estimator and Commercial Director.
- **Visual Discipline**:
  - Retain the clean engineering aesthetic with dark slate `#0F172A`, cyan `#0891B2` accents, emerald `#059669` commercial indicators, and unboxed metadata with typographic separators (`·`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct In-Memory Sync with LocalStorage & Database Persistence**
  - *Chosen Approach*: When a user updates equipment or busbars in SLD Studio, the engine calculates the equipment sum, copper weight, and enclosure requirements, immediately updating `activePanels` state in `App.tsx` and saving to `localStorage` and backend.
  - *Why*: Eliminates latency and prevents data loss during live client demos; changes in CAD reflect instantaneously in the commercial quotation without page refreshes.
- **Decision 2: Native jsPDF Vector Document Generation for Quotations**
  - *Chosen Approach*: Implement a dedicated `quotationPdfService.ts` utilizing `jspdf` and vector line drawing for tables, headers, and totals.
  - *Why*: Fast, client-side rendering with no external microservice dependency, ensuring offline resilience during client presentations.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT DEMO FLOW                                │
├────────────────────────────────────────────────────────────────────────┤
│  1. RFQ & Project Setup  ──►  2. Panel Configuration & Feeders         │
│     (Project Details,           (MDB-01, SMDB-GF, Form 4b,             │
│      DEWA/SEWA compliance)       Incomer ACB, Outgoing MCCBs)          │
│               │                                │                       │
│               ▼                                ▼                       │
│  3. SLD & CAD Studio    ◄──────────────────────┘                       │
│     - Graphical SLD Editor (Auto-routed busbars & feeder drops)        │
│     - 2D Panel GA Drawing (Cubicle tiers, cable alleys, busbar duct)   │
│     - Door Facia Layout (Meters, selector switches, pilot lamps)       │
│     - ATS Logic (Castell interlock, 3-breaker walking beam)            │
│     - Two-Way Sync to Project Estimate                                 │
│               │                                                        │
│               ▼                                                        │
│  4. Commercial Margin & Markup Engine                                  │
│     (Factory Overheads %, Target Margin %, Selling Price AED)          │
│               │                                                        │
│               ▼                                                        │
│  5. Official Downloadable PDF Quotation                                │
│     (UAE Tax Invoice format, 15-digit TRN, 5% VAT, IEC 61439 terms)   │
│               │                                                        │
│               ▼                                                        │
│  6. B2B Subscription Plans & Payment Gateway                           │
│     (Starter, Professional, Advanced, Business + UAE Stripe / Bank TRN)│
└────────────────────────────────────────────────────────────────────────┘
```

#### Proposed Changes by File:
1. `src/services/quotationPdfService.ts` (New):
   - Generate official multi-page downloadable PDF quotation with UAE VAT, TRN, panel itemization, commercial terms, and signature stamps.
2. `src/components/estimation/QuotationsView.tsx`:
   - Add "Download PDF Quote" button with loading state and toast feedback. Pass company tenant data (TRN, address, name) into the PDF generator.
3. `src/App.tsx`:
   - Mount `SLDStudioView` when `currentView === 'sld_studio'`.
   - Pass `activeProject`, `activePanels`, and a two-way sync callback `handleSyncSLDToPanels` into `SLDStudioView`.
   - Pass company information to `QuotationsView`.
4. `src/components/engineering/SLDStudioView.tsx`:
   - Add a Panel Selector header allowing the user to select which panel from `activePanels` they are designing.
   - Add a "Sync with Project Estimation" button that updates the project panel's BOM and equipment cost.
5. `src/components/estimation/EstimationWorkspaceView.tsx`:
   - Add a direct "Open in SLD CAD" button on every panel card to take the user directly into CAD for that panel.
6. Verification & Demo Testing:
   - Verify TypeScript compilation via `compile_applet`.
   - Ensure all sidebar navigation routes and demo data are active.
