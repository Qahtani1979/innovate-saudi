import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Zap, Sparkles, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function PartnershipSynergyDetector({ challengeId }) {
  const { language, t } = useLanguage();
  const [detecting, setDetecting] = useState(false);
  const [opportunities, setOpportunities] = useState(null);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
    initialData: []
  });

  const detectSynergies = async () => {
    setDetecting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Identify multi-party collaboration opportunities:

Available Organizations (${organizations.length}):
${organizations.slice(0, 20).map(o => `
${o.name_en}
Type: ${o.organization_type}
Expertise: ${o.expertise_areas?.join(', ')}
Sectors: ${o.sectors?.join(', ')}
`).join('\n')}

Find synergies where 2-3 organizations could collaborate:
- Complementary capabilities
- End-to-end solution coverage
- Strategic alignment

Recommend top 3 multi-party collaboration opportunities.`,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  partners: { type: "array", items: { type: "string" } },
                  synergy_score: { type: "number" },
                  use_case: { type: "string" },
                  value_proposition: { type: "string" },
                  complementarity: { type: "string" }
                }
              }
            }
          }
        }
      });

      setOpportunities(response.opportunities || []);
      toast.success(t({ en: 'Synergies detected', ar: 'التآزرات مكتشفة' }));
    } catch (error) {
      toast.error(t({ en: 'Detection failed', ar: 'فشل الكشف' }));
    } finally {
      setDetecting(false);
    }
  };

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            {t({ en: 'Synergy Detector', ar: 'كاشف التآزر' })}
          </CardTitle>
          <Button onClick={detectSynergies} disabled={detecting} size="sm" className="bg-orange-600">
            {detecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Detect', ar: 'اكتشف' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!opportunities && !detecting && (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-orange-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI identifies multi-party collaboration opportunities with complementary capabilities', ar: 'الذكاء يحدد فرص التعاون متعدد الأطراف مع القدرات التكميلية' })}
            </p>
          </div>
        )}

        {opportunities && opportunities.length > 0 && (
          <div className="space-y-4">
            {opportunities.map((opp, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-orange-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-slate-900">
                      {t({ en: 'Synergy Opportunity', ar: 'فرصة تآزر' })} #{i + 1}
                    </h4>
                  </div>
                  <Badge className="bg-orange-600">{opp.synergy_score}% synergy</Badge>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    {t({ en: 'Partners:', ar: 'الشركاء:' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opp.partners?.map((partner, j) => (
                      <Badge key={j} variant="outline" className="text-xs">
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      {t({ en: 'Use Case:', ar: 'حالة الاستخدام:' })}
                    </p>
                    <p className="text-xs text-slate-700">{opp.use_case}</p>
                  </div>

                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-xs font-semibold text-green-900 mb-1">
                      {t({ en: 'Value:', ar: 'القيمة:' })}
                    </p>
                    <p className="text-xs text-slate-700">{opp.value_proposition}</p>
                  </div>

                  <div className="p-2 bg-purple-50 rounded">
                    <p className="text-xs font-semibold text-purple-900 mb-1">
                      {t({ en: 'Complementarity:', ar: 'التكامل:' })}
                    </p>
                    <p className="text-xs text-slate-700">{opp.complementarity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}