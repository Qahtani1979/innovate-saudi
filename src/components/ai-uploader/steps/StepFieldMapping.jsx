/**
 * Step 3: AI Field Mapping
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, ArrowLeft, Loader2, 
  AlertCircle, CheckCircle, ArrowRightLeft, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import {
  FIELD_MAPPING_SYSTEM_PROMPT,
  buildFieldMappingPrompt,
  FIELD_MAPPING_SCHEMA
} from '@/lib/ai/prompts/uploader';

// Entity field definitions - synced with actual database schema
const ENTITY_FIELDS = {
  challenges: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description (English)', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'problem_statement_en', label: 'Problem Statement', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'enum', options: ['draft', 'submitted', 'under_review', 'approved', 'in_progress', 'resolved'] },
    { name: 'priority', label: 'Priority', required: false, type: 'enum', options: ['tier_1', 'tier_2', 'tier_3'] },
    { name: 'sector', label: 'Sector', required: false, type: 'string' },
    { name: 'category', label: 'Category', required: false, type: 'string' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' },
    { name: 'sector_id', label: 'Sector ID', required: false, type: 'relation', relation: 'sectors' },
    { name: 'impact_score', label: 'Impact Score', required: false, type: 'number' },
    { name: 'budget_estimate', label: 'Budget Estimate', required: false, type: 'number' },
    { name: 'tags', label: 'Tags', required: false, type: 'array' }
  ],
  solutions: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description (English)', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'solution_type', label: 'Solution Type', required: false, type: 'string' },
    { name: 'maturity_level', label: 'Maturity Level', required: false, type: 'enum', options: ['concept', 'prototype', 'pilot', 'production', 'scaled'] },
    { name: 'provider_id', label: 'Provider', required: false, type: 'relation', relation: 'providers' },
    { name: 'sector_id', label: 'Sector', required: false, type: 'relation', relation: 'sectors' },
    { name: 'pricing_model', label: 'Pricing Model', required: false, type: 'string' },
    { name: 'tags', label: 'Tags', required: false, type: 'array' }
  ],
  pilots: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description (English)', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'sector', label: 'Sector', required: true, type: 'string' },
    { name: 'sub_sector', label: 'Sub-Sector', required: false, type: 'string' },
    { name: 'stage', label: 'Stage', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'enum', options: ['planning', 'active', 'completed', 'cancelled'] },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'budget', label: 'Budget', required: false, type: 'number' },
    { name: 'municipality_id', label: 'Municipality', required: true, type: 'relation', relation: 'municipalities' },
    { name: 'solution_id', label: 'Solution', required: false, type: 'relation', relation: 'solutions' },
    { name: 'challenge_id', label: 'Challenge', required: true, type: 'relation', relation: 'challenges' }
  ],
  programs: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description (English)', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'program_type', label: 'Program Type', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'string' },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'budget', label: 'Budget', required: false, type: 'number' },
    { name: 'sector_id', label: 'Sector', required: false, type: 'relation', relation: 'sectors' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' }
  ],
  municipalities: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'region_id', label: 'Region', required: false, type: 'relation', relation: 'regions' },
    { name: 'population', label: 'Population', required: false, type: 'number' },
    { name: 'area', label: 'Area (km²)', required: false, type: 'number' }
  ],
  organizations: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'organization_type', label: 'Type', required: false, type: 'enum', options: ['government', 'private', 'ngo', 'academic'] },
    { name: 'website', label: 'Website', required: false, type: 'string' },
    { name: 'email', label: 'Email', required: false, type: 'string' }
  ],
  providers: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'provider_type', label: 'Provider Type', required: false, type: 'string' },
    { name: 'website_url', label: 'Website', required: false, type: 'string' },
    { name: 'contact_email', label: 'Contact Email', required: false, type: 'string' },
    { name: 'country', label: 'Country', required: false, type: 'string' },
    { name: 'city', label: 'City', required: false, type: 'string' }
  ],
  case_studies: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description', required: false, type: 'string' },
    { name: 'challenge_description', label: 'Challenge', required: false, type: 'string' },
    { name: 'solution_description', label: 'Solution', required: false, type: 'string' },
    { name: 'results_achieved', label: 'Results', required: false, type: 'string' },
    { name: 'lessons_learned', label: 'Lessons Learned', required: false, type: 'string' },
    { name: 'sector_id', label: 'Sector', required: false, type: 'relation', relation: 'sectors' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' }
  ],
  rd_projects: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description', required: false, type: 'string' },
    { name: 'project_type', label: 'Project Type', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'string' },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'budget', label: 'Budget', required: false, type: 'number' },
    { name: 'sector_id', label: 'Sector', required: false, type: 'relation', relation: 'sectors' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' }
  ],
  rd_calls: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description', required: false, type: 'string' },
    { name: 'call_type', label: 'Call Type', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'string' },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'budget', label: 'Budget', required: false, type: 'number' },
    { name: 'sector_id', label: 'Sector', required: false, type: 'relation', relation: 'sectors' }
  ],
  events: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description', required: false, type: 'string' },
    { name: 'event_type', label: 'Event Type', required: false, type: 'string' },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'location', label: 'Location', required: false, type: 'string' },
    { name: 'max_participants', label: 'Max Participants', required: false, type: 'number' }
  ],
  living_labs: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description (English)', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'domain', label: 'Domain', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'string' },
    { name: 'location', label: 'Location', required: false, type: 'string' },
    { name: 'contact_name', label: 'Contact Name', required: false, type: 'string' },
    { name: 'contact_email', label: 'Contact Email', required: false, type: 'string' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' },
    { name: 'region_id', label: 'Region', required: false, type: 'relation', relation: 'regions' }
  ],
  sandboxes: [
    { name: 'name', label: 'Name', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'description', label: 'Description', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'domain', label: 'Domain', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'string' },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'capacity', label: 'Capacity', required: false, type: 'number' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' },
    { name: 'living_lab_id', label: 'Living Lab', required: false, type: 'relation', relation: 'living_labs' }
  ],
  contracts: [
    { name: 'title_en', label: 'Title (English)', required: true, type: 'string' },
    { name: 'title_ar', label: 'Title (Arabic)', required: false, type: 'string' },
    { name: 'contract_code', label: 'Contract Code', required: true, type: 'string' },
    { name: 'contract_type', label: 'Contract Type', required: false, type: 'string' },
    { name: 'contract_value', label: 'Contract Value', required: false, type: 'number' },
    { name: 'currency', label: 'Currency', required: false, type: 'string' },
    { name: 'start_date', label: 'Start Date', required: false, type: 'date' },
    { name: 'end_date', label: 'End Date', required: false, type: 'date' },
    { name: 'provider_id', label: 'Provider', required: false, type: 'relation', relation: 'providers' },
    { name: 'pilot_id', label: 'Pilot', required: false, type: 'relation', relation: 'pilots' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' }
  ],
  budgets: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'budget_code', label: 'Budget Code', required: false, type: 'string' },
    { name: 'total_amount', label: 'Total Amount', required: true, type: 'number' },
    { name: 'allocated_amount', label: 'Allocated Amount', required: false, type: 'number' },
    { name: 'spent_amount', label: 'Spent Amount', required: false, type: 'number' },
    { name: 'currency', label: 'Currency', required: false, type: 'string' },
    { name: 'fiscal_year', label: 'Fiscal Year', required: false, type: 'number' },
    { name: 'status', label: 'Status', required: false, type: 'string' }
  ],
  sectors: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description', required: false, type: 'string' },
    { name: 'code', label: 'Code', required: false, type: 'string' },
    { name: 'icon', label: 'Icon', required: false, type: 'string' },
    { name: 'color', label: 'Color', required: false, type: 'string' }
  ],
  regions: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'code', label: 'Code', required: false, type: 'string' }
  ],
  cities: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: true, type: 'string' },
    { name: 'region_id', label: 'Region', required: false, type: 'relation', relation: 'regions' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' },
    { name: 'population', label: 'Population', required: false, type: 'number' }
  ],
  strategic_plans: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'description_en', label: 'Description (English)', required: false, type: 'string' },
    { name: 'description_ar', label: 'Description (Arabic)', required: false, type: 'string' },
    { name: 'vision_en', label: 'Vision (English)', required: false, type: 'string' },
    { name: 'vision_ar', label: 'Vision (Arabic)', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'string' },
    { name: 'start_year', label: 'Start Year', required: false, type: 'number' },
    { name: 'end_year', label: 'End Year', required: false, type: 'number' },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' }
  ],
  tags: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'category', label: 'Category', required: false, type: 'string' },
    { name: 'color', label: 'Color', required: false, type: 'string' }
  ],
  kpi_references: [
    { name: 'name_en', label: 'Name (English)', required: true, type: 'string' },
    { name: 'name_ar', label: 'Name (Arabic)', required: false, type: 'string' },
    { name: 'code', label: 'Code', required: false, type: 'string' },
    { name: 'description_en', label: 'Description', required: false, type: 'string' },
    { name: 'unit', label: 'Unit', required: false, type: 'string' },
    { name: 'category', label: 'Category', required: false, type: 'string' },
    { name: 'target_value', label: 'Target Value', required: false, type: 'number' },
    { name: 'sector_id', label: 'Sector', required: false, type: 'relation', relation: 'sectors' }
  ],
  citizen_ideas: [
    { name: 'title', label: 'Title', required: true, type: 'string' },
    { name: 'description', label: 'Description', required: false, type: 'string' },
    { name: 'category', label: 'Category', required: false, type: 'string' },
    { name: 'status', label: 'Status', required: false, type: 'enum', options: ['submitted', 'under_review', 'approved', 'rejected', 'implemented'] },
    { name: 'municipality_id', label: 'Municipality', required: false, type: 'relation', relation: 'municipalities' },
    { name: 'is_published', label: 'Published', required: false, type: 'boolean' }
  ]
};

export default function StepFieldMapping({ state, updateState, onNext, onBack }) {
  const [isMapping, setIsMapping] = useState(false);
  const [mappings, setMappings] = useState(state.fieldMappings || {});
  const [showUnmapped, setShowUnmapped] = useState(true);
  const { invokeAI } = useAIWithFallback({ showToasts: false });

  const entityFields = ENTITY_FIELDS[state.detectedEntity] || [];
  const sourceColumns = state.extractedData?.headers || [];

  useEffect(() => {
    if (Object.keys(mappings).length === 0) {
      autoMapWithAI();
    }
  }, []);

  const autoMapWithAI = async () => {
    setIsMapping(true);
    
    try {
      const prompt = buildFieldMappingPrompt(
        sourceColumns,
        state.detectedEntity,
        entityFields,
        state.extractedData.rows.slice(0, 3)
      );

      const result = await invokeAI({
        prompt,
        system_prompt: FIELD_MAPPING_SYSTEM_PROMPT,
        response_json_schema: FIELD_MAPPING_SCHEMA
      });

      if (result.success && result.data?.mappings) {
        const newMappings = {};
        result.data.mappings.forEach(m => {
          if (sourceColumns.includes(m.source_column)) {
            newMappings[m.target_field] = {
              sourceColumn: m.source_column,
              confidence: m.confidence,
              reason: m.reason
            };
          }
        });
        setMappings(newMappings);
        updateState({ fieldMappings: newMappings });
        toast.success(`AI mapped ${Object.keys(newMappings).length} fields`);
      }
    } catch (error) {
      console.error('Auto-mapping error:', error);
      toast.error('AI mapping failed. Please map fields manually.');
    } finally {
      setIsMapping(false);
    }
  };

  const handleMappingChange = (targetField, sourceColumn) => {
    const newMappings = { ...mappings };
    if (sourceColumn === '__none__') {
      delete newMappings[targetField];
    } else {
      newMappings[targetField] = {
        sourceColumn,
        confidence: 1,
        reason: 'Manual mapping'
      };
    }
    setMappings(newMappings);
    updateState({ fieldMappings: newMappings });
  };

  const getMappedColumns = () => {
    return Object.values(mappings).map(m => m.sourceColumn);
  };

  const getUnmappedColumns = () => {
    const mapped = getMappedColumns();
    return sourceColumns.filter(col => !mapped.includes(col));
  };

  const requiredFieldsMapped = entityFields
    .filter(f => f.required)
    .every(f => mappings[f.name]?.sourceColumn);

  const handleContinue = () => {
    if (!requiredFieldsMapped) {
      toast.error('Please map all required fields');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Field Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Map your source columns to {state.detectedEntity} fields
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={autoMapWithAI} 
          disabled={isMapping}
          className="gap-2"
        >
          {isMapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          AI Auto-Map
        </Button>
      </div>

      {isMapping ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-primary animate-pulse" />
          <p className="mt-4">AI is analyzing columns and creating mappings...</p>
        </div>
      ) : (
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {entityFields.map(field => {
              const mapping = mappings[field.name];
              const isMapped = !!mapping?.sourceColumn;
              
              return (
                <div 
                  key={field.name}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    isMapped ? 'border-green-200 bg-green-50/50' : 
                    field.required ? 'border-red-200 bg-red-50/50' : 'border-muted'
                  }`}
                >
                  {/* Target Field */}
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{field.label}</span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{field.name}</span>
                  </div>

                  {/* Arrow */}
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                  {/* Source Column Select */}
                  <div className="flex-1">
                    <Select 
                      value={mapping?.sourceColumn || '__none__'}
                      onValueChange={(value) => handleMappingChange(field.name, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select source column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- Not mapped --</SelectItem>
                        {sourceColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Confidence */}
                  {isMapped && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">
                        {Math.round((mapping.confidence || 1) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Unmapped Columns */}
      {getUnmappedColumns().length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Checkbox 
              id="showUnmapped" 
              checked={showUnmapped}
              onCheckedChange={setShowUnmapped}
            />
            <Label htmlFor="showUnmapped" className="text-sm">
              Show unmapped columns ({getUnmappedColumns().length})
            </Label>
          </div>
          {showUnmapped && (
            <div className="flex flex-wrap gap-1">
              {getUnmappedColumns().map(col => (
                <Badge key={col} variant="outline" className="text-muted-foreground">
                  {col}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2">
        {requiredFieldsMapped ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-600">All required fields mapped</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-600">Some required fields are not mapped</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!requiredFieldsMapped} className="gap-2">
          Continue to Validation
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
