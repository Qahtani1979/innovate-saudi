import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function MultiLabCollaborationEngine({ currentLabId }) {
  const { language, t } = useLanguage();
  const [opportunities, setOpportunities] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const currentLab = labs.find(l => l.id === currentLabId);

  const findCollaborations = async () => {
    const result = await invokeAI({
      prompt: `Find collaboration opportunities between living labs:

CURRENT LAB: ${currentLab?.name_en}
- Focus: ${currentLab?.research_themes?.join(', ')}
- Equipment: ${currentLab?.equipment?.map(e => e.name).join(', ')}

OTHER LABS:
${labs.filter(l => l.id !== currentLabId).slice(0, 10).map(l => 
  `- ${l.name_en}: ${l.research_themes?.join(', ')}`
).join('\n')}

Suggest top 5 collaboration opportunities:
1. Equipment sharing (Lab A has X, Lab B needs it)
2. Expertise exchange (complementary research areas)
3. Joint research projects
4. Resource optimization`,
      response_json_schema: {
        type: "object",
        properties: {
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                partner_lab: { type: "string" },
                opportunity_type: { type: "string" },
                description: { type: "string" },
                benefit: { type: "string" },
                synergy_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setOpportunities(result.data.opportunities || []);
      toast.success(t({ en: `${result.data.opportunities?.length || 0} opportunities found`, ar: `${result.data.opportunities?.length || 0} فرصة وُجدت` }));
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Multi-Lab Collaboration Finder', ar: 'باحث التعاون متعدد المختبرات' })}
          </CardTitle>
          <Button onClick={findCollaborations} disabled={isLoading || !isAvailable} size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find', ar: 'بحث' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!opportunities.length && !isLoading && (
          <div className="text-center py-8">
            <Network className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI identifies equipment sharing and research collaboration opportunities', ar: 'الذكاء يحدد مشاركة المعدات وفرص التعاون البحثي' })}
            </p>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="space-y-3">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="p-4 border-2 border-indigo-200 rounded-lg bg-white hover:border-indigo-400 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{opp.partner_lab}</h4>
                    <Badge className="mt-1 text-xs bg-indigo-100 text-indigo-700">{opp.opportunity_type}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{opp.synergy_score}%</p>
                    <p className="text-xs text-slate-500">{t({ en: 'Synergy', ar: 'تآزر' })}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-2">{opp.description}</p>
                
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-1">{t({ en: 'Benefit:', ar: 'الفائدة:' })}</p>
                  <p className="text-xs text-slate-700">{opp.benefit}</p>
                </div>

                <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Mail className="h-3 w-3 mr-1" />
                  {t({ en: 'Request Collaboration', ar: 'طلب التعاون' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
