import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getStrategicChallengeMapperPrompt, strategicChallengeMapperSchema } from '@/lib/ai/prompts/matchmaker';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function StrategicChallengeMapper({ application, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const [selectedChallenges, setSelectedChallenges] = useState(application.strategic_challenges || []);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['strategic-challenges'],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.priority === 'tier_1' || c.priority === 'tier_2');
    }
  });

  const handleAIMatch = async () => {
    const result = await invokeAI({
      prompt: getStrategicChallengeMapperPrompt({ application, challenges }),
      system_prompt: getSystemPrompt('COMPACT', true),
      response_json_schema: strategicChallengeMapperSchema
    });

    if (result.success) {
      setSelectedChallenges(result.data.matches || []);
      toast.success(t({ en: `AI found ${result.data.matches?.length || 0} relevant challenges`, ar: `وجد الذكاء ${result.data.matches?.length || 0} تحديات مناسبة` }));
    }
  };

  const toggleChallenge = (challenge, bonusPoints = 10) => {
    const exists = selectedChallenges.find(c => c.challenge_id === challenge.id);
    if (exists) {
      setSelectedChallenges(selectedChallenges.filter(c => c.challenge_id !== challenge.id));
    } else {
      setSelectedChallenges([...selectedChallenges, {
        challenge_id: challenge.id,
        challenge_code: challenge.code,
        bonus_points: bonusPoints
      }]);
    }
  };

  const totalBonus = selectedChallenges.reduce((sum, c) => sum + (c.bonus_points || 0), 0);

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600" />
            {t({ en: 'Strategic Challenge Alignment', ar: 'التوافق مع التحديات الاستراتيجية' })}
          </div>
          <Button onClick={handleAIMatch} disabled={isLoading || !isAvailable} variant="outline" size="sm">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Match', ar: 'مطابقة ذكية' })}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-900">
            {t({
              en: 'Applications addressing strategic challenges earn bonus points (max +15). Select all relevant challenges.',
              ar: 'الطلبات التي تعالج التحديات الاستراتيجية تحصل على نقاط إضافية (حد أقصى +15). اختر جميع التحديات ذات الصلة.'
            })}
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {challenges.map((challenge) => {
            const selected = selectedChallenges.find(c => c.challenge_id === challenge.id);
            
            return (
              <div key={challenge.id} className={`p-4 border-2 rounded-lg transition-all ${
                selected ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={!!selected}
                    onCheckedChange={() => toggleChallenge(challenge)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{challenge.code}</Badge>
                      <Badge className="bg-red-100 text-red-700 text-xs">{challenge.priority}</Badge>
                      <Badge className="text-xs">{challenge.sector?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <h4 className="font-medium text-sm">{language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}</h4>
                    {selected?.reason_en && (
                      <p className="text-xs text-slate-600 mt-2 italic">
                        💡 {language === 'ar' ? selected.reason_ar : selected.reason_en}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <Badge className="bg-amber-600 text-white">+{selected.bonus_points}</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-yellow-50 rounded-lg border-2 border-amber-300">
          <div>
            <p className="text-sm text-amber-900">{t({ en: 'Total Bonus Points', ar: 'مجموع النقاط الإضافية' })}</p>
            <p className="text-3xl font-bold text-amber-600">+{totalBonus}</p>
          </div>
          <Button onClick={() => onUpdate(selectedChallenges)} className="bg-amber-600 hover:bg-amber-700">
            {t({ en: 'Save Alignment', ar: 'حفظ التوافق' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
