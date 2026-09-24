import { Component, SupplierPrice } from '../types';

export function exportComponentsToCSV(components: Component[]): void {
  const headers = [
    'Component Code',
    'Part Number',
    'Component Name',
    'Category',
    'Manufacturer',
    'Model',
    'Rated Current (A)',
    'Rated Voltage (V)',
    'Poles',
    'Breaking Capacity (kA)',
    'Unit',
    'Current Supplier',
    'Currency',
    'List Price',
    'Discount %',
    'Net Price',
    'Status'
  ];

  const rows = components.map(c => [
    `"${c.componentCode}"`,
    `"${c.partNumber}"`,
    `"${c.componentName.replace(/"/g, '""')}"`,
    `"${c.categoryName || ''}"`,
    `"${c.manufacturerName || ''}"`,
    `"${c.model || ''}"`,
    c.ratedCurrent ?? '',
    c.ratedVoltage ?? '',
    c.poles ?? '',
    c.breakingCapacity ?? '',
    `"${c.unit}"`,
    `"${c.currentPrice?.supplierName || 'Not Quoted'}"`,
    `"${c.currentPrice?.currency || 'AED'}"`,
    c.currentPrice?.listPrice ?? '',
    c.currentPrice?.discountPercent ?? '',
    c.currentPrice?.netPrice ?? '',
    c.isActive ? 'Active' : 'Inactive'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `LV_Switchgear_Components_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPricesToCSV(prices: SupplierPrice[]): void {
  const headers = [
    'Price Record ID',
    'Part Number',
    'Component Name',
    'Manufacturer',
    'Supplier',
    'Supplier Part No',
    'Currency',
    'List Price',
    'Discount %',
    'Net Price',
    'Min Qty',
    'Lead Time (Days)',
    'Price Date',
    'Valid Until',
    'Quotation Ref',
    'Is Current'
  ];

  const rows = prices.map(p => [
    p.supplierPriceID,
    `"${p.partNumber || ''}"`,
    `"${(p.componentName || '').replace(/"/g, '""')}"`,
    `"${p.manufacturerName || ''}"`,
    `"${p.supplierName || ''}"`,
    `"${p.supplierPartNumber || ''}"`,
    `"${p.currency}"`,
    p.listPrice,
    p.discountPercent,
    p.netPrice,
    p.minimumQuantity,
    p.leadTimeDays ?? '',
    p.priceDate,
    p.validUntil || '',
    `"${p.quotationReference || ''}"`,
    p.isCurrent ? 'YES (Current Active)' : 'NO (Historical Archive)'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `LV_Switchgear_Prices_Master_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSQLScript(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBOMToCSV(projectCode: string, bomItems: any[]): void {
  const headers = [
    'Item ID',
    'Part Number',
    'Description',
    'Category',
    'OEM Manufacturer',
    'Total Quantity',
    'Unit',
    'Unit Buying Cost (AED)',
    'Extended Cost (AED)',
    'Used In Panel(s)'
  ];

  const rows = bomItems.map(item => [
    `"${item.id}"`,
    `"${item.partNumber}"`,
    `"${item.description.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    `"${item.manufacturer}"`,
    item.totalQuantity,
    `"${item.unit}"`,
    item.unitRate,
    item.extendedCost,
    `"${item.usedInPanels.join(', ')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `BOM_${projectCode}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportQuotationToCSV(quote: any, panels: any[]): void {
  const headers = [
    'Quotation Number',
    'Project Code',
    'Project Name',
    'Client',
    'Revision',
    'Date',
    'Currency',
    'Equipment Cost',
    'Copper Busbar Cost',
    'Enclosure Cost',
    'Labour Cost',
    'Total Direct Cost',
    'Overhead %',
    'Overhead Amount',
    'Profit Margin %',
    'Profit Margin Amount',
    'Subtotal Before Tax',
    'VAT %',
    'VAT Amount',
    'Grand Total Selling Price'
  ];

  const summaryRow = [
    `"${quote.quotationNumber}"`,
    `"${quote.projectCode}"`,
    `"${quote.projectName}"`,
    `"${quote.clientName}"`,
    `"${quote.revisionNumber}"`,
    `"${quote.quotationDate}"`,
    `"${quote.currency}"`,
    quote.totalEquipmentCost,
    quote.totalCopperCost,
    quote.totalEnclosureCost,
    quote.totalLabourCost,
    quote.totalDirectCost,
    quote.overheadPercent,
    quote.overheadAmount,
    quote.profitMarginPercent,
    quote.profitMarginAmount,
    quote.subtotalBeforeTax,
    quote.taxPercent,
    quote.taxAmount,
    quote.grandTotal
  ];

  let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + summaryRow.join(',') + '\n\n';
  csvContent += 'Panel Tag,Panel Name,Type,Incomer Rating (A),Icu (kA),Separation,IP Rating,Equipment Cost,Copper Cost,Enclosure Cost,Labour Cost,Total Panel Cost\n';
  
  panels.forEach(p => {
    csvContent += [
      `"${p.panelTag}"`,
      `"${p.panelName.replace(/"/g, '""')}"`,
      `"${p.panelTypeCode}"`,
      p.incomerRating,
      p.shortCircuitRating,
      `"${p.formOfSeparation}"`,
      `"${p.ipRating}"`,
      p.equipmentCost,
      p.copperCost,
      p.enclosureCost,
      p.labourCost,
      p.totalPanelCost
    ].join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Quotation_${quote.quotationNumber}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
