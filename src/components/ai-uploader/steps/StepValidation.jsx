/**
 * Step 4: AI-Enhanced Validation
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowRight, ArrowLeft, Loader2, CheckCircle, AlertTriangle,
  XCircle, Sparkles, RefreshCw, Wand2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

export default function StepValidation({ state, updateState, onNext, onBack }) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState(state.validationResults || null);
  const [applyCorrections, setApplyCorrections] = useState(true);
  const [enrichData, setEnrichData] = useState(true);
  const { invokeAI } = useAIWithFallback({ showToasts: false });

  useEffect(() => {
    if (!validationResults) {
      runValidation();
    }
  }, []);

  const runValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);

    const results = {
      totalRows: state.extractedData.rows.length,
      validRows: 0,
      invalidRows: 0,
      warnings: [],
      errors: [],
      duplicates: [],
      corrections: [],
      enrichments: [],
      processedRows: []
    };

    try {
      const rows = state.extractedData.rows;
      const mappings = state.fieldMappings;
      const batchSize = 10;
      
      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        setValidationProgress(Math.round((i / rows.length) * 100));
        
        // Transform rows using mappings
        const transformedBatch = batch.map((row, idx) => {
          const transformed = { _originalIndex: i + idx };
          Object.entries(mappings).forEach(([targetField, mapping]) => {
            const value = row[mapping.sourceColumn];
            transformed[targetField] = value;
          });
          return transformed;
        });

        // Basic validation
        transformedBatch.forEach((row, batchIdx) => {
          const rowIndex = i + batchIdx;
          const rowErrors = [];
          const rowWarnings = [];
          
          // Check required fields
          Object.entries(mappings).forEach(([field, mapping]) => {
            const value = row[field];
            if (!value || value.toString().trim() === '') {
              // Check if this is a required field based on field name
              if (field.includes('title') || field.includes('name')) {
                rowErrors.push(`Row ${rowIndex + 1}: Missing required field "${field}"`);
              }
            }
          });

          // Check for potential duplicates (by title/name)
          const titleField = Object.keys(row).find(k => k.includes('title') || k.includes('name'));
          if (titleField && row[titleField]) {
            const duplicateIdx = results.processedRows.findIndex(
              r => r[titleField]?.toLowerCase().trim() === row[titleField]?.toLowerCase().trim()
            );
            if (duplicateIdx !== -1) {
              results.duplicates.push({
                rowIndex,
                duplicateOf: duplicateIdx,
                field: titleField,
                value: row[titleField]
              });
              rowWarnings.push(`Row ${rowIndex + 1}: Potential duplicate of row ${duplicateIdx + 1}`);
            }
          }

          if (rowErrors.length === 0) {
            results.validRows++;
          } else {
            results.invalidRows++;
          }
          
          results.errors.push(...rowErrors);
          results.warnings.push(...rowWarnings);
          results.processedRows.push({ ...row, _errors: rowErrors, _warnings: rowWarnings });
        });
      }

      // AI-enhanced validation for suggestions
      setValidationProgress(80);
      
      if (results.processedRows.length > 0) {
        const sampleRows = results.processedRows.slice(0, 5);
        
        const aiResult = await invokeAI({
          prompt: `Analyze this data for quality issues and suggest corrections/enrichments.

Entity type: ${state.detectedEntity}
Sample data:
${JSON.stringify(sampleRows, null, 2)}

Look for:
1. Typos or inconsistencies in text fields
2. Invalid formats (dates, numbers, etc.)
3. Missing data that could be inferred
4. Standardization opportunities (e.g., consistent naming)

Return corrections and enrichment suggestions.`,
          system_prompt: 'You are a data quality expert. Analyze data for issues and suggest improvements.',
          response_json_schema: {
            type: 'object',
            properties: {
              corrections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rowIndex: { type: 'number' },
                    field: { type: 'string' },
                    originalValue: { type: 'string' },
                    suggestedValue: { type: 'string' },
                    reason: { type: 'string' }
                  }
                }
              },
              enrichments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rowIndex: { type: 'number' },
                    field: { type: 'string' },
                    suggestedValue: { type: 'string' },
                    reason: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        if (aiResult.success && aiResult.data) {
          results.corrections = aiResult.data.corrections || [];
          results.enrichments = aiResult.data.enrichments || [];
        }
      }

      // Check for existing records (duplicate detection against database)
      setValidationProgress(90);
      await checkDatabaseDuplicates(results);

      setValidationProgress(100);
      setValidationResults(results);
      updateState({ validationResults: results });

    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed: ' + error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const checkDatabaseDuplicates = async (results) => {
    try {
      // Get title/name field for duplicate check
      const titleField = Object.keys(state.fieldMappings).find(
        k => k.includes('title_en') || k.includes('name_en')
      );
      
      if (!titleField) return;

      const values = results.processedRows
        .map(r => r[titleField])
        .filter(Boolean)
        .slice(0, 50); // Check first 50

      if (values.length === 0) return;

      const { data: existing } = await supabase
        .from(state.detectedEntity)
        .select(titleField)
        .in(titleField, values)
        .eq('is_deleted', false)
        .limit(100);

      if (existing && existing.length > 0) {
        const existingValues = new Set(existing.map(e => e[titleField]?.toLowerCase().trim()));
        
        results.processedRows.forEach((row, idx) => {
          const value = row[titleField]?.toLowerCase().trim();
          if (existingValues.has(value)) {
            results.duplicates.push({
              rowIndex: idx,
              duplicateOf: 'database',
              field: titleField,
              value: row[titleField],
              inDatabase: true
            });
            results.warnings.push(`Row ${idx + 1}: Already exists in database - "${row[titleField]}"`);
          }
        });
      }
    } catch (error) {
      console.error('Database duplicate check error:', error);
    }
  };

  const applyAllCorrections = () => {
    if (!validationResults?.corrections) return;
    
    const updatedRows = [...validationResults.processedRows];
    validationResults.corrections.forEach(correction => {
      if (updatedRows[correction.rowIndex]) {
        updatedRows[correction.rowIndex][correction.field] = correction.suggestedValue;
      }
    });

    setValidationResults({
      ...validationResults,
      processedRows: updatedRows,
      corrections: []
    });

    toast.success(`Applied ${validationResults.corrections.length} corrections`);
  };

  const applyAllEnrichments = () => {
    if (!validationResults?.enrichments) return;
    
    const updatedRows = [...validationResults.processedRows];
    validationResults.enrichments.forEach(enrichment => {
      if (updatedRows[enrichment.rowIndex]) {
        updatedRows[enrichment.rowIndex][enrichment.field] = enrichment.suggestedValue;
      }
    });

    setValidationResults({
      ...validationResults,
      processedRows: updatedRows,
      enrichments: []
    });

    toast.success(`Applied ${validationResults.enrichments.length} enrichments`);
  };

  const handleContinue = () => {
    if (!validationResults) return;
    
    // Apply selected corrections/enrichments
    if (applyCorrections && validationResults.corrections.length > 0) {
      applyAllCorrections();
    }
    if (enrichData && validationResults.enrichments.length > 0) {
      applyAllEnrichments();
    }

    updateState({ 
      validationResults,
      enrichedData: validationResults.processedRows 
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Validation Progress */}
      {isValidating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          <p className="mt-4 font-medium">Validating & analyzing your data...</p>
          <div className="w-full max-w-xs mt-4">
            <Progress value={validationProgress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {validationProgress}% complete
            </p>
          </div>
        </div>
      ) : validationResults ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{validationResults.totalRows}</p>
              <p className="text-sm text-muted-foreground">Total Rows</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{validationResults.validRows}</p>
              <p className="text-sm text-green-600">Valid</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${
              validationResults.warnings.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted'
            }`}>
              <p className={`text-2xl font-bold ${validationResults.warnings.length > 0 ? 'text-yellow-600' : ''}`}>
                {validationResults.warnings.length}
              </p>
              <p className={`text-sm ${validationResults.warnings.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                Warnings
              </p>
            </div>
            <div className={`rounded-lg p-4 text-center ${
              validationResults.errors.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-muted'
            }`}>
              <p className={`text-2xl font-bold ${validationResults.errors.length > 0 ? 'text-red-600' : ''}`}>
                {validationResults.errors.length}
              </p>
              <p className={`text-sm ${validationResults.errors.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                Errors
              </p>
            </div>
          </div>

          {/* Duplicates Warning */}
          {validationResults.duplicates.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  {validationResults.duplicates.length} potential duplicates found
                </span>
              </div>
              <ScrollArea className="h-24">
                <ul className="text-sm text-yellow-700 space-y-1">
                  {validationResults.duplicates.slice(0, 5).map((dup, idx) => (
                    <li key={idx}>
                      Row {dup.rowIndex + 1}: "{dup.value}" 
                      {dup.inDatabase ? ' (exists in database)' : ` matches row ${dup.duplicateOf + 1}`}
                    </li>
                  ))}
                  {validationResults.duplicates.length > 5 && (
                    <li>...and {validationResults.duplicates.length - 5} more</li>
                  )}
                </ul>
              </ScrollArea>
            </div>
          )}

          {/* AI Corrections */}
          {validationResults.corrections.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    AI suggested {validationResults.corrections.length} corrections
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={applyAllCorrections}
                  className="gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Apply All
                </Button>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {validationResults.corrections.slice(0, 5).map((corr, idx) => (
                    <div key={idx} className="text-sm bg-white rounded p-2">
                      <p className="text-blue-800">
                        Row {corr.rowIndex + 1}, {corr.field}:
                      </p>
                      <p className="text-muted-foreground">
                        "{corr.originalValue}" → "{corr.suggestedValue}"
                      </p>
                      <p className="text-xs text-blue-600">{corr.reason}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* AI Enrichments */}
          {validationResults.enrichments.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">
                    AI can enrich {validationResults.enrichments.length} fields
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={applyAllEnrichments}
                  className="gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Apply All
                </Button>
              </div>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {validationResults.enrichments.slice(0, 3).map((enrich, idx) => (
                    <div key={idx} className="text-sm bg-white rounded p-2">
                      <p className="text-purple-800">
                        Row {enrich.rowIndex + 1}, {enrich.field}: "{enrich.suggestedValue}"
                      </p>
                      <p className="text-xs text-purple-600">{enrich.reason}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="applyCorrections" 
                checked={applyCorrections}
                onCheckedChange={setApplyCorrections}
              />
              <Label htmlFor="applyCorrections">Apply AI corrections</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="enrichData" 
                checked={enrichData}
                onCheckedChange={setEnrichData}
              />
              <Label htmlFor="enrichData">Apply AI enrichments</Label>
            </div>
          </div>

          {/* Re-validate Button */}
          <Button variant="outline" onClick={runValidation} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Re-validate
          </Button>
        </>
      ) : null}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isValidating || !validationResults}
          className="gap-2"
        >
          Continue to Review
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
