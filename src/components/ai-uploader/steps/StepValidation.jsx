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

  // Lookup tables for linked entities
  const LOOKUP_TABLES = {
    sector_id: { table: 'sectors', nameField: 'name_en' },
    municipality_id: { table: 'municipalities', nameField: 'name_en' },
    region_id: { table: 'regions', nameField: 'name_en' },
    city_id: { table: 'cities', nameField: 'name_en' },
    organization_id: { table: 'organizations', nameField: 'name_en' },
    provider_id: { table: 'providers', nameField: 'name_en' },
    subsector_id: { table: 'subsectors', nameField: 'name_en' },
    service_id: { table: 'services', nameField: 'name_en' },
    ministry_id: { table: 'ministries', nameField: 'name_en' },
    program_id: { table: 'programs', nameField: 'name_en' },
    pilot_id: { table: 'pilots', nameField: 'name_en' },
    challenge_id: { table: 'challenges', nameField: 'title_en' },
    solution_id: { table: 'solutions', nameField: 'name_en' },
  };

  // Load reference data for entity resolution
  const loadReferenceData = async () => {
    const refData = {};
    const mappedFields = Object.keys(state.fieldMappings);
    
    // Identify which lookup tables we need
    const neededLookups = Object.entries(LOOKUP_TABLES).filter(([field]) => 
      mappedFields.includes(field) || 
      mappedFields.some(f => f.includes(field.replace('_id', '')))
    );

    for (const [field, config] of neededLookups) {
      try {
        const { data } = await supabase
          .from(config.table)
          .select(`id, ${config.nameField}, name_ar`)
          .limit(500);
        
        if (data) {
          refData[field] = data.map(item => ({
            id: item.id,
            name_en: item[config.nameField] || item.name_en || item.title_en,
            name_ar: item.name_ar || item.title_ar
          }));
        }
      } catch (e) {
        console.warn(`Failed to load ${config.table}:`, e);
      }
    }
    return refData;
  };

  // Match text to reference entity ID
  const resolveEntityId = (text, refList) => {
    if (!text || !refList?.length) return null;
    const normalized = text.toString().toLowerCase().trim();
    
    // Exact match
    let match = refList.find(r => 
      r.name_en?.toLowerCase().trim() === normalized ||
      r.name_ar?.trim() === text.trim()
    );
    
    // Partial match
    if (!match) {
      match = refList.find(r => 
        r.name_en?.toLowerCase().includes(normalized) ||
        normalized.includes(r.name_en?.toLowerCase())
      );
    }
    
    return match?.id || null;
  };

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
      // Load reference data for linked entities
      setValidationProgress(10);
      const referenceData = await loadReferenceData();
      
      const rows = state.extractedData.rows;
      const mappings = state.fieldMappings;
      const batchSize = 10;
      
      // Identify fields needing special handling
      const idFields = Object.keys(mappings).filter(f => f.endsWith('_id'));
      const enFields = Object.keys(mappings).filter(f => f.endsWith('_en'));
      const arFields = Object.keys(mappings).filter(f => f.endsWith('_ar'));
      const textNameFields = Object.keys(mappings).filter(f => 
        (f.includes('sector') || f.includes('municipality') || f.includes('region') || 
         f.includes('city') || f.includes('organization') || f.includes('provider')) &&
        !f.endsWith('_id')
      );
      
      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        setValidationProgress(10 + Math.round((i / rows.length) * 50));
        
        // Transform rows using mappings
        const transformedBatch = batch.map((row, idx) => {
          const transformed = { _originalIndex: i + idx };
          Object.entries(mappings).forEach(([targetField, mapping]) => {
            const value = row[mapping.sourceColumn];
            transformed[targetField] = value;
          });
          return transformed;
        });

        // Resolve linked entities and validate
        transformedBatch.forEach((row, batchIdx) => {
          const rowIndex = i + batchIdx;
          const rowErrors = [];
          const rowWarnings = [];
          const rowEnrichments = [];
          
          // Check required fields
          Object.entries(mappings).forEach(([field, mapping]) => {
            const value = row[field];
            if (!value || value.toString().trim() === '') {
              if (field.includes('title') || field.includes('name')) {
                rowErrors.push(`Row ${rowIndex + 1}: Missing required field "${field}"`);
              }
            }
          });

          // Resolve ID fields from text values
          idFields.forEach(idField => {
            if (!row[idField] && referenceData[idField]) {
              // Look for corresponding text field
              const baseName = idField.replace('_id', '');
              const textField = textNameFields.find(f => f.includes(baseName)) ||
                               Object.keys(row).find(k => k.includes(baseName) && !k.endsWith('_id'));
              
              if (textField && row[textField]) {
                const resolvedId = resolveEntityId(row[textField], referenceData[idField]);
                if (resolvedId) {
                  rowEnrichments.push({
                    rowIndex,
                    field: idField,
                    suggestedValue: resolvedId,
                    reason: `Resolved from "${row[textField]}"`
                  });
                } else {
                  rowWarnings.push(`Row ${rowIndex + 1}: Could not resolve ${idField} from "${row[textField]}"`);
                }
              }
            }
          });

          // Check for missing Arabic translations
          enFields.forEach(enField => {
            const arField = enField.replace('_en', '_ar');
            if (row[enField] && (!row[arField] || row[arField].toString().trim() === '')) {
              rowEnrichments.push({
                rowIndex,
                field: arField,
                suggestedValue: `__NEEDS_TRANSLATION__:${row[enField]}`,
                reason: `Arabic translation needed for: "${row[enField]}"`
              });
            }
          });

          // Check for potential duplicates
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
          results.enrichments.push(...rowEnrichments);
          results.processedRows.push({ ...row, _errors: rowErrors, _warnings: rowWarnings });
        });
      }

      // AI-enhanced validation for translations and additional suggestions
      setValidationProgress(70);
      
      // Collect items needing AI translation
      const translationNeeded = results.enrichments
        .filter(e => e.suggestedValue?.startsWith('__NEEDS_TRANSLATION__:'))
        .slice(0, 30); // Limit for AI processing
      
      if (translationNeeded.length > 0) {
        const textsToTranslate = translationNeeded.map(e => ({
          rowIndex: e.rowIndex,
          field: e.field,
          text: e.suggestedValue.replace('__NEEDS_TRANSLATION__:', '')
        }));

        const aiResult = await invokeAI({
          prompt: `Translate the following English texts to Arabic. Maintain formal tone suitable for government/municipal context.

${JSON.stringify(textsToTranslate, null, 2)}

Return translations in the exact format specified.`,
          system_prompt: 'You are an expert Arabic translator specializing in government and municipal terminology. Provide accurate, formal Arabic translations.',
          response_json_schema: {
            type: 'object',
            properties: {
              translations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rowIndex: { type: 'number' },
                    field: { type: 'string' },
                    arabic: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        if (aiResult.success && aiResult.data?.translations) {
          aiResult.data.translations.forEach(t => {
            const idx = results.enrichments.findIndex(
              e => e.rowIndex === t.rowIndex && e.field === t.field
            );
            if (idx !== -1) {
              results.enrichments[idx].suggestedValue = t.arabic;
              results.enrichments[idx].reason = 'AI-generated Arabic translation';
            }
          });
        }
      }

      // Remove any enrichments that still have placeholder values
      results.enrichments = results.enrichments.filter(
        e => !e.suggestedValue?.startsWith('__NEEDS_TRANSLATION__:')
      );

      // Additional AI analysis for data quality
      setValidationProgress(85);
      
      if (results.processedRows.length > 0) {
        const sampleRows = results.processedRows.slice(0, 5);
        const availableRefs = Object.entries(referenceData)
          .map(([field, items]) => `${field}: ${items.slice(0, 5).map(i => i.name_en).join(', ')}...`)
          .join('\n');

        const aiResult = await invokeAI({
          prompt: `Analyze this data for quality issues and suggest improvements.

Entity type: ${state.detectedEntity}
Sample data: ${JSON.stringify(sampleRows, null, 2)}

Available reference entities for linking:
${availableRefs}

Fields in data: ${Object.keys(state.fieldMappings).join(', ')}

Look for:
1. Typos or inconsistencies
2. Invalid formats (dates, numbers)
3. Missing links that could be inferred from context
4. Standardization opportunities

Return corrections and enrichments.`,
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
          // Merge AI enrichments with existing ones (avoiding duplicates)
          const existingKeys = new Set(results.enrichments.map(e => `${e.rowIndex}-${e.field}`));
          (aiResult.data.enrichments || []).forEach(e => {
            if (!existingKeys.has(`${e.rowIndex}-${e.field}`)) {
              results.enrichments.push(e);
            }
          });
        }
      }

      // Check for existing records in database
      setValidationProgress(95);
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

      // Build query - handle tables with/without is_deleted
      let query = supabase
        .from(state.detectedEntity)
        .select(titleField)
        .in(titleField, values)
        .limit(100);

      // Only add is_deleted filter for tables that have this column
      const tablesWithDeleted = ['challenges', 'solutions', 'pilots', 'programs', 'providers', 
        'organizations', 'rd_projects', 'sandboxes', 'events', 'contracts', 'budgets', 
        'strategic_plans', 'rd_calls'];
      
      if (tablesWithDeleted.includes(state.detectedEntity)) {
        query = query.eq('is_deleted', false);
      }

      const { data: existing } = await query;

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
