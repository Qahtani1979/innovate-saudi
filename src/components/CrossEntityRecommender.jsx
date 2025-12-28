import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Loader2, ArrowRight, Target, TestTube, Microscope, Megaphone, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  CROSS_ENTITY_PROMPTS,
  buildCrossEntityPrompt,
  CROSS_ENTITY_SCHEMA
} from '@/lib/ai/prompts/recommendations';
import { useCrossEntityRecommender } from '@/hooks/useAIInsights';
import { useSystemEntities } from '@/hooks/useSystemData';

export default function CrossEntityRecommender({ sourceEntity, sourceType, recommendations = ['rdcalls', 'rdprojects', 'pilots', 'challenges'] }) {
  const { language, isRTL, t } = useLanguage();
  const [results, setResults] = useState(null);

  const { data: rdCalls = [] } = useSystemEntities('RDCall');
  const { data: rdProjects = [] } = useSystemEntities('RDProject');
  const { data: pilots = [] } = useSystemEntities('Pilot');
  const { data: challenges = [] } = useSystemEntities('Challenge');

  const { recommendMutation, status, isLoading, isAvailable, rateLimitInfo } = useCrossEntityRecommender();

  const handleRecommend = async () => {
    // Filter available entities based on specified recommendations
    const availableEntities = {
      rdCalls: recommendations.includes('rdcalls') ? rdCalls.filter(c => c.status === 'open') : [],
      rdProjects: recommendations.includes('rdprojects') ? rdProjects.filter(p => p.is_published) : [],
      pilots: recommendations.includes('pilots') ? pilots.filter(p => p.stage === 'active') : [],
      challenges: recommendations.includes('challenges') ? challenges.filter(c => c.status === 'approved') : []
    };

    recommendMutation.mutate({
      sourceEntity,
      sourceType,
      availableEntities,
      promptBuilder: buildCrossEntityPrompt,
      schema: CROSS_ENTITY_SCHEMA,
      systemPrompt: CROSS_ENTITY_PROMPTS.systemPrompt
    }, {
      onSuccess: (data) => {
        // Enrich with actual entities
        const enriched = {
          rdcalls: data.rdcall_recommendations?.map(r => ({
            ...r,
            entity: availableEntities.rdCalls.find(c => c.id === r.entity_id)
          })).filter(r => r.entity) || [],
          rdprojects: data.rdproject_recommendations?.map(r => ({
            ...r,
            entity: availableEntities.rdProjects.find(p => p.id === r.entity_id)
          })).filter(r => r.entity) || [],
          pilots: data.pilot_recommendations?.map(r => ({
            ...r,
            entity: availableEntities.pilots.find(p => p.id === r.entity_id)
          })).filter(r => r.entity) || [],
          challenges: data.challenge_recommendations?.map(r => ({
            ...r,
            entity: availableEntities.challenges.find(c => c.id === r.entity_id)
          })).filter(r => r.entity) || []
        };

        setResults(enriched);
      },
      onError: (error) => {
        toast.error(t({ en: 'Failed to generate recommendations', ar: 'فشل توليد التوصيات' }) + ': ' + error.message);
      }
    });
  };

  const getEntityIcon = (type) => {
    const icons = {
      rdcalls: Megaphone,
      rdprojects: Microscope,
      pilots: TestTube,
      challenges: Target
    };
    return icons[type] || LinkIcon;
  };

  const getEntityUrl = (type, id) => {
    const pages = {
      rdcalls: 'RDCallDetail',
      rdprojects: 'RDProjectDetail',
      pilots: 'PilotDetail',
      challenges: 'ChallengeDetail'
    };
    return createPageUrl(`${pages[type]}?id=${id}`);
  };

  const getEntityTitle = (type) => {
    const titles = {
      rdcalls: { en: 'R&D Calls', ar: 'دعوات البحث' },
      rdprojects: { en: 'R&D Projects', ar: 'مشاريع البحث' },
      pilots: { en: 'Pilots', ar: 'التجارب' },
      challenges: { en: 'Challenges', ar: 'التحديات' }
    };
    return titles[type]?.[language] || type;
  };


  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <LinkIcon className="h-5 w-5" />
            {t({ en: 'AI Smart Connections', ar: 'الربط الذكي' })}
          </CardTitle>
          <Button onClick={handleRecommend} disabled={isLoading || !isAvailable} size="sm" className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t({ en: 'Finding...', ar: 'جاري البحث...' })}
              </>
            ) : (
              <>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Find Connections', ar: 'إيجاد الروابط' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} error={null} rateLimitInfo={rateLimitInfo} showDetails />

        {!results && !isLoading && (
          <div className="text-center py-6">
            <LinkIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Discover related R&D calls, projects, pilots, and challenges using AI', ar: 'اكتشف دعوات البحث والمشاريع والتجارب والتحديات ذات الصلة بالذكاء الاصطناعي' })}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>
              {t({ en: 'Analyzing connections...', ar: 'جاري تحليل الروابط...' })}
            </span>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {Object.entries(results).map(([type, items]) => {
              if (!items || items.length === 0) return null;
              const Icon = getEntityIcon(type);

              return (
                <div key={type}>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-purple-600" />
                    {getEntityTitle(type)}
                  </h4>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-100 text-purple-700">
                                {item.match_score}% {t({ en: 'match', ar: 'تطابق' })}
                              </Badge>
                              {item.entity?.code && (
                                <Badge variant="outline">{item.entity.code}</Badge>
                              )}
                            </div>
                            <Link to={getEntityUrl(type, item.entity_id)} className="font-medium text-slate-900 hover:text-purple-600">
                              {language === 'ar' && item.entity?.title_ar ? item.entity.title_ar : (item.entity?.title_en || item.entity?.name_en)}
                            </Link>
                            <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              {language === 'ar' ? item.reason_ar : item.reason_en}
                            </p>
                            <p className="text-xs text-purple-700 mt-2 font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              💡 {language === 'ar' ? item.action_ar : item.action_en}
                            </p>
                          </div>
                          <Link to={getEntityUrl(type, item.entity_id)}>
                            <Button size="sm" variant="outline">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
