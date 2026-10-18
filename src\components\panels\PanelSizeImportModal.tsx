import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  HelpCircle,
  Box,
  Layers,
  Ruler,
  Check
} from 'lucide-react';
import { 
  Component, 
  Manufacturer, 
  PanelType, 
  Supplier, 
  ImportedPanelSizeRow,
  BulkImportOptions,
  BulkImportResult 
} from '../../types';
import { 
  downloadPanelSizeImportTemplateXLSX, 
  downloadPanelSizeImportTemplateCSV, 
  parsePanelSizeExcelOrCsvFile, 
  validatePanelSizeImportRows, 
  PanelSizeValidationSummary, 
  PanelSizeRowValidation,
  executePanelSizeBulkImport
} from '../../services/panelSizeImportService';

interface PanelSizeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturers: Manufacturer[];
  panelTypes: PanelType[];
  suppliers: Supplier[];
  existingComponents: Component[];
  onImportSuccess: (result: BulkImportResult) => void;
}

export const PanelSizeImportModal: React.FC<PanelSizeImportModalProps> = ({
  isOpen,
  onClose,
  manufacturers,
  panelTypes,
  suppliers,
  existingComponents,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportedPanelSizeRow[]>([]);
  const [validationSummary, setValidationSummary] = useState<PanelSizeValidationSummary | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'NEW' | 'UPDATE' | 'ERROR'>('ALL');
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  // Configuration options
  const [options, setOptions] = useState<BulkImportOptions>({
    updateExisting: true,
    autoCreateCategory: true,
    autoCreateManufacturer: true,
    autoCreateSupplier: true,
    importPricing: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setFile(null);
    setParsedRows([]);
    setValidationSummary(null);
    setImportResult(null);
    setParseError(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    await processFile(selected);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setParseError(null);
    setImportResult(null);

    try {
      const rows = await parsePanelSizeExcelOrCsvFile(selectedFile);
      if (rows.length === 0) {
        throw new Error('No valid panel enclosure size rows found in the selected file.');
      }
      setParsedRows(rows);
      const summary = validatePanelSizeImportRows(rows, existingComponents);
      setValidationSummary(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse panel size spreadsheet file.';
      setParseError(msg);
      setParsedRows([]);
      setValidationSummary(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplateXLSX = () => {
    downloadPanelSizeImportTemplateXLSX(manufacturers, panelTypes, suppliers);
  };

  const handleDownloadTemplateCSV = () => {
    downloadPanelSizeImportTemplateCSV();
  };

  const handleExecuteImport = () => {
    if (!parsedRows.length) return;
    setIsSubmitting(true);
    try {
      const res = executePanelSizeBulkImport(parsedRows, options);
      setImportResult(res);
      onImportSuccess(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing panel sizes bulk import.';
      setParseError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredValidations = validationSummary?.validations.filter((v: PanelSizeRowValidation) => {
    if (previewFilter === 'ALL') return true;
    return v.status === previewFilter;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Import Panel Sizes & Brand Enclosures from Excel / CSV
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  .XLSX, .XLS, .CSV
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Import standardized cubicle dimensions (H×W×D), columns, IP rating, form separation, and database listed prices
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Guide & Template Actions Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>How Panel Size Import Works</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                1. Download our template pre-populated with standard switchgear panel sizes from <strong className="text-slate-900">Alfanar, RR Global, ABB, Schneider, Siemens & Rittal</strong>.<br />
                2. Add your custom brand sizes with <strong className="text-slate-900 font-semibold">Height, Width, Depth (mm)</strong>, <strong className="text-slate-900 font-semibold">Part Number</strong>, and <strong className="text-slate-900 font-semibold">Database Listed Price (AED)</strong>.<br />
                3. Once imported, they will be instantly selectable when creating panels and will use the exact database price!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadTemplateXLSX}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-medium font-mono transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel Template (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplateCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-mono transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Template</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              file 
                ? 'border-blue-400 bg-blue-50/50 hover:bg-blue-50' 
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-700">
                  {file ? (
                    <span className="text-blue-700 font-mono font-semibold">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    <span>
                      Click to choose or drag & drop your Panel Sizes <strong className="text-blue-700">.XLSX</strong> or <strong className="text-blue-700">.CSV</strong> spreadsheet
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Supports Excel 2007+ (.xlsx), Excel 97-2004 (.xls), and Comma-Separated Values (.csv)
                </p>
              </div>
            </div>
          </div>

          {/* Parsing Error Message */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Import Rules & Configuration Toggles */}
          {parsedRows.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Import Configuration & Price Rules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.updateExisting}
                    onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Update Existing Sizes</span>
                    <span className="text-[10px] text-slate-500">Update dimensions & ratings if part number already exists</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.autoCreateManufacturer}
                    onChange={(e) => setOptions({ ...options, autoCreateManufacturer: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Auto-create Brand (OEM)</span>
                    <span className="text-[10px] text-slate-500">Register new manufacturer (e.g. Alfanar, RR) if not found</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.importPricing}
                    onChange={(e) => setOptions({ ...options, importPricing: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Store Database Listed Price</span>
                    <span className="text-[10px] text-slate-500">Save active supplier quote rate in database for panel cost</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Validation Metrics & Preview Table */}
          {validationSummary && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 font-mono">
                    Validation Preview:
                  </span>
                  
                  <button
                    onClick={() => setPreviewFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      previewFilter === 'ALL'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All ({validationSummary.totalRows})
                  </button>

                  <button
                    onClick={() => setPreviewFilter('NEW')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center gap-1 ${
                      previewFilter === 'NEW'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-blue-700 border-slate-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>New ({validationSummary.newCount})</span>
                  </button>

                  <button
                    onClick={() => setPreviewFilter('UPDATE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center gap-1 ${
                      previewFilter === 'UPDATE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Updates ({validationSummary.updateCount})</span>
                  </button>

                  {validationSummary.errorCount > 0 && (
                    <button
                      onClick={() => setPreviewFilter('ERROR')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center gap-1 ${
                        previewFilter === 'ERROR'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-rose-700 border-slate-200 hover:bg-rose-50/50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Errors ({validationSummary.errorCount})</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  {validationSummary.validations.length} rows verified for import
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Row / Status</th>
                      <th className="py-2.5 px-3 font-semibold">Brand (OEM)</th>
                      <th className="py-2.5 px-3 font-semibold">Part Number & Model</th>
                      <th className="py-2.5 px-3 font-semibold">Dimensions (H×W×D)</th>
                      <th className="py-2.5 px-3 font-semibold">Columns</th>
                      <th className="py-2.5 px-3 font-semibold">Separation / IP</th>
                      <th className="py-2.5 px-3 font-semibold">Incomer</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Database Price (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredValidations.map((v) => (
                      <tr 
                        key={v.rowNumber} 
                        className={`hover:bg-slate-50 transition-colors ${
                          v.status === 'ERROR' ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold">#{v.rowNumber}</span>
                            {v.status === 'NEW' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                NEW
                              </span>
                            )}
                            {v.status === 'UPDATE' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                UPDATE
                              </span>
                            )}
                            {v.status === 'ERROR' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                ERROR
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 font-bold text-blue-900 whitespace-nowrap">
                          {v.row.brand}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900">{v.row.modelName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{v.row.partNumber}</div>
                          {v.messages.length > 0 && (
                            <div className="text-[10px] text-amber-700 mt-0.5">
                              {v.messages.join(' • ')}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-800">
                          {v.row.enclosureHeight} × {v.row.enclosureWidth} × {v.row.enclosureDepth} mm
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                          {v.row.columns || 1} Cubicles
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 mr-1">
                            {v.row.formOfSeparation || 'Form 4b'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                            {v.row.ipRating || 'IP42'}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-semibold text-blue-800">
                          {v.row.incomerRating ? `${v.row.incomerRating}A` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-emerald-700">
                          {v.row.netPrice ? `${v.row.netPrice.toLocaleString()} AED` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Execution Result Banner */}
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in-50">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Panel Sizes Bulk Import Completed Successfully!</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-emerald-800">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Total Processed</span>
                  <strong className="text-sm font-bold text-slate-900">{importResult.totalProcessed}</strong>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">New Enclosures</span>
                  <strong className="text-sm font-bold text-blue-700">+{importResult.createdCount}</strong>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Updated Enclosures</span>
                  <strong className="text-sm font-bold text-slate-700">{importResult.updatedCount}</strong>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block">Database Prices Saved</span>
                  <strong className="text-sm font-bold text-emerald-700">+{importResult.pricesAddedCount}</strong>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <span className="font-bold block mb-1">Warnings during import:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {importResult.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            {parsedRows.length > 0 && !importResult && (
              <span>Ready to import <strong className="text-slate-800">{parsedRows.length}</strong> panel enclosure sizes into catalog</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              {importResult ? 'Close' : 'Cancel'}
            </button>

            {parsedRows.length > 0 && !importResult && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={Boolean(isSubmitting || (validationSummary && validationSummary.errorCount === validationSummary.totalRows))}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importing Panel Sizes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Import {parsedRows.length} Panel Sizes to Database</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
