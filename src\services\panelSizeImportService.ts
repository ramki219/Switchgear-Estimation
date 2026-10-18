import * as XLSX from 'xlsx';
import { 
  Component, 
  Manufacturer, 
  PanelType, 
  Supplier, 
  ImportedPanelSizeRow, 
  BulkImportOptions, 
  BulkImportResult 
} from '../types';
import { storageService } from './storageService';

export interface PanelSizeRowValidation {
  rowNumber: number;
  status: 'NEW' | 'UPDATE' | 'ERROR';
  messages: string[];
  row: ImportedPanelSizeRow;
}

export interface PanelSizeValidationSummary {
  totalRows: number;
  newCount: number;
  updateCount: number;
  errorCount: number;
  validations: PanelSizeRowValidation[];
}

/**
 * Downloads a pre-formatted Excel (.xlsx) Template for importing Brand Panel Enclosure Sizes.
 * Pre-filled with standard sizes from Alfanar, RR Global, ABB, Schneider Electric, Siemens & Rittal.
 */
export function downloadPanelSizeImportTemplateXLSX(
  manufacturers: Manufacturer[],
  panelTypes: PanelType[],
  suppliers: Supplier[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Realistic Sample Panel Enclosure Rows
  const sampleRows = [
    {
      'Brand (OEM)*': 'Alfanar',
      'Part Number*': 'ALF-PRM-2500-4B6',
      'Panel Size / Model Name*': 'Alfanar Prominence Form 4b MDB Enclosure 2500A',
      'Panel Category Code': 'MDB',
      'Height (mm)*': 2200,
      'Width (mm)*': 3200,
      'Depth (mm)*': 1000,
      'Columns / Tiers': 4,
      'Form of Separation': 'Form 4b Type 6',
      'IP Rating': 'IP42',
      'Incomer Rating (A)': 2500,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 14800,
      'List Price (AED)': 17500,
      'Discount %': 15.4,
      'Supplier Name': 'Danube Switchgear Supplies FZCO',
      'Quotation Reference': 'QT-DAN-ALF-001',
      'Lead Time (Days)': 21,
      'Description / Remarks': 'Heavy duty modular Form 4b Type 6 cubicle suite with segregated busbar chambers'
    },
    {
      'Brand (OEM)*': 'Alfanar',
      'Part Number*': 'ALF-AFS-630-2B',
      'Panel Size / Model Name*': 'Alfanar Alfasafe Form 2b SMDB Enclosure 630A',
      'Panel Category Code': 'SMDB',
      'Height (mm)*': 1800,
      'Width (mm)*': 1000,
      'Depth (mm)*': 400,
      'Columns / Tiers': 1,
      'Form of Separation': 'Form 2b',
      'IP Rating': 'IP54',
      'Incomer Rating (A)': 630,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 2850,
      'List Price (AED)': 3350,
      'Discount %': 14.9,
      'Supplier Name': 'Danube Switchgear Supplies FZCO',
      'Quotation Reference': 'QT-DAN-ALF-002',
      'Lead Time (Days)': 14,
      'Description / Remarks': 'Universal floor-standing sub-main distribution board enclosure with Form 2b busbar barrier'
    },
    {
      'Brand (OEM)*': 'RR Global',
      'Part Number*': 'RR-PRM-3200-4B6',
      'Panel Size / Model Name*': 'RR Prominence Form 4b Type 6 MDB Enclosure 3200A',
      'Panel Category Code': 'MDB',
      'Height (mm)*': 2200,
      'Width (mm)*': 3600,
      'Depth (mm)*': 1000,
      'Columns / Tiers': 4,
      'Form of Separation': 'Form 4b Type 6',
      'IP Rating': 'IP42',
      'Incomer Rating (A)': 3200,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 16500,
      'List Price (AED)': 19500,
      'Discount %': 15.4,
      'Supplier Name': 'Bin Ghalib Engineering Co.',
      'Quotation Reference': 'QT-BG-RR-001',
      'Lead Time (Days)': 21,
      'Description / Remarks': 'RR Prominence 3200A Form 4b Type 6 DEWA & ADDC compliant modular switchboard suite'
    },
    {
      'Brand (OEM)*': 'RR Global',
      'Part Number*': 'RR-MOD-400-2B',
      'Panel Size / Model Name*': 'RR Modular Form 2b SMDB Enclosure 400A',
      'Panel Category Code': 'SMDB',
      'Height (mm)*': 1800,
      'Width (mm)*': 800,
      'Depth (mm)*': 400,
      'Columns / Tiers': 1,
      'Form of Separation': 'Form 2b',
      'IP Rating': 'IP54',
      'Incomer Rating (A)': 400,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 2450,
      'List Price (AED)': 2900,
      'Discount %': 15.5,
      'Supplier Name': 'Bin Ghalib Engineering Co.',
      'Quotation Reference': 'QT-BG-RR-002',
      'Lead Time (Days)': 14,
      'Description / Remarks': 'Sub-main distribution floor cubicle with Form 2b separation and bottom/top cable gland plates'
    },
    {
      'Brand (OEM)*': 'ABB',
      'Part Number*': 'ABB-SPEP-4000-4B7',
      'Panel Size / Model Name*': 'ABB System pro E Power Form 4b Type 7 MDB 4000A',
      'Panel Category Code': 'MDB',
      'Height (mm)*': 2200,
      'Width (mm)*': 4000,
      'Depth (mm)*': 1000,
      'Columns / Tiers': 5,
      'Form of Separation': 'Form 4b Type 7',
      'IP Rating': 'IP42',
      'Incomer Rating (A)': 4000,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 22800,
      'List Price (AED)': 27500,
      'Discount %': 17.1,
      'Supplier Name': 'Al Ghandi Electrical Supplies LLC',
      'Quotation Reference': 'QT-AG-ABB-SPEP',
      'Lead Time (Days)': 28,
      'Description / Remarks': 'Premium ABB type-tested modular switchboard suite up to 4000A / 100kA, 5 columns'
    },
    {
      'Brand (OEM)*': 'Schneider Electric',
      'Part Number*': 'SCH-PRIS-P-3200-4B',
      'Panel Size / Model Name*': 'Schneider PrismaSeT P Form 4b MDB Enclosure 3200A',
      'Panel Category Code': 'MDB',
      'Height (mm)*': 2200,
      'Width (mm)*': 3200,
      'Depth (mm)*': 1000,
      'Columns / Tiers': 4,
      'Form of Separation': 'Form 4b Type 6',
      'IP Rating': 'IP42',
      'Incomer Rating (A)': 3200,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 18900,
      'List Price (AED)': 22800,
      'Discount %': 17.1,
      'Supplier Name': 'Danube Switchgear Supplies FZCO',
      'Quotation Reference': 'QT-DAN-SCH-PRISP',
      'Lead Time (Days)': 28,
      'Description / Remarks': 'Schneider PrismaSeT P modular system up to 3200A with Linergy busbar ducting'
    },
    {
      'Brand (OEM)*': 'Siemens',
      'Part Number*': 'SIE-SIV-S8-3200-4B',
      'Panel Size / Model Name*': 'Siemens SIVACON S8 Form 4b MDB Enclosure 3200A',
      'Panel Category Code': 'MDB',
      'Height (mm)*': 2200,
      'Width (mm)*': 3600,
      'Depth (mm)*': 1000,
      'Columns / Tiers': 4,
      'Form of Separation': 'Form 4b Type 6',
      'IP Rating': 'IP42',
      'Incomer Rating (A)': 3200,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 19400,
      'List Price (AED)': 23500,
      'Discount %': 17.5,
      'Supplier Name': 'Gulf Electrical Distribution FZCO',
      'Quotation Reference': 'QT-GED-SIE-S8',
      'Lead Time (Days)': 28,
      'Description / Remarks': 'Siemens design-verified SIVACON S8 low voltage switchboard system 3200A'
    },
    {
      'Brand (OEM)*': 'Rittal',
      'Part Number*': 'RIT-VX25-2500-IP55',
      'Panel Size / Model Name*': 'Rittal VX25 Form 4b Modular Suite 2500A',
      'Panel Category Code': 'MDB',
      'Height (mm)*': 2200,
      'Width (mm)*': 3200,
      'Depth (mm)*': 800,
      'Columns / Tiers': 4,
      'Form of Separation': 'Form 4b Type 6',
      'IP Rating': 'IP55',
      'Incomer Rating (A)': 2500,
      'Mounting Type': 'Floor Standing',
      'Sheet Metal Thickness (mm)': 2.0,
      'Database Listed Net Price (AED)*': 17600,
      'List Price (AED)': 21200,
      'Discount %': 17.0,
      'Supplier Name': 'Gulf Electrical Distribution FZCO',
      'Quotation Reference': 'QT-GED-RIT-VX25',
      'Lead Time (Days)': 21,
      'Description / Remarks': 'Rittal VX25 Ri4Power Form 4b modular bayed suite with IP55 foamed gasket'
    }
  ];

  const wsData = XLSX.utils.json_to_sheet(sampleRows);

  // Column width auto-fit
  wsData['!cols'] = [
    { wch: 18 }, // Brand
    { wch: 22 }, // Part Number
    { wch: 45 }, // Model Name
    { wch: 20 }, // Category Code
    { wch: 12 }, // Height
    { wch: 12 }, // Width
    { wch: 12 }, // Depth
    { wch: 16 }, // Columns
    { wch: 20 }, // Form of Separation
    { wch: 12 }, // IP Rating
    { wch: 18 }, // Incomer Rating
    { wch: 18 }, // Mounting
    { wch: 22 }, // Sheet Thickness
    { wch: 28 }, // Net Price
    { wch: 16 }, // List Price
    { wch: 12 }, // Discount
    { wch: 32 }, // Supplier
    { wch: 22 }, // Quotation Ref
    { wch: 16 }, // Lead Time
    { wch: 55 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, wsData, 'Panel Sizes Template');

  // 2. Reference Lookup Sheet
  const brandList = [
    { 'Valid Brands (OEM)': 'Alfanar', 'Country': 'Saudi Arabia / UAE', 'Standard Ranges': 'Prominence, Alfasafe, AlphaBox' },
    { 'Valid Brands (OEM)': 'RR Global', 'Country': 'UAE / India', 'Standard Ranges': 'RR Prominence, RR Modular, PowerFlex' },
    { 'Valid Brands (OEM)': 'ABB', 'Country': 'Switzerland / UAE', 'Standard Ranges': 'System pro E Power, ArTu K, ArTu L' },
    { 'Valid Brands (OEM)': 'Schneider Electric', 'Country': 'France / UAE', 'Standard Ranges': 'PrismaSeT P, PrismaSeT G, Spacial SF' },
    { 'Valid Brands (OEM)': 'Siemens', 'Country': 'Germany / UAE', 'Standard Ranges': 'SIVACON S8, ALPHA 630' },
    { 'Valid Brands (OEM)': 'Rittal', 'Country': 'Germany / UAE', 'Standard Ranges': 'VX25 Ri4Power, AX Compact' },
  ];

  const separationList = [
    { 'Form of Internal Separation': 'Form 1', 'Standard': 'IEC 61439-2', 'Description': 'No internal separation between busbars, functional units and terminals' },
    { 'Form of Internal Separation': 'Form 2b', 'Standard': 'IEC 61439-2', 'Description': 'Busbars separated from functional units and terminals' },
    { 'Form of Internal Separation': 'Form 3b', 'Standard': 'IEC 61439-2', 'Description': 'Busbars separated from units, units separated from one another' },
    { 'Form of Internal Separation': 'Form 4b Type 6', 'Standard': 'DEWA / Kahramaa / IEC', 'Description': 'Full separation of busbars, units, and outgoing terminal chambers' },
    { 'Form of Internal Separation': 'Form 4b Type 7', 'Standard': 'ADDC / SEWA / IEC', 'Description': 'Form 4b with separate glanding for all individual outgoing cables' },
  ];

  const wsLookup = XLSX.utils.json_to_sheet(brandList);
  wsLookup['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsLookup, 'Brand Reference');

  const wsSeparation = XLSX.utils.json_to_sheet(separationList);
  wsSeparation['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsSeparation, 'Forms & Standards');

  XLSX.writeFile(wb, 'Panel_Enclosure_Sizes_Import_Template.xlsx');
}

/**
 * Downloads a clean CSV template for Panel Sizes
 */
export function downloadPanelSizeImportTemplateCSV(): void {
  const headers = [
    'Brand (OEM)*',
    'Part Number*',
    'Panel Size / Model Name*',
    'Panel Category Code',
    'Height (mm)*',
    'Width (mm)*',
    'Depth (mm)*',
    'Columns / Tiers',
    'Form of Separation',
    'IP Rating',
    'Incomer Rating (A)',
    'Mounting Type',
    'Sheet Metal Thickness (mm)',
    'Database Listed Net Price (AED)*',
    'List Price (AED)',
    'Discount %',
    'Supplier Name',
    'Quotation Reference',
    'Lead Time (Days)',
    'Description / Remarks'
  ];

  const sampleRows = [
    [
      'Alfanar',
      'ALF-PRM-2500-4B6',
      'Alfanar Prominence Form 4b MDB Enclosure 2500A',
      'MDB',
      '2200',
      '3200',
      '1000',
      '4',
      'Form 4b Type 6',
      'IP42',
      '2500',
      'Floor Standing',
      '2.0',
      '14800',
      '17500',
      '15.4',
      'Danube Switchgear Supplies FZCO',
      'QT-DAN-ALF-001',
      '21',
      'Heavy duty modular Form 4b Type 6 cubicle suite'
    ],
    [
      'RR Global',
      'RR-PRM-3200-4B6',
      'RR Prominence Form 4b Type 6 MDB Enclosure 3200A',
      'MDB',
      '2200',
      '3600',
      '1000',
      '4',
      'Form 4b Type 6',
      'IP42',
      '3200',
      'Floor Standing',
      '2.0',
      '16500',
      '19500',
      '15.4',
      'Bin Ghalib Engineering Co.',
      'QT-BG-RR-001',
      '21',
      'RR Prominence 3200A Form 4b Type 6 DEWA approved'
    ],
    [
      'ABB',
      'ABB-SPEP-4000-4B7',
      'ABB System pro E Power Form 4b Type 7 MDB 4000A',
      'MDB',
      '2200',
      '4000',
      '1000',
      '5',
      'Form 4b Type 7',
      'IP42',
      '4000',
      'Floor Standing',
      '2.0',
      '22800',
      '27500',
      '17.1',
      'Al Ghandi Electrical Supplies LLC',
      'QT-AG-ABB-SPEP',
      '28',
      'ABB System pro E Power 4000A 100kA modular suite'
    ]
  ];

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...sampleRows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Panel_Enclosure_Sizes_Import_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Normalizes header keys for flexible matching
 */
function cleanKey(rawKey: string): string {
  return rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses uploaded .xlsx, .xls, or .csv file into typed ImportedPanelSizeRow[]
 */
export async function parsePanelSizeExcelOrCsvFile(file: File): Promise<ImportedPanelSizeRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Spreadsheet contains no readable sheets.');
  }

  // Use first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('Spreadsheet contains no data rows.');
  }

  const results: ImportedPanelSizeRow[] = [];

  for (const raw of rawRows) {
    // Map with normalized key lookup
    const lookup = new Map<string, any>();
    for (const [k, v] of Object.entries(raw)) {
      lookup.set(cleanKey(k), v);
    }

    const brand = String(
      lookup.get('brandoem') || 
      lookup.get('brand') || 
      lookup.get('manufacturer') || 
      lookup.get('oem') || 
      lookup.get('make') || 
      ''
    ).trim();

    const partNumber = String(
      lookup.get('partnumber') || 
      lookup.get('partno') || 
      lookup.get('part') || 
      lookup.get('modelno') || 
      lookup.get('itemcode') || 
      ''
    ).trim();

    const modelName = String(
      lookup.get('panelsizemodelname') || 
      lookup.get('panelsize') || 
      lookup.get('modelname') || 
      lookup.get('componentname') || 
      lookup.get('description') || 
      lookup.get('name') || 
      ''
    ).trim();

    const panelTypeCode = String(
      lookup.get('panelcategorycode') || 
      lookup.get('paneltypecode') || 
      lookup.get('paneltype') || 
      lookup.get('type') || 
      lookup.get('category') || 
      'MDB'
    ).trim().toUpperCase();

    // Height
    const rawHeight = lookup.get('heightmm') ?? lookup.get('height') ?? lookup.get('h');
    const enclosureHeight = Number(rawHeight) || 2100;

    // Width
    const rawWidth = lookup.get('widthmm') ?? lookup.get('width') ?? lookup.get('w');
    const enclosureWidth = Number(rawWidth) || 2400;

    // Depth
    const rawDepth = lookup.get('depthmm') ?? lookup.get('depth') ?? lookup.get('d');
    const enclosureDepth = Number(rawDepth) || 800;

    // Columns
    const rawCols = lookup.get('columnstiers') ?? lookup.get('columns') ?? lookup.get('tiers') ?? lookup.get('cols');
    const columns = rawCols ? Math.max(1, Number(rawCols) || 1) : 3;

    // Form of Separation
    const formOfSeparation = String(
      lookup.get('formofseparation') || 
      lookup.get('form') || 
      lookup.get('separation') || 
      'Form 4b Type 6'
    ).trim();

    // IP Rating
    const ipRating = String(
      lookup.get('iprating') || 
      lookup.get('ip') || 
      lookup.get('protection') || 
      'IP42'
    ).trim().toUpperCase();

    // Incomer Rating
    const rawIncomer = lookup.get('incomerratinga') ?? lookup.get('incomerrating') ?? lookup.get('current') ?? lookup.get('amps');
    const incomerRating = rawIncomer ? Number(rawIncomer) || undefined : undefined;

    // Mounting
    const mountingType = String(
      lookup.get('mountingtype') || 
      lookup.get('mounting') || 
      'Floor Standing'
    ).trim();

    // Sheet Metal Thickness
    const rawThick = lookup.get('sheetmetalthicknessmm') ?? lookup.get('sheetmetalthickness') ?? lookup.get('thickness') ?? lookup.get('gauge');
    const sheetMetalThickness = rawThick ? Number(rawThick) || 2.0 : 2.0;

    // Net Price (Database listed rate)
    const rawNetPrice = 
      lookup.get('databaselistednetpriceaed') ?? 
      lookup.get('databaselistednetprice') ?? 
      lookup.get('netprice') ?? 
      lookup.get('priceaed') ?? 
      lookup.get('price') ?? 
      lookup.get('cost') ?? 
      lookup.get('listpriceaed') ?? 
      lookup.get('listprice');
    const netPrice = Number(rawNetPrice) || 0;

    // List Price
    const rawListPrice = lookup.get('listpriceaed') ?? lookup.get('listprice');
    const listPrice = rawListPrice ? Number(rawListPrice) || undefined : undefined;

    // Discount %
    const rawDiscount = lookup.get('discount') ?? lookup.get('discountpercent');
    const discountPercent = rawDiscount ? Number(rawDiscount) || 0 : 0;

    // Supplier
    const supplierName = String(
      lookup.get('suppliername') || 
      lookup.get('supplier') || 
      lookup.get('vendor') || 
      lookup.get('distributor') || 
      ''
    ).trim();

    // Quote Ref & Remarks
    const quotationReference = String(lookup.get('quotationreference') || lookup.get('quoteref') || '').trim();
    const description = String(lookup.get('descriptionremarks') || lookup.get('description') || lookup.get('remarks') || '').trim();
    const leadTimeDays = Number(lookup.get('leadtimedays') || lookup.get('leadtime')) || 21;

    // Only skip if entirely blank
    if (!partNumber && !brand && !modelName && netPrice === 0) {
      continue;
    }

    results.push({
      brand,
      partNumber,
      modelName,
      panelTypeCode,
      enclosureHeight,
      enclosureWidth,
      enclosureDepth,
      columns,
      formOfSeparation,
      ipRating,
      incomerRating,
      mountingType,
      sheetMetalThickness,
      iecStandard: 'IEC 61439-1/2',
      netPrice,
      listPrice,
      discountPercent,
      supplierName,
      currency: 'AED',
      quotationReference,
      leadTimeDays,
      description,
    });
  }

  return results;
}

/**
 * Validates each imported panel size row against existing catalog components
 */
export function validatePanelSizeRows(
  rows: ImportedPanelSizeRow[],
  existingComponents: Component[]
): PanelSizeValidationSummary {
  let newCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  const validations: PanelSizeRowValidation[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // spreadsheet 1-indexed, accounting for header
    const messages: string[] = [];
    let hasError = false;

    // Mandatory checks
    if (!row.partNumber) {
      messages.push('Part Number is required.');
      hasError = true;
    }
    if (!row.brand) {
      messages.push('Brand (OEM) is required.');
      hasError = true;
    }
    if (!row.modelName) {
      messages.push('Panel Size / Model Name is required.');
      hasError = true;
    }
    if (!row.enclosureHeight || row.enclosureHeight <= 0) {
      messages.push('Height must be greater than 0 mm.');
      hasError = true;
    }
    if (!row.enclosureWidth || row.enclosureWidth <= 0) {
      messages.push('Width must be greater than 0 mm.');
      hasError = true;
    }
    if (!row.enclosureDepth || row.enclosureDepth <= 0) {
      messages.push('Depth must be greater than 0 mm.');
      hasError = true;
    }
    if (row.netPrice === undefined || row.netPrice <= 0) {
      messages.push('Database Listed Net Price (AED) must be greater than 0.');
      hasError = true;
    }

    if (hasError) {
      errorCount++;
      validations.push({
        rowNumber: rowNum,
        status: 'ERROR',
        messages,
        row,
      });
      return;
    }

    // Check if component already exists by partNumber
    const existing = existingComponents.find(c => 
      c.partNumber.trim().toLowerCase() === row.partNumber.trim().toLowerCase()
    );

    if (existing) {
      updateCount++;
      messages.push(`Matches existing component ID #${existing.componentID} (${existing.componentCode}). Specifications & database price will be updated.`);
      validations.push({
        rowNumber: rowNum,
        status: 'UPDATE',
        messages,
        row,
      });
    } else {
      newCount++;
      messages.push(`New brand enclosure size: ${row.brand} - ${row.enclosureHeight}x${row.enclosureWidth}x${row.enclosureDepth}mm (${row.netPrice.toLocaleString()} AED)`);
      validations.push({
        rowNumber: rowNum,
        status: 'NEW',
        messages,
        row,
      });
    }
  });

  return {
    totalRows: rows.length,
    newCount,
    updateCount,
    errorCount,
    validations,
  };
}

/**
 * Executes bulk import of panel sizes into StorageService
 */
export function bulkImportPanelSizes(
  rows: ImportedPanelSizeRow[],
  options: BulkImportOptions
): BulkImportResult {
  let createdCount = 0;
  let updatedCount = 0;
  let pricesAddedCount = 0;
  let manufacturersCreatedCount = 0;
  const errors: string[] = [];

  let manufacturers = storageService.getManufacturers();
  let suppliers = storageService.getSuppliers();
  let components = storageService.getComponents();

  // Ensure Modular Switchboard Enclosures category exists
  let categories = storageService.getCategories();
  let enclosureCategory = categories.find(c => 
    c.categoryID === 11 || 
    c.categoryCode === 'ENCLOSURE' || 
    c.categoryName.toLowerCase().includes('enclosure')
  );

  if (!enclosureCategory) {
    enclosureCategory = storageService.addCategory({
      categoryCode: 'ENCLOSURE',
      categoryName: 'Modular Switchboard Enclosures',
      description: 'Modular sheet steel switchboard cubicles and brand enclosure carcasses',
      defaultIECStandard: 'IEC 61439-1/2',
      isActive: true,
    });
  }

  // Helper to resolve/create Manufacturer
  const resolveManufacturer = (brandName: string): Manufacturer => {
    const cleanBrand = brandName.trim();
    let mfg = manufacturers.find(m => 
      m.manufacturerName.toLowerCase() === cleanBrand.toLowerCase() ||
      m.manufacturerCode.toLowerCase() === cleanBrand.toLowerCase()
    );

    if (!mfg && options.autoCreateManufacturer) {
      const code = cleanBrand.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'OEM';
      mfg = storageService.addManufacturer({
        manufacturerCode: code,
        manufacturerName: cleanBrand,
        country: 'United Arab Emirates',
        website: '',
        contactEmail: `sales@${cleanBrand.toLowerCase().replace(/\s+/g, '')}.com`,
        isActive: true,
      });
      manufacturersCreatedCount++;
      manufacturers = storageService.getManufacturers();
    }
    return mfg || manufacturers[0];
  };

  // Helper to resolve/create Supplier
  const resolveSupplier = (suppName: string): Supplier => {
    const cleanSupp = suppName.trim() || 'Al Ghandi Electrical Supplies LLC';
    let supp = suppliers.find(s => 
      s.supplierName.toLowerCase() === cleanSupp.toLowerCase() ||
      s.supplierCode.toLowerCase() === cleanSupp.toLowerCase()
    );

    if (!supp && options.autoCreateSupplier) {
      const code = `SUP-${cleanSupp.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}`;
      supp = storageService.addSupplier({
        supplierCode: code,
        supplierName: cleanSupp,
        country: 'United Arab Emirates',
        currency: 'AED',
        paymentTerms: '30 Days Net',
        isActive: true,
      });
      suppliers = storageService.getSuppliers();
    }
    return supp || suppliers[0];
  };

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    if (!row.partNumber || !row.brand || !row.modelName || row.netPrice <= 0) {
      errors.push(`Row ${rowNum}: Skipped due to missing required fields.`);
      return;
    }

    try {
      const mfg = resolveManufacturer(row.brand);
      const partNumTrimmed = row.partNumber.trim();
      components = storageService.getComponents();

      const existingComp = components.find(c => 
        c.partNumber.trim().toLowerCase() === partNumTrimmed.toLowerCase()
      );

      let targetCompID: number;

      if (existingComp) {
        targetCompID = existingComp.componentID;
        if (options.updateExisting) {
          const updated: Component = {
            ...existingComp,
            componentName: row.modelName.trim(),
            categoryID: enclosureCategory!.categoryID,
            categoryName: enclosureCategory!.categoryName,
            manufacturerID: mfg.manufacturerID,
            manufacturerName: mfg.manufacturerName,
            manufacturerCode: mfg.manufacturerCode,
            model: row.modelName.trim(),
            description: row.description?.trim() || existingComp.description,
            unit: 'SET',
            enclosureHeight: Number(row.enclosureHeight) || 2100,
            enclosureWidth: Number(row.enclosureWidth) || 2400,
            enclosureDepth: Number(row.enclosureDepth) || 800,
            columns: Number(row.columns) || 3,
            formOfSeparation: row.formOfSeparation || existingComp.formOfSeparation || 'Form 4b Type 6',
            ipRating: row.ipRating || existingComp.ipRating || 'IP42',
            mountingType: row.mountingType || existingComp.mountingType || 'Floor Standing',
            ratedCurrent: row.incomerRating || existingComp.ratedCurrent || 1600,
            sheetMetalThickness: row.sheetMetalThickness || 2.0,
            isEnclosureSize: true,
            iecStandard: row.iecStandard || 'IEC 61439-1/2',
            updatedAt: new Date().toISOString(),
          };
          storageService.updateComponent(updated);
          updatedCount++;
        }
      } else {
        const autoCode = `CMP-ENC-${mfg.manufacturerCode}-${partNumTrimmed.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}`;
        const newComp = storageService.addComponent({
          componentCode: autoCode,
          partNumber: partNumTrimmed,
          componentName: row.modelName.trim(),
          categoryID: enclosureCategory!.categoryID,
          categoryName: enclosureCategory!.categoryName,
          manufacturerID: mfg.manufacturerID,
          manufacturerName: mfg.manufacturerName,
          manufacturerCode: mfg.manufacturerCode,
          model: row.modelName.trim(),
          description: row.description?.trim() || `${row.brand} modular enclosure suite ${row.enclosureHeight}x${row.enclosureWidth}x${row.enclosureDepth}mm`,
          unit: 'SET',
          ratedVoltage: 415,
          ratedCurrent: row.incomerRating || 1600,
          poles: 4,
          frequency: 50,
          ipRating: row.ipRating || 'IP42',
          mountingType: row.mountingType || 'Floor Standing',
          iecStandard: row.iecStandard || 'IEC 61439-1/2',
          enclosureHeight: Number(row.enclosureHeight) || 2100,
          enclosureWidth: Number(row.enclosureWidth) || 2400,
          enclosureDepth: Number(row.enclosureDepth) || 800,
          columns: Number(row.columns) || 3,
          formOfSeparation: row.formOfSeparation || 'Form 4b Type 6',
          sheetMetalThickness: row.sheetMetalThickness || 2.0,
          isEnclosureSize: true,
          isActive: true,
        });
        targetCompID = newComp.componentID;
        createdCount++;
      }

      // Add or update current database supplier price record
      if (options.importPricing && row.netPrice > 0) {
        const supp = resolveSupplier(row.supplierName || `${mfg.manufacturerName} Authorized Distributor`);
        const listPrice = row.listPrice && row.listPrice > 0 ? Number(row.listPrice) : Number((row.netPrice * 1.18).toFixed(2));
        const discountPercent = row.discountPercent && row.discountPercent > 0 
          ? Number(row.discountPercent) 
          : Number((((listPrice - row.netPrice) / listPrice) * 100).toFixed(1));

        storageService.addOrRevisePrice({
          componentID: targetCompID,
          supplierID: supp.supplierID,
          currency: row.currency || 'AED',
          listPrice: listPrice,
          discountPercent: discountPercent,
          minimumQuantity: 1,
          leadTimeDays: row.leadTimeDays || 21,
          priceDate: new Date().toISOString().split('T')[0],
          quotationReference: row.quotationReference || 'EXCEL_PANEL_SIZE_IMPORT',
          notes: `Database listed price for ${row.brand} ${row.modelName} imported from Excel/CSV`,
          user: 'Panel Size Importer',
        });
        pricesAddedCount++;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error during import';
      errors.push(`Row ${rowNum}: ${msg}`);
    }
  });

  return {
    totalProcessed: rows.length,
    createdCount,
    updatedCount,
    pricesAddedCount,
    categoriesCreatedCount: 0,
    manufacturersCreatedCount,
    errors,
  };
}

// Aliases for convenience
export const validatePanelSizeImportRows = validatePanelSizeRows;
export const executePanelSizeBulkImport = bulkImportPanelSizes;
