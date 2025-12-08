import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { TestTube, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function RDToPilotTransition({ project, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [pilotData, setPilotData] = useState(null);

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const createPilotMutation = useMutation({
    mutationFn: async (data) => {
      const pilot = await base44.entities.Pilot.create(data);
      return pilot;
    },
    onSuccess: (pilot) => {
      queryClient.invalidateQueries(['pilots']);
      toast.success(t({ en: 'Pilot created from R&D', ar: 'تم إنشاء التجربة من البحث' }));
      navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
    }
  });

  const generatePilotScope = async () => {
    setGenerating(true);
    try {
      const prompt = `Generate pilot project scope from R&D outcomes:

R&D Project: ${project.title_en}
Institution: ${project.institution}
Research Area: ${project.research_area}
TRL Achieved: ${project.trl_current}
Duration: ${project.duration_months} months
Budget: ${project.budget} SAR

Outputs:
- Publications: ${project.publications?.length || 0}
- Patents: ${project.patents?.length || 0}
- Impact: ${project.impact_assessment?.practical_impact || 'Not specified'}

Generate pilot scope:
1. Pilot title (AR + EN)
2. Pilot tagline (AR + EN)
3. Objective (AR + EN) - what will be tested/validated
4. Hypothesis - specific testable claim
5. Methodology - how pilot will run
6. Scope - geographic and demographic
7. Duration in weeks (realistic for pilot)
8. Budget estimate
9. 3-5 KPIs to measure
10. Success criteria
11. Target population (size, demographics, location)

Make it practical and focused on real-world validation.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            tagline_en: { type: 'string' },
            tagline_ar: { type: 'string' },
            objective_en: { type: 'string' },
            objective_ar: { type: 'string' },
            hypothesis: { type: 'string' },
            methodology: { type: 'string' },
            scope: { type: 'string' },
            duration_weeks: { type: 'number' },
            budget: { type: 'number' },
            kpis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  baseline: { type: 'string' },
                  target: { type: 'string' },
                  unit: { type: 'string' }
                }
              }
            },
            success_criteria: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  criterion: { type: 'string' },
                  threshold: { type: 'string' }
                }
              }
            },
            target_population: {
              type: 'object',
              properties: {
                size: { type: 'number' },
                demographics: { type: 'string' },
                location: { type: 'string' }
              }
            }
          }
        }
      });

      setPilotData({
        ...result,
        solution_id: project.solution_id,
        sector: project.research_area || 'digital_services',
        trl_start: project.trl_current || project.trl_start,
        stage: 'design'
      });

      toast.success(t({ en: 'Pilot scope generated', ar: 'تم إنشاء نطاق التجربة' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate scope', ar: 'فشل إنشاء النطاق' }));
    } finally {
      setGenerating(false);
    }
  };

  const handleCreatePilot = () => {
    const challengeId = project.challenge_ids?.[0];
    
    createPilotMutation.mutate({
      ...pilotData,
      code: `PLT-RD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      municipality_id: pilotData.municipality_id,
      challenge_id: challengeId,
      description_en: `Pilot derived from R&D project: ${project.title_en}. ${pilotData.objective_en}`,
      description_ar: pilotData.description_ar || pilotData.objective_ar
    });
  };

  return (
    <Card className="w-full max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          {t({ en: 'Transition R&D to Pilot', ar: 'الانتقال من البحث للتجريب' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{project.title_en}</p>
              <p className="text-xs text-slate-600 mt-1">TRL {project.trl_current || project.trl_start} Achieved</p>
            </div>
            <ArrowRight className="h-8 w-8 text-blue-600" />
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-900">{t({ en: 'New Pilot', ar: 'تجربة جديدة' })}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Real-world validation', ar: 'التحقق الواقعي' })}</p>
            </div>
          </div>
        </div>

        {!pilotData ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ 
                en: 'AI will generate a complete pilot scope based on R&D outcomes', 
                ar: 'سينشئ الذكاء الاصطناعي نطاق تجربة كامل بناءً على نتائج البحث' 
              })}
            </p>
            <Button onClick={generatePilotScope} disabled={generating} className="bg-blue-600 hover:bg-blue-700">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Pilot Scope', ar: 'إنشاء نطاق التجربة' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">✨ AI-Generated Pilot Scope</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-blue-900">Title</Label>
                  <Input
                    value={pilotData.title_en}
                    onChange={(e) => setPilotData({...pilotData, title_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-900">Objective</Label>
                  <Textarea
                    value={pilotData.objective_en}
                    onChange={(e) => setPilotData({...pilotData, objective_en: e.target.value})}
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-900">Hypothesis</Label>
                  <Input
                    value={pilotData.hypothesis}
                    onChange={(e) => setPilotData({...pilotData, hypothesis: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-blue-900">Duration (weeks)</Label>
                    <Input
                      type="number"
                      value={pilotData.duration_weeks}
                      onChange={(e) => setPilotData({...pilotData, duration_weeks: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-blue-900">Budget (SAR)</Label>
                    <Input
                      type="number"
                      value={pilotData.budget}
                      onChange={(e) => setPilotData({...pilotData, budget: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-blue-900">Municipality</Label>
                    <Select
                      value={pilotData.municipality_id}
                      onValueChange={(v) => setPilotData({...pilotData, municipality_id: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={handleCreatePilot}
                disabled={createPilotMutation.isPending || !pilotData.municipality_id}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {t({ en: 'Create Pilot', ar: 'إنشاء التجربة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}