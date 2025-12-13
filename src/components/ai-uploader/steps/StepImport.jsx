/**
 * Step 6: Import execution
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, CheckCircle, XCircle, Loader2, Download,
  RefreshCw, Sparkles, AlertTriangle, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function StepImport({ state, updateState, onBack, onComplete }) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const startImport = async () => {
    setIsImporting(true);
    setProgress(0);
    setLogs([]);

    const rows = state.enrichedData || [];
    const entityType = state.detectedEntity;
    const batchSize = 50;
    
    const importResults = {
      total: rows.length,
      inserted: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    try {
      addLog(`Starting import of ${rows.length} records to ${entityType}...`);
      
      // Get user info for created_by field
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        setProgress(Math.round((i / rows.length) * 100));
        
        // Clean rows - remove internal fields
        const cleanedBatch = batch.map(row => {
          const cleaned = { ...row };
          delete cleaned._originalIndex;
          delete cleaned._errors;
          delete cleaned._warnings;
          
          // Add metadata
          if (userEmail) {
            cleaned.created_by = userEmail;
          }
          
          return cleaned;
        });

        addLog(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

        const { data, error } = await supabase
          .from(entityType)
          .insert(cleanedBatch)
          .select('id');

        if (error) {
          addLog(`Batch error: ${error.message}`, 'error');
          importResults.errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message
          });
          importResults.failed += batch.length;
        } else {
          addLog(`Inserted ${data?.length || 0} records`, 'success');
          importResults.inserted += data?.length || 0;
        }
      }

      setProgress(100);
      addLog(`Import completed: ${importResults.inserted} inserted, ${importResults.failed} failed`, 
        importResults.failed > 0 ? 'warning' : 'success');

      // Log to import history
      await logImportHistory(importResults, entityType);

      setResults(importResults);
      updateState({ importResults });

    } catch (error) {
      console.error('Import error:', error);
      addLog(`Fatal error: ${error.message}`, 'error');
      importResults.errors.push({ fatal: error.message });
      setResults(importResults);
    } finally {
      setIsImporting(false);
    }
  };

  const logImportHistory = async (results, entityType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('access_logs').insert({
        action: 'ai_import',
        entity_type: entityType,
        user_email: user?.email,
        user_id: user?.id,
        metadata: {
          source_file: state.file?.name,
          file_type: state.fileType,
          total_rows: results.total,
          inserted: results.inserted,
          failed: results.failed,
          mappings: Object.keys(state.fieldMappings)
        }
      });
    } catch (error) {
      console.error('Failed to log import:', error);
    }
  };

  const downloadErrorLog = () => {
    if (!results?.errors?.length) return;
    
    const log = {
      importDate: new Date().toISOString(),
      entityType: state.detectedEntity,
      sourceFile: state.file?.name,
      results: results,
      logs: logs
    };
    
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show confirmation before starting
  const [confirmed, setConfirmed] = useState(false);
  
  const handleStartImport = () => {
    setConfirmed(true);
    startImport();
  };

  return (
    <div className="space-y-6">
      {/* Confirmation before import */}
      {!confirmed && !isImporting && !results ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Sparkles className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-bold mb-2">Ready to Import</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            You are about to import <strong>{state.enrichedData?.length || 0}</strong> records 
            to <strong className="capitalize">{state.detectedEntity}</strong>.
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Review
            </Button>
            <Button onClick={handleStartImport}>
              <Sparkles className="h-4 w-4 mr-2" />
              Start Import
            </Button>
          </div>
        </div>
      ) : isImporting ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <p className="mt-4 text-lg font-medium">Importing data...</p>
          <div className="w-full max-w-md mt-4">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {progress}% complete
            </p>
          </div>
        </div>
      ) : results ? (
        /* Results Summary */
        <div className="space-y-4">
          {/* Result Header */}
          <div className={`text-center py-6 rounded-lg ${
            results.failed === 0 ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            {results.failed === 0 ? (
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto" />
            )}
            <h2 className="text-2xl font-bold mt-4">
              {results.failed === 0 ? 'Import Successful!' : 'Import Completed with Issues'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {results.inserted} of {results.total} records imported
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{results.inserted}</p>
              <p className="text-sm text-green-600">Inserted</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${
              results.failed > 0 ? 'bg-red-50 border border-red-200' : 'bg-muted'
            }`}>
              <p className={`text-3xl font-bold ${results.failed > 0 ? 'text-red-600' : ''}`}>
                {results.failed}
              </p>
              <p className={`text-sm ${results.failed > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                Failed
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{results.skipped}</p>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
          </div>

          {/* Error Details */}
          {results.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{results.errors.length} errors occurred during import</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadErrorLog}
                    className="gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download Log
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : null}

      {/* Import Logs - show when confirmed */}
      {confirmed && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Import Log
            </h4>
          </div>
          <ScrollArea className="h-[150px] border rounded-lg p-3 bg-muted/50">
            <div className="space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Waiting to start...</p>
              ) : logs.map((log, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start gap-2 ${
                    log.type === 'error' ? 'text-red-600' : 
                    log.type === 'success' ? 'text-green-600' : 
                    log.type === 'warning' ? 'text-yellow-600' : 'text-muted-foreground'
                  }`}
                >
                  <span className="text-muted-foreground">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Navigation - only show after import starts or completes */}
      {confirmed && (
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={isImporting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {results && results.failed > 0 && (
              <Button 
                variant="outline" 
                onClick={startImport}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Failed
              </Button>
            )}
            {results && (
              <Button 
                onClick={() => onComplete?.(results)}
                disabled={isImporting}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Done
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
