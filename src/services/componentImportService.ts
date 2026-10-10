import * as XLSX from 'xlsx';
import { 
  Component, 
  ComponentCategory, 
  Manufacturer, 
  Supplier, 
  ImportedComponentRow 
} from '../types';

export interface RowValidation {
  rowNumber: number;
  status: 'NEW' | 'UPDATE' | 'ERROR';
  messages: string[];
  row: ImportedComponentRow;
}

export interface ValidationSummary {
  totalRows: number;
  newCount: number;
  updateCount: number;
  errorCount: number;
  validations: RowValidation[];
}

/**
 * Downloads a pre-formatted Excel (.xlsx) Template for importing master components data.
 * Includes realistic sample switchgear items and reference lookup sheets.
 */
export function downloadComponentImportTemplateXLSX(
  categories: ComponentCategory[],
  manufacturers: Manufacturer[],
  suppliers: Supplier[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sample Data Rows
  const sampleRows = [
    {
      'Part Number*': '1SDA072314R1',
      'Component Name*': 'Emax 2 E2.2B 1600 Ekip Dip LI 4p WMP',
      'Category*': 'Air Circuit Breakers (ACB)',
      'Manufacturer (OEM)*': 'ABB',
      'Component Code': 'ABB-ACB-E22B16',
      'Model / Series': 'Emax 2 E2.2B',
      'Description': '1600A 4P 65kA Withdrawable Air Circuit Breaker with Ekip Dip LI trip unit',
      'Unit': 'EA',
      'Rated Current In (A)': 1600,
      'Rated Voltage Ue (V)': 415,
      'Poles': 4,
      'Breaking Capacity Icu (kA)': 65,
      'IP Rating': 'IP40',
      'Mounting Type': 'Withdrawable',
      'IEC Standard': 'IEC 60947-2',
      'Initial Supplier Name': 'ABB Gulf Dist. LLC',
      'Currency': 'AED',
      'List Price': 18500,
      'Discount %': 32,
      'Quotation Reference': 'RFQ-2026-ABB-01'
    },
    {
      'Part Number*': 'LV431780',
      'Component Name*': 'ComPact NSX250F Micrologic 2.2 4P 250A',
      'Category*': 'Moulded Case Circuit Breakers (MCCB)',
      'Manufacturer (OEM)*': 'Schneider Electric',
      'Component Code': 'SCH-MCCB-NSX250F',
      'Model / Series': 'ComPact NSX',
      'Description': '250A 4P 36kA Fixed Moulded Case Circuit Breaker with electronic trip unit',
      'Unit': 'EA',
      'Rated Current In (A)': 250,
      'Rated Voltage Ue (V)': 415,
      'Poles': 4,
      'Breaking Capacity Icu (kA)': 36,
      'IP Rating': 'IP40',
      'Mounting Type': 'Fixed',
      'IEC Standard': 'IEC 60947-2',
      'Initial Supplier Name': 'Schneider Electric FZE',
      'Currency': 'AED',
      'List Price': 2450,
      'Discount %': 35,
      'Quotation Reference': 'Q-2026-SE-88'
    },
    {
      'Part Number*': '5SY4332-7',
      'Component Name*': 'MCB 3P C-Curve 32A 10kA 400V',
      'Category*': 'Miniature Circuit Breakers (MCB)',
      'Manufacturer (OEM)*': 'Siemens',
      'Component Code': 'SIE-MCB-5SY4332',
      'Model / Series': '5SY4',
      'Description': 'Miniature circuit breaker 400V 10kA, 3-pole, C, 32A, D=70mm',
      'Unit': 'EA',
      'Rated Current In (A)': 32,
      'Rated Voltage Ue (V)': 400,
      'Poles': 3,
      'Breaking Capacity Icu (kA)': 10,
      'IP Rating': 'IP20',
      'Mounting Type': 'DIN Rail',
      'IEC Standard': 'IEC 60898-1',
      'Initial Supplier Name': 'Siemens Middle East Direct',
      'Currency': 'AED',
      'List Price': 145,
      'Discount %': 40,
      'Quotation Reference': 'SIE-RFQ-092'
    },
    {
      'Part Number*': 'LC1D40AP7',
      'Component Name*': 'TeSys D Contactor 3P 40A AC-3 230VAC Coil',
      'Category*': 'Contactors & Relays',
      'Manufacturer (OEM)*': 'Schneider Electric',
      'Component Code': 'SCH-CNT-LC1D40A',
      'Model / Series': 'TeSys D',
      'Description': '3-Pole contactor 40A AC-3 18.5kW @ 400V, 230VAC control coil 1NO+1NC',
      'Unit': 'EA',
      'Rated Current In (A)': 40,
      'Rated Voltage Ue (V)': 415,
      'Poles': 3,
      'Breaking Capacity Icu (kA)': '',
      'IP Rating': 'IP20',
      'Mounting Type': 'DIN Rail',
      'IEC Standard': 'IEC 60947-4-1',
      'Initial Supplier Name': 'Schneider Electric FZE',
      'Currency': 'AED',
      'List Price': 420,
      'Discount %': 38,
      'Quotation Reference': 'Q-2026-SE-88'
    },
    {
      'Part Number*': 'DIRIS-A40',
      'Component Name*': 'DIRIS A-40 Multi-Function Power Quality Meter',
      'Category*': 'Power Quality & Metering',
      'Manufacturer (OEM)*': 'Socomec',
      'Component Code': 'SOC-MTR-DIRISA40',
      'Model / Series': 'DIRIS A-40',
      'Description': 'Multi-function power & energy meter with RS485 Modbus, THD harmonics',
      'Unit': 'EA',
      'Rated Current In (A)': 5,
      'Rated Voltage Ue (V)': 415,
      'Poles': 3,
      'Breaking Capacity Icu (kA)': '',
      'IP Rating': 'IP54',
      'Mounting Type': 'Flush Door Mount',
      'IEC Standard': 'IEC 61557-12',
      'Initial Supplier Name': 'Socomec Middle East',
      'Currency': 'AED',
      'List Price': 2100,
      'Discount %': 28,
      'Quotation Reference': 'SOC-2026-PQ'
    }
  ];

  const mainWs = XLSX.utils.json_to_sheet(sampleRows);

  // Column width configuration for Excel readability
  mainWs['!cols'] = [
    { wch: 18 }, // Part Number
    { wch: 40 }, // Component Name
    { wch: 32 }, // Category
    { wch: 22 }, // Manufacturer
    { wch: 20 }, // Component Code
    { wch: 18 }, // Model
    { wch: 55 }, // Description
    { wch: 8 },  // Unit
    { wch: 18 }, // Rated Current
    { wch: 18 }, // Rated Voltage
    { wch: 8 },  // Poles
    { wch: 22 }, // Breaking Cap
    { wch: 12 }, // IP Rating
    { wch: 16 }, // Mounting Type
    { wch: 16 }, // IEC Standard
    { wch: 26 }, // Supplier
    { wch: 10 }, // Currency
    { wch: 14 }, // List Price
    { wch: 12 }, // Discount %
    { wch: 20 }  // Quotation Ref
  ];

  XLSX.utils.book_append_sheet(wb, mainWs, 'Components_Catalog');

  // 2. Reference Sheet for Allowed Categories & OEMs
  const maxRefRows = Math.max(categories.length, manufacturers.length, suppliers.length);
  const refRows = [];
  for (let i = 0; i < maxRefRows; i++) {
    refRows.push({
      'System Categories': categories[i]?.categoryName || '',
      'Category Code': categories[i]?.categoryCode || '',
      'System Manufacturers (OEM)': manufacturers[i]?.manufacturerName || '',
      'OEM Code': manufacturers[i]?.manufacturerCode || '',
      'Sample Suppliers': suppliers[i]?.supplierName || '',
      'Standard Units': ['EA', 'SET', 'MTR', 'LOT', 'KG'][i] || '',
      'Standard Voltages (V)': ['415', '400', '240', '230', '690'][i] || '',
      'Standard Poles': ['1', '2', '3', '4'][i] || '',
      'Typical Breaking Cap (kA)': ['6', '10', '16', '25', '36', '50', '65', '85', '100'][i] || ''
    });
  }

  const refWs = XLSX.utils.json_to_sheet(refRows);
  refWs['!cols'] = [
    { wch: 32 },
    { wch: 15 },
    { wch: 28 },
    { wch: 12 },
    { wch: 28 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 24 }
  ];

  XLSX.utils.book_append_sheet(wb, refWs, 'Lookup_Reference_Guide');

  XLSX.writeFile(wb, 'LV_Switchgear_Master_Components_Template.xlsx');
}

/**
 * Downloads a CSV template
 */
export function downloadComponentImportTemplateCSV(): void {
  const headers = [
    'Part Number*',
    'Component Name*',
    'Category*',
    'Manufacturer (OEM)*',
    'Component Code',
    'Model / Series',
    'Description',
    'Unit',
    'Rated Current In (A)',
    'Rated Voltage Ue (V)',
    'Poles',
    'Breaking Capacity Icu (kA)',
    'IP Rating',
    'Mounting Type',
    'IEC Standard',
    'Initial Supplier Name',
    'Currency',
    'List Price',
    'Discount %',
    'Quotation Reference'
  ];

  const sampleRows = [
    [
      '"1SDA072314R1"',
      '"Emax 2 E2.2B 1600 Ekip Dip LI 4p WMP"',
      '"Air Circuit Breakers (ACB)"',
      '"ABB"',
      '"ABB-ACB-E22B16"',
      '"Emax 2 E2.2B"',
      '"1600A 4P 65kA Withdrawable Air Circuit Breaker"',
      '"EA"',
      '1600',
      '415',
      '4',
      '65',
      '"IP40"',
      '"Withdrawable"',
      '"IEC 60947-2"',
      '"ABB Gulf Dist. LLC"',
      '"AED"',
      '18500',
      '32',
      '"RFQ-2026-ABB-01"'
    ],
    [
      '"LV431780"',
      '"ComPact NSX250F Micrologic 2.2 4P 250A"',
      '"Moulded Case Circuit Breakers (MCCB)"',
      '"Schneider Electric"',
      '"SCH-MCCB-NSX250F"',
      '"ComPact NSX"',
      '"250A 4P 36kA Fixed Moulded Case Circuit Breaker"',
      '"EA"',
      '250',
      '415',
      '4',
      '36',
      '"IP40"',
      '"Fixed"',
      '"IEC 60947-2"',
      '"Schneider Electric FZE"',
      '"AED"',
      '2450',
      '35',
      '"Q-2026-SE-88"'
    ]
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'LV_Switchgear_Master_Components_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Normalizes string keys for fuzzy header detection
 */
function cleanKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses numeric strings, stripping currency symbols, commas, or spaces
 */
function parseNumber(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  if (typeof val === 'number') return isNaN(val) ? undefined : val;
  const str = String(val).replace(/[^0-9.-]/g, '');
  if (!str) return undefined;
  const num = Number(str);
  return isNaN(num) ? undefined : num;
}

/**
 * Reads and parses an uploaded Excel (.xlsx, .xls) or CSV file into standard ImportedComponentRow format.
 */
export async function parseExcelOrCsvFile(file: File): Promise<ImportedComponentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Use the sheet with the most rows, or first sheet
  let chosenSheetName = workbook.SheetNames[0];
  let maxRows = 0;
  for (const name of workbook.SheetNames) {
    if (name.toLowerCase().includes('reference') || name.toLowerCase().includes('lookup')) continue;
    const s = workbook.Sheets[name];
    if (!s || !s['!ref']) continue;
    const range = XLSX.utils.decode_range(s['!ref']);
    const rowCount = range.e.r - range.s.r;
    if (rowCount > maxRows) {
      maxRows = rowCount;
      chosenSheetName = name;
    }
  }

  const sheet = workbook.Sheets[chosenSheetName];
  if (!sheet) {
    throw new Error('Workbook contains no readable worksheets.');
  }

  const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  if (!rawJson || rawJson.length === 0) {
    throw new Error('Worksheet is empty or could not be parsed.');
  }

  // Map each row flexibly to ImportedComponentRow
  const mappedRows: ImportedComponentRow[] = rawJson.map((raw) => {
    const keys = Object.keys(raw);

    const getVal = (targetKeys: string[]): string => {
      // Pass 1: Exact matches in order of targetKey priority
      for (const tk of targetKeys) {
        const targetClean = cleanKey(tk);
        for (const k of keys) {
          const cleaned = cleanKey(k);
          if (cleaned === targetClean) {
            const v = raw[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') {
              return String(v).trim();
            }
          }
        }
      }
      // Pass 2: Partial substring matches (only if target key is at least 4 chars)
      for (const tk of targetKeys) {
        const targetClean = cleanKey(tk);
        if (targetClean.length < 4) continue;
        for (const k of keys) {
          const cleaned = cleanKey(k);
          if (cleaned.includes(targetClean)) {
            const v = raw[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') {
              return String(v).trim();
            }
          }
        }
      }
      return '';
    };

    const getNum = (targetKeys: string[]): number | undefined => {
      // Pass 1: Exact matches
      for (const tk of targetKeys) {
        const targetClean = cleanKey(tk);
        for (const k of keys) {
          const cleaned = cleanKey(k);
          if (cleaned === targetClean) {
            const val = parseNumber(raw[k]);
            if (val !== undefined) return val;
          }
        }
      }
      // Pass 2: Partial matches
      for (const tk of targetKeys) {
        const targetClean = cleanKey(tk);
        if (targetClean.length < 4) continue;
        for (const k of keys) {
          const cleaned = cleanKey(k);
          if (cleaned.includes(targetClean)) {
            const val = parseNumber(raw[k]);
            if (val !== undefined) return val;
          }
        }
      }
      return undefined;
    };

    const partNumber = getVal(['partnumber', 'partno', 'part', 'itemcode', 'orderingcode', 'catalogno']);
    const componentName = getVal(['componentname', 'itemname', 'productname', 'title', 'name']);
    const categoryName = getVal(['category', 'categoryname', 'componentcategory', 'group', 'type']);
    const manufacturerName = getVal(['manufactureroem', 'manufacturer', 'mfg', 'oem', 'brand', 'make', 'vendor']);
    const componentCode = getVal(['componentcode', 'code', 'internalcode']);
    const model = getVal(['model', 'series', 'range', 'frame']);
    const description = getVal(['description', 'desc', 'specification', 'details']);
    const unit = getVal(['unit', 'uom', 'unitofmeasure']) || 'EA';
    const ratedCurrent = getNum(['ratedcurrentina', 'ratedcurrent', 'currentina', 'current', 'ina', 'amps', 'amp']);
    const ratedVoltage = getNum(['ratedvoltageuev', 'ratedvoltage', 'voltageuev', 'voltage', 'uev', 'volts']);
    const poles = getNum(['poles', 'pole', 'noofpoles']);
    const breakingCapacity = getNum(['breakingcapacityicuka', 'breakingcapacity', 'breakingcapacityka', 'icuka', 'icu', 'ka']);
    const ipRating = getVal(['iprating', 'ip', 'protection']);
    const mountingType = getVal(['mountingtype', 'mounting', 'installation']);
    const iecStandard = getVal(['iecstandard', 'standard', 'iec']);
    const supplierName = getVal(['initialsuppliername', 'suppliername', 'supplier', 'distributor']);
    const currency = getVal(['currency', 'curr']) || 'AED';
    const listPrice = getNum(['listprice', 'unitprice', 'grossprice', 'price', 'rate']);
    const discountPercent = getNum(['discountpercent', 'discount', 'disc']);
    const quotationReference = getVal(['quotationreference', 'quoteref', 'quotationref', 'rfq']);

    return {
      partNumber,
      componentName,
      categoryName,
      manufacturerName,
      componentCode,
      model,
      description,
      unit,
      ratedCurrent,
      ratedVoltage,
      poles,
      breakingCapacity,
      ipRating,
      mountingType,
      iecStandard,
      supplierName,
      currency,
      listPrice,
      discountPercent,
      quotationReference
    };
  });

  // Filter out completely blank rows
  return mappedRows.filter(r => r.partNumber || r.componentName);
}

/**
 * Validates parsed rows against existing catalog data
 */
export function validateImportRows(
  rows: ImportedComponentRow[],
  existingComponents: Component[]
): ValidationSummary {
  const existingPartNumbers = new Set(
    existingComponents.map(c => c.partNumber.trim().toLowerCase())
  );

  let newCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  const validations: RowValidation[] = rows.map((row, index) => {
    const rowNumber = index + 1;
    const messages: string[] = [];
    let isError = false;

    if (!row.partNumber || !row.partNumber.trim()) {
      messages.push('Missing required Part Number');
      isError = true;
    }
    if (!row.componentName || !row.componentName.trim()) {
      messages.push('Missing required Component Name');
      isError = true;
    }
    if (!row.categoryName || !row.categoryName.trim()) {
      messages.push('Category is blank (will use "General LV Switchgear")');
    }
    if (!row.manufacturerName || !row.manufacturerName.trim()) {
      messages.push('OEM is blank (will use "Generic OEM")');
    }

    if (isError) {
      errorCount++;
      return {
        rowNumber,
        status: 'ERROR',
        messages,
        row
      };
    }

    const isExisting = existingPartNumbers.has(row.partNumber.trim().toLowerCase());
    if (isExisting) {
      updateCount++;
      messages.push('Part number exists in catalog - will update item attributes');
      return {
        rowNumber,
        status: 'UPDATE',
        messages,
        row
      };
    } else {
      newCount++;
      return {
        rowNumber,
        status: 'NEW',
        messages,
        row
      };
    }
  });

  return {
    totalRows: rows.length,
    newCount,
    updateCount,
    errorCount,
    validations
  };
}
