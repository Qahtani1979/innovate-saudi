/**
 * Step 1: File Upload with multi-format support
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileText, FileSpreadsheet, FileImage, 
  File, Loader2, ArrowRight, X, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SUPPORTED_TYPES = {
  'text/csv': { icon: FileSpreadsheet, label: 'CSV', color: 'bg-green-100 text-green-800' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, label: 'Excel', color: 'bg-blue-100 text-blue-800' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, label: 'Excel', color: 'bg-blue-100 text-blue-800' },
  'application/json': { icon: FileText, label: 'JSON', color: 'bg-yellow-100 text-yellow-800' },
  'application/pdf': { icon: FileText, label: 'PDF', color: 'bg-red-100 text-red-800' },
  'image/png': { icon: FileImage, label: 'PNG', color: 'bg-purple-100 text-purple-800' },
  'image/jpeg': { icon: FileImage, label: 'JPG', color: 'bg-purple-100 text-purple-800' },
  'image/webp': { icon: FileImage, label: 'WebP', color: 'bg-purple-100 text-purple-800' }
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function StepFileUpload({ state, updateState, onNext }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const fileInputRef = useRef(null);

  const getFileType = (file) => {
    const mimeType = file.type;
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (mimeType === 'text/csv' || extension === 'csv') return 'csv';
    if (mimeType.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls') return 'excel';
    if (mimeType === 'application/json' || extension === 'json') return 'json';
    if (mimeType === 'application/pdf' || extension === 'pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    return 'unknown';
  };

  const processCSV = async (file) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((h, idx) => row[h] = values[idx]);
        rows.push(row);
      }
    }
    
    return { headers, rows, rawText: text };
  };

  const processJSON = async (file) => {
    const text = await file.text();
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : [data];
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { headers, rows, rawText: text };
  };

  const processWithAI = async (file, fileType) => {
    setProcessStatus('Uploading file for AI extraction...');
    
    // Upload to temp storage
    const fileName = `ai-upload-${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('temp')
      .upload(fileName, file);
    
    if (uploadError) throw new Error('Failed to upload file: ' + uploadError.message);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('temp').getPublicUrl(fileName);
    
    setProcessStatus('AI is extracting data from your file...');
    
    // Call AI extraction edge function
    const { data: result, error: extractError } = await supabase.functions.invoke('extract-file-data', {
      body: { 
        file_url: publicUrl,
        json_schema: {
          type: 'object',
          properties: {
            headers: { type: 'array', items: { type: 'string' } },
            rows: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    });
    
    // Cleanup temp file
    await supabase.storage.from('temp').remove([fileName]);
    
    if (extractError) throw new Error('AI extraction failed: ' + extractError.message);
    
    return {
      headers: result.headers || Object.keys(result.rows?.[0] || {}),
      rows: result.rows || [],
      rawText: JSON.stringify(result)
    };
  };

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 20MB');
      return;
    }
    
    const fileType = getFileType(file);
    const typeInfo = SUPPORTED_TYPES[file.type];
    
    if (fileType === 'unknown') {
      toast.error('Unsupported file type. Please upload CSV, Excel, JSON, PDF, or image files.');
      return;
    }
    
    setIsProcessing(true);
    setProcessStatus('Reading file...');
    
    try {
      let extractedData;
      
      if (fileType === 'csv') {
        extractedData = await processCSV(file);
      } else if (fileType === 'json') {
        extractedData = await processJSON(file);
      } else {
        // PDF, Excel, Image - use AI extraction
        extractedData = await processWithAI(file, fileType);
      }
      
      updateState({
        file,
        fileType,
        extractedData: {
          ...extractedData,
          rowCount: extractedData.rows.length,
          columnCount: extractedData.headers.length
        }
      });
      
      toast.success(`Extracted ${extractedData.rows.length} rows from ${file.name}`);
      
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file: ' + error.message);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  }, [updateState]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    updateState({ file: null, fileType: null, extractedData: null });
  };

  const typeInfo = state.file ? SUPPORTED_TYPES[state.file.type] : null;
  const FileIcon = typeInfo?.icon || File;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      {!state.file ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,.json,.pdf,.png,.jpg,.jpeg,.webp"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground">{processStatus}</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports CSV, Excel, JSON, PDF, and images (with OCR)
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(SUPPORTED_TYPES).slice(0, 5).map(([type, info]) => (
                  <Badge key={type} variant="secondary" className={info.color}>
                    {info.label}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* File Preview */
        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${typeInfo?.color || 'bg-muted'}`}>
                <FileIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="font-medium">{state.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(state.file.size / 1024).toFixed(1)} KB • {typeInfo?.label || 'Unknown'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {state.extractedData && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-green-600 mb-3">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Data extracted successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground">Rows</p>
                  <p className="text-2xl font-bold">{state.extractedData.rowCount}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground">Columns</p>
                  <p className="text-2xl font-bold">{state.extractedData.columnCount}</p>
                </div>
              </div>
              
              {/* Column Preview */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Detected columns:</p>
                <div className="flex flex-wrap gap-1">
                  {state.extractedData.headers.slice(0, 10).map((header, i) => (
                    <Badge key={i} variant="outline">{header}</Badge>
                  ))}
                  {state.extractedData.headers.length > 10 && (
                    <Badge variant="secondary">+{state.extractedData.headers.length - 10} more</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!state.extractedData}
          className="gap-2"
        >
          Continue to Entity Detection
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
