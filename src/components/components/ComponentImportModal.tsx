import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  Component, 
  ComponentCategory, 
  Manufacturer, 
  Supplier, 
  ImportedComponentRow,
  BulkImportOptions,
  BulkImportResult 
} from '../../types';
import { 
  downloadComponentImportTemplateXLSX, 
  downloadComponentImportTemplateCSV, 
  parseExcelOrCsvFile, 
  validateImportRows, 
  ValidationSummary, 
  RowValidation 
} from '../../services/componentImportService';
import { storageService } from '../../services/storageService';

interface ComponentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ComponentCategory[];
  manufacturers: Manufacturer[];
  suppliers: Supplier[];
  existingComponents: Component[];
  onImportSuccess: (result: BulkImportResult) => void;
}

export const ComponentImportModal: React.FC<ComponentImportModalProps> = ({
  isOpen,
  onClose,
  categories,
  manufacturers,
  suppliers,
  existingComponents,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ImportedComponentRow[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'NEW' | 'UPDATE' | 'ERROR'>('ALL');
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  // Import configuration options
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
      const rows = await parseExcelOrCsvFile(selectedFile);
      if (rows.length === 0) {
        throw new Error('No valid component rows found in the selected file.');
      }
      setParsedRows(rows);
      const summary = validateImportRows(rows, existingComponents);
      setValidationSummary(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse spreadsheet file.';
      setParseError(msg);
      setParsedRows([]);
      setValidationSummary(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplateXLSX = () => {
    downloadComponentImportTemplateXLSX(categories, manufacturers, suppliers);
  };

  const handleDownloadTemplateCSV = () => {
    downloadComponentImportTemplateCSV();
  };

  const handleExecuteImport = () => {
    if (!parsedRows.length) return;
    setIsSubmitting(true);
    try {
      const res = storageService.bulkImportComponents(parsedRows, options);
      setImportResult(res);
      onImportSuccess(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing bulk import.';
      setParseError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredValidations = validationSummary?.validations.filter((v: RowValidation) => {
    if (previewFilter === 'ALL') return true;
    return v.status === previewFilter;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Import Master Components Data from Excel / CSV
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  .XLSX, .XLS, .CSV
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Bulk upload circuit breakers, switchgear accessories, electrical ratings, and supplier pricing into catalog
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
                <span>How Excel Import Works</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                1. Download our pre-filled template with sample switchgear parts (ACB, MCCB, MCB, Contactors, Meters).<br />
                2. Fill or paste your parts. Key columns: <strong className="text-slate-900 font-semibold">Part Number*</strong>, <strong className="text-slate-900 font-semibold">Component Name*</strong>, <strong className="text-slate-900 font-semibold">Category*</strong>, <strong className="text-slate-900 font-semibold">Manufacturer*</strong>.<br />
                3. Optional technical specs (Current, Voltage, Icu kA, Poles) & pricing (List Price, Disc %) will be auto-mapped!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadTemplateXLSX}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-medium font-mono transition-colors shadow-2xs"
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
                ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50' 
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-cyan-500'
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
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-cyan-600 shadow-xs">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-700">
                  {file ? (
                    <span className="text-emerald-700 font-mono font-semibold">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    <span>
                      Click to choose or drag & drop your <strong className="text-cyan-700">.XLSX</strong> or <strong className="text-cyan-700">.CSV</strong> spreadsheet
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Supports Microsoft Excel 2007+ (.xlsx), Excel 97-2004 (.xls), and Comma-Separated Values (.csv)
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
                <Sliders className="w-4 h-4 text-cyan-600" />
                <span>Import Behavior & Duplicate Handling</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.updateExisting}
                    onChange={(e) => setOptions({ ...options, updateExisting: e.target.checked })}
                    className="mt-0.5 rounded text-cyan-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Update Existing</span>
                    <span className="text-[10px] text-slate-500">Update specs if Part # already exists in database</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.autoCreateCategory}
                    onChange={(e) => setOptions({ ...options, autoCreateCategory: e.target.checked })}
                    className="mt-0.5 rounded text-cyan-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Auto-create Categories</span>
                    <span className="text-[10px] text-slate-500">Register new category if not currently recognized</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.autoCreateManufacturer}
                    onChange={(e) => setOptions({ ...options, autoCreateManufacturer: e.target.checked })}
                    className="mt-0.5 rounded text-cyan-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Auto-create OEMs</span>
                    <span className="text-[10px] text-slate-500">Register new manufacturer if not recognized</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 text-slate-700 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-slate-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={options.importPricing}
                    onChange={(e) => setOptions({ ...options, importPricing: e.target.checked })}
                    className="mt-0.5 rounded text-cyan-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold block text-slate-900">Import Supplier Pricing</span>
                    <span className="text-[10px] text-slate-500">Store initial price record if List Price is in sheet</span>
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
                    Workbook Validation:
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
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>New ({validationSummary.newCount})</span>
                  </button>

                  <button
                    onClick={() => setPreviewFilter('UPDATE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center gap-1 ${
                      previewFilter === 'UPDATE'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-blue-700 border-slate-200 hover:bg-blue-50/50'
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
                  Showing {filteredValidations.length} of {validationSummary.totalRows} items
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-64 overflow-y-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600 font-mono uppercase">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Part Number</th>
                      <th className="py-2.5 px-3 font-semibold">Component Name</th>
                      <th className="py-2.5 px-3 font-semibold">Category & OEM</th>
                      <th className="py-2.5 px-3 font-semibold">In (A)</th>
                      <th className="py-2.5 px-3 font-semibold">Icu (kA)</th>
                      <th className="py-2.5 px-3 font-semibold">Poles</th>
                      <th className="py-2.5 px-3 font-semibold">List Price</th>
                      <th className="py-2.5 px-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredValidations.map((v) => (
                      <tr 
                        key={v.rowNumber} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          v.status === 'ERROR' ? 'bg-rose-50/50' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400">{v.rowNumber}</td>
                        <td className="py-2 px-3">
                          {v.status === 'NEW' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              NEW
                            </span>
                          )}
                          {v.status === 'UPDATE' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
                              <RefreshCw className="w-2.5 h-2.5" />
                              UPDATE
                            </span>
                          )}
                          {v.status === 'ERROR' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              ERROR
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {v.row.partNumber || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="py-2 px-3 text-slate-700 max-w-[200px] truncate" title={v.row.componentName}>
                          {v.row.componentName || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {v.row.categoryName || 'General'} | {v.row.manufacturerName || 'Generic'}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {v.row.ratedCurrent ? `${v.row.ratedCurrent}A` : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {v.row.breakingCapacity ? `${v.row.breakingCapacity}kA` : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {v.row.poles ? `${v.row.poles}P` : '-'}
                        </td>
                        <td className="py-2 px-3 text-emerald-700 font-semibold">
                          {v.row.listPrice ? `${v.row.currency || 'AED'} ${v.row.listPrice.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-[10px] text-slate-500 max-w-[220px] truncate">
                          {v.messages.join('; ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Complete Success Banner */}
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Bulk Import Finished Successfully!</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
                <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                  <div className="text-slate-500 text-[10px]">New Components Created</div>
                  <div className="text-lg font-bold text-emerald-700">{importResult.createdCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs">
                  <div className="text-slate-500 text-[10px]">Existing Updated</div>
                  <div className="text-lg font-bold text-blue-700">{importResult.updatedCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-cyan-200 shadow-2xs">
                  <div className="text-slate-500 text-[10px]">Supplier Prices Added</div>
                  <div className="text-lg font-bold text-cyan-700">{importResult.pricesAddedCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-2xs">
                  <div className="text-slate-500 text-[10px]">OEMs / Cats Created</div>
                  <div className="text-lg font-bold text-purple-700">
                    {importResult.categoriesCreatedCount + importResult.manufacturersCreatedCount}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/80 font-mono text-xs">
          <div className="text-slate-500">
            {parsedRows.length > 0 && (
              <span>Ready to process {parsedRows.length} switchgear component records</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-medium transition-colors shadow-2xs"
            >
              {importResult ? 'Close' : 'Cancel'}
            </button>

            {parsedRows.length > 0 && !importResult && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isSubmitting || validationSummary?.errorCount === parsedRows.length}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm & Import ({parsedRows.length} Items)</span>
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
