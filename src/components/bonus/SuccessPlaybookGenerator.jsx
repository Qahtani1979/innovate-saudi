import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Sparkles, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildSuccessPlaybookPrompt, successPlaybookSchema, SUCCESS_PLAYBOOK_SYSTEM_PROMPT } from '@/lib/ai/prompts/bonus';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function SuccessPlaybookGenerator({ pilot }) {
  const { language, t } = useLanguage();
  const [playbook, setPlaybook] = useState(null);
  const { invokeAI, isLoading: generating, status, error, rateLimitInfo } = useAIWithFallback();

  const { data: similarPilots = [] } = useQuery({
    queryKey: ['similar-pilots', pilot.sector],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => 
        p.sector === pilot.sector && 
        p.stage === 'completed' && 
        p.recommendation === 'scale'
      );
    },
    initialData: []
  });

  const generatePlaybook = async () => {
    const result = await invokeAI({
      prompt: buildSuccessPlaybookPrompt(pilot, similarPilots),
      systemPrompt: getSystemPrompt(SUCCESS_PLAYBOOK_SYSTEM_PROMPT),
      response_json_schema: successPlaybookSchema
    });

    if (result.success && result.data) {
      setPlaybook(result.data);
      
      // Save to knowledge base
      try {
        await base44.entities.KnowledgeDocument.create({
          title: `Success Playbook: ${pilot.title_en}`,
          type: 'playbook',
          content: JSON.stringify(result.data),
          tags: ['playbook', 'replication', pilot.sector],
          source_entity_type: 'pilot',
          source_entity_id: pilot.id
        });
      } catch (e) {
        console.error('Failed to save playbook to knowledge base:', e);
      }

      toast.success(t({ en: 'Playbook generated', ar: 'الدليل أُنشئ' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            {t({ en: 'Success Playbook Generator', ar: 'مولد دليل النجاح' })}
          </CardTitle>
          <Button onClick={generatePlaybook} disabled={generating} size="sm" className="bg-green-600">
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate', ar: 'إنشاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} className="mb-4" />
        
        {!playbook && !generating && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI creates step-by-step replication guide from successful pilots', ar: 'الذكاء ينشئ دليل تكرار خطوة بخطوة من التجارب الناجحة' })}
            </p>
          </div>
        )}

        {playbook && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-green-900 text-lg mb-2">{playbook.title}</h3>
              <p className="text-sm text-slate-700">{playbook.summary}</p>
            </div>

            <div className="p-4 bg-white rounded border-2 border-blue-300">
              <h4 className="font-semibold text-blue-900 mb-3">🎯 {t({ en: 'Critical Success Factors', ar: 'عوامل النجاح الحاسمة' })}</h4>
              <ul className="space-y-2">
                {playbook.success_factors?.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Badge className="bg-blue-600">{i + 1}</Badge>
                    <span className="text-slate-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {playbook.implementation_steps?.length > 0 && (
              <div className="p-4 bg-white rounded border-2 border-purple-300">
                <h4 className="font-semibold text-purple-900 mb-3">📋 {t({ en: 'Implementation Steps', ar: 'خطوات التنفيذ' })}</h4>
                <div className="space-y-3">
                  {playbook.implementation_steps.map((step, i) => (
                    <div key={i} className="p-3 bg-purple-50 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium text-slate-900">{step.step}</span>
                        <Badge variant="outline" className="ml-auto">{step.duration}</Badge>
                      </div>
                      {step.deliverables?.length > 0 && (
                        <ul className="ml-8 mt-2 space-y-1">
                          {step.deliverables.map((d, j) => (
                            <li key={j} className="text-xs text-slate-600">✓ {d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {playbook.pitfalls?.length > 0 && (
              <div className="p-4 bg-red-50 rounded border-2 border-red-300">
                <h4 className="font-semibold text-red-900 mb-3">⚠️ {t({ en: 'Common Pitfalls', ar: 'المزالق الشائعة' })}</h4>
                <ul className="space-y-2">
                  {playbook.pitfalls.map((pitfall, i) => (
                    <li key={i} className="text-sm text-slate-700">• {pitfall}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t({ en: 'Download Playbook PDF', ar: 'تنزيل دليل PDF' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
