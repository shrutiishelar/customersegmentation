import { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Database,
  Info,
  Loader2,
  FileCheck,
  XCircle
} from 'lucide-react';
import { uploadDatasetFile } from '../../services/api';

export default function DatasetView() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErrorMessage('Invalid file format. Please select a valid CSV (.csv) file.');
        setSelectedFile(null);
        setUploadResult(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadResult(null);

    try {
      const result = await uploadDatasetFile(selectedFile);
      setUploadResult(result);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload dataset. Ensure the Spring Boot backend is running on http://localhost:8080.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-xl bg-[#13131a] border border-[#8b5cf6]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Dataset Ingestion & Preprocessing Pipeline</h2>
            <p className="text-xs text-gray-400">
              Upload raw customer CSV datasets directly into MongoDB with schema validation and duplicate detection.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone & Preprocessing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#8b5cf6]" />
            <span>Upload Customer CSV Dataset</span>
          </h3>

          <div className="relative border-2 border-dashed border-[#8b5cf6]/30 hover:border-[#8b5cf6]/60 rounded-xl p-8 text-center transition-all cursor-pointer bg-[#0d0c1d]/60">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="p-3 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your CSV file here, or browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Expected schema: CustomerID, Gender, Age, Annual Income (k$), Spending Score (1-100)
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <FileCheck className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                <span className="text-gray-200 truncate font-mono">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 text-white font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload to MongoDB</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <span className="font-bold">Upload Error:</span>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Summary Result */}
          {uploadResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload Completed Successfully</span>
              </div>
              <p className="text-xs text-gray-300">{uploadResult.message}</p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-[#0d0c1d] border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">Total Rows</div>
                  <div className="text-base font-bold text-white">{uploadResult.totalRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d0c1d] border border-white/5">
                  <div className="text-[10px] text-emerald-400 uppercase">Valid</div>
                  <div className="text-base font-bold text-emerald-400">{uploadResult.validRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d0c1d] border border-white/5">
                  <div className="text-[10px] text-[#8b5cf6] uppercase">Saved (DB)</div>
                  <div className="text-base font-bold text-[#8b5cf6]">{uploadResult.savedRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d0c1d] border border-white/5">
                  <div className="text-[10px] text-amber-400 uppercase">Duplicates</div>
                  <div className="text-base font-bold text-amber-400">{uploadResult.duplicateRows}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d0c1d] border border-white/5">
                  <div className="text-[10px] text-rose-400 uppercase">Invalid</div>
                  <div className="text-base font-bold text-rose-400">{uploadResult.invalidRows}</div>
                </div>
              </div>

              {/* List of rejected / duplicate row details */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Row Validation Issues ({uploadResult.errors.length}):</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {uploadResult.errors.map((err, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-[#0d0c1d] border border-white/5 text-[11px]">
                        <span className="font-mono text-gray-400">Row #{err.rowNumber} (ID: {err.customerId})</span>
                        <span className="text-rose-400">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Cleaning Status Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#13131a] border border-[#8b5cf6]/20 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Preprocessing & Cleansing Specs</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0d0c1d] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Missing Values Handling:</span>
              <span className="text-emerald-400 font-semibold">Zero Nulls / Imputed</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0d0c1d] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Duplicate Record Filtration:</span>
              <span className="text-emerald-400 font-semibold">Enabled (Primary Key ID)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0d0c1d] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Feature Scaling (StandardScaler):</span>
              <span className="text-purple-400 font-semibold">Ready for Spark VectorAssembler</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0d0c1d] border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Benchmark Dataset Available:</span>
              <span className="text-blue-400 font-semibold">dataset/Mall_Customers.csv (200 rows)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d0c1d] border border-[#8b5cf6]/15 text-[11px] text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#8b5cf6] shrink-0 mt-0.5" />
            <span>
              A benchmark CSV has been placed in <code className="text-purple-300">dataset/Mall_Customers.csv</code>. You can select it directly to test ingestion into MongoDB.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
