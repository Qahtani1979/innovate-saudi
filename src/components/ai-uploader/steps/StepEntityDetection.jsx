/**
 * Step 2: AI Entity Detection
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, ArrowRight, ArrowLeft, CheckCircle, 
  Sparkles, Building2, Lightbulb, Target,
  Users, FileText, Briefcase, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ENTITY_OPTIONS = [
  { id: 'challenges', name: 'Challenges', icon: Target, description: 'Municipal challenges and problems' },
  { id: 'solutions', name: 'Solutions', icon: Lightbulb, description: 'Innovative solutions and technologies' },
  { id: 'pilots', name: 'Pilots', icon: Briefcase, description: 'Pilot projects and trials' },
  { id: 'programs', name: 'Programs', icon: Briefcase, description: 'Innovation programs and initiatives' },
  { id: 'municipalities', name: 'Municipalities', icon: Building2, description: 'Cities and municipalities' },
  { id: 'organizations', name: 'Organizations', icon: Globe, description: 'Companies and institutions' },
  { id: 'providers', name: 'Providers', icon: Users, description: 'Solution providers and vendors' },
  { id: 'case_studies', name: 'Case Studies', icon: FileText, description: 'Success stories and case studies' },
  { id: 'rd_projects', name: 'R&D Projects', icon: Sparkles, description: 'Research and development projects' },
  { id: 'rd_calls', name: 'R&D Calls', icon: Sparkles, description: 'Research funding calls' },
  { id: 'events', name: 'Events', icon: FileText, description: 'Events and conferences' },
  { id: 'living_labs', name: 'Living Labs', icon: Building2, description: 'Innovation living labs' },
  { id: 'sandboxes', name: 'Sandboxes', icon: Target, description: 'Regulatory sandboxes' },
  { id: 'contracts', name: 'Contracts', icon: FileText, description: 'Agreements and contracts' },
  { id: 'budgets', name: 'Budgets', icon: FileText, description: 'Budget allocations' },
  { id: 'sectors', name: 'Sectors', icon: Target, description: 'Industry sectors' },
  { id: 'regions', name: 'Regions', icon: Globe, description: 'Geographic regions' },
  { id: 'cities', name: 'Cities', icon: Building2, description: 'Cities data' },
  { id: 'strategic_plans', name: 'Strategic Plans', icon: FileText, description: 'Strategic planning documents' },
  { id: 'tags', name: 'Tags', icon: Target, description: 'Taxonomy tags' },
  { id: 'kpi_references', name: 'KPI References', icon: Target, description: 'KPI definitions' }
];

export default function StepEntityDetection({ state, updateState, onNext, onBack }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(state.detectedEntity || '');

  useEffect(() => {
    if (state.extractedData && !state.detectedEntity) {
      detectEntity();
    }
  }, []);

  const detectEntity = async () => {
    setIsDetecting(true);
    
    try {
      const sampleData = state.extractedData.rows.slice(0, 5);
      const headers = state.extractedData.headers;
      
      const prompt = `Analyze this data and determine which entity type it belongs to.

Available entity types:
- challenges: Municipal challenges with fields like title_en, title_ar, description_en, status, priority, sector, municipality_id
- solutions: Innovative solutions with fields like name_en, name_ar, description_en, solution_type, maturity_level, provider_id
- pilots: Pilot projects with fields like title_en, title_ar, description_en, pilot_type, stage, status, start_date, end_date, budget, municipality_id
- programs: Innovation programs with fields like name_en, name_ar, description_en, program_type, status, start_date, end_date, budget
- municipalities: Cities with fields like name_en, name_ar, region_id, population, area
- organizations: Companies with fields like name_en, name_ar, organization_type, website, email
- providers: Solution providers with fields like name_en, name_ar, provider_type, website_url, contact_email, country
- case_studies: Success stories with title_en, description_en, challenge_description, solution_description, results_achieved
- rd_projects: Research projects with title_en, description_en, project_type, status, budget
- rd_calls: Research funding calls with title_en, description_en, call_type, status, budget
- events: Events and conferences with title_en, event_type, start_date, end_date, location
- living_labs: Innovation labs with name_en, lab_type, status, location, capacity
- sandboxes: Regulatory sandboxes with name_en, sandbox_type, status, start_date, end_date
- contracts: Agreements with title_en, contract_code, contract_type, contract_value, provider_id
- budgets: Budget allocations with name_en, budget_code, total_amount, allocated_amount, fiscal_year
- sectors: Industry sectors with name_en, name_ar, description_en, code
- regions: Geographic regions with name_en, name_ar, code
- cities: Cities data with name_en, name_ar, region_id, municipality_id, population
- strategic_plans: Strategic planning with title_en, plan_type, status, start_date, end_date
- tags: Taxonomy tags with name_en, name_ar, category, color
- kpi_references: KPI definitions with name_en, code, description_en, unit, category, target_value

Data headers: ${headers.join(', ')}
Sample rows: ${JSON.stringify(sampleData, null, 2)}

Return the top 3 most likely entity types with confidence scores.`;

      const response_json_schema = {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entity_type: { type: 'string' },
                confidence: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          }
        }
      };

      // Optional anonymous session id for rate limiting
      let sessionId = null;
      if (typeof window !== 'undefined') {
        sessionId = sessionStorage.getItem('ai_session_id');
        if (!sessionId) {
          sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('ai_session_id', sessionId);
        }
      }

      const { data: aiData, error } = await supabase.functions.invoke('invoke-llm', {
        body: { 
          prompt,
          system_prompt: 'You are a data classification expert. Analyze data structures and determine entity types.',
          response_json_schema,
          session_id: sessionId
        }
      });

      if (error) {
        throw error;
      }

      const suggestions = aiData?.suggestions || [];

      if (suggestions.length > 0) {
        setAiSuggestions(suggestions);
        const topMatch = suggestions[0];
        setSelectedEntity(topMatch.entity_type);
        updateState({
          detectedEntity: topMatch.entity_type,
          entityConfidence: topMatch.confidence
        });
      }
    } catch (error) {
      console.error('Entity detection error:', error);
      toast.error('AI detection failed. Please select entity type manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleEntitySelect = (entityId) => {
    setSelectedEntity(entityId);
    const suggestion = aiSuggestions.find(s => s.entity_type === entityId);
    updateState({
      detectedEntity: entityId,
      entityConfidence: suggestion?.confidence || 0
    });
  };

  const handleContinue = () => {
    if (!selectedEntity) {
      toast.error('Please select an entity type');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* AI Detection Status */}
      {isDetecting ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <Brain className="h-16 w-16 text-primary animate-pulse" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <p className="mt-4 text-lg font-medium">AI is analyzing your data...</p>
          <p className="text-muted-foreground">Detecting entity type based on column headers and sample data</p>
        </div>
      ) : (
        <>
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, idx) => {
                  const entity = ENTITY_OPTIONS.find(e => e.id === suggestion.entity_type);
                  const Icon = entity?.icon || FileText;
                  const isTop = idx === 0;
                  
                  return (
                    <div 
                      key={suggestion.entity_type}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEntity === suggestion.entity_type 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-background hover:bg-muted'
                      }`}
                      onClick={() => handleEntitySelect(suggestion.entity_type)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entity?.name || suggestion.entity_type}</p>
                          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isTop ? 'default' : 'secondary'}>
                          {Math.round(suggestion.confidence * 100)}% match
                        </Badge>
                        {selectedEntity === suggestion.entity_type && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Selection */}
          <div>
            <h3 className="font-medium mb-3">
              {aiSuggestions.length > 0 ? 'Or select manually:' : 'Select entity type:'}
            </h3>
            <RadioGroup value={selectedEntity} onValueChange={handleEntitySelect}>
              <div className="grid grid-cols-2 gap-3">
                {ENTITY_OPTIONS.map(entity => {
                  const Icon = entity.icon;
                  const isSelected = selectedEntity === entity.id;
                  
                  return (
                    <div 
                      key={entity.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleEntitySelect(entity.id)}
                    >
                      <RadioGroupItem value={entity.id} id={entity.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={entity.id} className="flex items-center gap-2 cursor-pointer">
                          <Icon className="h-4 w-4" />
                          {entity.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">{entity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Re-detect Button */}
          <Button variant="outline" onClick={detectEntity} disabled={isDetecting} className="gap-2">
            <Brain className="h-4 w-4" />
            Re-analyze with AI
          </Button>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedEntity || isDetecting} className="gap-2">
          Continue to Field Mapping
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
