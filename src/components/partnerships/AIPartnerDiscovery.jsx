import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIPartnerDiscovery({ challengeId, sector, keywords }) {
  const { language, t } = useLanguage();
  const { invokeAI, status, isLoading: searching, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [partners, setPartners] = useState(null);
  const [requirements, setRequirements] = useState('');

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list(),
    initialData: []
  });

  const discoverPartners = async () => {
    if (!isAvailable) return;
    
    const response = await invokeAI({
      prompt: `Find ideal partners for this initiative:

Sector: ${sector}
Keywords: ${keywords?.join(', ')}
Requirements: ${requirements}

Available Organizations (${organizations.length}):
${organizations.slice(0, 15).map(o => `
${o.name_en}
Type: ${o.organization_type}
Sectors: ${o.sectors?.join(', ')}
Expertise: ${o.expertise_areas?.join(', ')}
Track Record: ${o.partnerships_count || 0} partnerships
`).join('\n')}

Recommend top 5 partner organizations:
1. Best technical capability match
2. Strong track record
3. Sector expertise alignment
4. Capacity availability
5. Compatibility score (0-100)`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                organization_name: { type: "string" },
                match_score: { type: "number" },
                rationale: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                track_record_summary: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (response.success && response.data) {
      setPartners(response.data.recommendations || []);
      toast.success(t({ en: 'Partners found', ar: 'الشركاء وُجدوا' }));
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            {t({ en: 'AI Partner Discovery', ar: 'اكتشاف الشركاء الذكي' })}
          </CardTitle>
          <Button onClick={discoverPartners} disabled={searching || !isAvailable} size="sm" className="bg-indigo-600">
            {searching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find Partners', ar: 'ابحث عن شركاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t({ en: 'Partner Requirements (optional)', ar: 'متطلبات الشريك (اختياري)' })}
          </label>
          <Input
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={t({ en: 'e.g., IoT expertise, pilot experience in Riyadh', ar: 'مثال: خبرة إنترنت الأشياء، خبرة تجريبية في الرياض' })}
          />
        </div>

        {!partners && !searching && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI finds ideal partners based on expertise, track record, and compatibility', ar: 'الذكاء يجد الشركاء المثاليين بناءً على الخبرة والسجل والتوافق' })}
            </p>
          </div>
        )}

        {partners && partners.length > 0 && (
          <div className="space-y-3">
            {partners.map((partner, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-indigo-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{partner.organization_name}</h4>
                  <Badge className="bg-indigo-600">{partner.match_score}% match</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{partner.rationale}</p>
                {partner.strengths?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      {t({ en: 'Strengths:', ar: 'نقاط القوة:' })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {partner.strengths.map((strength, j) => (
                        <Badge key={j} variant="outline" className="text-xs bg-green-50">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {partner.track_record_summary && (
                  <p className="text-xs text-slate-500 mt-2">
                    {t({ en: 'Track Record:', ar: 'السجل:' })} {partner.track_record_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}