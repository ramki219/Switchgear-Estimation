// ============================================================================
// FORMAL COMMERCIAL & TECHNICAL SWITCHGEAR QUOTATION PDF GENERATOR
// Compliant with UAE Tax Authority (FTA) 15-Digit TRN & 5% VAT Requirements
// IEC 61439-1/2 Low Voltage Switchgear & Controlgear Assemblies Standard
// ============================================================================

import { jsPDF } from 'jspdf';
import { Project, EstimatePanel, Quotation, CompanyTenant } from '../types';

export interface QuotationPdfOptions {
  project: Project;
  panels: EstimatePanel[];
  quotation?: Quotation;
  company?: CompanyTenant | null;
  calculationDetails?: {
    totalDirectCost: number;
    overheadAmount: number;
    profitMarginAmount: number;
    subtotalBeforeTax: number;
    taxAmount: number;
    grandTotal: number;
  };
}

export function generateQuotationPDF(options: QuotationPdfOptions): jsPDF {
  const { project, panels, quotation, company, calculationDetails } = options;

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

  // Corporate Color Palette
  const darkNavy = [15, 23, 42]; // #0F172A (Primary Slate)
  const headerCyan = [8, 145, 178]; // #0891B2 (Cyan accent)
  const textDark = [30, 41, 59]; // #1E293B
  const textMuted = [100, 116, 139]; // #64748B
  const emeraldGreen = [5, 150, 105]; // #059669
  const borderGrey = [226, 232, 240]; // #E2E8F0
  const bgSoft = [248, 250, 252]; // #F8FAFC

  // Calculations fallback
  const totalEquip = panels.reduce((sum, p) => sum + p.equipmentCost, 0);
  const totalCu = panels.reduce((sum, p) => sum + p.copperCost, 0);
  const totalEnc = panels.reduce((sum, p) => sum + p.enclosureCost, 0);
  const totalLab = panels.reduce((sum, p) => sum + p.labourCost, 0);
  const directCost = totalEquip + totalCu + totalEnc + totalLab;

  const overheadPct = quotation?.overheadPercent ?? 8.0;
  const marginPct = quotation?.profitMarginPercent ?? 15.0;
  const vatPct = quotation?.taxPercent ?? (company?.defaultVatPercent ? Number(company.defaultVatPercent) : 5.0);

  const overheadAmt = calculationDetails?.overheadAmount ?? (directCost * (overheadPct / 100));
  const subtotal = calculationDetails?.subtotalBeforeTax ?? ((directCost + overheadAmt) / (1 - marginPct / 100));
  const vatAmt = calculationDetails?.taxAmount ?? (subtotal * (vatPct / 100));
  const grandTotal = calculationDetails?.grandTotal ?? (subtotal + vatAmt);

  const quoteNo = quotation?.quotationNumber || `QT-${new Date().getFullYear()}-${String(project.projectID).padStart(3, '0')}-R0`;
  const revNo = quotation?.revisionNumber || 'R0';
  const quoteDate = quotation?.quotationDate || new Date().toISOString().split('T')[0];
  const validityDays = quotation?.validityDays || 30;
  const deliveryWeeks = quotation?.deliveryPeriodWeeks || 8;
  const warrantyMonths = quotation?.warrantyMonths || 18;
  const paymentTerms = quotation?.paymentTerms || '10% Advance with Order, 80% against Delivery, 10% on Testing & Handover';
  const currency = project.currency || company?.currency || 'AED';

  // Multi-page management
  const addPageHeader = (pageNum: number) => {
    if (pageNum > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`${company?.companyName || 'LV SWITCHGEAR MANUFACTURING'} • QUOTATION REF: ${quoteNo} (${revNo})`, margin, margin);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
      y = margin + 8;
    }
  };

  const addPageFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(
        `Confidential Tender Document • Switchgear Assembly IEC 61439-1/2 • TRN: ${company?.vatTrn || '100293847500003'}`,
        margin,
        pageHeight - 8
      );
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8);
    }
  };

  const checkAddPage = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 18) {
      doc.addPage();
      y = margin + 8;
      addPageHeader(doc.getNumberOfPages());
    }
  };

  // --------------------------------------------------------------------------
  // PAGE 1: FORMAL COMMERCIAL & TECHNICAL PROPOSAL
  // --------------------------------------------------------------------------

  // Corporate Top Bar / Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(margin, y, contentWidth, 22, 'F');

  // Company Name & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text((company?.companyName || 'GULF SWITCHGEAR & POWER SOLUTIONS LLC').toUpperCase(), margin + 5, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 220, 240);
  const companyAddr = `${company?.address || 'Industrial Area 11'}, ${company?.city || 'Dubai'}, ${company?.country || 'United Arab Emirates'}`;
  doc.text(companyAddr, margin + 5, y + 13.5);
  doc.text(`Tel: ${company?.phone || '+971 4 338 9000'} | Email: ${company?.email || 'sales@switchgear.ae'} | Trade Lic: ${company?.tradeLicenseNo || 'TL-984210'}`, margin + 5, y + 18);

  // UAE Tax Registration Number (TRN) Badge
  doc.setFillColor(headerCyan[0], headerCyan[1], headerCyan[2]);
  doc.roundedRect(pageWidth - margin - 62, y + 3.5, 57, 15, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('UAE FEDERAL TAX AUTHORITY', pageWidth - margin - 59, y + 8);
  doc.setFontSize(8.5);
  doc.text(`TRN: ${company?.vatTrn || '100293847500003'}`, pageWidth - margin - 59, y + 13.5);

  y += 27;

  // Title Ribbon
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(headerCyan[0], headerCyan[1], headerCyan[2]);
  doc.text('FORMAL COMMERCIAL & TECHNICAL PROPOSAL — LV SWITCHGEAR ASSEMBLIES', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`IEC 61439-1/2 COMPLIANT`, pageWidth - margin - 46, y + 5.5);

  y += 12;

  // Quotation Metadata & Client Information (Two Column Box)
  const boxHeight = 36;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

  // Vertical Divider
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.line(margin + contentWidth / 2, y, margin + contentWidth / 2, y + boxHeight);

  // Left Column: Client & Project Details
  const col1X = margin + 4;
  let textY = y + 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('PROJECT & CLIENT PARTICULARS', col1X, textY);
  textY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Project Name:', col1X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(project.projectName.substring(0, 36), col1X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Project Code:', col1X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headerCyan[0], headerCyan[1], headerCyan[2]);
  doc.text(`${project.projectCode} • ${project.authority || 'DEWA'} Approved`, col1X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Client Name:', col1X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(project.clientName.substring(0, 36), col1X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Consultant:', col1X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text((project.consultantName || 'Engineering Bureau Consult').substring(0, 34), col1X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Location:', col1X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${project.location || 'Dubai'}, United Arab Emirates`, col1X + 26, textY);

  // Right Column: Quotation Commercial Meta
  const col2X = margin + contentWidth / 2 + 5;
  textY = y + 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('TENDER & COMMERCIAL REFERENCE', col2X, textY);
  textY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Quotation No:', col2X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headerCyan[0], headerCyan[1], headerCyan[2]);
  doc.text(quoteNo, col2X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Revision / Status:', col2X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${revNo} • ${quotation?.status || 'SUBMITTED'}`, col2X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Issue Date:', col2X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(quoteDate, col2X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Validity Period:', col2X, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${validityDays} Calendar Days`, col2X + 26, textY);
  textY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Estimator:', col2X, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(project.assignedEstimator || 'Lead Estimation Engineer', col2X + 26, textY);

  y += boxHeight + 6;

  // --------------------------------------------------------------------------
  // ITEMIZED SWITCHBOARDS & ESTIMATION BILL OF QUANTITIES
  // --------------------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('1. ITEMIZED SCHEDULE OF LOW VOLTAGE SWITCHBOARDS', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`(All prices in ${currency} exclusive of 5% UAE VAT unless indicated)`, margin + 98, y);

  y += 3.5;

  // Table Headers
  const colWidths = [10, 24, 76, 12, 28, 32];
  const tableHeaders = ['Item', 'Tag', 'Technical Specification & Configuration', 'Qty', 'Unit Rate', `Total (${currency})`];

  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let curX = margin;
  tableHeaders.forEach((th, idx) => {
    const align = (idx === 0 || idx === 3) ? 'center' : (idx >= 4 ? 'right' : 'left');
    const posX = align === 'right' ? curX + colWidths[idx] - 2 : (align === 'center' ? curX + colWidths[idx] / 2 : curX + 2);
    doc.text(th, posX, y + 4.8, { align });
    curX += colWidths[idx];
  });

  y += 7;

  // Table Rows
  panels.forEach((panel, pIdx) => {
    checkAddPage(18);

    const isEven = pIdx % 2 === 0;
    doc.setFillColor(isEven ? 255 : bgSoft[0], isEven ? 255 : bgSoft[1], isEven ? 255 : bgSoft[2]);
    
    // Calculate approximate panel selling price proportionally
    const panelDirect = panel.equipmentCost + panel.copperCost + panel.enclosureCost + panel.labourCost;
    const panelProportion = directCost > 0 ? (panelDirect / directCost) : (1 / panels.length);
    const panelSelling = subtotal * panelProportion;

    const rowHeight = 14;
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    curX = margin;

    // Col 0: Item
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(String(pIdx + 1).padStart(2, '0'), curX + colWidths[0] / 2, y + 5.5, { align: 'center' });
    curX += colWidths[0];

    // Col 1: Panel Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(headerCyan[0], headerCyan[1], headerCyan[2]);
    doc.text(panel.panelTag, curX + 2, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(panel.panelTypeCode || 'Switchboard', curX + 2, y + 9.5);
    curX += colWidths[1];

    // Col 2: Specification
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(panel.panelName.substring(0, 48), curX + 2, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const incomerStr = panel.incomerRating ? `Incomer: ${panel.incomerRating}A` : 'Custom Incomer';
    const formStr = panel.formOfSeparation ? `• ${panel.formOfSeparation}` : '• Form 4B';
    const ipStr = panel.ipRating ? `• ${panel.ipRating}` : '• IP54';
    const circuitsCount = panel.items ? panel.items.length : 12;
    doc.text(`${incomerStr} ${formStr} ${ipStr} • ${circuitsCount} Outgoing Feeders`, curX + 2, y + 9);
    doc.text(`Copper: ${panel.copperWeightKg || 65} kg Cu • Dim: ${panel.enclosureWidth || 1600}x${panel.enclosureHeight || 2000}x${panel.enclosureDepth || 600}mm`, curX + 2, y + 12.5);
    curX += colWidths[2];

    // Col 3: Qty
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('1 No.', curX + colWidths[3] / 2, y + 6.5, { align: 'center' });
    curX += colWidths[3];

    // Col 4: Unit Rate
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(panelSelling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), curX + colWidths[4] - 2, y + 6.5, { align: 'right' });
    curX += colWidths[4];

    // Col 5: Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(panelSelling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), curX + colWidths[5] - 2, y + 6.5, { align: 'right' });

    y += rowHeight;
  });

  // --------------------------------------------------------------------------
  // FINANCIAL TOTALS & UAE VAT BREAKDOWN
  // --------------------------------------------------------------------------
  checkAddPage(48);
  y += 4;

  const summaryWidth = 92;
  const summaryX = pageWidth - margin - summaryWidth;

  // Summary Container
  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(summaryX, y, summaryWidth, 38, 1.5, 1.5, 'FD');

  let sY = y + 5.5;

  // Subtotal (Excl. VAT)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Total Net Amount (Excl. VAT):', summaryX + 4, sY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, summaryX + summaryWidth - 4, sY, { align: 'right' });
  sY += 5.5;

  // Factory Routine Testing & FAT
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Routine FAT Testing (IEC 61439):', summaryX + 4, sY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text('INCLUDED', summaryX + summaryWidth - 4, sY, { align: 'right' });
  sY += 5.5;

  // UAE VAT (5%)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`UAE Federal VAT (${vatPct.toFixed(1)}%):`, summaryX + 4, sY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(headerCyan[0], headerCyan[1], headerCyan[2]);
  doc.text(`+${vatAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, summaryX + summaryWidth - 4, sY, { align: 'right' });
  sY += 6;

  // Divider
  doc.setDrawColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.setLineWidth(0.6);
  doc.line(summaryX + 3, sY - 1, summaryX + summaryWidth - 3, sY - 1);

  // Grand Total Banner
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.rect(summaryX + 1, sY, summaryWidth - 2, 13, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text('GRAND TOTAL TENDER PRICE (INCL. VAT):', summaryX + 4, sY + 5);

  doc.setFontSize(10.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`, summaryX + summaryWidth - 4, sY + 10, { align: 'right' });

  // Left Note block next to summary
  const noteWidth = contentWidth - summaryWidth - 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, noteWidth, 38, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('TAX & COMMERCIAL NOTES', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('• Prices are formulated in accordance with UAE VAT Federal Decree-Law No. (8).', margin + 4, y + 10.5);
  doc.text(`• Supplier TRN: ${company?.vatTrn || '100293847500003'} (Registered with UAE FTA).`, margin + 4, y + 15);
  doc.text('• Busbar calculations sized as per IEC 61439-1 with copper conductivity >99.9% IACS.', margin + 4, y + 19.5);
  doc.text(`• Quotation valid for ${validityDays} days from issue date. Copper price indexed to LME cash.`, margin + 4, y + 24);
  doc.text('• Routine FAT tests: High Voltage insulation, contact resistance, and trip logic.', margin + 4, y + 28.5);

  y += 44;

  // --------------------------------------------------------------------------
  // COMMERCIAL TERMS & CONDITIONS
  // --------------------------------------------------------------------------
  checkAddPage(55);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('2. COMMERCIAL TERMS, WARRANTY & SCOPE BOUNDARY', margin, y);
  y += 4;

  doc.setFillColor(bgSoft[0], bgSoft[1], bgSoft[2]);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

  let tY = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Payment Milestones:', margin + 4, tY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(paymentTerms, margin + 34, tY);
  tY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Manufacturing Lead Time:', margin + 4, tY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${deliveryWeeks} weeks from approval of single-line diagrams (SLD) & advance payment.`, margin + 34, tY);
  tY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Standard Warranty:', margin + 4, tY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${warrantyMonths} months from supply date or 12 months from commercial commissioning.`, margin + 34, tY);
  tY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Scope Inclusions:', margin + 4, tY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Supply of switchboards as per approved SLD, factory routine tests (FAT), and delivery to site.', margin + 34, tY);
  tY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Scope Exclusions:', margin + 4, tY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Civil foundations, site cable laying/termination, glands, and local utility inspection charges.', margin + 34, tY);

  y += 40;

  // --------------------------------------------------------------------------
  // AUTHORIZED SIGNATURE & COMPANY SEAL BLOCK
  // --------------------------------------------------------------------------
  checkAddPage(32);

  const sigWidth = (contentWidth - 8) / 2;

  // Estimator Sign Block
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, y, sigWidth, 26, 1.5, 1.5, 'D');

  doc.line(margin + 6, y + 16, margin + sigWidth - 6, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(project.assignedEstimator || 'Lead Estimation Engineer', margin + 6, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Authorized Switchgear Estimator • Electrical Technical Division', margin + 6, y + 23.5);

  // Commercial Director Block
  const sig2X = margin + sigWidth + 8;
  doc.roundedRect(sig2X, y, sigWidth, 26, 1.5, 1.5, 'D');

  doc.line(sig2X + 6, y + 16, sig2X + sigWidth - 6, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Commercial Procurement Director', sig2X + 6, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Approved for Official Client Tender Submission (with Company Seal)', sig2X + 6, y + 23.5);

  // Apply footers to all pages
  addPageFooter();

  return doc;
}
