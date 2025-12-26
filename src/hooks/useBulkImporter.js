import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBulkImporter() {
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
    };

    const logImportHistory = async (results, entityType, metadata) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('access_logs').insert({
                action: 'ai_import',
                entity_type: entityType,
                user_email: user?.email,
                user_id: user?.id,
                metadata: {
                    total_rows: results.total,
                    inserted: results.inserted,
                    failed: results.failed,
                    ...metadata
                }
            });
        } catch (error) {
            console.error('Failed to log import:', error);
        }
    };

    const importData = async ({
        data: allRows,
        entityType,
        retryFailedOnly = false,
        existingStatuses = [],
        batchSize = 50,
        metadata = {}
    }) => {
        setIsImporting(true);
        setProgress(0);
        setLogs([]);
        setResults(null);

        // Wrap rows with their original index so we can track failures
        let rowWrappers = allRows.map((row, index) => ({ row, index }));

        if (retryFailedOnly && existingStatuses.length === allRows.length) {
            rowWrappers = rowWrappers.filter((_, idx) => existingStatuses[idx] === 'failed');
            if (rowWrappers.length === 0) {
                addLog('No failed records to retry.', 'info');
                toast.info('No failed records to retry.');
                setIsImporting(false);
                return { success: false, reason: 'no_failed_records' };
            }
        }

        const rowStatuses = retryFailedOnly && existingStatuses.length === allRows.length
            ? [...existingStatuses]
            : new Array(allRows.length).fill('pending');

        const importResults = {
            total: rowWrappers.length,
            inserted: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };

        try {
            addLog(`Starting import of ${rowWrappers.length} records to ${entityType}...`);

            // Get user info for created_by field
            const { data: { user } } = await supabase.auth.getUser();
            const userEmail = user?.email;

            // Process in batches
            for (let i = 0; i < rowWrappers.length; i += batchSize) {
                const batchWrappers = rowWrappers.slice(i, i + batchSize);
                setProgress(Math.round((i / rowWrappers.length) * 100));

                // Clean rows - remove internal fields
                const cleanedBatch = batchWrappers.map(({ row }) => {
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

                const batchNumber = Math.floor(i / batchSize) + 1;
                addLog(`Processing batch ${batchNumber}...`);

                const { data, error } = await supabase
                    .from(entityType)
                    .insert(cleanedBatch)
                    .select('id');

                if (error) {
                    addLog(`Batch ${batchNumber} error: ${error.message}`, 'error');
                    importResults.errors.push({
                        batch: batchNumber,
                        error: error.message
                    });
                    importResults.failed += batchWrappers.length;

                    batchWrappers.forEach(({ index }) => {
                        rowStatuses[index] = 'failed';
                    });
                } else {
                    addLog(`Inserted ${data?.length || 0} records in batch ${batchNumber}`, 'success');
                    importResults.inserted += data?.length || 0;

                    batchWrappers.forEach(({ index }) => {
                        rowStatuses[index] = 'success';
                    });
                }
            }

            setProgress(100);
            addLog(`Import completed: ${importResults.inserted} inserted, ${importResults.failed} failed`,
                importResults.failed > 0 ? 'warning' : 'success');

            // Log to import history
            await logImportHistory(importResults, entityType, metadata);

            setResults(importResults);
            return { success: true, importResults, rowStatuses };

        } catch (error) {
            console.error('Import error:', error);
            addLog(`Fatal error: ${error.message}`, 'error');
            importResults.errors.push({ fatal: error.message });
            setResults(importResults);
            return { success: false, error, importResults };
        } finally {
            setIsImporting(false);
        }
    };

    return {
        isImporting,
        progress,
        results,
        logs,
        importData
    };
}
