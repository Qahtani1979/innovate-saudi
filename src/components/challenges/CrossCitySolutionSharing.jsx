import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { Share2, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  CROSS_CITY_SHARING_SYSTEM_PROMPT,
  buildCrossCitySharingPrompt,
  CROSS_CITY_SHARING_SCHEMA
} from '@/lib/ai/prompts/challenges/crossCitySharing';

import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useShareChallenge } from '@/hooks/useChallengeMutations';

export default function CrossCitySolutionSharing({ challenge }) {
  const { language, isRTL, t } = useLanguage();
  // queryClient removed
  const [selectedCities, setSelectedCities] = useState([]);
  const { invokeAI, isLoading: generating, status, error, rateLimitInfo } = useAIWithFallback();

  const { data: muniResult = { data: [] } } = useMunicipalitiesWithVisibility();
  const municipalities = muniResult.data || [];

  const { data: simResult = { data: [] } } = useChallengesWithVisibility({
    filters: { sector: challenge.sector },
    pageSize: 20
  });

  const similarChallenges = (simResult.data || [])
    .filter(c => c.id !== challenge.id && (c.status === 'under_review' || c.status === 'approved'))
    .slice(0, 10);

  const shareMutation = useShareChallenge();

  const handleShare = () => {
    shareMutation.mutate({ challenge, cities: selectedCities }, {
      onSuccess: () => setSelectedCities([])
    });
  };

  const autoSuggestCities = async () => {
    const result = await invokeAI({
      system_prompt: CROSS_CITY_SHARING_SYSTEM_PROMPT,
      prompt: buildCrossCitySharingPrompt({ challenge, municipalities }),
      response_json_schema: CROSS_CITY_SHARING_SCHEMA
    });

    if (result.success && result.data?.recommended_cities) {
      const cityNames = result.data.recommended_cities.map(r => r.municipality_name);
      const cityIds = municipalities.filter(m =>
        cityNames.some(name => m.name_en.includes(name) || name.includes(m.name_en))
      ).map(m => m.id);

      setSelectedCities(cityIds);
      toast.success(t({ en: 'Cities recommended by AI', ar: 'المدن الموصى بها من الذكاء الاصطناعي' }));
    }
  };

  return (
    <Card className="border-2 border-teal-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-teal-600" />
          {t({ en: 'Share Solution with Other Cities', ar: 'مشاركة الحل مع مدن أخرى' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />

        <div className="flex gap-2">
          <Button size="sm" onClick={autoSuggestCities} disabled={generating} variant="outline">
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'AI Suggest Cities', ar: 'اقتراح المدن بالذكاء' })}
          </Button>
        </div>

        {municipalities.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {municipalities.filter(m => m.id !== challenge.municipality_id).slice(0, 15).map((city) => (
              <div key={city.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded border hover:bg-slate-100">
                <Checkbox
                  checked={selectedCities.includes(city.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCities([...selectedCities, city.id]);
                    } else {
                      setSelectedCities(selectedCities.filter(id => id !== city.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{city.name_en}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">MII: {city.mii_score || 'N/A'}</Badge>
                    <Badge variant="outline" className="text-xs">{city.region}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCities.length > 0 && (
          <Button
            onClick={() => shareMutation.mutate(selectedCities)}
            disabled={shareMutation.isPending}
            className="w-full bg-teal-600"
          >
            {shareMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: `Share with ${selectedCities.length} Cities`, ar: `مشاركة مع ${selectedCities.length} مدينة` })}
          </Button>
        )}

        {similarChallenges.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              {t({ en: 'Similar Challenges in Other Cities', ar: 'تحديات مشابهة في مدن أخرى' })}
            </p>
            <div className="space-y-2">
              {similarChallenges.slice(0, 5).map((sim) => (
                <div key={sim.id} className="p-2 bg-blue-50 rounded border text-xs">
                  <p className="font-medium text-blue-900">{sim.title_en}</p>
                  <p className="text-slate-600">{sim.municipality_id}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
