import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  MULTI_INSTITUTION_SYSTEM_PROMPT,
  buildMultiInstitutionPrompt,
  MULTI_INSTITUTION_SCHEMA
} from '@/lib/ai/prompts/rd/multiInstitution';

export default function MultiInstitutionCollaboration({ projectId }) {
  const { language, t } = useLanguage();
  const [partners, setPartners] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const findPartners = async () => {
    const response = await invokeAI({
      system_prompt: MULTI_INSTITUTION_SYSTEM_PROMPT,
      prompt: buildMultiInstitutionPrompt({ 
        projectNeeds: 'Advanced AI research, smart city deployment expertise, civic tech experience' 
      }),
      response_json_schema: MULTI_INSTITUTION_SCHEMA
    });

    if (response.success && response.data?.partners) {
      setPartners(response.data.partners);
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Multi-Institution Collaboration', ar: 'التعاون متعدد المؤسسات' })}
          </CardTitle>
          <Button onClick={findPartners} disabled={isLoading || !isAvailable} size="sm" className="bg-indigo-600">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Find Partners', ar: 'إيجاد شركاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {partners && (
          <div className="space-y-3">
            {partners.map((p, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{p.institution_name}</h4>
                  <Badge className="bg-indigo-600">{p.collaboration_potential}</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2"><strong>Expertise:</strong> {p.expertise}</p>
                <p className="text-xs text-slate-600">{p.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
