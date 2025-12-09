import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Rocket, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function RDToStartupSpinoff({ rdProject, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [spinoffData, setSpinoffData] = useState({
    startup_name: '',
    commercialization_potential_score: 0,
    ip_to_transfer: [],
    founding_team: [],
    business_model: ''
  });
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const assessCommercialization = async () => {
    const result = await invokeAI({
      prompt: `Assess commercialization potential for this R&D project:
Project: ${rdProject.title_en}
Research Area: ${rdProject.research_area_en}
TRL: ${rdProject.trl_current}
Outputs: ${rdProject.expected_outputs?.map(o => o.output_en).join(', ')}

Provide:
1. Commercialization potential score (0-100)
2. Market readiness assessment
3. Recommended startup name
4. Suggested business model
5. Key value propositions`,
      response_json_schema: {
        type: 'object',
        properties: {
          commercialization_score: { type: 'number' },
          market_readiness: { type: 'string' },
          startup_name_suggestion: { type: 'string' },
          business_model: { type: 'string' },
          value_propositions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setSpinoffData(prev => ({
        ...prev,
        startup_name: result.data.startup_name_suggestion,
        commercialization_potential_score: result.data.commercialization_score,
        business_model: result.data.business_model
      }));
      toast.success(t({ en: 'Assessment complete', ar: 'اكتمل التقييم' }));
    }
  };

  const createSpinoffMutation = useMutation({
    mutationFn: async () => {
      const startup = await base44.entities.StartupProfile.create({
        name_en: spinoffData.startup_name,
        description_en: rdProject.abstract_en,
        stage: 'pre_seed',
        product_stage: rdProject.trl_current >= 7 ? 'beta' : 'mvp',
        sectors: [rdProject.research_area_en],
        source_rd_project_id: rdProject.id
      });

      const solution = await base44.entities.Solution.create({
        name_en: spinoffData.startup_name,
        description_en: rdProject.abstract_en,
        provider_id: startup.id,
        provider_name: spinoffData.startup_name,
        provider_type: 'startup',
        trl: rdProject.trl_current,
        maturity_level: rdProject.trl_current >= 7 ? 'market_ready' : 'prototype',
        source_rd_project_id: rdProject.id
      });

      await base44.entities.RDProject.update(rdProject.id, {
        spinoff_startup_id: startup.id,
        spinoff_solution_id: solution.id,
        commercialization_status: 'spinoff_created'
      });

      return { startup, solution };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-projects']);
      toast.success(t({ en: 'Spinoff created!', ar: 'تم إنشاء الشركة!' }));
      onClose();
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-orange-600" />
          {t({ en: 'Create Startup Spinoff', ar: 'إنشاء شركة فرعية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="font-semibold text-blue-900">{rdProject.title_en}</p>
          <div className="flex gap-2 mt-2">
            <Badge>TRL {rdProject.trl_current}</Badge>
            <Badge variant="outline">{rdProject.research_area_en}</Badge>
          </div>
        </div>

        <Button
          onClick={assessCommercialization}
          disabled={isLoading || !isAvailable}
          className="w-full bg-purple-600"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'AI Commercialization Assessment', ar: 'تقييم التسويق الذكي' })}
        </Button>

        {spinoffData.commercialization_potential_score > 0 && (
          <>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Commercialization Potential', ar: 'إمكانية التسويق' })}</p>
              <p className="text-4xl font-bold text-green-600">{spinoffData.commercialization_potential_score}%</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Startup Name', ar: 'اسم الشركة' })}
              </label>
              <Input
                value={spinoffData.startup_name}
                onChange={(e) => setSpinoffData({...spinoffData, startup_name: e.target.value})}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={() => createSpinoffMutation.mutate()}
                disabled={!spinoffData.startup_name}
                className="flex-1 bg-orange-600"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {t({ en: 'Create Spinoff', ar: 'إنشاء شركة' })}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
