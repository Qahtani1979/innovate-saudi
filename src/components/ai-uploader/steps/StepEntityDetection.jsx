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
  Brain, ArrowRight, ArrowLeft, Loader2, CheckCircle, 
  AlertTriangle, Sparkles, Building2, Lightbulb, Target,
  Users, FileText, Briefcase, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

const ENTITY_OPTIONS = [
  { id: 'challenges', name: 'Challenges', icon: Target, description: 'Municipal challenges and problems' },
  { id: 'solutions', name: 'Solutions', icon: Lightbulb, description: 'Innovative solutions and technologies' },
  { id: 'pilots', name: 'Pilots', icon: Briefcase, description: 'Pilot projects and trials' },
  { id: 'municipalities', name: 'Municipalities', icon: Building2, description: 'Cities and municipalities' },
  { id: 'organizations', name: 'Organizations', icon: Globe, description: 'Companies and institutions' },
  { id: 'providers', name: 'Providers', icon: Users, description: 'Solution providers and vendors' },
  { id: 'case_studies', name: 'Case Studies', icon: FileText, description: 'Success stories and case studies' },
  { id: 'rd_projects', name: 'R&D Projects', icon: Sparkles, description: 'Research and development projects' },
  { id: 'sectors', name: 'Sectors', icon: Target, description: 'Industry sectors' },
  { id: 'strategic_plans', name: 'Strategic Plans', icon: FileText, description: 'Strategic planning documents' }
];

export default function StepEntityDetection({ state, updateState, onNext, onBack }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(state.detectedEntity || '');
  const { invokeAI, isLoading } = useAIWithFallback({ showToasts: false });

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
- challenges: Municipal challenges with fields like title, description, status, priority, sector
- solutions: Innovative solutions with fields like name, provider, technology_type, maturity_level
- pilots: Pilot projects with fields like name, municipality, start_date, end_date, budget
- municipalities: Cities with fields like name, region, population, coordinates
- organizations: Companies with fields like name, type, industry, contact info
- providers: Solution providers with fields like company_name, expertise, certifications
- case_studies: Success stories with title, challenge, solution, results
- rd_projects: Research projects with title, objectives, methodology, findings
- sectors: Industry sectors with name, description
- strategic_plans: Strategic plans with goals, timeline, KPIs

Data headers: ${headers.join(', ')}
Sample rows: ${JSON.stringify(sampleData, null, 2)}

Return the top 3 most likely entity types with confidence scores.`;

      const result = await invokeAI({
        prompt,
        system_prompt: 'You are a data classification expert. Analyze data structures and determine entity types.',
        response_json_schema: {
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
        }
      });

      if (result.success && result.data?.suggestions) {
        setAiSuggestions(result.data.suggestions);
        if (result.data.suggestions.length > 0) {
          const topMatch = result.data.suggestions[0];
          setSelectedEntity(topMatch.entity_type);
          updateState({
            detectedEntity: topMatch.entity_type,
            entityConfidence: topMatch.confidence
          });
        }
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
          <Button variant="outline" onClick={detectEntity} disabled={isLoading} className="gap-2">
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
