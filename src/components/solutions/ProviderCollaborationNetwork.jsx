import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  PROVIDER_COLLABORATION_SYSTEM_PROMPT, 
  buildProviderCollaborationPrompt, 
  PROVIDER_COLLABORATION_SCHEMA 
} from '@/lib/ai/prompts/solutions/providerCollaboration';

export default function ProviderCollaborationNetwork({ providerId }) {
  const { language, t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solutions').select('*');
      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const findPartners = async () => {
    const currentSolution = solutions.find(s => s.provider_id === providerId);
    
    const result = await invokeAI({
      system_prompt: PROVIDER_COLLABORATION_SYSTEM_PROMPT,
      prompt: buildProviderCollaborationPrompt({
        currentSolution: {
          name_en: currentSolution?.name_en,
          sector: currentSolution?.sectors?.join(', '),
          capabilities: currentSolution?.features,
          target_municipalities: 'All'
        },
        potentialPartners: solutions
          .filter(s => s.provider_id !== providerId)
          .slice(0, 15)
          .map(s => ({
            name_en: s.name_en,
            sector: s.sectors?.join(', '),
            capabilities: s.features?.slice(0, 3)
          })),
        sectorData: {}
      }),
      response_json_schema: PROVIDER_COLLABORATION_SCHEMA
    });

    if (result.success) {
      // Map response to expected format
      setSuggestions(result.data.recommended_partners?.map(p => ({
        partner_solution: p.partner_name,
        synergy_score: p.compatibility_score,
        value_proposition: p.rationale,
        target_challenges: p.complementary_capabilities?.join(', ') || '',
        revenue_model: p.partnership_model
      })) || []);
      toast.success(t({ en: 'Found partnership opportunities', ar: 'وُجدت فرص الشراكة' }));
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            {t({ en: 'Provider Collaboration Network', ar: 'شبكة تعاون المقدمين' })}
          </CardTitle>
          <Button onClick={findPartners} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find Partners', ar: 'ابحث عن الشركاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!suggestions && !isLoading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI identifies complementary providers for joint solutions', ar: 'الذكاء يحدد المقدمين التكميليين للحلول المشتركة' })}
            </p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-4">
            {suggestions.map((partner, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-teal-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{partner.partner_solution}</h4>
                    <Badge className="bg-teal-600">
                      {t({ en: `${partner.synergy_score}% synergy`, ar: `${partner.synergy_score}% تآزر` })}
                    </Badge>
                  </div>
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">
                      {t({ en: 'Value Proposition:', ar: 'عرض القيمة:' })}
                    </p>
                    <p className="text-slate-700">{partner.value_proposition}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">
                      {t({ en: 'Target Challenges:', ar: 'التحديات المستهدفة:' })}
                    </p>
                    <p className="text-slate-700">{partner.target_challenges}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">
                      {t({ en: 'Revenue Model:', ar: 'نموذج الإيرادات:' })}
                    </p>
                    <p className="text-slate-700">{partner.revenue_model}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-3">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  {t({ en: 'Request Partnership', ar: 'طلب الشراكة' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
