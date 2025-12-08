import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Share2, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

export default function CrossCitySolutionSharing({ challenge }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCities, setSelectedCities] = useState([]);
  const [generating, setGenerating] = useState(false);

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-for-sharing'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: similarChallenges = [] } = useQuery({
    queryKey: ['similar-challenges', challenge.id],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => 
        c.id !== challenge.id && 
        c.sector === challenge.sector &&
        (c.status === 'under_review' || c.status === 'approved')
      ).slice(0, 10);
    }
  });

  const shareMutation = useMutation({
    mutationFn: async (cities) => {
      for (const cityId of cities) {
        await base44.entities.ChallengeActivity.create({
          challenge_id: challenge.id,
          activity_type: 'cross_city_share',
          description: `Solution shared with ${cityId}`,
          details: { shared_to_municipality: cityId, shared_date: new Date().toISOString() }
        });

        await base44.integrations.Core.SendEmail({
          to: `innovation@${cityId}.gov.sa`,
          subject: `Solution Available for Challenge: ${challenge.title_en}`,
          body: `A solution has been validated for a similar challenge in another municipality and is now available for consideration in your city.

Challenge: ${challenge.title_en}
Sector: ${challenge.sector}
Treatment Approach: ${challenge.track}

View details: ${window.location.origin}/challenge/${challenge.id}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge-activities']);
      toast.success(t({ en: 'Solution shared with selected cities', ar: 'تم مشاركة الحل مع المدن المختارة' }));
      setSelectedCities([]);
    }
  });

  const autoSuggestCities = async () => {
    setGenerating(true);
    try {
      const prompt = `Recommend which municipalities should adopt this solution:

Challenge: ${challenge.title_en}
Sector: ${challenge.sector}
Municipality: ${challenge.municipality_id}

Available municipalities: ${municipalities.map(m => `${m.name_en} (population: ${m.population}, MII: ${m.mii_score})`).join(', ')}

Recommend top 5 municipalities that would benefit most, considering:
- Similar demographics
- MII capacity
- Sector alignment
- Geographic proximity`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_cities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  municipality_name: { type: 'string' },
                  reason: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const cityNames = result.recommended_cities.map(r => r.municipality_name);
      const cityIds = municipalities.filter(m => 
        cityNames.some(name => m.name_en.includes(name) || name.includes(m.name_en))
      ).map(m => m.id);
      
      setSelectedCities(cityIds);
      toast.success(t({ en: 'Cities recommended by AI', ar: 'المدن الموصى بها من الذكاء الاصطناعي' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate recommendations', ar: 'فشل إنشاء التوصيات' }));
    } finally {
      setGenerating(false);
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